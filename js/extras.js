/* Dodaci: kviz, kalkulator korekcije, kartica vjernosti i poklon bon. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, $ = APP.$, $$ = APP.$$, esc = APP.esc;
  if (window.Extras) return;

  /* ---------- kviz ---------- */
  var MAP = [
    [['gel'], ['russian', 'classic'], ['build'], ['spa', 'paraffin']],
    [['build', 'gel'], ['gel', 'russian'], ['refill', 'removal'], ['classic', 'russian']],
    [['gel', 'refill'], ['gelfrench', 'classic'], ['russian'], ['russian', 'classic']],
    [['gel'], ['gelfrench'], ['chrome', 'gel'], ['spa', 'paraffin', 'classic']],
  ];
  var q = { i: -1, a: [] };
  function quiz() {
    var T = APP.T(), Q = T.care.quiz, el = $('#kviz'), h;
    if (q.i < 0) {
      h = '<p class="kicker">' + esc(T.care.kicker) + '</p><h3 class="qtitle">' + esc(Q.title) + '</h3><p class="note">' + esc(Q.intro) + '</p><button type="button" class="btn btn-plum gloss" data-q="start">' + esc(Q.start) + '<svg class="ic"><use href="#i-arrow"/></svg></button>';
    } else if (q.i < 4) {
      var qq = Q.qs[q.i];
      h = '<div class="step-in"><p class="qn">' + esc(APP.t('care.quiz.q', { n: q.i + 1 })) + '</p><div class="qbar" aria-hidden="true"><i style="transform:scaleX(' + ((q.i) / 4) + ')"></i></div><h3 class="qtitle" style="margin:14px 0">' + esc(qq[0]) + '</h3><div class="answers">' +
        qq[1].map(function (a, k) { return '<button type="button" data-qa="' + k + '">' + esc(a) + '</button>'; }).join('') + '</div></div>';
    } else {
      var sc = {};
      q.a.forEach(function (k, i) { MAP[i][k].forEach(function (id, j) { sc[id] = (sc[id] || 0) + (j === 0 ? 2 : 1); }); });
      var best = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; }), s1 = APP.service(best[0]), s2 = APP.service(best[1]);
      q.best = [s1.id].concat(s2 && sc[best[1]] >= 3 ? [s2.id] : []);
      h = '<div class="res step-in"><p class="qn">' + esc(Q.result) + '</p><b>' + esc(APP.tr(s1.name)) + '</b><p class="note">' + esc(APP.tr(s1.desc)) + '</p>' +
        (q.best[1] ? '<p class="note">+ ' + esc(APP.tr(s2.name)) + '</p>' : '') +
        '<p><span class="srv-price">' + (s1.from ? esc(T.services.from) + ' ' : '') + APP.price(s1.price) + '</span> · ' + s1.min + ' ' + esc(T.services.min) + '</p>' +
        '<div class="row-btns"><button type="button" class="btn btn-plum gloss" data-q="book"><svg class="ic"><use href="#i-cal"/></svg>' + esc(Q.book) + '</button><button type="button" class="btn btn-text" data-q="again">' + esc(Q.again) + '</button></div></div>';
    }
    el.innerHTML = h;
    if (q.i >= 0 && q.i < 4) requestAnimationFrame(function () { var bar = $('#kviz .qbar i'); if (bar) bar.style.transform = 'scaleX(' + ((q.i + 1) / 4) + ')'; });
  }

  /* ---------- poklon bon ---------- */
  var gift = { amount: S.giftAmounts[1], design: 0 };
  function giftUI() {
    var T = APP.T(), G = T.gift;
    $('.gift-amounts').innerHTML = S.giftAmounts.map(function (a) { return '<button type="button" role="radio" data-ga="' + a + '" aria-checked="' + (a === gift.amount) + '">' + APP.price(a) + '</button>'; }).join('');
    $('.gift-designs').innerHTML = G.designs.map(function (d, i) { return '<button type="button" role="radio" data-gd="' + i + '" aria-checked="' + (i === gift.design) + '">' + esc(d) + '</button>'; }).join('');
    $('.gift-amounts').setAttribute('aria-label', G.amount); $('.gift-designs').setAttribute('aria-label', G.design);
    $('.gift-to').placeholder = G.toPh; $('.gift-msg').placeholder = G.msgPh;
    giftCard();
  }
  function giftCard() {
    var T = APP.T(), G = T.gift, to = $('.gift-to').value.trim(), msg = $('.gift-msg').value.trim();
    var c = $('.gift-card'); c.className = 'gift-card d' + gift.design;
    c.innerHTML = '<div class="gc-top"><span>' + esc(G.label) + '</span><span class="gc-brand">' + esc(S.name) + '</span></div><div><p class="gc-amt">' + APP.price(gift.amount) + '</p><p class="gc-to">' + esc(G.for + ' ' + (to || G.toPh)) + '</p><p class="gc-msg">' + esc(msg || G.msgPh) + '</p></div>';
  }
  function giftBuy() {
    var T = APP.T(), to = $('.gift-to').value.trim() || T.gift.toPh;
    var text = APP.t('gift.buyMsg', { a: APP.price(gift.amount), n: to }) + ($('.gift-msg').value.trim() ? '\n' + T.gift.msg + ': ' + $('.gift-msg').value.trim() : '');
    var L = APP.links(), c = S.contact;
    APP.sheet.open({
      title: T.gift.buy, kind: 'gift',
      body: '<p class="note" style="margin-bottom:14px;white-space:pre-line">' + esc(text) + '</p><div class="via">' +
        '<a class="btn btn-ghost" style="display:grid;min-height:76px" href="viber://chat?number=%2B' + c.viber + '&draft=' + encodeURIComponent(text) + '"><svg class="ic"><use href="#i-viber"/></svg>Viber</a>' +
        '<a class="btn btn-ghost" style="display:grid;min-height:76px" target="_blank" rel="noopener" href="https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text) + '"><svg class="ic"><use href="#i-wa"/></svg>WhatsApp</a>' +
        '<button type="button" class="btn btn-ghost" style="display:grid;min-height:76px" data-gift-ig><svg class="ic"><use href="#i-insta"/></svg>Instagram</button></div>',
    });
    APP.giftText = text;
  }

  /* ---------- događaji ---------- */
  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-q]'))) {
      var a = b.getAttribute('data-q');
      if (a === 'start' || a === 'again') { q = { i: 0, a: [] }; quiz(); var f = $('#kviz [data-qa]'); if (f) f.focus({ preventScroll: true }); }
      if (a === 'book') { q.best.forEach(function (id) { APP.toggleCart(id, true); }); APP.openBooking({ step: 0 }); }
      return;
    }
    if ((b = e.target.closest('[data-qa]'))) { q.a.push(+b.getAttribute('data-qa')); q.i++; quiz(); var g = $('#kviz [data-qa], #kviz [data-q]'); if (g) g.focus({ preventScroll: true }); return; }
    if ((b = e.target.closest('[data-ga]'))) { gift.amount = +b.getAttribute('data-ga'); $$('[data-ga]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); giftCard(); return; }
    if ((b = e.target.closest('[data-gd]'))) { gift.design = +b.getAttribute('data-gd'); $$('[data-gd]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); giftCard(); return; }
    if ((b = e.target.closest('[data-gift]'))) {
      giftBuy(); return;
    }
    if (e.target.closest('[data-gift-ig]')) {
      var done = function () { APP.toast(APP.T().booking.copyIg); setTimeout(function () { window.open('https://ig.me/m/' + S.contact.instagram, '_blank', 'noopener'); }, 900); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(APP.giftText).then(done, done); else done();
    }
  });
  $('.gift-to').addEventListener('input', giftCard);
  $('.gift-msg').addEventListener('input', giftCard);

  function renderAll() { quiz(); giftUI(); }
  document.addEventListener('langchange', renderAll);
  renderAll();
})();
