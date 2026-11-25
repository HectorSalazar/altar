(() => {
  'use strict';

  const carousel = document.querySelector('[data-hero-carousel]');
  const viewer = document.getElementById('hero-photo-viewer');
  if (!carousel || !viewer) return;

  const photos = Array.from(carousel.querySelectorAll('[data-hero-slide]'), element => ({
    element,
    button: element.querySelector('button'),
    image: element.querySelector('img')
  }));
  const enlarged = viewer.querySelector('img');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = ['front', 'back', 'middle'];
  const interval = 6500;
  let available = [];
  let active = photos.find(({ element }) => element.dataset.heroSlide === 'front');
  let hovered = false;
  let inView = !('IntersectionObserver' in window);
  let timer;

  function arrange() {
    const start = available.indexOf(active);
    const slots = available.length === 1 ? ['middle'] : positions;
    available.forEach(({ element }, index) => {
      element.dataset.heroSlide = slots[(index - start + available.length) % available.length];
    });
  }

  function schedule() {
    window.clearTimeout(timer);
    if (available.length < 2 || !inView || motion.matches || document.hidden ||
        hovered || carousel.contains(document.activeElement) || viewer.open) return;

    timer = window.setTimeout(() => {
      active = available[(available.indexOf(active) + available.length - 1) % available.length];
      arrange();
      schedule();
    }, interval);
  }

  function refresh() {
    available = photos.filter(({ element, button, image }, index) => {
      const isAvailable = !element.hasAttribute('data-cms-media-removed') &&
        image.hasAttribute('src') && (!image.complete || image.naturalWidth > 0);
      element.hidden = !isAvailable;
      button.disabled = !isAvailable;
      button.setAttribute('aria-label', image.alt ? `Ampliar foto: ${image.alt}` : `Ampliar foto ${index + 1}`);
      return isAvailable;
    });
    carousel.hidden = available.length === 0;
    if (!available.includes(active)) active = available[0];
    arrange();
    schedule();
  }

  photos.forEach(photo => {
    const { button, image } = photo;
    image.addEventListener('load', refresh);
    image.addEventListener('error', refresh);
    button.addEventListener('click', () => {
      if (!available.includes(photo) || !image.naturalWidth || viewer.open) return;
      active = photo;
      arrange();
      enlarged.alt = image.alt;
      enlarged.src = image.currentSrc || image.src;
      viewer.showModal();
      schedule();
    });
  });

  viewer.addEventListener('close', () => {
    enlarged.removeAttribute('src');
    enlarged.alt = '';
    schedule();
  });
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') {
      hovered = true;
      schedule();
    }
  });
  carousel.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      hovered = false;
      schedule();
    }
  });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .2;
      schedule();
    }, { threshold: .2 }).observe(carousel);
  }

  refresh();
  window.ALTAR_CMS?.ready.then(refresh);
})();
