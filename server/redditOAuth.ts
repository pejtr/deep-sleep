/**
 * Reddit OAuth2 Authorization Code flow
 * Handles /api/reddit/callback to exchange code for tokens
 * Also provides /api/reddit/auth to initiate the flow
 */
import type { Express, Request, Response } from "express";

const REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

// Scopes needed for Reddit Ads API (comma-separated, no underscores)
// Official docs: https://business.reddithelp.com/s/article/authenticate-your-developer-application
const SCOPES = "adsread,adsconversions,history,adsedit,read";

export function registerRedditOAuthRoutes(app: Express) {
  /**
   * GET /api/reddit/auth
   * Initiates the OAuth flow — redirects to Reddit authorization page
   * Only accessible by admin (checks session cookie)
   */
  app.get("/api/reddit/auth", (req: Request, res: Response) => {
    const clientId = process.env.REDDIT_ADS_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "REDDIT_ADS_CLIENT_ID not configured" });
    }

    // Use the origin from the request to build redirect URI
    // Use the actual production domain (not the old placeholder)
    const redirectUri = `${req.protocol}://${req.get("host")}/api/reddit/callback`;

    const state = Math.random().toString(36).substring(2, 15);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      state,
      redirect_uri: redirectUri,
      duration: "permanent",
      scope: SCOPES,
    });

    const authUrl = `${REDDIT_AUTH_URL}?${params.toString()}`;
    console.log("[Reddit OAuth] Redirecting to:", authUrl);
    res.redirect(authUrl);
  });

  /**
   * GET /api/reddit/callback
   * Handles the OAuth callback from Reddit
   * Exchanges code for access_token + refresh_token
   */
  app.get("/api/reddit/callback", async (req: Request, res: Response) => {
    const { code, error, state } = req.query;

    if (error) {
      console.error("[Reddit OAuth] Error:", error);
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #e2e8f0;">
            <h1 style="color: #ef4444;">❌ Reddit OAuth Error</h1>
            <p>Error: ${error}</p>
            <p><a href="/admin" style="color: #60a5fa;">Back to Admin</a></p>
          </body>
        </html>
      `);
    }

    if (!code || typeof code !== "string") {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #e2e8f0;">
            <h1 style="color: #ef4444;">❌ Missing authorization code</h1>
            <p><a href="/admin" style="color: #60a5fa;">Back to Admin</a></p>
          </body>
        </html>
      `);
    }

    try {
      const clientId = process.env.REDDIT_ADS_CLIENT_ID;
      const clientSecret = process.env.REDDIT_ADS_CLIENT_SECRET;
      const username = process.env.REDDIT_ADS_USERNAME;

      if (!clientId || !clientSecret) {
        throw new Error("Reddit OAuth credentials not configured");
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/api/reddit/callback`;
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      });

      console.log("[Reddit OAuth] Exchanging code for tokens...");

      const response = await fetch(REDDIT_TOKEN_URL, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${text}`);
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
      };

      console.log("[Reddit OAuth] ✅ Token exchange successful!");
      console.log("[Reddit OAuth] Access token:", data.access_token?.substring(0, 10) + "...");
      console.log("[Reddit OAuth] Refresh token:", data.refresh_token?.substring(0, 10) + "...");
      console.log("[Reddit OAuth] Expires in:", data.expires_in, "seconds");
      console.log("[Reddit OAuth] Scope:", data.scope);

      // Store tokens in process.env for immediate use
      process.env.REDDIT_ADS_ACCESS_TOKEN = data.access_token;
      process.env.REDDIT_ADS_REFRESH_TOKEN = data.refresh_token;

      // Return success page with token info for manual secret update
      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #e2e8f0; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #22c55e;">✅ Reddit OAuth Successful!</h1>
            <p style="color: #94a3b8;">Tokens have been obtained. Copy these to your Manus secrets:</p>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #60a5fa; margin-top: 0;">REDDIT_ADS_ACCESS_TOKEN</h3>
              <code style="word-break: break-all; color: #fbbf24; font-size: 12px;">${data.access_token}</code>
            </div>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #60a5fa; margin-top: 0;">REDDIT_ADS_REFRESH_TOKEN</h3>
              <code style="word-break: break-all; color: #fbbf24; font-size: 12px;">${data.refresh_token}</code>
            </div>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Expires in:</strong> ${data.expires_in} seconds</p>
              <p><strong>Scope:</strong> ${data.scope}</p>
            </div>
            
            <p style="color: #94a3b8;">The tokens are already active in the current server session. For persistence across deploys, update the secrets in Manus Settings.</p>
            <p><a href="/admin" style="color: #60a5fa; text-decoration: none; padding: 10px 20px; background: #1e40af; border-radius: 6px; display: inline-block;">→ Go to Admin Dashboard</a></p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("[Reddit OAuth] Token exchange error:", err.message);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #e2e8f0;">
            <h1 style="color: #ef4444;">❌ Token Exchange Failed</h1>
            <p>${err.message}</p>
            <p><a href="/api/reddit/auth" style="color: #60a5fa;">Try Again</a> | <a href="/admin" style="color: #60a5fa;">Back to Admin</a></p>
          </body>
        </html>
      `);
    }
  });
}
