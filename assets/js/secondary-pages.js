(() => {
  'use strict';

  function youtubeId(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return null;
      if (!['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) return null;
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
      return /^[\w-]{11}$/.test(id || '') ? id : null;
    } catch { return null; }
  }

  function bindVideoLink(link) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const id = youtubeId(link.href);
      if (!id) return;
      event.preventDefault();
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = link.dataset.videoTitle || 'Mensaje del pastor Hernán Paredes';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      const wrapper = document.createElement('div');
      wrapper.className = 'legacy-embed';
      wrapper.append(frame);
      link.replaceWith(wrapper);
      frame.focus();
    });
  }
  document.querySelectorAll('[data-youtube-link]').forEach(bindVideoLink);

  function syncPastorPhotos() {
    document.querySelectorAll('.pastor-card[data-pastor-slot]').forEach(card => {
      const image = card.querySelector('img');
      const pending = !image || image.getAttribute('src')?.includes('altar-isotype-black.png');
      card.classList.toggle('is-pending', Boolean(pending));
      if (image && !pending && !image.alt.trim()) {
        image.alt = card.querySelector('h3')?.textContent.trim() || 'Equipo pastoral de ALTAR';
      }
    });
  }
  syncPastorPhotos();
  window.ALTAR_CMS?.ready.then(fields => {
    syncPastorPhotos();
    document.querySelectorAll('[data-secondary-video-key]').forEach(pending => {
      const href = fields[pending.dataset.secondaryVideoKey];
      if (!youtubeId(href)) return;
      const link = document.createElement('a');
      link.className = 'legacy-video-frame';
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const title = pending.querySelector('strong')?.textContent || 'Mensaje sobre nuestro legado';
      link.dataset.videoTitle = title;
      link.setAttribute('aria-label', `Reproducir ${title}`);
      const name = document.createElement('strong');
      name.textContent = title;
      const play = document.createElement('span');
      play.className = 'legacy-play';
      play.setAttribute('aria-hidden', 'true');
      const action = document.createElement('span');
      action.textContent = 'Reproducir video';
      link.append(name, play, action);
      bindVideoLink(link);
      pending.replaceWith(link);
    });
  });
})();
