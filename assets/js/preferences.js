/* Run before Resonance initialization, including when motion preference changes. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    document.body.classList.add('motion-reduced');
    window.SmoothScroll?.destroy?.();
    if (window.jQuery) window.jQuery.fx.off = true;
    document.body.classList.remove('appear-animate');
    document.querySelectorAll('[class*="parallax-"]').forEach(element => {
      [...element.classList].filter(name => /^parallax-\d+$/.test(name)).forEach(name => element.classList.remove(name));
    });
  }
})();
