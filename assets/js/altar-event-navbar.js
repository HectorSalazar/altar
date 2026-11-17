(() => {
  const header = document.querySelector('.altar-event-header');
  const navbar = header?.querySelector('.altar-event-navbar');
  const toggle = navbar?.querySelector('.altar-event-navbar-toggle');
  if (!toggle) return;

  const mobile = window.matchMedia('(max-width: 1024px)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  const syncScroll = () => navbar.classList.toggle('small-height', window.scrollY > 0);

  toggle.addEventListener('click', () => setMenu(!isOpen()));
  navbar.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !navbar.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });
  mobile.addEventListener('change', () => setMenu(false));
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('pageshow', syncScroll);
  syncScroll();
  header.classList.add('is-ready');
})();
