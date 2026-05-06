/**
 * Luna Persona Images Mapping
 * Maps each persona to their professional portrait image
 */

export const LUNA_IMAGES: Record<string, { url: string; alt: string; name: string }> = {
  compassionate: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna1-compassionate-8NXuzwydKEFJqcAoPnCcjT.webp",
    alt: "Luna Compassionate - Empathetic Sleep Guide",
    name: "Luna Compassionate",
  },
  scientific: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna2-scientific-mYAhLYZabBTWbhs5LNKhWS.webp",
    alt: "Luna Scientific - Evidence-Based Sleep Coach",
    name: "Luna Scientific",
  },
  practical: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna3-practical-P7jpWjdDqaiZbQawVsNAoc.webp",
    alt: "Luna Practical - Action-Oriented Sleep Guide",
    name: "Luna Practical",
  },
  curious: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna4-curious-CrXgMor97BEibUtSdVBmxn.webp",
    alt: "Luna Curious - Inquisitive Sleep Coach",
    name: "Luna Curious",
  },
  motivational: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna5-motivational-5tXLYjVzFdpjHmWE3po62L.webp",
    alt: "Luna Motivational - Inspiring Sleep Guide",
    name: "Luna Motivational",
  },
  holistic: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna6-holistic-8maAxSgWqg5GPi7CDsgFT5.webp",
    alt: "Luna Holistic - Balanced Sleep Coach",
    name: "Luna Holistic",
  },
  storyteller: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna7-storyteller-mYAhLYZabBTWbhs5LNKhWS.webp",
    alt: "Luna Storyteller - Narrative Sleep Guide",
    name: "Luna Storyteller",
  },
  structured: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna8-structured-P7jpWjdDqaiZbQawVsNAoc.webp",
    alt: "Luna Structured - Systematic Sleep Coach",
    name: "Luna Structured",
  },
  adaptive: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna9-adaptive-CrXgMor97BEibUtSdVBmxn.webp",
    alt: "Luna Adaptive - Flexible Sleep Guide",
    name: "Luna Adaptive",
  },
  empowering: {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna10-empowering-5tXLYjVzFdpjHmWE3po62L.webp",
    alt: "Luna Empowering - Confident Sleep Coach",
    name: "Luna Empowering",
  },
};

/**
 * Get Luna image by persona key
 */
export function getLunaImage(personaKey: string) {
  const key = personaKey.toLowerCase();
  return LUNA_IMAGES[key] || LUNA_IMAGES.compassionate; // Default to Compassionate
}

/**
 * Get all Luna images
 */
export function getAllLunaImages() {
  return Object.values(LUNA_IMAGES);
}

/**
 * Get random Luna image
 */
export function getRandomLunaImage() {
  const images = Object.values(LUNA_IMAGES);
  return images[Math.floor(Math.random() * images.length)];
}
