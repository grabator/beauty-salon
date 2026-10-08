/* Dodaci: kviz za izbor usluge. */
(function () {
  'use strict';
  var APP = window.APP, $ = APP.$, esc = APP.esc;
  if (window.Extras) return;
  window.Extras = true;

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
      h = '<p class="kicker">' + esc(T.care.kicker) + '</p><h3 class="qtitle">' + esc(Q.title) + '</h3><p class="note">' + esc(Q.intro) + '</p><button type="button" class="btn btn-plum gloss" data-q="start">' + esc(Q.start) + '<svg class="ic ic-end"><use href="#i-arrow"/></svg></button>';
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
  });

  function renderAll() { quiz(); }
  document.addEventListener('langchange', renderAll);
  renderAll();
})();
