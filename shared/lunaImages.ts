/**
 * Luna Persona Images Mapping
 * Maps each persona to their professional portrait image
 */

export const LUNA_IMAGES: Record<string, { url: string; alt: string; name: string }> = {
  compassionate: {
    url: "/manus-storage/luna1-compassionate_f0d3169d.png",
    alt: "Luna Compassionate - Empathetic Sleep Guide",
    name: "Luna Compassionate",
  },
  scientific: {
    url: "/manus-storage/luna2-scientific_863a9c63.png",
    alt: "Luna Scientific - Evidence-Based Sleep Coach",
    name: "Luna Scientific",
  },
  practical: {
    url: "/manus-storage/luna3-practical_3fd48da1.png",
    alt: "Luna Practical - Action-Oriented Sleep Guide",
    name: "Luna Practical",
  },
  curious: {
    url: "/manus-storage/luna4-curious_a46ad845.png",
    alt: "Luna Curious - Inquisitive Sleep Coach",
    name: "Luna Curious",
  },
  motivational: {
    url: "/manus-storage/luna5-motivational_678fba95.png",
    alt: "Luna Motivational - Inspiring Sleep Guide",
    name: "Luna Motivational",
  },
  holistic: {
    url: "/manus-storage/luna6-holistic_787f9fbc.png",
    alt: "Luna Holistic - Balanced Sleep Coach",
    name: "Luna Holistic",
  },
  storyteller: {
    url: "/manus-storage/luna7-storyteller_fa4fa0d3.png",
    alt: "Luna Storyteller - Narrative Sleep Guide",
    name: "Luna Storyteller",
  },
  structured: {
    url: "/manus-storage/luna8-structured_05f8769c.png",
    alt: "Luna Structured - Systematic Sleep Coach",
    name: "Luna Structured",
  },
  adaptive: {
    url: "/manus-storage/luna9-adaptive_dbc9485f.png",
    alt: "Luna Adaptive - Flexible Sleep Guide",
    name: "Luna Adaptive",
  },
  empowering: {
    url: "/manus-storage/luna10-empowering_6c05b798.png",
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
