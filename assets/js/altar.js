(() => {
  'use strict';
  const content = window.ALTAR_CONTENT;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Resonance owns WOW, Splitting, background parallax, Rellax, and rollovers.
  // Keep only the preference bridge here; do not replace its native effects.
  const desktop = window.matchMedia('(min-width: 1025px)');
  function syncMotionPreference() {
    document.body.classList.toggle('motion-reduced', motion.matches);
    if (motion.matches) window.SmoothScroll?.destroy?.();
    if (window.jQuery) window.jQuery.fx.off = motion.matches;
  }
  motion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();

  // Keep native accordion activation with Space out of the vendor's page scrolling.
  document.querySelectorAll('details > summary').forEach(summary => {
    summary.addEventListener('keydown', event => {
      if (event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) summary.click();
      }
    });
  });

  const programDialog = document.getElementById('program-dialog');
  const programContact = document.getElementById('program-dialog-contact');
  const defaultProgramContact = programContact.href;
  const programTestimonials = document.getElementById('program-dialog-testimonials');
  const classroomLink = document.getElementById('charisma-classroom');
  const dialogClassroomLink = document.getElementById('program-dialog-classroom');
  const defaultClassroomUrl = classroomLink.href;

  function syncClassroomLink() {
    const isDefault = classroomLink.href === defaultClassroomUrl;
    const isLoopback = ['localhost', '127.0.0.1'].includes(location.hostname);
    const isLocalStaticPreview = isLoopback && ['4173', '5500'].includes(location.port);
    const isStaticPage = location.protocol === 'file:' || location.hostname.endsWith('.github.io');
    if (isDefault && isLocalStaticPreview) classroomLink.href = 'http://127.0.0.1:5173/intranet/';
    classroomLink.hidden = !classroomLink.hasAttribute('href') || (isDefault && isStaticPage);
    dialogClassroomLink.hidden = classroomLink.hidden || programDialog.dataset.activeProgram !== 'carisma';
    if (!dialogClassroomLink.hidden) {
      dialogClassroomLink.href = classroomLink.href;
      dialogClassroomLink.querySelector('span').textContent = classroomLink.querySelector('span').textContent;
    }
  }

  let programFields = {};
  syncClassroomLink();
  document.addEventListener('DOMContentLoaded', () => {
    window.ALTAR_CMS?.ready.then(fields => {
      programFields = fields;
      syncClassroomLink();
    });
  }, { once: true });
  let lastDialogTrigger;
  function openDialog(dialog, trigger) {
    lastDialogTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('has-modal');
  }
  document.querySelectorAll('[data-program]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.program;
    const original = content.programs[id];
    if (!original) return;
    const field = name => programFields[`dialogo-${id}.${name}`];
    const lines = (name, fallback) => typeof field(name) === 'string' ? field(name).split(/\r?\n/).map(line => line.trim()).filter(Boolean) : fallback;
    const publicManual = id === 'discipulado' ? programFields['formacion.destino-del-enlace'] : undefined;
    const dialogManual = field('descarga');
    const program = {
      ...original,
      label: field('etiqueta') ?? original.label,
      title: field('titulo') ?? original.title,
      paragraphs: lines('parrafos', original.paragraphs),
      items: lines('elementos', original.items),
      contactUrl: window.ALTAR_CMS?.publicUrl(field('contacto'), true) ?? original.contactUrl,
      downloadUrl: dialogManual === '' ? undefined : (
        window.ALTAR_CMS?.publicUrl(publicManual) ?? window.ALTAR_CMS?.publicUrl(dialogManual)
        ?? (publicManual === '' ? undefined : original.downloadUrl)
      )
    };
    document.getElementById('program-dialog-label').textContent = program.label;
    document.getElementById('program-dialog-title').textContent = program.title;
    programContact.href = program.contactUrl ?? defaultProgramContact;
    programDialog.dataset.activeProgram = id;
    programTestimonials.hidden = id !== 'carisma';
    syncClassroomLink();
    const body = document.getElementById('program-dialog-body');
    body.replaceChildren();
    program.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.append(p); });
    if (program.items) {
      const list = document.createElement(program.ordered ? 'ol' : 'ul'); list.className = 'dialog-list';
      program.items.forEach(text => { const item = document.createElement('li'); item.textContent = text; list.append(item); });
      body.append(list);
    }
    if (program.downloadUrl) {
      const download = document.createElement('a');
      download.className = 'altar-button button-dark dialog-download';
      download.href = program.downloadUrl;
      download.download = program.downloadName;
      download.textContent = 'Descargar manual · PDF ↓';
      body.append(download);
    }
    openDialog(programDialog, button);
  }));
  document.querySelectorAll('.altar-dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('has-modal');
      lastDialogTrigger?.focus({ preventScroll: true });
    });
  });

  const menuButton = document.querySelector('.mobile-nav');
  const menu = document.getElementById('primary-navigation');
  if (menuButton && menu) {
    // The vendor targets a div; this native button already handles Enter/Space.
    window.jQuery?.(() => window.jQuery(menuButton).off('keydown'));
    const syncMenu = () => {
      const expanded = menuButton.classList.contains('active');
      menuButton.setAttribute('aria-expanded', String(expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
    };
    desktop.addEventListener('change', event => {
      if (!event.matches) return;
      menuButton.classList.remove('active');
      menu.classList.remove('js-opened');
      window.jQuery?.(menu).stop(true, true).show();
      syncMenu();
    });
    new MutationObserver(syncMenu).observe(menuButton, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.classList.contains('active')) { menuButton.click(); menuButton.focus(); }
    });
    syncMenu();
  }
  document.getElementById('copyright-year').textContent = String(new Date().getFullYear());
})();
