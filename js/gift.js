/* Poklon bon (uključuje se sa features.gift u salon.js). */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, $ = APP.$, $$ = APP.$$, esc = APP.esc;
  if (window.Gift || !$('.gift-card')) return;
  window.Gift = true;

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

  document.addEventListener('click', function (e) {
    var b;
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
  document.addEventListener('langchange', giftUI);
  giftUI();
})();
