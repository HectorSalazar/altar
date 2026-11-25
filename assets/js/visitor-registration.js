(() => {
  'use strict';
  const section = document.getElementById('bienvenido');
  const form = section?.querySelector('[data-visitor-form]');
  if (!form) return;
  const fields = form.querySelector('.visitor-fields');
  const requiredNote = section.querySelector('#visitor-required-note');
  const status = section.querySelector('[data-visitor-status]');
  const error = section.querySelector('[data-visitor-error]');
  const unavailable = section.querySelector('[data-visitor-unavailable]');
  const unavailableMessage = section.querySelector('[data-visitor-unavailable-message]');
  const retry = section.querySelector('[data-visitor-retry]');
  const restart = section.querySelector('[data-visitor-new]');
  const maritalOther = form.querySelector('[data-marital-other]');
  const childrenAges = form.querySelector('[data-children-ages]');
  const storageKey = 'altar.visitor.submission-id';
  const { protocol, hostname, port } = window.location;
  const livePreviewApi = protocol === 'http:' && port === '5500' && ['127.0.0.1', 'localhost'].includes(hostname)
    ? `http://${hostname}:8180` : '';
  let apiBase = '';
  let token = '';
  let loading = false;
  let sending = false;
  let completed = false;
  let submissionId = '';

  function newId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function getSubmissionId() {
    if (submissionId) return submissionId;
    try { submissionId = sessionStorage.getItem(storageKey) || ''; } catch { /* ID can live in memory. */ }
    if (!/^[a-f0-9-]{36}$/.test(submissionId)) submissionId = newId();
    // Only the random request ID is persisted. Personal details stay in the form.
    try { sessionStorage.setItem(storageKey, submissionId); } catch { /* Storage is optional. */ }
    return submissionId;
  }

  function forgetSubmissionId() {
    submissionId = '';
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
  }

  async function request(path, options = {}, base = apiBase) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${base}${path}`, {
        ...options, credentials: base ? 'include' : 'same-origin', cache: 'no-store', signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data !== 'object') {
        const failure = new Error(typeof data?.error === 'string' ? data.error : 'No se pudo completar la solicitud.');
        failure.status = response.status;
        throw failure;
      }
      return data;
    } finally { clearTimeout(timeout); }
  }

  async function getToken(base) {
    const data = await request('/api/public/visitor-form', { headers: { Accept: 'application/json' } }, base);
    if (typeof data.token !== 'string' || !/^[a-f0-9]{64}$/.test(data.token)) throw new Error('Formulario no disponible.');
    return data.token;
  }

  async function prepareToken() {
    try {
      return await getToken(apiBase);
    } catch (failure) {
      if (!livePreviewApi || apiBase || failure.status !== 404) throw failure;
      // Live Server serves the HTML in development. Keep GET and POST on the API that creates the session.
      const previewToken = await getToken(livePreviewApi);
      apiBase = livePreviewApi;
      return previewToken;
    }
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    error.focus({ preventScroll: false });
  }

  function showUnavailable(message) {
    unavailable.hidden = false;
    unavailableMessage.textContent = message;
  }

  function syncConditionalFields() {
    const other = form.elements.namedItem('marital_status').value === 'other';
    maritalOther.hidden = !other;
    const otherInput = form.elements.namedItem('marital_other');
    otherInput.disabled = !other;
    otherInput.required = other;
    const children = form.elements.namedItem('has_children').value === 'yes';
    childrenAges.hidden = !children;
    form.elements.namedItem('children_ages').disabled = !children;
  }

  async function prepare() {
    if (loading || completed) return;
    loading = true;
    retry.disabled = true;
    fields.disabled = true;
    unavailable.hidden = true;
    status.textContent = 'Preparando el formulario…';
    try {
      token = await prepareToken();
      fields.disabled = sending;
      syncConditionalFields();
      status.textContent = '';
    } catch {
      token = '';
      showUnavailable('El registro no está disponible en este momento.');
      status.textContent = '';
    } finally {
      loading = false;
      retry.disabled = false;
    }
  }

  // Set the date bound in Lima, without interpreting a birthday as a UTC instant.
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  form.elements.namedItem('birth_date').max = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  if (hostname.endsWith('.github.io')) {
    showUnavailable('En esta versión, coordinamos tu registro por WhatsApp.');
    retry.hidden = true;
    return;
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void prepare();
    }, { rootMargin: '300px 0px' });
    observer.observe(section);
  } else {
    void prepare();
  }

  retry.addEventListener('click', async () => {
    error.hidden = true;
    await prepare();
    if (token) form.elements.namedItem('full_name').focus();
    else unavailableMessage.focus();
  });
  form.addEventListener('change', syncConditionalFields);
  form.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); });
  form.addEventListener('invalid', event => { event.target.setAttribute('aria-invalid', 'true'); }, true);

  restart.addEventListener('click', () => {
    forgetSubmissionId();
    completed = false;
    form.reset();
    error.hidden = true;
    restart.hidden = true;
    status.textContent = '';
    status.classList.remove('visitor-success');
    form.hidden = false;
    requiredNote.hidden = false;
    syncConditionalFields();
    if (!token) void prepare();
    else form.elements.namedItem('full_name').focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || completed || !token) return;
    error.hidden = true;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const hasChildren = values.get('has_children') === 'yes';
    const marital = String(values.get('marital_status'));
    const data = {
      full_name: String(values.get('full_name') || '').trim(),
      age: Number(values.get('age')),
      birth_date: String(values.get('birth_date') || ''),
      district: String(values.get('district') || '').trim(),
      email: String(values.get('email') || '').trim(),
      marital_status: marital,
      marital_other: marital === 'other' ? String(values.get('marital_other') || '').trim() : '',
      has_children: hasChildren,
      children_ages: hasChildren ? String(values.get('children_ages') || '').trim() : '',
      consent: values.get('consent') === 'on',
      website: String(values.get('website') || ''),
      submission_id: getSubmissionId(),
    };
    sending = true;
    fields.disabled = true;
    unavailable.hidden = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando tu registro…';
    try {
      const response = await request('/api/public/visitors', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Visitor-Token': token },
        body: JSON.stringify(data),
      });
      if (response.received !== true) throw new Error('No pudimos confirmar tu registro. Intenta de nuevo.');
      completed = true;
      forgetSubmissionId();
      form.reset();
      form.hidden = true;
      requiredNote.hidden = true;
      restart.hidden = true;
      status.textContent = typeof response.message === 'string' ? response.message : '¡Bienvenido a casa! Recibimos tus datos.';
      status.classList.add('visitor-success');
      status.tabIndex = -1;
      status.focus();
    } catch (failure) {
      status.textContent = '';
      if (failure.status === 403) {
        token = '';
        await prepare();
        if (token) showError('Revisa tus datos y vuelve a enviar el formulario.');
        else unavailableMessage.focus();
      } else if (failure.status === 409) {
        showError(failure.message);
        restart.hidden = false;
      } else if (failure.name === 'AbortError' || !failure.status || failure.status >= 500) {
        showUnavailable('No pudimos confirmar el envío. Tus datos siguen en el formulario.');
        unavailableMessage.focus();
      } else showError(failure.message);
    } finally {
      sending = false;
      fields.disabled = !token;
      form.removeAttribute('aria-busy');
    }
  });
})();
