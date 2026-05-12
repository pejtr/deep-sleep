import axios from "axios";

const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  budget: number;
  status: string;
  create_time: number;
}

interface TikTokPerformance {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  ctr: number;
  conversion_rate: number;
  roas: number;
}

export async function getTikTokCampaigns(accessToken: string, advertiserId: string): Promise<TikTokCampaign[]> {
  try {
    const response = await axios.get(`${TIKTOK_API_BASE}/campaign/get/`, {
      headers: {
        "Access-Token": accessToken,
        "Business-Central-Id": advertiserId,
      },
      params: {
        advertiser_id: advertiserId,
        fields: ["campaign_id", "campaign_name", "budget", "status", "create_time"],
      },
    });

    return response.data.data?.list || [];
  } catch (error) {
    console.error("[TikTok] Error fetching campaigns:", error);
    throw error;
  }
}

export async function getTikTokPerformance(
  accessToken: string,
  advertiserId: string,
  campaignId: string,
  startDate: string,
  endDate: string
): Promise<TikTokPerformance> {
  try {
    const response = await axios.get(`${TIKTOK_API_BASE}/analytics/`, {
      headers: {
        "Access-Token": accessToken,
        "Business-Central-Id": advertiserId,
      },
      params: {
        advertiser_id: advertiserId,
        campaign_ids: [campaignId],
        start_date: startDate,
        end_date: endDate,
        fields: [
          "campaign_id",
          "campaign_name",
          "spend",
          "impressions",
          "clicks",
          "conversions",
          "cpc",
          "ctr",
          "conversion_rate",
          "roas",
        ],
      },
    });

    const data = response.data.data?.[0];
    return {
      campaign_id: data?.campaign_id || campaignId,
      campaign_name: data?.campaign_name || "Unknown",
      spend: data?.spend || 0,
      impressions: data?.impressions || 0,
      clicks: data?.clicks || 0,
      conversions: data?.conversions || 0,
      cpc: data?.cpc || 0,
      ctr: data?.ctr || 0,
      conversion_rate: data?.conversion_rate || 0,
      roas: data?.roas || 0,
    };
  } catch (error) {
    console.error("[TikTok] Error fetching performance:", error);
    throw error;
  }
}

export async function getTikTokAccountInfo(accessToken: string, advertiserId: string) {
  try {
    const response = await axios.get(`${TIKTOK_API_BASE}/advertiser/get/`, {
      headers: {
        "Access-Token": accessToken,
        "Business-Central-Id": advertiserId,
      },
      params: {
        advertiser_ids: [advertiserId],
        fields: ["advertiser_id", "advertiser_name", "balance", "currency"],
      },
    });

    return response.data.data?.[0] || null;
  } catch (error) {
    console.error("[TikTok] Error fetching account info:", error);
    throw error;
  }
}
