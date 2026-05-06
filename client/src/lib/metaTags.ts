/**
 * Helper to set dynamic meta tags for Open Graph (Facebook, LinkedIn, etc.)
 * This enables proper preview cards when sharing links on social media
 */

export interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export function setMetaTags(config: MetaTagsConfig) {
  const {
    title,
    description,
    image = "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp",
    url = window.location.href,
    type = "website",
  } = config;

  // Update document title
  document.title = title;

  // Update or create meta tags
  const updateOrCreateMeta = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  const updateOrCreateMetaName = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  // Open Graph tags (Facebook, LinkedIn)
  updateOrCreateMeta("og:title", title);
  updateOrCreateMeta("og:description", description);
  updateOrCreateMeta("og:image", image);
  updateOrCreateMeta("og:url", url);
  updateOrCreateMeta("og:type", type);

  // Twitter tags
  updateOrCreateMetaName("twitter:title", title);
  updateOrCreateMetaName("twitter:description", description);
  updateOrCreateMetaName("twitter:image", image);
  updateOrCreateMetaName("twitter:card", "summary_large_image");

  // Standard meta tags
  updateOrCreateMetaName("description", description);
}

/**
 * Reset meta tags to defaults (home page)
 */
export function resetMetaTags() {
  setMetaTags({
    title: "Deep Sleep Reset: Fix Insomnia in 7 Nights — $5",
    description:
      "Science-backed 7-night protocol that fixes insomnia without pills. CBT-I has an 80% clinical success rate. Just $5.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp",
    url: "https://deep-sleep-reset.com",
  });
}
