/* Upit za termin u sheetu: usluga, kada odgovara (dan i dio dana), kontakt.
 * Poruka se otvara u Viberu, WhatsAppu ili Instagramu sa već napisanim tekstom; salon potvrđuje tačno vrijeme.
 * Ništa se ne šalje na server. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, N = window.Nails, $ = APP.$, $$ = APP.$$, esc = APP.esc;
  var ss = function (k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem('glaze-bk-' + k)); sessionStorage.setItem('glaze-bk-' + k, JSON.stringify(v)); } catch (e) { return null; } };
  var st = Object.assign({ step: 0, when: '', date: '', part: '', name: '', phone: '', via: 'viber', note: '' }, ss('state2') || {});
  var dir = 1, open = false, errors = {};
  var STEPS = 3, WHEN = ['today', 'tomorrow', 'week', 'next', 'date'], PARTS = ['morning', 'afternoon', 'evening', 'any'];
  var VIA = { viber: ['i-viber', 'Viber'], wa: ['i-wa', 'WhatsApp'], ig: ['i-insta', 'Instagram'] };
  function save() { ss('state2', st); }

  function main() { return S.services.filter(function (s) { return S.addons.indexOf(s.id) < 0; }); }
  function chosen() { return APP.cart.map(APP.service).filter(Boolean); }
  function totals() {
    var c = chosen();
    return { min: c.reduce(function (a, s) { return a + s.min; }, 0), price: c.reduce(function (a, s) { return a + s.price; }, 0), from: c.some(function (s) { return s.from || s.unit; }) };
  }
  function lookText(l) { var T = APP.T(), sh = N.shadeOf(l.shade); return APP.tr(sh.name) + ' · ' + T.tryon.shapes[l.shape] + ', ' + T.tryon.lengths[l.len].toLowerCase() + ', ' + T.tryon.styles[l.style].toLowerCase(); }
  function whenText() {
    var B = APP.T().booking, d = st.when === 'date' && st.date ? APP.dayLabel(st.date) : B.when[st.when] || '';
    return d + (st.part ? ', ' + B.parts[st.part].toLowerCase() : '');
  }
  // salon ne radi taj dan?
  function closedOn(key) { return !!key && !APP.hoursOn(key); }

  /* ---------- koraci ---------- */
  function paneSteps() {
    var B = APP.T().booking, h = '<ol class="bk-steps">';
    for (var i = 0; i < STEPS; i++) h += '<li class="' + (i < st.step ? 'done' : i === st.step ? 'now' : '') + '"><span>' + (i < st.step ? '<svg class="ic"><use href="#i-check"/></svg>' : i + 1) + '</span><b>' + esc(B.steps[i]) + '</b></li>';
    return h + '</ol>';
  }
  function pickItem(s) {
    var on = APP.cart.indexOf(s.id) > -1, T = APP.T();
    return '<button type="button" class="pick-item" role="checkbox" aria-checked="' + on + '" data-pick="' + s.id + '"><span><b>' + esc(APP.tr(s.name)) + '</b><small>' + s.min + ' ' + T.services.min + (s.unit ? ' · ' + T.services.perNail : '') + '</small></span><span class="pp">' + (s.from ? '<small>' + T.services.from + ' </small>' : '') + APP.price(s.price) + '</span><span class="ck"><svg class="ic"><use href="#i-check"/></svg></span></button>';
  }
  function stepService() {
    var T = APP.T(), B = T.booking, l = APP.look, h = '';
    if (l) h += '<div class="look-card"><span class="mini">' + N.nailArt(l, 64) + '</span><div><small>' + esc(B.look) + '</small><b>' + esc(APP.tr(N.shadeOf(l.shade).name)) + '</b>' + esc(T.tryon.shapes[l.shape] + ' · ' + T.tryon.styles[l.style]) + '</div><a class="btn btn-text" href="#isprobaj" data-close-sheet>' + esc(B.changeLook) + '</a></div>';
    h += '<p class="bk-hint">' + esc(B.pickServices) + '</p><div class="pick" role="group" aria-label="' + esc(B.steps[0]) + '">';
    S.categories.forEach(function (c) {
      var list = main().filter(function (s) { return s.cat === c[0]; }); if (!list.length) return;
      h += '<p class="pick-cat">' + esc(APP.tr(c.slice(1))) + '</p>' + list.map(pickItem).join('');
    });
    h += '<p class="pick-cat">' + esc(B.addons) + '</p>' + S.addons.map(function (id) { return pickItem(APP.service(id)); }).join('');
    h += '</div><p class="err-t" aria-live="polite">' + (errors.svc ? esc(B.needService) : '') + '</p>';
    return h + '<label class="field"><span>' + esc(B.note) + '</span><textarea class="bk-note" maxlength="300">' + esc(st.note) + '</textarea></label>';
  }
  function stepWhen() {
    var B = APP.T().booking, today = APP.now().key, h = '<p class="bk-q">' + esc(B.whenQ) + '</p><p class="bk-hint">' + esc(B.whenHint) + '</p>';
    h += '<div class="choice" role="radiogroup" aria-label="' + esc(B.whenQ) + '">' + WHEN.map(function (w) {
      var off = (w === 'today' && closedOn(today)) || (w === 'tomorrow' && closedOn(APP.addDays(today, 1)));
      return '<button type="button" role="radio" data-when="' + w + '" aria-checked="' + (st.when === w) + '"' + (off ? ' disabled' : '') + '>' + esc(B.when[w]) + (off ? '<small>' + esc(B.closed) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
    if (st.when === 'date') h += '<label class="field bk-date"><span>' + esc(B.when.date) + '</span><input type="date" class="bk-date-in" min="' + today + '" max="' + APP.addDays(today, 90) + '" value="' + esc(st.date) + '"></label>' +
      '<p class="err-t" aria-live="polite">' + (closedOn(st.date) ? esc(B.closedOn) : '') + '</p>';
    h += '<p class="bk-q" style="margin-top:20px">' + esc(B.partQ) + '</p><div class="choice parts" role="radiogroup" aria-label="' + esc(B.partQ) + '">' + PARTS.map(function (p) {
      return '<button type="button" role="radio" data-part="' + p + '" aria-checked="' + (st.part === p) + '"><svg class="ic"><use href="#' + { morning: 'i-sun', afternoon: 'i-lamp', evening: 'i-moon', any: 'i-sparkle' }[p] + '"/></svg>' + esc(B.parts[p]) + '</button>';
    }).join('') + '</div>';
    return h + '<p class="err-t when-err" aria-live="polite">' + (errors.when ? esc(B.pickWhen) : '') + '</p>';
  }
  function stepContact() {
    var B = APP.T().booking;
    return '<div class="form-grid">' +
      '<label class="field' + (errors.name ? ' err' : '') + '"><span>' + esc(B.name) + '</span><input type="text" class="bk-name" autocomplete="given-name" value="' + esc(st.name) + '" maxlength="40"></label><p class="err-t" aria-live="polite">' + (errors.name ? esc(B.nameErr) : '') + '</p>' +
      '<label class="field' + (errors.phone ? ' err' : '') + '"><span>' + esc(B.phone) + '</span><input type="tel" class="bk-phone" autocomplete="tel" inputmode="tel" placeholder="+387 6x xxx xxx" value="' + esc(st.phone) + '" maxlength="22"></label><p class="err-t" aria-live="polite">' + (errors.phone ? esc(B.phoneErr) : '') + '</p>' +
      '<p class="bk-q">' + esc(B.via) + '</p><div class="via" role="radiogroup" aria-label="' + esc(B.via) + '">' +
      Object.keys(VIA).map(function (k) { return '<button type="button" role="radio" data-via="' + k + '" aria-checked="' + (st.via === k) + '"><svg class="ic"><use href="#' + VIA[k][0] + '"/></svg>' + VIA[k][1] + '</button>'; }).join('') +
      '</div>' + previewHTML() + '<p class="note small">' + esc(B.privacy) + '</p></div>';
  }
  function previewHTML() { return '<div class="bk-preview"><p class="kicker">' + esc(APP.T().booking.preview) + '</p><p class="bubble">' + esc(message()).replace(/\n/g, '<br>') + '</p></div>'; }
  function message() {
    var B = APP.T().booking, m = B.msg, lines = [m.hi], c = chosen();
    if (c.length) lines.push(m.services + ': ' + c.map(function (s) { return APP.tr(s.name); }).join(', '));
    if (st.when) lines.push(m.when + ': ' + whenText());
    if (APP.look) lines.push(m.look + ': ' + lookText(APP.look));
    if (st.note) lines.push(m.note + ': ' + st.note);
    if (st.name) lines.push(m.name + ': ' + st.name);
    if (st.phone) lines.push(m.phone + ': ' + st.phone);
    return lines.join('\n');
  }
  function stepDone() {
    var T = APP.T(), B = T.booking, tt = totals();
    return '<div class="done-mark"><svg class="ic"><use href="#i-check"/></svg></div><p class="done-title">' + esc(B.sent) + '</p><p class="done-text">' + esc(B.sentText) + '</p>' +
      '<div class="summary"><dl>' +
      '<dt>' + esc(B.msg.services) + '</dt><dd>' + esc(chosen().map(function (s) { return APP.tr(s.name); }).join(', ')) + '</dd>' +
      '<dt>' + esc(B.msg.when) + '</dt><dd>' + esc(whenText()) + '</dd>' +
      (APP.look ? '<dt>' + esc(B.msg.look) + '</dt><dd>' + esc(lookText(APP.look)) + '</dd>' : '') +
      '<dt>' + esc(B.total) + '</dt><dd>' + (tt.from ? esc(T.services.from) + ' ' : '') + APP.price(tt.price) + ' · ' + APP.dur(tt.min) + '</dd></dl></div>' +
      '<div class="form-grid" style="margin-top:16px"><button type="button" class="btn btn-ghost btn-block" data-bk-send><svg class="ic"><use href="#' + VIA[st.via][0] + '"/></svg>' + esc(B.resend) + '</button>' +
      '<button type="button" class="btn btn-text" data-close-sheet>' + esc(T.close) + '</button></div>';
  }

  /* ---------- prikaz ---------- */
  function footHTML() {
    var T = APP.T(), B = T.booking, tt = totals(), n = APP.cart.length;
    if (st.step >= STEPS) return '';
    var btn = st.step === STEPS - 1
      ? '<button type="button" class="btn btn-plum gloss" data-bk-next><svg class="ic"><use href="#' + VIA[st.via][0] + '"/></svg>' + esc(APP.t('booking.sendTo', { a: VIA[st.via][1] })) + '</button>'
      : '<button type="button" class="btn btn-plum gloss" data-bk-next>' + esc(B.next) + '<svg class="ic ic-end"><use href="#i-arrow"/></svg></button>';
    return '<div class="bk-foot"><p class="tot"><b>' + (n ? (tt.from ? esc(T.services.from) + ' ' : '') + APP.price(tt.price) : '') + '</b>' + (n ? esc(APP.t('cart.items', { n: n }) + ' · ' + APP.dur(tt.min)) : esc(B.pickServices)) + (st.step >= 1 && st.when ? '<br>' + esc(whenText()) : '') + '</p>' + btn + '</div>';
  }
  function render() {
    var T = APP.T(), body = [stepService, stepWhen, stepContact, stepDone][Math.min(st.step, STEPS)]();
    APP.sheet.set({
      title: st.step >= STEPS ? T.booking.done : T.booking.title,
      body: (st.step < STEPS ? paneSteps() : '') + '<div class="bk-pane' + (dir < 0 ? ' back' : '') + '">' + body + '</div>',
      foot: footHTML(),
      onBack: st.step > 0 && st.step < STEPS ? function () { go(st.step - 1); } : null,
    });
    save();
  }
  function go(s) { dir = s >= st.step ? 1 : -1; st.step = s; errors = {}; render(); }
  function next() {
    readInputs();
    if (st.step === 0 && !chosen().length) { errors = { svc: 1 }; render(); return; }
    if (st.step === 1 && (!st.when || !st.part || (st.when === 'date' && (!st.date || closedOn(st.date))))) { errors = { when: 1 }; render(); return; }
    if (st.step === 2) {
      errors = {};
      if (st.name.trim().length < 2) errors.name = 1;
      var digits = st.phone.replace(/[^\d]/g, '');
      if (!/^[+\d][\d\s\-/().]*$/.test(st.phone.trim()) || digits.length < 8 || digits.length > 15) errors.phone = 1;
      if (errors.name || errors.phone) { render(); var f = $('.field.err input'); if (f) f.focus(); return; }
      if (navigator.vibrate) try { navigator.vibrate([10, 40, 10]); } catch (e) {}
      go(STEPS); send(); return;
    }
    go(st.step + 1);
  }
  function readInputs() {
    var n = $('.bk-note'), a = $('.bk-name'), p = $('.bk-phone'), d = $('.bk-date-in');
    if (n) st.note = n.value.trim(); if (a) st.name = a.value; if (p) st.phone = p.value; if (d) st.date = d.value;
  }
  function refreshPreview() { var pv = $('.bk-preview'); if (pv) pv.outerHTML = previewHTML(); }

  /* ---------- slanje ---------- */
  function send() {
    var text = message(), c = S.contact;
    if (st.via === 'ig') {
      var done = function () { APP.toast(APP.T().booking.copyIg); setTimeout(function () { window.open('https://ig.me/m/' + c.instagram, '_blank', 'noopener'); }, 900); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done); else done();
      return;
    }
    APP.openApp(st.via === 'viber' ? 'viber://chat?number=%2B' + c.viber + '&draft=' + encodeURIComponent(text) : 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text));
  }

  /* ---------- događaji ---------- */
  function pick(sel, b) { $$(sel).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); }
  document.addEventListener('click', function (e) {
    if (!open) return;
    var b;
    if ((b = e.target.closest('[data-pick]'))) { readInputs(); var id = b.getAttribute('data-pick'), on = APP.cart.indexOf(id) < 0; APP.toggleCart(id, on); b.setAttribute('aria-checked', String(on)); errors = {}; APP.sheet.set({ foot: footHTML() }); var et = $('.sheet .err-t'); if (et && st.step === 0) et.textContent = ''; return; }
    if ((b = e.target.closest('[data-when]'))) {
      readInputs(); var w = b.getAttribute('data-when'), was = st.when; st.when = w; errors = {};
      if (w === 'date' || was === 'date') { dir = 0; render(); var di = $('.bk-date-in'); if (di) di.focus(); }
      else { pick('[data-when]', b); APP.sheet.set({ foot: footHTML() }); save(); }
      return;
    }
    if ((b = e.target.closest('[data-part]'))) { st.part = b.getAttribute('data-part'); errors = {}; pick('[data-part]', b); var we = $('.when-err'); if (we) we.textContent = ''; APP.sheet.set({ foot: footHTML() }); save(); return; }
    if ((b = e.target.closest('[data-via]'))) { readInputs(); st.via = b.getAttribute('data-via'); pick('[data-via]', b); APP.sheet.set({ foot: footHTML() }); refreshPreview(); save(); return; }
    if (e.target.closest('[data-bk-next]')) { next(); return; }
    if (e.target.closest('[data-bk-send]')) { send(); return; }
  });
  document.addEventListener('input', function (e) { if (open && e.target.matches('.bk-note, .bk-name, .bk-phone')) { readInputs(); if (!e.target.matches('.bk-note')) refreshPreview(); save(); } });
  document.addEventListener('change', function (e) { if (open && e.target.matches('.bk-date-in')) { readInputs(); dir = 0; render(); } });
  document.addEventListener('keydown', function (e) { if (open && e.key === 'Enter' && e.target.matches('.bk-name, .bk-phone')) { e.preventDefault(); next(); } });
  document.addEventListener('langchange', function () { if (open) render(); });

  window.Booking = {
    open: function (o) {
      o = o || {};
      if (st.step >= STEPS) st.step = 0; // novi upit poslije poslanog
      if (o.step != null) st.step = o.step;
      if (st.step > 0 && !chosen().length) st.step = 0;
      dir = 1; errors = {}; open = true;
      APP.sheet.open({ title: APP.T().booking.title, body: '', kind: 'booking', onClose: function () { open = false; readInputs(); save(); } });
      render();
    },
  };
})();
