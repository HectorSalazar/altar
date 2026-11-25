(() => {
  'use strict';
  const tablist = document.querySelector('[data-yelp-tabs]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('a[href^="#"]')];
    const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
    if (tabs.length && panels.every(Boolean)) {
      tablist.setAttribute('role', 'tablist');
      tablist.classList.add('is-enhanced');
      const select = (index, focus = false) => {
        tabs.forEach((tab, position) => {
          const selected = position === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
          panels[position].hidden = !selected;
        });
        if (focus) tabs[index].focus();
      };
      tabs.forEach((tab, index) => {
        tab.id = `yelp-tab-${panels[index].id}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', panels[index].id);
        panels[index].setAttribute('role', 'tabpanel');
        panels[index].setAttribute('aria-labelledby', tab.id);
        panels[index].tabIndex = 0;
        tab.addEventListener('click', event => { event.preventDefault(); select(index); });
        tab.addEventListener('keydown', event => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault(); select(index); return;
          }
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== undefined) { event.preventDefault(); select(next, true); }
        });
      });
      const initial = panels.findIndex(panel => `#${panel.id}` === location.hash);
      select(initial < 0 ? 0 : initial);
      window.addEventListener('hashchange', () => {
        const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
        if (index >= 0) select(index);
      });
    }
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 901px)');
  const sections = [...document.querySelectorAll('[data-yelp-parallax]')];
  let queued = false;
  const render = () => {
    queued = false;
    sections.forEach(section => {
      if (motion.matches || !wide.matches) {
        section.style.removeProperty('--yelp-parallax');
        return;
      }
      const rect = section.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        const offset = Math.max(-24, Math.min(24, (innerHeight / 2 - rect.top - rect.height / 2) * .045));
        section.style.setProperty('--yelp-parallax', `${offset.toFixed(2)}px`);
      }
    });
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', schedule);
  wide.addEventListener('change', schedule);
  render();
})();
