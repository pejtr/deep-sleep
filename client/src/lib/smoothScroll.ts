/**
 * Custom smooth scroll implementation with configurable duration
 * Default duration: 1500ms (slower than browser default)
 */

export function smoothScrollTo(target: HTMLElement | string, duration = 1500) {
  const element = typeof target === 'string' 
    ? document.querySelector(target) as HTMLElement
    : target;

  if (!element) return;

  const startPosition = window.scrollY;
  const targetPosition = element.getBoundingClientRect().top + window.scrollY;
  const distance = targetPosition - startPosition;
  let start: number | null = null;

  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  const animation = (currentTime: number) => {
    if (start === null) start = currentTime;
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutQuad(progress);

    window.scrollTo(0, startPosition + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
}

/**
 * Override default smooth scroll behavior globally
 */
export function initGlobalSmoothScroll() {
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    smoothScrollTo(href, 1500);
  });
}
