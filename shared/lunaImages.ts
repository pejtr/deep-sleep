/**
 * Luna Visual Identity — Real Photos
 * 3 authentic photos of Luna, used across landing page and chatbot
 */

export const LUNA_IMAGES: Record<string, { url: string; alt: string; name: string }> = {
  compassionate: {
    url: "/manus-storage/luna1_93e25070.jpeg",
    alt: "Luna — Your Personal Sleep Guide",
    name: "Luna",
  },
  scientific: {
    url: "/manus-storage/luna2_671b3719.jpeg",
    alt: "Luna — Sleep Science Expert",
    name: "Luna",
  },
  practical: {
    url: "/manus-storage/luna3_ab28b31a.jpeg",
    alt: "Luna — Sleep Optimizer",
    name: "Luna",
  },
  curious: {
    url: "/manus-storage/luna1_93e25070.jpeg",
    alt: "Luna — Your Personal Sleep Guide",
    name: "Luna",
  },
  motivational: {
    url: "/manus-storage/luna2_671b3719.jpeg",
    alt: "Luna — Sleep Science Expert",
    name: "Luna",
  },
  holistic: {
    url: "/manus-storage/luna3_ab28b31a.jpeg",
    alt: "Luna — Sleep Optimizer",
    name: "Luna",
  },
  storyteller: {
    url: "/manus-storage/luna1_93e25070.jpeg",
    alt: "Luna — Your Personal Sleep Guide",
    name: "Luna",
  },
  structured: {
    url: "/manus-storage/luna2_671b3719.jpeg",
    alt: "Luna — Sleep Science Expert",
    name: "Luna",
  },
  adaptive: {
    url: "/manus-storage/luna3_ab28b31a.jpeg",
    alt: "Luna — Sleep Optimizer",
    name: "Luna",
  },
  empowering: {
    url: "/manus-storage/luna1_93e25070.jpeg",
    alt: "Luna — Your Personal Sleep Guide",
    name: "Luna",
  },
};

/**
 * Get Luna image by persona key
 */
export function getLunaImage(personaKey: string) {
  const key = personaKey.toLowerCase();
  return LUNA_IMAGES[key] || LUNA_IMAGES["compassionate"]!;
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
  const photos = [
    { url: "/manus-storage/luna1_93e25070.jpeg", alt: "Luna — Your Personal Sleep Guide", name: "Luna" },
    { url: "/manus-storage/luna2_671b3719.jpeg", alt: "Luna — Sleep Science Expert", name: "Luna" },
    { url: "/manus-storage/luna3_ab28b31a.jpeg", alt: "Luna — Sleep Optimizer", name: "Luna" },
  ];
  return photos[Math.floor(Math.random() * photos.length)]!;
}
