/**
 * Luna Persona Images Mapping
 * Maps each persona to their professional portrait image
 */

export const LUNA_IMAGES: Record<string, { url: string; alt: string; name: string }> = {
  compassionate: {
    url: "/manus-storage/luna-hero-green_66809a3d.png",
    alt: "Luna Compassionate - Empathetic Sleep Guide",
    name: "Luna Compassionate",
  },
  scientific: {
    url: "/manus-storage/luna2-scientific_5d248fd3.webp",
    alt: "Luna Scientific - Evidence-Based Sleep Coach",
    name: "Luna Scientific",
  },
  practical: {
    url: "/manus-storage/luna3-practical_9b178c6b.webp",
    alt: "Luna Practical - Action-Oriented Sleep Guide",
    name: "Luna Practical",
  },
  curious: {
    url: "/manus-storage/luna4-curious_f8a139f0.webp",
    alt: "Luna Curious - Inquisitive Sleep Coach",
    name: "Luna Curious",
  },
  motivational: {
    url: "/manus-storage/luna-motivational_708b4863.png",
    alt: "Luna Motivational - Inspiring Sleep Guide",
    name: "Luna Motivational",
  },
  holistic: {
    url: "/manus-storage/luna-holistic_475c6309.png",
    alt: "Luna Holistic - Balanced Sleep Coach",
    name: "Luna Holistic",
  },
  storyteller: {
    url: "/manus-storage/luna-storyteller_89c4c087.png",
    alt: "Luna Storyteller - Narrative Sleep Guide",
    name: "Luna Storyteller",
  },
  structured: {
    url: "/manus-storage/luna8-structured_364e506a.webp",
    alt: "Luna Structured - Systematic Sleep Coach",
    name: "Luna Structured",
  },
  adaptive: {
    url: "/manus-storage/luna9-adaptive_5cc4ca34.webp",
    alt: "Luna Adaptive - Flexible Sleep Guide",
    name: "Luna Adaptive",
  },
  empowering: {
    url: "/manus-storage/luna10-empowering_21e4197c.webp",
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
