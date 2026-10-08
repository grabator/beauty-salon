/* Glaze Nail Studio: pokretanje, jezik, navigacija, radno vrijeme, usluge, galerija i sheet. */
(function () {
  'use strict';
  if (/[?&]debug=1/.test(location.search)) (function () {
    var box = document.createElement('pre'); box.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:9999;max-height:40vh;overflow:auto;margin:0;padding:10px;border-radius:12px;background:#2a0f18;color:#ffd3de;font:12px/1.4 monospace;white-space:pre-wrap;pointer-events:none';
    var add = function (t) { if (!box.parentNode) document.body.appendChild(box); box.textContent += t + '\n'; };
    window.addEventListener('error', function (e) { add('Greška: ' + e.message + ' (' + (e.filename || '').split('/').pop() + ':' + e.lineno + ')'); });
    window.addEventListener('unhandledrejection', function (e) { add('Greška: ' + (e.reason && (e.reason.message || e.reason.type) || e.reason)); });
    document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('button, a'); add('klik: ' + (t ? (t.getAttribute('data-t') || t.className || t.tagName) + ' ' + (t.textContent || '').trim().slice(0, 24) : e.target.tagName)); }, true);
    add('debug uključen · ' + navigator.userAgent);
  })();
  var S = window.SALON, I = window.I18N = window.I18N || {}, root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('glaze-' + k)); localStorage.setItem('glaze-' + k, JSON.stringify(v)); } catch (e) { return null; } }
  var LANGS = ['bs', 'en', 'de'];
  // dodatni dijelovi (salon.js, features): isključeni se uklanjaju iz stranice, a njihov kod se ne učitava
  var F = Object.assign({ mirror: false, lights: false, season: false, beforeAfter: false, gift: false }, S.features);
  $$('[data-feature]').forEach(function (el) { if (F[el.getAttribute('data-feature')]) el.classList.add('feat-on'); else el.remove(); });

  var APP = window.APP = {
    $: $, $$: $$, esc: esc, store: store, reduced: reduced, v: '7', features: F,
    lang: (function () {
      var q = (location.search.match(/[?&]lang=(bs|en|de)/) || [])[1], saved = store('lang');
      var nav = (navigator.language || '').slice(0, 2);
      return q || saved || (['bs', 'hr', 'sr'].indexOf(nav) > -1 ? 'bs' : nav === 'de' ? 'de' : nav === 'en' ? 'en' : 'bs');
    })(),
    cart: [], look: null, favs: store('favs') || [],
  };
  APP.T = function () { return I[APP.lang]; };
  APP.t = function (key, vars) {
    var v = key.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, I[APP.lang]);
    if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return v;
  };
  APP.tr = function (arr) { return Array.isArray(arr) ? arr[LANGS.indexOf(APP.lang)] || arr[0] : arr; };
  APP.price = function (n) { return S.currency === 'EUR' ? n + ' €' : n + ' KM'; };
  APP.dur = function (m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + r + ' min' : '') : r + ' min'; };
  APP.service = function (id) { return S.services.filter(function (s) { return s.id === id; })[0]; };
  // naslovi sa *kurzivom*, riječ po riječ
  APP.rich = function (text) {
    var hot = false;
    return String(text).split(' ').map(function (w, i) {
      var a = w.charAt(0) === '*', b = /\*[.,!?]?$/.test(w);
      if (a) hot = true;
      var h = esc(w.replace(/\*/g, '')), o = '<span class="w"><span style="--i:' + i + '">' + (hot ? '<em>' + h + '</em>' : h) + '</span></span>';
      if (b) hot = false;
      return o;
    }).join(' ');
  };

  /* ---------- vrijeme salona ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toMin(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function fromMin(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  APP.toMin = toMin; APP.fromMin = fromMin;
  APP.now = function () {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: S.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    var p = {}; f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = +p.hour % 24, key = p.year + '-' + p.month + '-' + p.day;
    return { key: key, min: h * 60 + +p.minute, dow: new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay() };
  };
  APP.addDays = function (key, n) { var p = key.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)); return d.toISOString().slice(0, 10); };
  APP.dow = function (key) { var p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); };
  APP.hoursOn = function (key) { if (S.holidays.indexOf(key) > -1) return null; return S.hours[APP.dow(key)] || null; };
  APP.dayLabel = function (key) {
    var n = APP.now(), T = APP.T();
    if (key === n.key) return T.today;
    if (key === APP.addDays(n.key, 1)) return T.tomorrow;
    var p = key.split('-');
    return T.days[APP.dow(key)] + ', ' + (+p[2]) + '. ' + T.months[+p[1] - 1];
  };
  // slobodni termini za dan i trajanje (u minutama)

  /* ---------- jezik i tekstovi ---------- */
  function applyText() {
    var T = APP.T();
    root.lang = APP.lang;
    $$('[data-t]').forEach(function (el) {
      var v = APP.t(el.getAttribute('data-t'), { city: S.address.city });
      if (typeof v !== 'string') return;
      if (el.classList.contains('split')) { el.innerHTML = APP.rich(v); el.classList.remove('in'); }
      else el.textContent = v;
    });
    $$('[data-ta]').forEach(function (el) { el.setAttribute('aria-label', APP.t(el.getAttribute('data-ta'))); });
    $$('[data-salon]').forEach(function (el) { el.textContent = S[el.getAttribute('data-salon')]; });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === APP.lang)); });
    $$('[data-href]').forEach(function (a) { a.href = S.contact[a.getAttribute('data-href')]; });
    $('.facts').innerHTML = S.facts.map(function (f) { return '<li>' + esc(APP.tr(f)) + '</li>'; }).join('');
    document.title = S.name + ' · ' + APP.tr(['Manikura, gel i njega noktiju', 'Manicure, gel & nail care', 'Maniküre, Gel & Nagelpflege']);
    var md = $('meta[name="description"]');
    if (md) md.content = APP.tr(['Studio za nokte: manikura, gel lak, nadogradnja, pedikura i njega. Isprobaj boju na ruci i zakaži termin.', 'Nail studio: manicure, gel polish, extensions, pedicure and care. Try a colour on the hand and book online.', 'Nagelstudio: Maniküre, Gel-Lack, Modellage, Pediküre und Pflege. Farbe an der Hand ausprobieren und Termin buchen.']);
    $('.fab-t').textContent = T.cart.book;
  }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn(e); } }
  function renderAll() {
    [applyText, renderStatus, renderServices, renderSeason, renderGallery, renderBA, renderFlow, renderHygiene, renderStudio, renderTeam, renderReviews, renderTips, renderFaq, renderContact, renderFooter, updateCartUI, updateFavUI, observeReveal].forEach(safe);
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  /* ---------- otvoreno sada ---------- */
  function renderStatus() {
    var n = APP.now(), T = APP.T(), h = APP.hoursOn(n.key), el = $('.status');
    if (h && n.min >= toMin(h[0]) && n.min < toMin(h[1])) {
      el.classList.remove('closed'); $('.status-t').textContent = APP.t('status.open', { t: h[1] });
      return;
    }
    el.classList.add('closed');
    for (var i = 0; i < 14; i++) {
      var k = APP.addDays(n.key, i), hh = APP.hoursOn(k);
      if (hh && (i > 0 || n.min < toMin(hh[0]))) {
        var d = i === 0 ? T.today : i === 1 ? T.tomorrow : T.days[APP.dow(k)];
        $('.status-t').textContent = APP.t('status.closed', { d: d, t: hh[0] });
        return;
      }
    }
    $('.status-t').textContent = T.status.closedLong;
  }

  /* ---------- usluge i korpa ---------- */
  var CAT_IC = { mani: 'i-hand', gel: 'i-drop', ext: 'i-sparkle', pedi: 'i-leaf', care: 'i-cream', art: 'i-brush' };
  var curCat = 'mani';
  function renderServices() {
    var T = APP.T();
    $('.cat-tabs').innerHTML = S.categories.map(function (c) { return '<button type="button" role="tab" data-cat="' + c[0] + '" aria-selected="' + (c[0] === curCat) + '">' + esc(APP.tr(c.slice(1))) + '</button>'; }).join('');
    drawServices(false);
  }
  function drawServices(anim) {
    var T = APP.T(), list = $('.srv-list');
    list.innerHTML = S.services.filter(function (s) { return s.cat === curCat; }).map(function (s, i) {
      var on = APP.cart.indexOf(s.id) > -1;
      return '<article class="card srv" style="--d:' + i + '"><span class="srv-ic"><svg class="ic"><use href="#' + CAT_IC[s.cat] + '"/></svg></span>' +
        '<h3>' + esc(APP.tr(s.name)) + (s.tag ? '<span class="srv-tag">' + esc(T.services[s.tag]) + '</span>' : '') + '</h3>' +
        '<p>' + esc(APP.tr(s.desc)) + '</p>' +
        '<div class="srv-meta"><span class="srv-price">' + (s.from ? '<small style="font-family:var(--sans);font-size:13px">' + T.services.from + ' </small>' : '') + APP.price(s.price) + (s.unit ? '<small style="font-family:var(--sans);font-size:13px"> / ' + T.services.perNail + '</small>' : '') + '</span>' +
        '<span class="srv-time"><svg class="ic"><use href="#i-clock"/></svg>' + s.min + ' ' + T.services.min + '</span>' +
        '<button type="button" class="btn btn-ghost srv-add" data-add="' + s.id + '" aria-pressed="' + on + '"><svg class="ic"><use href="#' + (on ? 'i-check' : 'i-plus') + '"/></svg><span>' + (on ? T.services.added : T.services.add) + '</span></button></div></article>';
    }).join('');
    list.classList.toggle('anim', !!anim && !reduced);
  }
  APP.toggleCart = function (id, force) {
    var i = APP.cart.indexOf(id), on = force != null ? force : i < 0;
    if (on && i < 0) APP.cart.push(id); if (!on && i > -1) APP.cart.splice(i, 1);
    store('cart', APP.cart); updateCartUI();
    if (on && navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
    $$('[data-add="' + id + '"]').forEach(function (b) {
      var T = APP.T();
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = '<svg class="ic"><use href="#' + (on ? 'i-check' : 'i-plus') + '"/></svg><span>' + (on ? T.services.added : T.services.add) + '</span>';
    });
  };
  function updateCartUI() {
    var n = APP.cart.length;
    $$('.cart-count').forEach(function (b) { b.hidden = !n; b.textContent = n; });
    if (n) { var fab = $('.fab'); fab.classList.remove('bump'); void fab.offsetWidth; }
  }

  /* ---------- omiljeni ---------- */
  APP.lookKey = function (l) { return [l.shade, l.shape, l.len, l.style].join('|'); };
  APP.isFav = function (l) { var k = APP.lookKey(l); return APP.favs.some(function (f) { return APP.lookKey(f) === k; }); };
  APP.toggleFav = function (l) {
    var k = APP.lookKey(l), had = APP.isFav(l);
    APP.favs = had ? APP.favs.filter(function (f) { return APP.lookKey(f) !== k; }) : [Object.assign({ at: Date.now() }, l)].concat(APP.favs).slice(0, 30);
    store('favs', APP.favs); updateFavUI();
    if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
    return !had;
  };
  function updateFavUI() {
    var b = $('.fav-count'); b.hidden = !APP.favs.length; b.textContent = APP.favs.length;
    $$('.dcard .fav-mini').forEach(function (btn) { var d = designById(btn.getAttribute('data-fav')); btn.setAttribute('aria-pressed', String(APP.isFav(designLook(d)))); });
  }
  APP.lookName = function (l) {
    var T = APP.T(), sh = window.Nails.shadeOf(l.shade);
    return (l.name ? l.name + ' · ' : '') + (sh.name ? APP.tr(sh.name) : '') + ' · ' + T.tryon.shapes[l.shape] + ', ' + T.tryon.styles[l.style].toLowerCase();
  };
  function openFavs() {
    var T = APP.T(), body;
    if (!APP.favs.length) {
      body = '<div class="empty"><svg class="ic"><use href="#i-heart"/></svg><p>' + esc(T.favs.empty) + '</p><a class="btn btn-plum" href="#isprobaj" data-close-sheet>' + esc(T.favs.go) + '</a></div>';
    } else {
      body = '<div class="fav-list">' + APP.favs.map(function (f, i) {
        return '<div class="fav-item"><span class="mini">' + window.Nails.nailArt(f, 68) + '</span><div><b>' + esc(f.name || APP.tr(window.Nails.shadeOf(f.shade).name)) + '</b><small>' + esc(T.tryon.shapes[f.shape] + ' · ' + T.tryon.lengths[f.len] + ' · ' + T.tryon.styles[f.style]) + '</small>' +
          '<div class="row-btns"><button type="button" class="btn btn-plum" data-fav-book="' + i + '">' + esc(T.favs.book) + '</button><button type="button" class="btn btn-ghost" data-fav-rm="' + i + '">' + esc(T.favs.remove) + '</button></div></div></div>';
      }).join('') + '</div>';
    }
    APP.sheet.open({ title: T.favs.title, body: body, kind: 'favs' });
  }
  APP.openFavs = openFavs;

  /* ---------- galerija i sezona ---------- */
  function designById(id) { return S.designs.filter(function (d) { return d.id === id; })[0]; }
  function designLook(d) { return { shade: d.shade, shape: d.shape, len: 1, style: d.style, skin: 0, name: APP.tr(d.name), design: d.id }; }
  function season() { var m = +APP.now().key.slice(5, 7); return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'; }
  function dcard(d, i) {
    var T = APP.T(), l = designLook(d);
    return '<article class="dcard" style="--d:' + i + '"><button type="button" class="art" data-design="' + d.id + '" aria-label="' + esc(APP.tr(d.name)) + '">' + window.Nails.nailArt(l, 120) + '</button>' +
      '<b>' + esc(APP.tr(d.name)) + '</b><small>' + esc(T.tryon.shapes[d.shape] + ' · ' + T.gallery.approx + ' ' + APP.price(d.price)) + '</small>' +
      '<button type="button" class="fav-mini" data-fav="' + d.id + '" aria-pressed="' + APP.isFav(l) + '" aria-label="' + esc(T.tryon.fav) + '"><svg class="ic"><use href="#i-heart"/></svg></button></article>';
  }
  function renderSeason() {
    if (!F.season) return;
    var s = season(), T = APP.T();
    $('.season-title').innerHTML = APP.rich(APP.t('season.title', { s: T.season.names[s] }));
    $('.season-row').innerHTML = S.seasons[s].map(function (id, i) { return dcard(designById(id), i); }).join('');
  }
  // galerija: filteri, godišnja doba ispod "Sezona" i "Prikaži još" (4 na desktopu, 2 na mobitelu)
  var galFilter = 'all', galSeason = null, galShown = 0;
  var GAL_F = ['all', 'minimal', 'french', 'chrome', 'ombre', 'glitter', 'season'], SEASONS = ['winter', 'spring', 'summer', 'autumn'];
  function galStep() { return window.innerWidth < 760 ? 2 : 4; }
  function galList() {
    var ss = S.seasons[galSeason || season()];
    return S.designs.filter(function (d) { return galFilter === 'all' || (galFilter === 'season' ? ss.indexOf(d.id) > -1 : d.tags.indexOf(galFilter) > -1); });
  }
  function renderGallery() {
    var T = APP.T(), G = T.gallery, sel = galSeason || season();
    $('.gal-filters').innerHTML = GAL_F.map(function (f) { return '<button type="button" data-gf="' + f + '" aria-pressed="' + (f === galFilter) + '"' + (f === 'season' ? ' aria-controls="gal-seasons" aria-expanded="' + (galFilter === 'season') + '"' : '') + '>' + esc(G.filters[f]) + (f === 'season' ? '<svg class="ic chev" aria-hidden="true"><use href="#i-chev"/></svg>' : '') + '</button>'; }).join('');
    var gs = $('.gal-seasons'); gs.setAttribute('aria-label', G.seasonsLabel);
    gs.innerHTML = SEASONS.map(function (k) { return '<button type="button" data-gs="' + k + '" aria-pressed="' + (k === sel) + '">' + esc(G.seasons[k]) + '</button>'; }).join('');
    $('.gal-sub').classList.toggle('open', galFilter === 'season');
    drawGallery(!galShown);
  }
  function galMoreUI(total) {
    var T = APP.T().gallery, p = $('.gal-more');
    p.hidden = galShown >= total;
    $('.gal-more-t').textContent = T.showMore;
    $('.gal-count').textContent = APP.t('gallery.shown', { n: Math.min(galShown, total), t: total });
  }
  function drawGallery(reset) {
    var list = galList();
    if (reset) galShown = galStep();
    $('.gal-grid').innerHTML = list.slice(0, galShown).map(dcard).join('');
    galMoreUI(list.length);
  }
  function galMore() {
    var list = galList(), from = galShown, grid = $('.gal-grid');
    galShown = Math.min(list.length, galShown + galStep());
    grid.insertAdjacentHTML('beforeend', list.slice(from, galShown).map(function (d, i) { return dcard(d, i); }).join(''));
    galMoreUI(list.length);
    if (galShown >= list.length) { var f = grid.children[from] && grid.children[from].querySelector('.art'); if (f) f.focus({ preventScroll: true }); }
  }
  function openDesign(id) {
    var d = designById(id), T = APP.T(), l = designLook(d), fav = APP.isFav(l);
    APP.sheet.open({
      title: APP.tr(d.name), kind: 'design',
      body: '<div class="d-detail"><div class="art">' + window.Nails.nailArt(l, 260) + '</div><div class="meta"><span>' + esc(T.tryon.shapes[d.shape]) + '</span><span>' + esc(T.tryon.styles[d.style]) + '</span><span>' + esc(APP.tr(window.Nails.shadeOf(d.shade).name)) + '</span><span>' + esc(T.gallery.approx + ' ' + APP.price(d.price)) + '</span></div></div>',
      foot: '<div class="row-btns"><button type="button" class="btn btn-ghost" data-fav="' + d.id + '" aria-pressed="' + fav + '"><svg class="ic"><use href="#i-heart"/></svg><span>' + esc(fav ? T.tryon.faved : T.tryon.fav) + '</span></button><button type="button" class="btn btn-plum gloss" style="flex:1" data-want-design="' + d.id + '"><svg class="ic"><use href="#i-cal"/></svg><span>' + esc(T.gallery.want) + '</span></button></div>',
    });
  }
  APP.serviceForLook = function (l) { return l.style === 'french' ? 'gelfrench' : 'gel'; };
  APP.bookLook = function (l) {
    APP.look = l;
    APP.toggleCart(APP.serviceForLook(l), true);
    if ((l.style === 'chrome' || window.Nails.shadeOf(l.shade).kind === 'chrome') && APP.cart.indexOf('chrome') < 0) APP.toggleCart('chrome', true);
    APP.openBooking({ step: 0 });
  };

  /* ---------- prije i poslije ---------- */
  function baSVG(after) {
    var N = window.Nails, sk = S.skins[0];
    var s = '<svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ba' + after + 'f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + sk[1] + '"/><stop offset=".45" stop-color="' + sk[0] + '"/><stop offset="1" stop-color="' + sk[1] + '"/></linearGradient></defs>';
    s += '<rect width="400" height="320" fill="' + (after ? '#FBEFF2' : '#EFE6E3') + '"/>';
    [[130, 330, -8, 92], [270, 330, 8, 88]].forEach(function (f, k) {
      var W = 58, L = 66, d = N.nailPath(after ? 'almond' : 'square', W, L);
      s += '<g transform="translate(' + f[0] + ' ' + f[1] + ') rotate(' + f[2] + ')"><rect x="-46" y="-250" width="92" height="300" rx="46" fill="url(#ba' + after + 'f)"/>';
      s += '<g transform="translate(0 -150)">';
      if (after) {
        s += '<clipPath id="bac' + k + '"><path d="' + d + '"/></clipPath><g clip-path="url(#bac' + k + ')"><rect x="-60" y="-120" width="120" height="160" fill="#E792A8"/><path d="M' + (-W * 0.22) + ' -20C' + (-W * 0.3) + ' -40 ' + (-W * 0.26) + ' -50 -6 -60" stroke="#fff" stroke-width="7" opacity=".6" fill="none" stroke-linecap="round"/></g><path d="' + d + '" fill="none" stroke="#000" stroke-opacity=".08"/>';
        s += '<path d="M-30 -10Q0 8 30 -10" stroke="' + sk[1] + '" stroke-width="2.5" fill="none" opacity=".5"/>';
      } else {
        s += '<clipPath id="bbc' + k + '"><path d="' + d + '"/></clipPath><g clip-path="url(#bbc' + k + ')"><rect x="-60" y="-120" width="120" height="160" fill="#EFD2CB"/>' +
          '<path d="M-29 -18L-18 -40L-24 -52L-8 -46L2 -62L12 -50L26 -58L29 -30L18 -22L22 -6L-29 -2Z" fill="#C98D9B" opacity=".9"/></g><path d="' + d + '" fill="none" stroke="#000" stroke-opacity=".1"/>';
        s += '<path d="M-34 -6L-26 2L-20 -4L-12 4L-4 -3L4 5L12 -3L20 4L28 -4L34 2" stroke="' + sk[1] + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M-26 6l-6 8M18 8l5 7" stroke="#C99183" stroke-width="2" stroke-linecap="round"/>';
      }
      s += '</g></g>';
    });
    if (after) for (var i = 0; i < 6; i++) s += '<path d="M' + (60 + i * 55) + ' ' + (40 + (i % 3) * 22) + 'l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff" opacity=".9"/>';
    return s + '</svg>';
  }
  function renderBA() {
    if (!F.beforeAfter) return;
    if (!$('.ba-before').innerHTML) { $('.ba-before').innerHTML = baSVG(0); $('.ba-after').innerHTML = baSVG(1); }
    var r = $('.ba-range'); r.setAttribute('aria-label', APP.T().ba.label);
  }

  /* ---------- tok termina, higijena, tim, recenzije, savjeti, FAQ ---------- */
  function renderFlow() {
    var ics = ['i-coffee', 'i-hand', 'i-brush', 'i-oil'];
    $('.flow-steps').innerHTML = APP.T().flow.steps.map(function (s, i) { return '<li class="reveal" style="--d:' + i + '"><span class="fi"><svg class="ic"><use href="#' + ics[i] + '"/></svg></span><h3 class="h3">' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></li>'; }).join('');
  }
  function renderHygiene() {
    $('.hyg-list').innerHTML = S.hygiene.map(function (h, i) { return '<li class="reveal" style="--d:' + i + '"><span class="hi"><svg class="ic"><use href="#i-' + h[0] + '"/></svg></span><h3 class="h3">' + esc(APP.tr(h[1])) + '</h3><p>' + esc(APP.tr(h[2])) + '</p></li>'; }).join('');
  }
  function avatar(m, i) {
    var sk = S.skins[m.skin], hair = m.hair;
    var back = [
      '<path d="M44 74C40 40 60 22 80 22S120 40 116 74C120 104 116 126 110 140H50C44 126 40 104 44 74Z" fill="' + hair + '"/>',
      '<circle cx="80" cy="26" r="17" fill="' + hair + '"/>',
      '<path d="M46 76C42 44 60 26 80 26S118 44 114 76C114 92 110 102 104 106H56C50 102 46 92 46 76Z" fill="' + hair + '"/>',
    ];
    var front = [
      '<path d="M52 66C54 46 66 36 80 36S106 46 108 66C98 54 88 50 80 50S62 54 52 66Z" fill="' + hair + '"/>',
      '<path d="M52 64C54 46 66 38 80 38S106 46 108 64C100 54 92 50 80 50S60 54 52 64Z" fill="' + hair + '"/>',
      '<path d="M52 70C52 48 64 38 80 38S108 48 108 70C96 58 90 52 76 54C68 55 60 60 52 70Z" fill="' + hair + '"/>',
    ];
    return '<svg class="av" viewBox="0 0 160 160" aria-hidden="true"><rect width="160" height="160" fill="#F3E6EC"/><circle cx="80" cy="80" r="62" fill="#fff" opacity=".5"/>' +
      back[i % 3] + '<path d="M28 160C32 128 54 114 80 114S128 128 132 160Z" fill="' + ['#E8B4C0', '#4A1F33', '#C8879A'][i % 3] + '"/><rect x="71" y="92" width="18" height="26" rx="8" fill="' + sk[1] + '"/>' +
      '<ellipse cx="80" cy="72" rx="26" ry="30" fill="' + sk[0] + '"/>' + front[i % 3] +
      '<ellipse cx="68" cy="82" rx="5" ry="3" fill="#E8A1AE" opacity=".45"/><ellipse cx="92" cy="82" rx="5" ry="3" fill="#E8A1AE" opacity=".45"/>' +
      '<circle cx="54" cy="80" r="2.6" fill="#E9C9A6"/><circle cx="106" cy="80" r="2.6" fill="#E9C9A6"/></svg>';
  }
  function renderTeam() {
    var T = APP.T();
    $('.team-row').innerHTML = S.team.map(function (m, i) {
      var sh = window.Nails.shadeOf(m.shade);
      return '<li class="reveal" style="--d:' + i + '"><article class="member">' + avatar(m, i) + '<h3 class="h3">' + esc(m.name) + ' <span class="ex-badge">' + esc(T.example) + '</span></h3><p class="role">' + esc(APP.tr(m.role)) + '</p><span class="shade"><i style="background:' + sh.hex + '"></i>' + esc(T.team.fav + ': ' + APP.tr(sh.name)) + '</span></article></li>';
    }).join('');
  }
  function renderReviews() {
    var T = APP.T();
    var f = S.reviews[0], fs = ''; for (var q = 0; q < 5; q++) fs += '<svg class="ic' + (q < f.stars ? '' : ' off') + '"><use href="#i-star"/></svg>';
    $('.rev-feature').innerHTML = '<div class="stars" role="img" aria-label="' + f.stars + '/5">' + fs + '</div><blockquote>' + esc(APP.tr(f.text)) + '</blockquote><figcaption><span>' + esc(f.name) + '</span><span class="ex-badge">' + esc(T.example) + '</span></figcaption>';
    $('.rev-row').innerHTML = S.reviews.slice(1).map(function (r, i) {
      var st = ''; for (var k = 0; k < 5; k++) st += '<svg class="ic' + (k < r.stars ? '' : ' off') + '"><use href="#i-star"/></svg>';
      return '<li class="reveal" style="--d:' + i + '"><figure class="card review"><div class="stars" role="img" aria-label="' + r.stars + '/5">' + st + '</div><blockquote>' + esc(APP.tr(r.text)) + '</blockquote><footer><span>' + esc(r.name) + '</span><span class="ex-badge">' + esc(T.example) + '</span></footer></figure></li>';
    }).join('');
  }
  function renderStudio() {
    var T = APP.T().studio, P = S.photos || {};
    $('.studio-grid').innerHTML = ['interior', 'team', 'work'].map(function (k, i) {
      var src = P[k], cap = esc(T[k]);
      return '<figure class="ph reveal' + (src ? ' has' : '') + '" style="--d:' + i + '">' + (src ? '<img src="' + esc(src) + '" alt="' + cap + '" loading="lazy" decoding="async">' : '<div class="ph-empty"><svg class="ic"><use href="#i-sparkle"/></svg><span>' + esc(T.placeholder) + '</span></div>') + '<figcaption>' + cap + '</figcaption></figure>';
    }).join('');
  }
  function renderTips() {
    $('.tips').innerHTML = S.tips.map(function (t, i) { return '<li class="reveal" style="--d:' + i + '"><article class="card tip"><span class="ti"><svg class="ic"><use href="#i-' + t[0] + '"/></svg></span><h3 class="h3">' + esc(APP.tr(t[1])) + '</h3><p>' + esc(APP.tr(t[2])) + '</p></article></li>'; }).join('');
  }
  function renderFaq() {
    $('.faq-list').innerHTML = S.faq.map(function (q, i) {
      return '<div class="acc"><button type="button" aria-expanded="false" aria-controls="fq' + i + '" id="fb' + i + '"><span>' + esc(APP.tr(q[0])) + '</span><span class="pl" aria-hidden="true"></span></button><div class="acc-body" id="fq' + i + '" role="region" aria-labelledby="fb' + i + '"><div><p>' + esc(APP.tr(q[1])) + '</p></div></div></div>';
    }).join('');
  }

  /* ---------- kontakt, mapa, footer ---------- */
  APP.links = function () {
    var c = S.contact;
    return { tel: 'tel:' + c.tel, viber: 'viber://chat?number=%2B' + c.viber, wa: 'https://wa.me/' + c.whatsapp, ig: 'https://ig.me/m/' + c.instagram, igProfile: 'https://instagram.com/' + c.instagram, maps: S.address.maps };
  };
  function renderContact() {
    var T = APP.T(), L = APP.links(), n = APP.now(), order = [1, 2, 3, 4, 5, 6, 0], adr = S.address.street + ', ' + S.address.zip + ' ' + S.address.city;
    var hrs = order.map(function (d) { var h = S.hours[d]; return '<span' + (d === n.dow ? ' class="today"' : '') + '>' + esc(T.days[d].charAt(0).toUpperCase() + T.days[d].slice(1)) + '</span><span' + (d === n.dow ? ' class="today"' : '') + '>' + (h ? h[0] + ' – ' + h[1] : esc(T.status.closedLong)) + '</span>'; }).join('');
    $('.ct-info').innerHTML = '<div><dt>' + esc(T.contact.address) + '</dt><dd>' + esc(adr) + '</dd></div>' +
      '<div><dt>' + esc(T.contact.hours) + '</dt><dd class="hours">' + hrs + '</dd></div>' +
      '<div><dt>' + esc(T.contact.parking) + '</dt><dd>' + esc(APP.tr(S.address.parking)) + '</dd></div>';
    $('.ct-btns').innerHTML = '<div class="ct-main"><a class="btn btn-line" href="' + L.tel + '"><svg class="ic"><use href="#i-phone"/></svg><span>' + esc(T.contact.call) + '</span></a>' +
      '<a class="btn btn-line" href="' + L.maps + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-pin"/></svg><span>' + esc(T.contact.maps) + '</span></a></div>' +
      '<div class="msg-btns"><a class="btn btn-soft" href="' + L.viber + '"><svg class="ic"><use href="#i-viber"/></svg><span>Viber</span></a>' +
      '<a class="btn btn-soft" href="' + L.wa + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg><span>WhatsApp</span></a>' +
      '<a class="btn btn-soft" href="' + L.igProfile + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-insta"/></svg><span>Instagram</span></a></div>';
    $('.map-addr-t').textContent = S.name + ' · ' + adr;
    if (!$('.map-ph').innerHTML) $('.map-ph').innerHTML = mapSVG();
    var fr = $('.map iframe'); if (fr) fr.title = APP.t('contact.mapTitle', { n: S.name });
  }
  // prava Google mapa (bez API ključa) se ubacuje tek kad se sekcija približi ekranu
  APP.mapSrc = function () {
    var a = S.address, q = a.lat != null && a.lng != null ? a.lat + ',' + a.lng : a.street + ', ' + a.zip + ' ' + a.city;
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=16&hl=' + APP.lang + '&output=embed';
  };
  function loadMap() {
    var box = $('.map'); if (!box || $('iframe', box)) return;
    var f = document.createElement('iframe');
    f.title = APP.t('contact.mapTitle', { n: S.name }); f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    f.addEventListener('load', function () { box.classList.add('live'); });
    f.src = APP.mapSrc();
    box.appendChild(f);
  }
  function mapSVG() {
    return '<svg viewBox="0 0 520 420" preserveAspectRatio="xMidYMid slice"><rect width="520" height="420" fill="#F6ECEF"/>' +
      '<path d="M-20 300C80 270 160 330 260 300S440 250 540 280V440H-20Z" fill="#DDE9F2"/><path d="M-20 300C80 270 160 330 260 300S440 250 540 280" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>' +
      '<ellipse cx="400" cy="110" rx="80" ry="54" fill="#E3EFE6"/><circle cx="380" cy="100" r="9" fill="#CFE3D4"/><circle cx="420" cy="122" r="11" fill="#CFE3D4"/><circle cx="398" cy="128" r="7" fill="#CFE3D4"/>' +
      '<g stroke="#fff" stroke-linecap="round" fill="none"><path d="M-10 190H530" stroke-width="26"/><path d="M200 -10V300" stroke-width="22"/><path d="M60 -10L120 270" stroke-width="14"/><path d="M330 -10C320 80 360 150 340 290" stroke-width="16"/><path d="M-10 90H530" stroke-width="10"/></g>' +
      '<g fill="#EAD9DF"><rect x="232" y="110" width="80" height="60" rx="8"/><rect x="232" y="210" width="74" height="60" rx="8"/><rect x="90" y="110" width="88" height="62" rx="8"/><rect x="20" y="210" width="80" height="54" rx="8"/><rect x="370" y="210" width="110" height="54" rx="8"/></g>' +
      '<g class="pin"><path d="M272 172s-26-28-26-46a26 26 0 0 1 52 0c0 18-26 46-26 46z" fill="#4A1F33"/><circle cx="272" cy="126" r="10" fill="#E8B4C0"/></g>' +
      '<ellipse cx="272" cy="178" rx="14" ry="4" fill="#4A1F33" opacity=".18"/>' +
      '<g transform="translate(300 62)"><rect width="150" height="40" rx="20" fill="#fff"/><text x="75" y="26" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="15" fill="#4A1F33">' + esc(S.name) + '</text></g></svg>';
  }
  function renderFooter() {
    var L = APP.links(), T = APP.T();
    $('.foot-slogan').textContent = APP.tr(S.slogan);
    $('.foot-links').innerHTML = '<a class="btn btn-dark" href="' + L.tel + '"><svg class="ic"><use href="#i-phone"/></svg><span>' + esc(S.contact.phone) + '</span></a><a class="btn btn-dark" href="' + L.viber + '"><svg class="ic"><use href="#i-viber"/></svg><span>Viber</span></a><a class="btn btn-dark" href="' + L.wa + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg><span>WhatsApp</span></a><a class="btn btn-dark" href="' + L.igProfile + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-insta"/></svg><span>Instagram</span></a>';
    $('.foot-copy').textContent = '© ' + APP.now().key.slice(0, 4) + ' ' + S.name + '. ' + T.footer.rights;
  }

  /* ---------- sheet ---------- */
  APP.sheet = (function () {
    var el = $('.sheet'), scrim = $('.scrim'), body = $('.sheet-body'), foot = $('.sheet-foot'), title = $('#sheet-title'), back = $('.sheet-back');
    var cur = null, lastFocus = null;
    function open(o) {
      cur = o; lastFocus = document.activeElement;
      set(o);
      el.hidden = false; scrim.hidden = false;
      requestAnimationFrame(function () { el.classList.add('on'); scrim.classList.add('on'); });
      document.body.style.overflow = 'hidden';
      $('.fab').classList.add('away');
      setTimeout(function () { var f = $('.sheet-close'); if (f) f.focus({ preventScroll: true }); }, 60);
      markTab(o.kind === 'favs' ? 'favs' : o.kind === 'booking' ? 'book' : null);
    }
    function set(o) {
      if (o.title != null) title.textContent = o.title;
      if (o.body != null) { if (typeof o.body === 'string') body.innerHTML = o.body; else { body.innerHTML = ''; body.appendChild(o.body); } body.scrollTop = 0; }
      if (o.foot != null) foot.innerHTML = o.foot;
      if ('onBack' in o) back.hidden = !o.onBack;
      cur = Object.assign(cur || {}, o);
    }
    function close() {
      if (!cur) return;
      var c = cur; cur = null;
      el.classList.remove('on'); scrim.classList.remove('on');
      document.body.style.overflow = '';
      setTimeout(function () { el.hidden = true; scrim.hidden = true; el.style.transform = ''; }, 420);
      syncFab(); markTab(null);
      if (c.onClose) c.onClose();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    back.addEventListener('click', function () { if (cur && cur.onBack) cur.onBack(); });
    $('.sheet-close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!cur) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') { // fokus ostaje u sheetu
        var f = $$('button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    // povlačenje nadolje zatvara (mobitel)
    var y0 = null, dy = 0;
    [$('.sheet-grab'), $('.sheet-head')].forEach(function (h) {
      h.addEventListener('pointerdown', function (e) { if (e.target.closest('button') || window.innerWidth >= 760) return; y0 = e.clientY; dy = 0; el.classList.add('drag'); h.setPointerCapture(e.pointerId); });
      h.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); el.style.transform = 'translateY(' + dy + 'px)'; });
      function end() { if (y0 == null) return; y0 = null; el.classList.remove('drag'); el.style.transform = ''; if (dy > 110) close(); }
      h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    });
    return { open: open, set: set, close: close, isOpen: function () { return !!cur; }, kind: function () { return cur && cur.kind; } };
  })();

  APP.toast = (function () { var t = 0; return function (msg) { var el = $('.toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(t); t = setTimeout(function () { el.classList.remove('on'); }, 2400); }; })();

  /* ---------- učitavanje modula po potrebi ---------- */
  var loaded = {};
  APP.load = function (name) {
    if (!loaded[name]) loaded[name] = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'js/' + name + '.js?v=' + APP.v; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return loaded[name];
  };
  APP.openBooking = function (o) { APP.load('booking').then(function () { window.Booking.open(o || {}); }); };

  // boja uz outfit: modul se učitava tek kad se izabere slika
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('of-file') || !e.target.files || !e.target.files[0]) return;
    var f = e.target.files[0]; e.target.value = '';
    APP.load('outfit').then(function () { window.Outfit.run(f); }).catch(function () { APP.toast(APP.T().outfit.error); });
  });

  // otvaranje Vibera: ako se aplikacija ne otvori, korisnica dobije poruku umjesto tišine
  APP.openApp = function (url) {
    if (/^viber:/.test(url)) {
      var t = setTimeout(function () { if (!document.hidden) APP.toast(APP.T().toast.noViber); }, 1800);
      var stop = function () { if (document.hidden) { clearTimeout(t); document.removeEventListener('visibilitychange', stop); } };
      document.addEventListener('visibilitychange', stop);
    }
    window.location.href = url;
  };
  // meni (mobitel)
  var MENU = [['studio', 'i-home'], ['galerija', 'i-sparkle'], ['tim', 'i-team'], ['isprobaj', 'i-brush'], ['usluge', 'i-list'], ['njega', 'i-drop'], ['poklon', 'i-gift', 'gift'], ['faq', 'i-help'], ['lokacija', 'i-pin']].filter(function (m) { return !m[2] || F[m[2]]; });
  function openMenu() {
    var T = APP.T();
    APP.sheet.open({
      title: T.menu, kind: 'menu',
      body: '<nav class="menu-list">' + MENU.map(function (m, i) { return '<a href="#' + m[0] + '" data-goto="' + m[0] + '"><span class="mi"><svg class="ic"><use href="#' + m[1] + '"/></svg></span><span>' + esc(T.nav.m[m[0]]) + '</span><svg class="ic go"><use href="#i-arrow"/></svg></a>'; }).join('') + '</nav>',
      foot: '<button type="button" class="btn btn-plum btn-lg btn-block gloss" data-menu-book><svg class="ic"><use href="#i-cal"/></svg><span>' + esc(T.hero.book) + '</span></button>'
    });
  }
  function goTo(id) {
    var el = document.getElementById(id); if (!el) return;
    var go = function () { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); if (history.replaceState) history.replaceState(null, '', '#' + id); };
    if (APP.sheet.isOpen && APP.sheet.isOpen()) { APP.sheet.close(); setTimeout(go, 380); } else go();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-menu], [data-goto], [data-menu-book], a[href^="viber:"]'); if (!b) return;
    if (b.hasAttribute('data-menu')) { openMenu(); return; }
    if (b.hasAttribute('data-goto')) { e.preventDefault(); goTo(b.getAttribute('data-goto')); return; }
    if (b.hasAttribute('data-menu-book')) { APP.sheet.close(); setTimeout(function () { APP.openBooking({}); }, 380); return; }
    if (/^viber:/.test(b.getAttribute('href'))) { e.preventDefault(); APP.openApp(b.getAttribute('href')); }
  });

  /* ---------- događaji ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (b) { var nl = b.getAttribute('data-lang'); ensureLang(nl).then(function () { APP.lang = nl; store('lang', nl); renderAll(); }); return; }
    if ((b = e.target.closest('[data-light]'))) { APP.setLight(b.getAttribute('data-light')); return; }
    if (e.target.closest('[data-tilt]')) { askTilt(); return; }
    if (F.mirror && e.target.closest('[data-mirror]')) { APP.load('mirror').then(function () { window.Mirror.open(); }).catch(function () { APP.toast(APP.T().mirror.noModel); }); return; }
    if (e.target.closest('[data-open-booking]')) { e.preventDefault(); APP.openBooking({}); return; }
    if (e.target.closest('[data-open-favs]')) { openFavs(); return; }
    if (e.target.closest('[data-close-sheet]')) { APP.sheet.close(); return; }
    if ((b = e.target.closest('[data-cat]'))) { curCat = b.getAttribute('data-cat'); $$('[data-cat]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); }); b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' }); drawServices(true); return; }
    if ((b = e.target.closest('[data-add]'))) { var id = b.getAttribute('data-add'), on = APP.cart.indexOf(id) < 0; APP.toggleCart(id, on); if (on) { var f = $('.fab'); f.classList.add('shine'); setTimeout(function () { f.classList.remove('shine'); }, 900); } return; }
    if (e.target.closest('[data-gal-more]')) { galMore(); return; }
    if ((b = e.target.closest('[data-gf]'))) {
      galFilter = b.getAttribute('data-gf'); if (galFilter === 'season' && !galSeason) galSeason = season();
      $$('[data-gf]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); if (x.hasAttribute('aria-expanded')) x.setAttribute('aria-expanded', String(galFilter === 'season')); });
      $('.gal-sub').classList.toggle('open', galFilter === 'season');
      drawGallery(true); return;
    }
    if ((b = e.target.closest('[data-gs]'))) { galSeason = b.getAttribute('data-gs'); $$('[data-gs]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); drawGallery(true); return; }
    if ((b = e.target.closest('[data-fav]'))) {
      var d = designById(b.getAttribute('data-fav')), now = APP.toggleFav(designLook(d));
      APP.toast(now ? APP.T().tryon.saved : APP.T().favs.removed);
      $$('[data-fav="' + d.id + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(now)); var sp = x.querySelector('span'); if (sp) sp.textContent = now ? APP.T().tryon.faved : APP.T().tryon.fav; });
      return;
    }
    if ((b = e.target.closest('[data-design]'))) { openDesign(b.getAttribute('data-design')); return; }
    if ((b = e.target.closest('[data-want-design]'))) { APP.sheet.close(); var dd = designById(b.getAttribute('data-want-design')); setTimeout(function () { APP.bookLook(designLook(dd)); }, 300); return; }
    if ((b = e.target.closest('[data-fav-book]'))) { var fl = APP.favs[+b.getAttribute('data-fav-book')]; APP.sheet.close(); setTimeout(function () { APP.bookLook(fl); }, 300); return; }
    if ((b = e.target.closest('[data-fav-rm]'))) { APP.toggleFav(APP.favs[+b.getAttribute('data-fav-rm')]); openFavs(); APP.toast(APP.T().favs.removed); return; }
    if ((b = e.target.closest('.acc > button'))) { var ex = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!ex)); return; }
    if ((b = e.target.closest('.tabbar a'))) { markTab(b.getAttribute('data-tab')); }
  });

  // prije i poslije: klizač
  (function () {
    var box = $('.ba-box'), r = $('.ba-range'); if (!box) return;
    r.addEventListener('input', function () { box.style.setProperty('--p', r.value + '%'); });
  })();

  /* ---------- navigacija: tabovi, sakrivanje, fab, aktivni link ---------- */
  var tabs = ['home', 'tryon', 'services', 'favs', 'book'];
  function markTab(name) {
    if (!name) name = curSection;
    var i = Math.max(0, tabs.indexOf(name));
    $('.tab-ind').style.transform = 'translateX(' + (i * 100) + '%)';
    $$('.tabbar [data-tab]').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-tab') === name); });
  }
  var curSection = 'home', lastY = 0, ticking = false, heroH = 600;
  function syncFab() { $('.fab').classList.toggle('away', APP.sheet.isOpen() || window.scrollY < heroH * 0.55 || curSection === 'tryon'); }
  function onScroll() {
    ticking = false;
    var y = window.scrollY, tb = $('.tabbar');
    $('.top').classList.toggle('solid', y > 20);
    // donja traka ostaje uvijek vidljiva
    lastY = y; syncFab();
    var vh = window.innerHeight, sec = 'home', topLink = '';
    var tryTop = $('#isprobaj').getBoundingClientRect(), srvTop = $('#usluge').getBoundingClientRect();
    if (tryTop.top < vh * 0.5 && tryTop.bottom > vh * 0.3) sec = 'tryon';
    else if (srvTop.top < vh * 0.5 && srvTop.bottom > vh * 0.3) sec = 'services';
    if (sec !== curSection) { curSection = sec; if (!APP.sheet.isOpen()) markTab(sec); }
    syncFab();
    $$('.top-links a').map(function (a) { return a.getAttribute('data-goto'); }).forEach(function (id) { var el = document.getElementById(id); if (!el) return; var r = el.getBoundingClientRect(); if (r.top < vh * 0.45 && r.bottom > vh * 0.45) topLink = id; });
    $$('.top-links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + topLink); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { heroH = $('.hero').offsetHeight; });

  /* ---------- pojavljivanje ---------- */
  var io = null;
  function observeReveal() {
    var els = $$('.split, .reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { var t = x.target; if (t.classList.contains('hscroll')) { $$('.reveal, .split', t).forEach(function (r) { r.classList.add('in'); }); delete t.dataset.rv; } else t.classList.add('in'); io.unobserve(t); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (e) {
      if (e.classList.contains('in')) return;
      var row = e.closest('.hscroll');
      if (row) { if (!row.dataset.rv) { row.dataset.rv = '1'; io.observe(row); } } else io.observe(e);
    });
  }

  /* brzi skrol ili skok na sidro može preskočiti posmatrač, pa sve što je iznad dna ekrana otkrij kad skrol stane */
  var revT = 0;
  window.addEventListener('scroll', function () {
    clearTimeout(revT);
    revT = setTimeout(function () { $$('.split:not(.in), .reveal:not(.in)').forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); }); }, 160);
  }, { passive: true });

  /* ---------- kursor kapljica ---------- */
  if (fine && !reduced) (function () {
    var c = $('.cursor-drop'), x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    function loop() { x += (tx - x) * 0.22; y += (ty - y) * 0.22; c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0; }
    document.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY; c.classList.add('on'); c.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, input, [role="tab"]'))); if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.addEventListener('mouseleave', function () { c.classList.remove('on'); });
  })();

  /* ---------- veliki nokat koji se lakira dok se skrola do "Isprobaj boju" ---------- */
  (function () {
    var el = $('.scroll-nail'); if (!el) return;
    var d = window.Nails.nailPath('almond', 92, 150);
    el.innerHTML = '<svg viewBox="-56 -170 112 190" aria-hidden="true"><defs><clipPath id="snc"><path d="' + d + '"/></clipPath></defs><path d="' + d + '" class="sn-base"/><g clip-path="url(#snc)"><rect class="sn-fill" x="-60" y="-175" width="120" height="200"/><path class="sn-gl" d="M-20 -10Q-34 -80 -12 -132"/></g><path d="' + d + '" class="sn-edge"/></svg>';
    var look = (store('look') || {}).shade; root.style.setProperty('--look', window.Nails.shadeOf(look || 'ballet').hex);
    if (reduced || (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'))) return;
    var tick = 0;
    function upd() { tick = 0; var r = el.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight * 0.85); el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3)); }
    window.addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(upd); }, { passive: true }); upd();
  })();

  /* ---------- svjetlo salona: Dan, Salon, Večer ---------- */
  var THEME = { day: '#FFFDFC', salon: '#FBF6F3', evening: '#1E0C16' };
  // bez features.lights stranica je uvijek u svjetlu "Salon"
  APP.light = F.lights && store('light') || 'salon'; if (!THEME[APP.light]) APP.light = 'salon';
  if (APP.light !== 'salon') { root.setAttribute('data-light', APP.light); var mc0 = $('meta[name="theme-color"]'); if (mc0) mc0.content = THEME[APP.light]; }
  window.Nails.setLightMode(APP.light);
  function markLight() {
    $$('.light-sw [data-light]').forEach(function (b) { var on = b.getAttribute('data-light') === APP.light; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
  }
  APP.setLight = function (m) {
    if (!F.lights || !THEME[m] || m === APP.light) return;
    APP.light = m; store('light', m);
    if (!reduced) { root.classList.add('light-anim'); clearTimeout(APP.setLight.t); APP.setLight.t = setTimeout(function () { root.classList.remove('light-anim'); }, 700); }
    if (m === 'salon') root.removeAttribute('data-light'); else root.setAttribute('data-light', m);
    var mc = $('meta[name="theme-color"]'); if (mc) mc.content = THEME[m];
    window.Nails.setLightMode(m);
    if (hero) hero.setLight(m);
    if (APP.tryon) APP.tryon.hand.setLight(m);
    markLight();
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) {}
  };
  // strelice unutar grupe radio dugmadi
  document.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.light-sw [data-light]'); if (!b) return;
    var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault(); var all = $$('[data-light]', b.parentNode), i = (all.indexOf(b) + k + all.length) % all.length;
    APP.setLight(all[i].getAttribute('data-light')); all[i].focus();
  });
  markLight();

  /* odsjaj prati nagib telefona ili miš (suptilno) */
  function tiltHands(x, y) { if (hero && heroVisible) hero.setTilt(x, y); if (APP.tryon) APP.tryon.hand.setTilt(x, y); }
  var tiltOn = false;
  function onOrient(e) { if (e.gamma == null) return; tiltHands(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 30))); }
  function startTilt() { if (tiltOn) return; tiltOn = true; window.addEventListener('deviceorientation', onOrient, { passive: true }); }
  function askTilt() {
    var D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().then(function (r) { if (r === 'granted') { startTilt(); $$('[data-tilt]').forEach(function (t) { t.hidden = true; }); APP.toast(APP.T().light.tiltOn); } }).catch(function () {});
    else startTilt();
  }
  if (!reduced) {
    if (fine) document.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') tiltHands(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); }, { passive: true });
    else if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') $$('[data-tilt]').forEach(function (t) { t.hidden = false; });
    else if ('ondeviceorientation' in window) startTilt();
  }

  /* ---------- hero ruka ---------- */
  var hero = null, heroShades = ['peony', 'latte', 'cherry', 'pearl', 'lilac', 'wine'], heroIdx = 0, heroTimer = 0, heroVisible = true;
  function heroPaint() {
    var id = heroShades[heroIdx++ % heroShades.length], sh = window.Nails.shadeOf(id);
    hero.set({ shade: id, style: sh.kind === 'chrome' ? 'chrome' : 'solid' });
    var chip = $('.shade-chip'); chip.querySelector('i').style.background = sh.hex; chip.querySelector('b').textContent = APP.tr(sh.name);
    chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
  }
  function heroLoop() { clearTimeout(heroTimer); if (!heroVisible || document.hidden || reduced) return; heroTimer = setTimeout(function () { heroPaint(); heroLoop(); }, 4200); }
  function startHero() {
    hero = new window.Nails.Hand($('.hero-hand'), { bake: false, state: { shade: 'bare', shape: 'almond', len: 1, style: 'solid', skin: 0 } });
    setTimeout(heroPaint, reduced ? 0 : 450);
    heroLoop();
    $('.hero-hand').addEventListener('click', function () { heroPaint(); heroLoop(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; document.body.classList.toggle('paused', !heroVisible); heroLoop(); }).observe($('.hero'));
    document.addEventListener('visibilitychange', heroLoop);
  }

  /* ---------- uvod ---------- */
  function intro(done) {
    var el = $('.intro');
    if (reduced || store('intro')) { el.remove(); done(); return; }
    store('intro', 1); el.classList.add('run');
    var fin = function () { el.remove(); done(); };
    var t = setTimeout(fin, 1250);
    el.addEventListener('click', function () { clearTimeout(t); fin(); });
  }

  /* ---------- lijeno učitavanje sekcija ---------- */
  function lazy(sel, name) {
    var el = $(sel);
    if (!('IntersectionObserver' in window)) { APP.load(name); return; }
    var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { APP.load(name); o.disconnect(); } }, { rootMargin: '700px 0px' });
    o.observe(el);
  }

  /* ---------- start ---------- */
  // engleski i njemački tekstovi se učitavaju samo kad zatrebaju
  function ensureLang(l) { return I[l] ? Promise.resolve() : APP.load('i18n-' + l); }
  APP.cart = (store('cart') || []).filter(function (id) { return APP.service(id); });
  ensureLang(APP.lang).catch(function () { APP.lang = 'bs'; }).then(start);
  function start() {
  renderAll();
  heroH = $('.hero').offsetHeight;
  intro(function () { startHero(); });
  onScroll(); markTab('home');
  lazy('#isprobaj', 'tryon');
  lazy('#njega', 'extras');
  if (F.gift) lazy('#poklon', 'gift');
  (function () { var m = $('.map'); if (!m) return; if (!('IntersectionObserver' in window)) { loadMap(); return; } var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: '400px 0px' }); o.observe(m); })();
  if ('requestIdleCallback' in window) requestIdleCallback(function () { APP.load('booking'); }, { timeout: 4000 }); else setTimeout(function () { APP.load('booking'); }, 3000);
  setInterval(function () { safe(renderStatus); }, 60000);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  // JSON-LD iz salon.js (jedan izvor podataka)
  (function () {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var ld = { '@context': 'https://schema.org', '@graph': [{
      '@type': 'NailSalon', name: S.name, url: S.url, telephone: S.contact.phone, email: S.contact.email, image: S.url.replace(/\/$/, '') + '/assets/og.jpg', priceRange: '$$',
      address: { '@type': 'PostalAddress', streetAddress: S.address.street, addressLocality: S.address.city, postalCode: S.address.zip, addressCountry: S.address.country },
      geo: { '@type': 'GeoCoordinates', latitude: S.address.lat, longitude: S.address.lng },
      sameAs: ['https://instagram.com/' + S.contact.instagram],
      openingHoursSpecification: Object.keys(S.hours).filter(function (d) { return S.hours[d]; }).map(function (d) { return { '@type': 'OpeningHoursSpecification', dayOfWeek: days[d], opens: S.hours[d][0], closes: S.hours[d][1] }; }),
      makesOffer: S.services.map(function (s) { return { '@type': 'Offer', price: s.price, priceCurrency: S.currency === 'EUR' ? 'EUR' : 'BAM', itemOffered: { '@type': 'Service', name: s.name[0] } }; }),
    }, { '@type': 'FAQPage', mainEntity: S.faq.map(function (q) { return { '@type': 'Question', name: q[0][0], acceptedAnswer: { '@type': 'Answer', text: q[1][0] } }; }) }] };
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  })();
})();
