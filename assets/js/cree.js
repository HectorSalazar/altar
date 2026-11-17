(async () => {
  'use strict';
  const content = window.CREE_CONTENT || {};
  const cms = window.ALTAR_CMS;
  const fields = await cms?.ready || {};
  const safeAsset = (value, extensions) => {
    if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('..') || /[\\:]/.test(value)) return '';
    return new RegExp(`^assets/[a-z0-9_./% -]+\\.(?:${extensions})$`, 'i').test(value) ? value : '';
  };
  const assetUrl = value => new URL('../' + value, document.baseURI).href;
  const text = value => typeof value === 'string' ? value.trim() : '';
  const youtubeId = value => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return '';
      const host = url.hostname.toLowerCase();
      const candidate = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'].includes(host) ? (url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]) : '';
      return /^[a-zA-Z0-9_-]{11}$/.test(candidate || '') ? candidate : '';
    } catch { return ''; }
  };

  const videoConfig = content.video || {};
  const publishedVideo = cms?.publicUrl(fields['video.archivo']);
  const publishedEmbed = youtubeId(fields['video.youtube']);
  const src = publishedVideo || (publishedEmbed || fields['video.archivo'] === '' ? '' : resolveAsset(videoConfig.src, 'mp4|webm'));
  const embedId = publishedEmbed || youtubeId(videoConfig.youtubeUrl);
  const frame = document.getElementById('cree-video-frame');
  if (src && frame) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.src = src;
    video.setAttribute('aria-label', 'Video de CREE 2026');
    const poster = fields['video.portada'] === '' ? '' : (
      cms?.publicUrl(fields['video.portada']) || resolveAsset(videoConfig.poster, 'webp|jpg|jpeg|png|avif')
    );
    if (poster) video.poster = poster;
    frame.replaceChildren(video);
  } else if (embedId && frame) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${embedId}`;
    iframe.title = 'CREE 2026 — Video de nuestro encuentro';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.replaceChildren(iframe);
  }
  if (src || embedId) document.getElementById('video-description').textContent = text(fields['video.descripcion-publicada']) || text(videoConfig.description) || 'Vuelve a vivir nuestro encuentro y recuerda lo que compartimos juntos en CREE.';

  function resolveAsset(value, extensions) {
    const src = safeAsset(value, extensions);
    return src ? assetUrl(src) : '';
  }

  const publishedPhotos = Array.from({ length: 3 }, (_, index) => {
    const prefix = `galeria.foto-${index + 1}`;
    const caption = text(fields[`${prefix}.pie`]);
    return {
      src: cms?.publicUrl(fields[`${prefix}.imagen`]),
      alt: text(fields[`${prefix}.alternativo`]) || caption || 'Fotografía de CREE 2026',
      caption
    };
  }).filter(item => item.src);
  const localPhotos = Array.isArray(content.gallery) ? content.gallery.filter((item, index) => item && fields[`galeria.foto-${index + 1}.imagen`] !== '').map(item => ({
    ...item, src: resolveAsset(item.src, 'webp|jpg|jpeg|png|avif')
  })).filter(item => item.src && text(item.alt)) : [];
  const photos = publishedPhotos.length ? publishedPhotos : localPhotos;
  if (photos.length) {
    const gallery = document.getElementById('cree-gallery');
    gallery.replaceChildren();
    photos.forEach((item, index) => {
      const figure = document.createElement('figure');
      figure.className = `gallery-photo${index === 0 ? ' gallery-photo-wide' : ''}`;
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = text(item.alt);
      image.loading = 'lazy';
      image.decoding = 'async';
      figure.append(image);
      if (text(item.caption)) {
        const caption = document.createElement('figcaption');
        caption.textContent = text(item.caption);
        figure.append(caption);
      }
      gallery.append(figure);
    });
    document.getElementById('gallery-note').hidden = true;
  }

  const testimonies = Array.isArray(content.testimonials) ? content.testimonials.filter(item => item && text(item.quote) && text(item.name)) : [];
  const grid = document.getElementById('testimonials-grid');
  if (testimonies.length && grid.hidden) {
    testimonies.forEach(item => {
      const figure = document.createElement('figure');
      figure.className = 'testimony';
      const quote = document.createElement('blockquote');
      quote.textContent = `“${text(item.quote)}”`;
      const caption = document.createElement('figcaption');
      caption.textContent = text(item.name);
      if (text(item.detail)) {
        const detail = document.createElement('span');
        detail.textContent = text(item.detail);
        caption.append(detail);
      }
      figure.append(quote, caption);
      grid.append(figure);
    });
    grid.hidden = false;
    document.getElementById('testimonials-pending').hidden = true;
  }
})();
