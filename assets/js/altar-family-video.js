(() => {
  'use strict';

  const trigger = document.querySelector('[data-family-video]');
  const dialog = document.getElementById('family-video-dialog');
  if (!trigger || !dialog?.showModal) return;

  const youtube = document.querySelector('[data-family-youtube]');
  const thumbnail = trigger.querySelector('img');
  const intro = trigger.querySelector('[data-family-intro]');
  const play = trigger.querySelector('.family-video-play');
  const player = dialog.querySelector('[data-family-player]');
  const status = dialog.querySelector('[data-family-status]');
  const external = dialog.querySelector('[data-family-external]');
  const defaultVideo = trigger.href;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let introObserver;
  let introFinished = false;
  let introLoadTimer;

  function finishIntro() {
    if (!intro || introFinished) return;
    introFinished = true;
    introObserver?.disconnect();
    window.clearTimeout(introLoadTimer);
    trigger.removeAttribute('data-family-intro-pending');
    trigger.removeAttribute('data-family-intro-playing');
    if (intro.hasAttribute('src')) {
      intro.pause();
      intro.removeAttribute('src');
      intro.load();
    }
  }

  function observeIntro() {
    if (!intro || introFinished || reducedMotion.matches || !('IntersectionObserver' in window)) return;
    trigger.setAttribute('data-family-intro-pending', '');
    intro.addEventListener('playing', () => {
      if (introFinished) return;
      window.clearTimeout(introLoadTimer);
      trigger.removeAttribute('data-family-intro-pending');
      trigger.setAttribute('data-family-intro-playing', '');
    });
    intro.addEventListener('ended', finishIntro, { once: true });
    intro.addEventListener('error', finishIntro, { once: true });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) finishIntro();
    });
    introObserver = new IntersectionObserver(entries => {
      const entry = entries.at(-1);
      if (introFinished) return;
      if (intro.hasAttribute('src')) {
        if (!entry.isIntersecting) finishIntro();
        return;
      }
      if (entry.intersectionRatio < .5 || document.hidden) return;
      intro.muted = true;
      intro.src = intro.dataset.familyIntro;
      introLoadTimer = window.setTimeout(finishIntro, 4000);
      intro.play().catch(finishIntro);
    }, { threshold: [0, .5] });
    introObserver.observe(trigger);
  }

  function youtubeId(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      let id;
      if (url.hostname === 'youtu.be' && parts.length === 1) {
        [id] = parts;
      } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
        if (url.pathname === '/watch') id = url.searchParams.get('v');
        else if (['embed', 'shorts', 'live'].includes(parts[0]) && parts.length === 2) id = parts[1];
      } else if (['youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname) && parts[0] === 'embed' && parts.length === 2) {
        id = parts[1];
      }
      return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    } catch {
      return null;
    }
  }

  function videoSource() {
    const href = trigger.getAttribute('href');
    if (!href) return null;
    const url = new URL(href, document.baseURI);
    if (url.username || url.password) return defaultVideo;
    if (url.origin === location.origin && ['http:', 'https:', 'file:'].includes(url.protocol)) return url.href;
    return url.protocol === 'https:' && /\.(?:mp4|webm)$/i.test(url.pathname) ? url.href : defaultVideo;
  }

  const sources = Promise.resolve(window.ALTAR_CMS?.ready).then(() => {
    const id = youtubeId(youtube?.getAttribute('href'));
    const src = videoSource();
    const poster = thumbnail.getAttribute('src');
    if (id && !src) trigger.href = `https://www.youtube.com/watch?v=${id}`;
    if (!id && !src) {
      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-controls');
      play.hidden = true;
      if (!poster) trigger.closest('figure').setAttribute('data-cms-media-removed', '');
    } else {
      if (!poster) trigger.setAttribute('data-family-no-poster', '');
      observeIntro();
    }
    return { id, src, poster };
  });

  async function openVideo(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || dialog.open) return;
    event.preventDefault();
    finishIntro();
    const { id, src, poster } = await sources;
    if ((!id && !src) || dialog.open) return;
    status.hidden = true;
    external.hidden = true;
    dialog.showModal();

    if (id) {
      const frame = document.createElement('iframe');
      frame.title = 'Video de presentación de ALTAR en YouTube';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      player.append(frame);
      external.href = `https://www.youtube.com/watch?v=${id}`;
      external.hidden = false;
      return;
    }

    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    if (poster) video.poster = poster;
    video.addEventListener('error', () => { status.hidden = false; }, { once: true });
    video.src = src;
    player.append(video);
    video.play().catch(() => {});
  }

  trigger.addEventListener('click', openVideo);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const video = player.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    player.replaceChildren();
    trigger.focus({ preventScroll: true });
  });
})();
