/* "Isprobaj boju": polica sa bočicama, oblik, dužina, stil, ten, omiljeni i slika za story. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, N = window.Nails, $ = APP.$, $$ = APP.$$, esc = APP.esc;
  var svg = $('.try-hand'); if (!svg || svg.__done) return; svg.__done = true;
  var STYLES = ['solid', 'french', 'ombre', 'chrome', 'matte', 'deco'];
  var state = Object.assign({ shade: 'ballet', shape: 'almond', len: 1, style: 'solid', skin: 0 }, APP.store('look') || {});
  if (!N.shadeOf(state.shade).name) state.shade = 'ballet';
  var hand = new N.Hand(svg, { state: Object.assign({}, state, { shade: 'bare' }) });
  var group = N.shadeOf(state.shade).g || 'nude';

  /* ---------- bočica laka ---------- */
  function bottle(s) {
    var id = 'bt' + s.id, glow = N.mix(s.hex, '#ffffff', 0.45), dark = N.mix(s.hex, '#2a0f1c', 0.25), fill = 'url(#' + id + ')';
    var extra = s.kind === 'glitter' ? '<g fill="#fff" opacity=".9"><circle cx="15" cy="44" r=".9"/><circle cx="23" cy="52" r=".8"/><circle cx="27" cy="42" r=".7"/><circle cx="18" cy="56" r=".7"/><circle cx="25" cy="60" r=".9"/></g><g fill="#E9C9A6"><circle cx="20" cy="47" r=".8"/><circle cx="14" cy="58" r=".7"/><circle cx="28" cy="55" r=".7"/></g>' : '';
    var grad = s.kind === 'chrome'
      ? '<stop offset="0" stop-color="' + N.mix(s.hex, '#fff', 0.6) + '"/><stop offset=".45" stop-color="' + s.hex + '"/><stop offset=".6" stop-color="#F3E8FF"/><stop offset="1" stop-color="' + dark + '"/>'
      : '<stop offset="0" stop-color="' + glow + '"/><stop offset=".35" stop-color="' + s.hex + '"/><stop offset="1" stop-color="' + dark + '"/>';
    return '<svg viewBox="0 0 40 66" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' + grad + '</linearGradient></defs>' +
      '<rect x="13" y="2" width="14" height="22" rx="4" fill="#4A1F33"/><rect x="15" y="4" width="3" height="18" rx="1.5" fill="#fff" opacity=".25"/>' +
      '<rect x="11" y="22" width="18" height="6" rx="2" fill="#E8E1EA"/>' +
      '<path d="M8 32C8 28 11 27 14 27H26C29 27 32 28 32 32V58C32 62 29 64 25 64H15C11 64 8 62 8 58Z" fill="' + fill + '"/>' + extra +
      '<path d="M11.5 33V57" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"/><path d="M8 32C8 28 11 27 14 27H26C29 27 32 28 32 32V58C32 62 29 64 25 64H15C11 64 8 62 8 58Z" fill="none" stroke="#fff" stroke-opacity=".5"/></svg>';
  }
  function shapeIcon(shape) {
    return '<svg viewBox="-12 -34 24 36" aria-hidden="true"><path d="' + N.nailPath(shape, 18, 30) + '" fill="currentColor" opacity=".9"/></svg>';
  }

  /* ---------- crtanje kontrola ---------- */
  function render() {
    var T = APP.T(), to = T.tryon;
    $('.shelf-groups').innerHTML = S.shadeGroups.map(function (g) { return '<button type="button" role="tab" data-sg="' + g[0] + '" aria-selected="' + (g[0] === group) + '">' + esc(APP.tr(g.slice(1))) + '</button>'; }).join('');
    $('.shelf').innerHTML = S.shades.map(function (s) { return '<button type="button" class="bottle" role="option" data-shade="' + s.id + '" data-g="' + s.g + '" aria-selected="' + (s.id === state.shade) + '" aria-label="' + esc(APP.tr(s.name)) + '">' + bottle(s) + '<span>' + esc(APP.tr(s.name)) + '</span></button>'; }).join('');
    $('.seg-shapes').innerHTML = N.SHAPES.map(function (k) { return '<button type="button" role="radio" data-shape="' + k + '" aria-checked="' + (k === state.shape) + '">' + shapeIcon(k) + esc(to.shapes[k]) + '</button>'; }).join('');
    $('.seg-len').innerHTML = to.lengths.map(function (l, i) { return '<button type="button" role="radio" data-len="' + i + '" aria-checked="' + (i === state.len) + '">' + esc(l) + '</button>'; }).join('');
    $('.seg-style').innerHTML = STYLES.map(function (k) { return '<button type="button" role="radio" data-style="' + k + '" aria-checked="' + (k === state.style) + '">' + esc(to.styles[k]) + '</button>'; }).join('');
    $('.seg-skin').innerHTML = S.skins.map(function (sk, i) { return '<button type="button" role="radio" data-skin="' + i + '" aria-checked="' + (i === state.skin) + '" aria-label="' + esc(to.skins[i]) + '"><i style="background:linear-gradient(135deg,' + sk[0] + ',' + sk[1] + ')"></i></button>'; }).join('');
    ['.seg-shapes', '.seg-len', '.seg-style', '.seg-skin'].forEach(function (s, i) { $(s).setAttribute('aria-label', [to.shape, to.length, to.style, to.skin][i]); });
    $('.shelf').setAttribute('aria-label', to.shade);
    updateName(false); updateFav();
  }
  function updateName(pop) {
    var sh = N.shadeOf(state.shade), el = $('.try-name');
    el.querySelector('i').style.background = sh.hex;
    el.querySelector('span').textContent = APP.tr(sh.name) + ' · ' + APP.T().tryon.styles[state.style];
    if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  function updateFav() {
    var b = $('[data-try="fav"]'), on = APP.isFav(state);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('span').textContent = on ? APP.T().tryon.faved : APP.T().tryon.fav;
  }
  function mark(attr, val) { $$('[' + attr + ']').forEach(function (b) { b.setAttribute(b.classList.contains('bottle') ? 'aria-selected' : 'aria-checked', String(b.getAttribute(attr) === String(val))); }); }
  function apply(next) {
    Object.assign(state, next);
    hand.set(next);
    APP.store('look', state); APP.look = Object.assign({}, state);
    updateName(next.shade != null || next.style != null); updateFav();
    if (navigator.vibrate && next.shade) try { navigator.vibrate(10); } catch (e) {}
  }

  /* ---------- događaji ---------- */
  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-shade]'))) { mark('data-shade', b.getAttribute('data-shade')); var s = N.shadeOf(b.getAttribute('data-shade')); var nx = { shade: s.id }; if (s.kind === 'chrome' && state.style === 'solid') { nx.style = 'chrome'; mark('data-style', 'chrome'); } apply(nx); syncGroup(s.g); return; }
    if ((b = e.target.closest('[data-sg]'))) { group = b.getAttribute('data-sg'); syncGroup(group, true); return; }
    if ((b = e.target.closest('[data-shape]'))) { mark('data-shape', b.getAttribute('data-shape')); apply({ shape: b.getAttribute('data-shape') }); return; }
    if ((b = e.target.closest('[data-len]'))) { mark('data-len', b.getAttribute('data-len')); apply({ len: +b.getAttribute('data-len') }); return; }
    if ((b = e.target.closest('[data-style]'))) { mark('data-style', b.getAttribute('data-style')); apply({ style: b.getAttribute('data-style') }); return; }
    if ((b = e.target.closest('[data-skin]'))) { mark('data-skin', b.getAttribute('data-skin')); apply({ skin: +b.getAttribute('data-skin') }); return; }
    if ((b = e.target.closest('[data-try]'))) {
      var a = b.getAttribute('data-try');
      if (a === 'surprise') surprise();
      if (a === 'fav') { var on = APP.toggleFav(Object.assign({}, state)); updateFav(); APP.toast(on ? APP.T().tryon.saved : APP.T().favs.removed); }
      if (a === 'share') share();
      if (a === 'want') APP.bookLook(Object.assign({}, state));
    }
  });
  // strelice lijevo/desno kroz nijanse
  $('.shelf').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = $$('.bottle'), i = list.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); var n = list[Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))]; n.focus(); n.click();
  });
  function syncGroup(g, scroll) {
    group = g; $$('[data-sg]').forEach(function (x) { x.setAttribute('aria-selected', String(x.getAttribute('data-sg') === g)); });
    if (scroll) { var first = $('.bottle[data-g="' + g + '"]'), shelf = $('.shelf'); if (first) shelf.scrollTo({ left: first.offsetLeft - shelf.offsetLeft - 20, behavior: APP.reduced ? 'auto' : 'smooth' }); }
  }
  // dok se polica lista, aktivna grupa prati vidljive bočice
  $('.shelf').addEventListener('scroll', function () {
    var shelf = this, mid = shelf.scrollLeft + 60, cur = null;
    $$('.bottle', shelf).forEach(function (b) { if (b.offsetLeft - shelf.offsetLeft <= mid) cur = b.getAttribute('data-g'); });
    if (cur && cur !== group) syncGroup(cur);
  }, { passive: true });

  var COMBOS = [['ballet', 'almond', 1, 'french'], ['pearl', 'oval', 1, 'chrome'], ['cherry', 'squoval', 0, 'solid'], ['lilac', 'almond', 2, 'ombre'], ['latte', 'square', 1, 'deco'], ['wine', 'oval', 1, 'solid'], ['peach', 'coffin', 2, 'ombre'], ['champagne', 'almond', 1, 'solid'], ['plum', 'squoval', 0, 'matte'], ['rosechrome', 'stiletto', 2, 'chrome'], ['milk', 'almond', 1, 'deco'], ['mint', 'oval', 0, 'solid']];
  var lastCombo = -1;
  function surprise() {
    var k; do { k = Math.floor(Math.random() * COMBOS.length); } while (k === lastCombo); lastCombo = k;
    var c = COMBOS[k], nx = { shade: c[0], shape: c[1], len: c[2], style: c[3] };
    mark('data-shade', c[0]); mark('data-shape', c[1]); mark('data-len', c[2]); mark('data-style', c[3]);
    apply(nx); syncGroup(N.shadeOf(c[0]).g, true);
    var sel = $('.bottle[aria-selected="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center', behavior: APP.reduced ? 'auto' : 'smooth' });
  }

  /* ---------- slika za Instagram story (1080x1920) ---------- */
  function share() {
    var T = APP.T(), sh = N.shadeOf(state.shade), W = 1080, H = 1920;
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FBF6F3'); g.addColorStop(0.55, '#F7E3E8'); g.addColorStop(1, '#EEDDF3');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    [[180, 360, 420, '#F4D6DC'], [930, 1220, 460, '#E9DDF4'], [540, 980, 520, '#ffffff']].forEach(function (b) { var r = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); r.addColorStop(0, b[3]); r.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = r; x.fillRect(0, 0, W, H); });
    var img = new Image();
    img.onload = function () {
      Promise.all([document.fonts.load('96px "Instrument Serif"'), document.fonts.load('italic 96px "Instrument Serif"'), document.fonts.load('700 30px Manrope')]).catch(function () {}).then(function () {
        x.drawImage(img, 140, 420, 800, 1132);
        x.textAlign = 'center'; x.fillStyle = '#9C4F66'; x.font = '800 30px Manrope, sans-serif';
        x.fillText(spaced(T.tryon.storyTitle.toUpperCase()), W / 2, 190);
        x.fillStyle = '#4A1F33'; x.font = 'italic 110px "Instrument Serif", serif'; x.fillText(APP.tr(sh.name), W / 2, 310);
        x.font = '600 34px Manrope, sans-serif'; x.fillStyle = '#7A4A5E';
        x.fillText(T.tryon.shapes[state.shape] + ' · ' + T.tryon.lengths[state.len] + ' · ' + T.tryon.styles[state.style], W / 2, 375);
        x.beginPath(); x.arc(W / 2, 1640, 30, 0, Math.PI * 2); x.fillStyle = sh.hex; x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke();
        x.fillStyle = '#4A1F33'; x.font = '72px "Instrument Serif", serif'; x.fillText(S.name, W / 2, 1765);
        x.font = '700 32px Manrope, sans-serif'; x.fillStyle = '#9C4F66'; x.fillText('@' + S.contact.instagram, W / 2, 1825);
        c.toBlob(function (blob) {
          var file = new File([blob], 'glaze-' + state.shade + '.png', { type: 'image/png' });
          APP.lastStory = blob;
          if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: S.name, text: T.tryon.shareText }).catch(function () {});
          else { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
        }, 'image/png');
      });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(hand.toSVGString(800, 1132));
  }
  function spaced(s) { return s.split('').join(String.fromCharCode(8202)); }

  render();
  // prvo lakiranje kad se sekcija pojavi
  var started = false;
  function start() { if (started) return; started = true; hand.set({ shade: state.shade, style: state.style }); }
  if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: 0.35 }); o.observe(svg); } else start();
  document.addEventListener('langchange', render);
  APP.tryon = { state: state, hand: hand, share: share };
})();
