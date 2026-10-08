/* Zakazivanje termina u sheetu: usluge, dodaci, dan i vrijeme, kontakt, pa poruka salonu.
 * Ništa se ne šalje na server: poruka se otvara u Viberu, WhatsAppu ili Instagramu. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, N = window.Nails, $ = APP.$, $$ = APP.$$, esc = APP.esc;
  var ss = function (k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem('glaze-bk-' + k)); sessionStorage.setItem('glaze-bk-' + k, JSON.stringify(v)); } catch (e) { return null; } };
  var st = Object.assign({ step: 0, date: null, time: null, name: '', phone: '', via: 'viber', note: '' }, ss('state') || {});
  var dir = 1, open = false, errors = {};
  function save() { ss('state', st); }

  function main() { return S.services.filter(function (s) { return S.addons.indexOf(s.id) < 0; }); }
  function chosen() { return APP.cart.map(APP.service).filter(Boolean); }
  function totals() {
    var c = chosen(), m = c.reduce(function (a, s) { return a + s.min; }, 0), p = c.reduce(function (a, s) { return a + s.price; }, 0);
    return { min: Math.max(S.slotStep, Math.ceil(m / S.slotStep) * S.slotStep), price: p, from: c.some(function (s) { return s.from || s.unit; }) };
  }
  function days() { var n = APP.now(), out = []; for (var i = 0; i < S.daysAhead; i++) out.push(APP.addDays(n.key, i)); return out; }
  function firstFree(dur) { var d = days(); for (var i = 0; i < d.length; i++) { var sl = APP.slots(d[i], dur); if (sl && sl.some(function (s) { return s.free; })) return d[i]; } return d[0]; }
  function dateText(key, t) { return APP.dayLabel(key) + (t ? ' · ' + t : ''); }
  function lookText(l) { var T = APP.T(), sh = N.shadeOf(l.shade); return (l.name ? l.name + ' · ' : '') + APP.tr(sh.name) + ' · ' + T.tryon.shapes[l.shape] + ', ' + T.tryon.lengths[l.len].toLowerCase() + ', ' + T.tryon.styles[l.style].toLowerCase(); }

  /* ---------- koraci ---------- */
  function paneSteps() { var h = '<div class="bk-steps" aria-hidden="true">'; for (var i = 0; i < 4; i++) h += '<i class="' + (i <= st.step ? 'done' : '') + '"></i>'; return h + '</div>'; }
  function pickItem(s) {
    var on = APP.cart.indexOf(s.id) > -1, T = APP.T();
    return '<button type="button" class="pick-item" role="checkbox" aria-checked="' + on + '" data-pick="' + s.id + '"><span><b>' + esc(APP.tr(s.name)) + '</b><small>' + s.min + ' ' + T.services.min + (s.unit ? ' · ' + T.services.perNail : '') + '</small></span><span class="pp">' + (s.from ? '<small>' + T.services.from + ' </small>' : '') + APP.price(s.price) + '</span><span class="ck"><svg class="ic"><use href="#i-check"/></svg></span></button>';
  }
  function step0() {
    var T = APP.T(), h = '<p class="bk-label">' + esc(T.booking.steps[0]) + '</p><p class="bk-hint">' + esc(T.booking.pickServices) + '</p><div class="pick" role="group" aria-label="' + esc(T.booking.steps[0]) + '">';
    S.categories.forEach(function (c) {
      var list = main().filter(function (s) { return s.cat === c[0]; }); if (!list.length) return;
      h += '<p class="pick-cat">' + esc(APP.tr(c.slice(1))) + '</p>' + list.map(pickItem).join('');
    });
    return h + '</div><p class="err-t" aria-live="polite">' + (errors.svc ? esc(T.booking.needService) : '') + '</p>';
  }
  function step1() {
    var T = APP.T(), l = APP.look, h = '<p class="bk-label">' + esc(T.booking.look) + '</p>';
    if (l) h += '<div class="look-card"><span class="mini">' + N.nailArt(l, 64) + '</span><div><b>' + esc(APP.tr(N.shadeOf(l.shade).name)) + '</b>' + esc(T.tryon.shapes[l.shape] + ' · ' + T.tryon.lengths[l.len] + ' · ' + T.tryon.styles[l.style]) + '</div><a class="btn btn-text" href="#isprobaj" data-close-sheet>' + esc(T.booking.changeLook) + '</a></div>';
    else h += '<div class="look-card"><span class="mini"><svg class="ic" style="width:30px;height:30px;color:var(--mauve-ink)"><use href="#i-brush"/></svg></span><div>' + esc(T.booking.noLook) + '</div><a class="btn btn-text" href="#isprobaj" data-close-sheet>' + esc(T.hero.try) + '</a></div>';
    h += '<p class="bk-label" style="margin-top:22px">' + esc(T.booking.addons) + '</p><div class="pick">' + S.addons.map(function (id) { return pickItem(APP.service(id)); }).join('') + '</div>';
    h += '<label class="field" style="margin-top:18px"><span>' + esc(T.booking.note) + '</span><textarea class="bk-note" maxlength="300">' + esc(st.note) + '</textarea></label>';
    return h;
  }
  function step2() {
    var T = APP.T(), tt = totals(), d = days();
    if (!st.date || d.indexOf(st.date) < 0) st.date = firstFree(tt.min);
    var h = '<p class="bk-label">' + esc(T.booking.day) + '</p><div class="days" role="group" aria-label="' + esc(T.booking.day) + '">';
    d.forEach(function (k) {
      var hrs = APP.hoursOn(k), sl = APP.slots(k, tt.min), any = sl && sl.some(function (s) { return s.free; }), p = k.split('-');
      h += '<button type="button" class="day" data-day="' + k + '" aria-pressed="' + (k === st.date) + '"' + (!hrs ? ' disabled' : '') + ' aria-label="' + esc(APP.dayLabel(k) + (hrs ? '' : ', ' + T.booking.closedDay)) + '"><small>' + esc(T.daysShort[APP.dow(k)]) + '</small><b>' + (+p[2]) + '</b><span>' + (hrs ? (any ? esc(T.months[+p[1] - 1].slice(0, 3)) : '–') : esc(T.booking.closedDay)) + '</span></button>';
    });
    h += '</div><p class="bk-label" style="margin-top:14px">' + esc(T.booking.time) + '</p><p class="bk-hint">' + esc(APP.t('booking.duration', { m: APP.dur(tt.min) })) + '</p>';
    var sl = APP.slots(st.date, tt.min);
    if (!sl || !sl.some(function (s) { return s.free; })) { h += '<p class="note">' + esc(T.booking.noSlots) + '</p>'; st.time = null; }
    else {
      if (st.time && !sl.some(function (s) { return s.t === st.time && s.free; })) st.time = null;
      h += '<div class="slots" role="group" aria-label="' + esc(T.booking.time) + '">' + sl.map(function (s, i) { return '<button type="button" class="slot in" style="--d:' + i + '" data-slot="' + s.t + '" aria-pressed="' + (s.t === st.time) + '"' + (s.free ? '' : ' disabled') + '>' + s.t + '</button>'; }).join('') + '</div>';
    }
    return h + '<p class="err-t" aria-live="polite">' + (errors.time ? esc(T.booking.pickTime) : '') + '</p>';
  }
  function step3() {
    var T = APP.T(), b = T.booking;
    return '<p class="bk-label">' + esc(T.booking.steps[3]) + '</p><div class="form-grid">' +
      '<label class="field' + (errors.name ? ' err' : '') + '"><span>' + esc(b.name) + '</span><input type="text" class="bk-name" autocomplete="given-name" value="' + esc(st.name) + '" maxlength="40"></label><p class="err-t" aria-live="polite">' + (errors.name ? esc(b.nameErr) : '') + '</p>' +
      '<label class="field' + (errors.phone ? ' err' : '') + '"><span>' + esc(b.phone) + '</span><input type="tel" class="bk-phone" autocomplete="tel" inputmode="tel" placeholder="+387 6x xxx xxx" value="' + esc(st.phone) + '" maxlength="22"></label><p class="err-t" aria-live="polite">' + (errors.phone ? esc(b.phoneErr) : '') + '</p>' +
      '<p class="bk-label">' + esc(b.via) + '</p><div class="via" role="radiogroup" aria-label="' + esc(b.via) + '">' +
      [['viber', 'i-viber', 'Viber'], ['wa', 'i-wa', 'WhatsApp'], ['ig', 'i-insta', 'Instagram']].map(function (v) { return '<button type="button" role="radio" data-via="' + v[0] + '" aria-checked="' + (st.via === v[0]) + '" aria-pressed="' + (st.via === v[0]) + '"><svg class="ic"><use href="#' + v[1] + '"/></svg>' + v[2] + '</button>'; }).join('') +
      '</div><p class="note small">' + esc(b.privacy) + '</p></div>';
  }
  function message() {
    var T = APP.T(), m = T.booking.msg, lines = [m.hi];
    lines.push(m.services + ': ' + chosen().map(function (s) { return APP.tr(s.name); }).join(', '));
    lines.push(m.date + ': ' + dateText(st.date, st.time));
    if (APP.look) lines.push(m.look + ': ' + lookText(APP.look));
    if (st.note) lines.push(m.note + ': ' + st.note);
    lines.push(m.name + ': ' + st.name, m.phone + ': ' + st.phone);
    return lines.join('\n');
  }
  function stepDone() {
    var T = APP.T(), b = T.booking, tt = totals(), app = { viber: 'Viber', wa: 'WhatsApp', ig: 'Instagram' }[st.via];
    return '<div class="done-mark"><svg class="ic"><use href="#i-check"/></svg></div><p class="center-x" style="margin:0 0 14px"><b class="h3">' + esc(b.sent) + '</b></p>' +
      '<div class="summary"><p class="kicker">' + esc(b.summary) + '</p><p class="big">' + esc(dateText(st.date, st.time)) + '</p><dl>' +
      '<dt>' + esc(b.msg.services) + '</dt><dd>' + esc(chosen().map(function (s) { return APP.tr(s.name); }).join(', ')) + '</dd>' +
      (APP.look ? '<dt>' + esc(b.msg.look) + '</dt><dd>' + esc(lookText(APP.look)) + '</dd>' : '') +
      '<dt>' + esc(b.total) + '</dt><dd>' + (tt.from ? esc(T.services.from) + ' ' : '') + APP.price(tt.price) + ' · ' + APP.dur(tt.min) + '</dd>' +
      '<dt>' + esc(b.msg.name) + '</dt><dd>' + esc(st.name + ', ' + st.phone) + '</dd></dl></div>' +
      '<div class="form-grid" style="margin-top:16px"><button type="button" class="btn btn-plum btn-lg gloss btn-block" data-bk-send><svg class="ic"><use href="#' + { viber: 'i-viber', wa: 'i-wa', ig: 'i-insta' }[st.via] + '"/></svg>' + esc(APP.t('booking.send', { a: app })) + '</button>' +
      '<button type="button" class="btn btn-ghost btn-block" data-bk-ics><svg class="ic"><use href="#i-cal"/></svg>' + esc(b.ics) + '</button>' +
      '<p class="note small" style="text-align:center">' + esc(b.confirm) + '</p></div>';
  }

  /* ---------- prikaz ---------- */
  function footHTML() {
    var T = APP.T(), b = T.booking, tt = totals(), n = APP.cart.length;
    if (st.step >= 4) return '';
    return '<div class="bk-foot"><p class="tot"><b>' + (n ? (tt.from ? esc(T.services.from) + ' ' : '') + APP.price(tt.price) : '–') + '</b>' + (n ? esc(APP.t('cart.items', { n: n }) + ' · ' + APP.dur(tt.min)) : esc(b.pickServices)) + (st.step >= 2 && st.time ? '<br>' + esc(dateText(st.date, st.time)) : '') + '</p>' +
      '<button type="button" class="btn btn-plum gloss" data-bk-next>' + esc(b.next) + '<svg class="ic"><use href="#i-arrow"/></svg></button></div>';
  }
  function render() {
    var T = APP.T(), body = st.step === 0 ? step0() : st.step === 1 ? step1() : st.step === 2 ? step2() : st.step === 3 ? step3() : stepDone();
    APP.sheet.set({
      title: st.step >= 4 ? T.booking.done : T.booking.title,
      body: (st.step < 4 ? paneSteps() : '') + '<div class="bk-pane' + (dir < 0 ? ' back' : '') + '">' + body + '</div>',
      foot: footHTML(),
      onBack: st.step > 0 && st.step < 4 ? function () { go(st.step - 1); } : null,
    });
    var sel = $('.day[aria-pressed="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
    save();
  }
  function go(s) { dir = s >= st.step ? 1 : -1; st.step = s; errors = {}; render(); }
  function next() {
    readInputs();
    if (st.step === 0 && !chosen().length) { errors = { svc: 1 }; render(); return; }
    if (st.step === 2 && !st.time) { errors = { time: 1 }; render(); return; }
    if (st.step === 3) {
      errors = {};
      if (st.name.trim().length < 2) errors.name = 1;
      var digits = st.phone.replace(/[^\d]/g, '');
      if (!/^[+\d][\d\s\-/().]*$/.test(st.phone.trim()) || digits.length < 8 || digits.length > 15) errors.phone = 1;
      if (errors.name || errors.phone) { render(); var f = $('.field.err input'); if (f) f.focus(); return; }
      if (navigator.vibrate) try { navigator.vibrate([10, 40, 10]); } catch (e) {}
    }
    go(st.step + 1);
  }
  function readInputs() {
    var n = $('.bk-note'), a = $('.bk-name'), p = $('.bk-phone');
    if (n) st.note = n.value.trim(); if (a) st.name = a.value; if (p) st.phone = p.value;
  }

  /* ---------- slanje i kalendar ---------- */
  function send() {
    var text = message(), c = S.contact, url;
    if (st.via === 'viber') url = 'viber://chat?number=%2B' + c.viber + '&draft=' + encodeURIComponent(text);
    if (st.via === 'wa') url = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text);
    if (st.via === 'ig') {
      var done = function () { APP.toast(APP.T().booking.copyIg); setTimeout(function () { window.open('https://ig.me/m/' + c.instagram, '_blank', 'noopener'); }, 900); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done); else done();
      return;
    }
    window.location.href = url;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  APP.ics = function (title, dateKey, startMin, dur, desc, file) {
    var d = dateKey.replace(/-/g, ''), now = new Date(), stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    var t = function (m) { return d + 'T' + pad(Math.floor(m / 60)) + pad(m % 60) + '00'; };
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + S.name + '//Termin//BS', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@' + S.short.toLowerCase(), 'DTSTAMP:' + stamp,
      startMin == null ? 'DTSTART;VALUE=DATE:' + d : 'DTSTART:' + t(startMin),
      startMin == null ? 'DTEND;VALUE=DATE:' + APP.addDays(dateKey, 1).replace(/-/g, '') : 'DTEND:' + t(startMin + dur),
      'SUMMARY:' + icsEsc(title), 'LOCATION:' + icsEsc(S.address.street + ', ' + S.address.city), 'DESCRIPTION:' + icsEsc(desc),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(title), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = (file || 'termin') + '.ics'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return lines.join('\r\n');
  };
  function ics() {
    var T = APP.T();
    APP.ics(APP.t('booking.icsTitle', { s: S.name }), st.date, APP.toMin(st.time), totals().min, message() + '\n\n' + T.booking.confirm, 'termin-' + st.date);
  }

  /* ---------- događaji ---------- */
  document.addEventListener('click', function (e) {
    if (!open) return;
    var b;
    if ((b = e.target.closest('[data-pick]'))) { readInputs(); var id = b.getAttribute('data-pick'), on = APP.cart.indexOf(id) < 0; APP.toggleCart(id, on); b.setAttribute('aria-checked', String(on)); errors = {}; APP.sheet.set({ foot: footHTML() }); var et = $('.sheet .err-t'); if (et && st.step === 0) et.textContent = ''; return; }
    if ((b = e.target.closest('[data-day]'))) { st.date = b.getAttribute('data-day'); st.time = null; errors = {}; dir = 0; render(); return; }
    if ((b = e.target.closest('[data-slot]'))) { st.time = b.getAttribute('data-slot'); $$('[data-slot]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); errors = {}; APP.sheet.set({ foot: footHTML() }); save(); return; }
    if ((b = e.target.closest('[data-via]'))) { readInputs(); st.via = b.getAttribute('data-via'); $$('[data-via]').forEach(function (x) { var on = x === b; x.setAttribute('aria-pressed', String(on)); x.setAttribute('aria-checked', String(on)); }); save(); return; }
    if (e.target.closest('[data-bk-next]')) { next(); return; }
    if (e.target.closest('[data-bk-send]')) { send(); return; }
    if (e.target.closest('[data-bk-ics]')) { ics(); return; }
  });
  document.addEventListener('input', function (e) { if (open && e.target.matches('.bk-note, .bk-name, .bk-phone')) { readInputs(); save(); } });
  document.addEventListener('keydown', function (e) { if (open && e.key === 'Enter' && e.target.matches('.bk-name, .bk-phone')) { e.preventDefault(); next(); } });
  document.addEventListener('langchange', function () { if (open) render(); });

  window.Booking = {
    open: function (o) {
      o = o || {};
      if (st.step >= 4) { st.step = 0; st.time = null; } // novi upit poslije poslanog
      if (o.date) { st.date = o.date; st.time = o.time || null; }
      if (o.step != null) st.step = o.step;
      if (o.time && !chosen().length) st.step = 0;
      dir = 1; errors = {}; open = true;
      APP.sheet.open({ title: APP.T().booking.title, body: '', kind: 'booking', onClose: function () { open = false; readInputs(); save(); } });
      render();
    },
  };
})();
