/* Ilustrovana ruka sa noktima: oblici noktiju, stilovi laka i animacija lakiranja četkicom.
 * Koristi se u heroju, u "Isprobaj boju", u galeriji i za sliku za story. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- boje ---------- */
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function toHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = hx(a), y = hx(b); return toHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function light(c) { var v = hx(c); return (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) / 255; }

  /* ---------- oblik nokta ----------
   * Ishodište je sredina baze nokta, vrh je prema gore (negativan y). Svi oblici imaju
   * istu strukturu (M + 4 C + Z), pa se mogu glatko pretvarati jedan u drugi. */
  var SHAPES = ['almond', 'oval', 'square', 'squoval', 'coffin', 'stiletto'];
  function nailPath(shape, W, L) {
    var h = W / 2, k = W * 0.3, f = function (n) { return Math.round(n * 100) / 100; };
    var Rx, Ls, t1, t2; // t1/t2 = kontrolne tačke vrha
    switch (shape) {
      case 'square': Rx = h; Ls = L - W * 0.09; t1 = [h, -L]; t2 = [-h, -L]; break;
      case 'squoval': Rx = h; Ls = L - W * 0.24; t1 = [h * 0.98, -L - W * 0.02]; t2 = [-h * 0.98, -L - W * 0.02]; break;
      case 'oval': Rx = h; Ls = L - h; t1 = [h, -Ls - h * 1.33]; t2 = [-h, -Ls - h * 1.33]; break;
      case 'coffin': Rx = W * 0.3; Ls = L - W * 0.02; t1 = [W * 0.12, -L - W * 0.01]; t2 = [-W * 0.12, -L - W * 0.01]; break;
      case 'stiletto': Rx = W * 0.1; Ls = L - W * 0.08; t1 = [W * 0.03, -L - W * 0.1]; t2 = [-W * 0.03, -L - W * 0.1]; break;
      default: Rx = W * 0.4; Ls = L - W * 0.5; t1 = [W * 0.3, -L - W * 0.18]; t2 = [-W * 0.3, -L - W * 0.18]; // badem
    }
    var sideTop = -Ls, mid = (-k + sideTop) / 2;
    return 'M' + f(-h) + ' ' + f(-k) +
      'C' + f(-h) + ' ' + f(k * 0.55) + ' ' + f(h) + ' ' + f(k * 0.55) + ' ' + f(h) + ' ' + f(-k) +
      'C' + f(h) + ' ' + f(mid) + ' ' + f(Rx + (h - Rx) * 0.35) + ' ' + f(sideTop + (Ls - k) * 0.18) + ' ' + f(Rx) + ' ' + f(sideTop) +
      'C' + f(t1[0]) + ' ' + f(t1[1]) + ' ' + f(t2[0]) + ' ' + f(t2[1]) + ' ' + f(-Rx) + ' ' + f(sideTop) +
      'C' + f(-Rx - (h - Rx) * 0.35) + ' ' + f(sideTop + (Ls - k) * 0.18) + ' ' + f(-h) + ' ' + f(mid) + ' ' + f(-h) + ' ' + f(-k) + 'Z';
  }

  /* ---------- slojevi laka ---------- */
  var BARE = '#F1D2CA';
  function shadeOf(id) { var s = (window.SALON.shades || []).filter(function (x) { return x.id === id; })[0]; return s || { id: 'bare', hex: BARE }; }
  // vraća SVG markup za jedan nokat (sloj boje), u lokalnim koordinatama nokta
  function layers(o, uid) {
    var c = o.hex, W = o.W, L = o.L, k = W * 0.3, box = '<rect x="' + (-W) + '" y="' + (-L * 1.6) + '" width="' + (W * 2) + '" height="' + (L * 1.9) + '"';
    var kind = o.kind || 'solid', st = o.style || 'solid', s = '';
    if (st === 'french') {
      var tip = light(c) > 0.8 ? '#FFFDFB' : c;
      s += box + ' fill="#F4DAD4"/>';
      s += '<path d="M' + (-W) + ' ' + (-L * 2) + 'H' + W + 'V' + (-L * 0.76) + 'Q0 ' + (-L * 0.42) + ' ' + (-W) + ' ' + (-L * 0.76) + 'Z" fill="' + tip + '"/>';
    } else if (st === 'ombre') {
      s += '<linearGradient id="og' + uid + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + (-L) + '" x2="0" y2="' + (-k) + '"><stop offset="0" stop-color="' + c + '"/><stop offset=".55" stop-color="' + mix(c, '#F4DAD4', 0.45) + '"/><stop offset="1" stop-color="#F6E0DA"/></linearGradient>';
      s += box + ' fill="url(#og' + uid + ')"/>';
    } else if (st === 'chrome' || kind === 'chrome') {
      s += '<linearGradient id="cg' + uid + '" gradientUnits="userSpaceOnUse" x1="' + (-W / 2) + '" y1="' + (-L) + '" x2="' + (W / 2) + '" y2="' + (-k) + '">' +
        '<stop offset="0" stop-color="' + mix(c, '#ffffff', 0.55) + '"/><stop offset=".3" stop-color="' + c + '"/><stop offset=".5" stop-color="' + mix(c, '#F3E8FF', 0.7) + '"/>' +
        '<stop offset=".72" stop-color="' + mix(c, '#3a2030', 0.12) + '"/><stop offset="1" stop-color="' + mix(c, '#ffffff', 0.4) + '"/></linearGradient>';
      s += box + ' fill="url(#cg' + uid + ')"/>';
    } else {
      s += box + ' fill="' + c + '"/>';
    }
    if (st === 'glitter' || kind === 'glitter') s += box + ' fill="url(#' + o.pat + ')"/>';
    if (st === 'matte') s += box + ' fill="#fff" opacity=".07"/>';
    if (st === 'deco' && o.finger === 3) { // prstenjak: kamenčić i tačkice
      var gy = -k - W * 0.32;
      s += '<path d="M0 ' + (gy - W * 0.16) + 'L' + (W * 0.13) + ' ' + gy + 'L0 ' + (gy + W * 0.16) + 'L' + (-W * 0.13) + ' ' + gy + 'Z" fill="#fff" stroke="' + mix(c, '#000', 0.25) + '" stroke-width=".8"/>';
      s += '<path d="M0 ' + (gy - W * 0.16) + 'L' + (W * 0.13) + ' ' + gy + 'H' + (-W * 0.13) + 'Z" fill="#F1E6FF" opacity=".9"/>';
      for (var d = 1; d <= 3; d++) s += '<circle cx="0" cy="' + (gy - W * 0.18 - d * W * 0.2) + '" r="' + (W * 0.045) + '" fill="#fff" opacity=".95"/>';
    }
    return s;
  }
  function glossPath(W, L) {
    var k = W * 0.3;
    return 'M' + (-W * 0.22) + ' ' + (-k - 2) + 'C' + (-W * 0.3) + ' ' + (-L * 0.42) + ' ' + (-W * 0.26) + ' ' + (-L * 0.7) + ' ' + (-W * 0.1) + ' ' + (-L * 0.86);
  }

  /* ---------- prsti ---------- */
  var FINGERS = [ // bx, by = baza prsta; a = ugao; len = dužina; w = širina
    { bx: 124, by: 388, a: -33, len: 122, w: 46 }, // palac
    { bx: 160, by: 282, a: -8, len: 166, w: 42 },  // kažiprst
    { bx: 201, by: 270, a: -1, len: 184, w: 43 },  // srednji
    { bx: 241, by: 278, a: 6, len: 168, w: 41 },   // prstenjak
    { bx: 277, by: 302, a: 14, len: 130, w: 36 },  // mali
  ];
  var LEN = [1.0, 1.42, 1.9];
  function nailGeom(f, lenIdx) {
    var W = f.w * 0.66, L = f.w * 0.98 * LEN[lenIdx || 0];
    return { W: W, L: L, base: -f.len + f.w * 1.04 };
  }
  function toWorld(f, x, y) {
    var r = f.a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [f.bx + x * c - y * s, f.by + x * s + y * c];
  }

  /* ---------- ruka ---------- */
  var count = 0;
  function Hand(svg, opts) {
    opts = opts || {};
    this.svg = svg; this.id = 'h' + (++count);
    this.state = Object.assign({ shade: 'bare', shape: 'almond', len: 1, style: 'solid', skin: 0 }, opts.state || {});
    this.brushOn = opts.brush !== false;
    this.render();
  }
  Hand.prototype.render = function () {
    var p = this.id, st = this.state, sk = window.SALON.skins[st.skin], sh = shadeOf(st.shade);
    var h = '<defs>' +
      '<linearGradient id="' + p + 'sk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="sk2" stop-color="' + sk[1] + '"/><stop offset=".42" class="sk1" stop-color="' + sk[0] + '"/><stop offset=".7" class="sk1" stop-color="' + sk[0] + '"/><stop offset="1" class="sk2" stop-color="' + sk[1] + '"/></linearGradient>' +
      '<radialGradient id="' + p + 'pl" cx=".45" cy=".35" r=".75"><stop offset="0" class="sk1" stop-color="' + sk[0] + '"/><stop offset="1" class="sk2" stop-color="' + sk[1] + '"/></radialGradient>' +
      '<linearGradient id="' + p + 'cf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F1F6"/><stop offset=".35" stop-color="#EAD7E6"/><stop offset=".7" stop-color="#D9D3EE"/><stop offset="1" stop-color="#F3E6EC"/></linearGradient>' +
      '<pattern id="' + p + 'gl" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#fff" opacity=".9"/><circle cx="6.5" cy="5" r=".7" fill="#E9C9A6"/><circle cx="3.5" cy="7.5" r=".55" fill="#fff" opacity=".7"/><circle cx="8" cy="1" r=".45" fill="#F7E7C9"/></pattern>' +
      '</defs>';
    // dlan i zglob
    h += '<path class="skin" fill="url(#' + p + 'pl)" d="M152 566C150 506 122 462 106 414C96 380 104 342 126 312L142 272C160 244 290 246 297 296C303 346 297 402 291 450C285 492 279 530 277 566Z"/>';
    h += '<path d="M150 470C170 480 200 482 228 476" fill="none" stroke="' + sk[1] + '" stroke-width="2" opacity=".35" stroke-linecap="round" class="crease"/>';
    // svilena manžeta
    h += '<path d="M112 566L124 506C170 488 254 488 300 506L308 566Z" fill="url(#' + p + 'cf)"/><path d="M150 512C160 530 158 550 152 566M200 506C206 528 206 548 202 566M252 510C258 530 258 548 254 566" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/><path d="M124 506C170 488 254 488 300 506" fill="none" stroke="#C8879A" stroke-width="1.5" opacity=".35"/>';
    var order = [0, 4, 3, 1, 2], self = this;
    order.forEach(function (i) { h += self.fingerSVG(i); });
    if (this.brushOn) h += '<g class="brush" opacity="0" style="pointer-events:none">' + brushSVG(sh.hex) + '</g>';
    this.svg.innerHTML = h;
    this.nails = [0, 1, 2, 3, 4].map(function (i) { return self.svg.querySelector('[data-n="' + i + '"]'); });
    this.brush = this.svg.querySelector('.brush');
  };
  Hand.prototype.fingerSVG = function (i) {
    var f = FINGERS[i], p = this.id, st = this.state, g = nailGeom(f, st.len), sk = window.SALON.skins[st.skin];
    var d = nailPath(st.shape, g.W, g.L), sh = shadeOf(st.shade);
    var s = '<g transform="translate(' + f.bx + ' ' + f.by + ') rotate(' + f.a + ')">';
    var wb = f.w * 1.08, wt = f.w * 0.94, ty = -f.len + wt / 2;
    var fp = 'M' + (-wb / 2) + ' 34C' + (-wb / 2) + ' ' + (-f.len * 0.5) + ' ' + (-wt / 2) + ' ' + (ty + wt * 0.3) + ' ' + (-wt / 2) + ' ' + ty + 'A' + (wt / 2) + ' ' + (wt / 2) + ' 0 0 1 ' + (wt / 2) + ' ' + ty + 'C' + (wt / 2) + ' ' + (ty + wt * 0.3) + ' ' + (wb / 2) + ' ' + (-f.len * 0.5) + ' ' + (wb / 2) + ' 34';
    s += '<path class="skin" d="' + fp + 'Z" fill="url(#' + p + 'sk)"/><path class="fs" d="' + fp + '" fill="none" stroke="' + sk[1] + '" stroke-opacity=".55" stroke-width="1.2"/>';
    [0.42, 0.68].forEach(function (t) { var y = -f.len * t; s += '<path class="crease" d="M' + (-f.w * 0.22) + ' ' + y + 'Q0 ' + (y - 4) + ' ' + (f.w * 0.22) + ' ' + y + '" fill="none" stroke="' + sk[1] + '" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>'; });
    s += '<g data-n="' + i + '" transform="translate(0 ' + g.base + ')">';
    s += '<clipPath id="' + p + 'c' + i + '"><path class="ns" d="' + d + '"/></clipPath>';
    s += '<mask id="' + p + 'm' + i + '" maskUnits="userSpaceOnUse" x="-80" y="-200" width="160" height="260"><path class="ms" d="M0 ' + (g.W * 0.4) + 'V' + (-g.L * 1.12) + '" stroke="#fff" stroke-width="' + (g.W * 1.7) + '" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/></mask>';
    s += '<path d="' + d + '" class="ns" fill="none" stroke="' + sk[1] + '" stroke-width="3" opacity=".5" transform="translate(0 1.2)"/>'; // rub kože oko nokta
    s += '<g clip-path="url(#' + p + 'c' + i + ')"><g class="lo">' + layers({ hex: sh.hex, kind: sh.kind, style: st.style, W: g.W, L: g.L, finger: i, pat: p + 'gl' }, p + i + 'a') + '</g>';
    s += '<g class="ln" mask="url(#' + p + 'm' + i + ')"></g>';
    s += '<path class="gl" d="' + glossPath(g.W, g.L) + '" stroke="#fff" stroke-width="' + (g.W * 0.12) + '" stroke-linecap="round" fill="none" opacity="' + (st.style === 'matte' ? 0 : 0.6) + '"/>';
    s += '<rect class="sheen" x="' + (-g.W * 1.4) + '" y="' + (-g.L * 1.5) + '" width="' + (g.W * 0.35) + '" height="' + (g.L * 2) + '" fill="#fff" opacity=".0" transform="skewX(-18)"/>';
    s += '</g><path class="ns edge" d="' + d + '" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="1"/>';
    s += '</g></g>';
    return s;
  };
  function brushSVG(c) { // vrh četkice je u (0,0), drška ide prema gore
    return '<g class="bt"><path class="bristle" d="M0 2C-5 -4 -7 -12 -6.5 -20H6.5C7 -12 5 -4 0 2Z" fill="' + c + '"/>' +
      '<rect x="-7.5" y="-36" width="15" height="17" rx="2.5" fill="#E8E1EA"/><rect x="-7.5" y="-36" width="5" height="17" rx="2" fill="#fff" opacity=".7"/>' +
      '<path d="M-6.5 -36L-4.5 -160C-4.4 -164 4.4 -164 4.5 -160L6.5 -36Z" fill="#4A1F33"/><path d="M-3.8 -40L-2.6 -150" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/></g>';
  }

  // promjena stanja: oblik i dužina odmah (sa morphom), boja i stil sa lakiranjem
  Hand.prototype.set = function (next, o) {
    o = o || {};
    var prev = this.state, st = this.state = Object.assign({}, prev, next), self = this;
    if (next.skin != null && next.skin !== prev.skin) {
      var sk = window.SALON.skins[st.skin];
      this.svg.querySelectorAll('.sk1').forEach(function (e) { e.setAttribute('stop-color', sk[0]); });
      this.svg.querySelectorAll('.sk2').forEach(function (e) { e.setAttribute('stop-color', sk[1]); });
      this.svg.querySelectorAll('.fs').forEach(function (e) { e.setAttribute('stroke', sk[1]); });
      this.svg.querySelectorAll('.crease').forEach(function (e) { e.setAttribute('stroke', sk[1]); });
    }
    var geomChanged = st.shape !== prev.shape || st.len !== prev.len;
    if (geomChanged) {
      this.nails.forEach(function (n, i) {
        var f = FINGERS[i], g = nailGeom(f, st.len), d = nailPath(st.shape, g.W, g.L);
        n.setAttribute('transform', 'translate(0 ' + g.base + ')');
        n.parentNode.querySelectorAll('.ns').forEach(function (p) { p.setAttribute('d', d); p.style.d = 'path("' + d + '")'; });
        n.querySelector('.gl').setAttribute('d', glossPath(g.W, g.L));
      });
    }
    var paintChanged = st.shade !== prev.shade || st.style !== prev.style || (geomChanged && o.repaint !== false);
    if (paintChanged) this.paint(o);
  };
  Hand.prototype.paint = function (o) {
    o = o || {};
    var self = this, st = this.state, sh = shadeOf(st.shade), stagger = o.stagger == null ? 140 : o.stagger, dur = o.dur || 420;
    var animate = !reduced && o.animate !== false;
    var seq = [4, 3, 2, 1, 0];
    this.paintId = (this.paintId || 0) + 1; var pid = this.paintId;
    seq.forEach(function (i, k) {
      var n = self.nails[i], f = FINGERS[i], g = nailGeom(f, st.len);
      var html = layers({ hex: sh.hex, kind: sh.kind, style: st.style, W: g.W, L: g.L, finger: i, pat: self.id + 'gl' }, self.id + i + 'p' + pid);
      var lo = n.querySelector('.lo'), ln = n.querySelector('.ln'), ms = n.parentNode.querySelector('.ms'), gl = n.querySelector('.gl');
      gl.setAttribute('opacity', st.style === 'matte' ? 0 : (st.style === 'chrome' || sh.kind === 'chrome') ? 0.85 : 0.6);
      ms.setAttribute('d', 'M0 ' + (g.W * 0.4) + 'V' + (-g.L * 1.12));
      ms.setAttribute('stroke-width', g.W * 1.7);
      if (!animate) { lo.innerHTML = html; ln.innerHTML = ''; return; }
      ln.innerHTML = html; ms.style.strokeDashoffset = '1';
      var a = ms.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: k * stagger, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
      a.onfinish = function () {
        if (pid !== self.paintId) return;
        lo.innerHTML = html; ln.innerHTML = ''; ms.style.strokeDashoffset = '0'; a.cancel();
        self.sheen(i);
      };
    });
    if (animate && this.brush) this.moveBrush(seq, stagger, dur, sh.hex);
  };
  Hand.prototype.sheen = function (i) {
    if (reduced) return;
    var r = this.nails[i].querySelector('.sheen'), W = nailGeom(FINGERS[i], this.state.len).W;
    r.animate([{ transform: 'skewX(-18deg) translateX(0)', opacity: 0.0 }, { opacity: 0.55, offset: 0.3 }, { transform: 'skewX(-18deg) translateX(' + (W * 2.6) + 'px)', opacity: 0 }], { duration: 650, easing: 'ease-out' });
  };
  Hand.prototype.moveBrush = function (seq, stagger, dur, hex) {
    var b = this.brush, self = this, st = this.state, t0 = performance.now(), total = (seq.length - 1) * stagger + dur;
    b.querySelector('.bristle').setAttribute('fill', hex);
    cancelAnimationFrame(this.brushRaf);
    function frame(now) {
      var t = Math.max(0, now - t0), idx = Math.min(seq.length - 1, Math.floor(t / stagger)), i = seq[idx], f = FINGERS[i], g = nailGeom(f, st.len);
      var lt = Math.max(0, Math.min(1, (t - idx * stagger) / dur));
      var y = g.base + g.W * 0.2 - (g.L * 1.05) * lt, w = toWorld(f, 0, y);
      var op = t < 80 ? t / 80 : t > total - 120 ? Math.max(0, (total - t) / 120) : 1;
      b.setAttribute('transform', 'translate(' + w[0].toFixed(1) + ' ' + w[1].toFixed(1) + ') rotate(' + (f.a + 28) + ')');
      b.setAttribute('opacity', op.toFixed(2));
      if (t < total) self.brushRaf = requestAnimationFrame(frame); else b.setAttribute('opacity', 0);
    }
    this.brushRaf = requestAnimationFrame(frame);
  };
  Hand.prototype.toSVGString = function (w, h) {
    var c = this.svg.cloneNode(true);
    c.setAttribute('xmlns', NS); c.setAttribute('width', w); c.setAttribute('height', h);
    c.querySelectorAll('.brush').forEach(function (e) { e.remove(); });
    c.querySelectorAll('[style]').forEach(function (e) { e.removeAttribute('style'); });
    return new XMLSerializer().serializeToString(c);
  };

  /* ---------- nokti za kartice (galerija, sezona, omiljeni) ---------- */
  var cardN = 0;
  function nailArt(o, size) {
    var id = 'na' + (++cardN), sh = shadeOf(o.shade), shape = o.shape || 'almond', style = o.style || 'solid';
    var Ws = [30, 34, 30], Ls = [56, 66, 56], xs = [26, 60, 94], ys = [92, 84, 92], rot = [-10, 0, 10];
    var sk = window.SALON.skins[o.skin || 0];
    var s = '<svg viewBox="0 0 120 120" width="' + (size || 120) + '" height="' + (size || 120) + '" aria-hidden="true"><defs><pattern id="' + id + 'gl" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r=".75" fill="#fff"/><circle cx="5" cy="4" r=".6" fill="#E9C9A6"/><circle cx="2.8" cy="6" r=".45" fill="#fff" opacity=".7"/></pattern></defs>';
    for (var i = 0; i < 3; i++) {
      var W = Ws[i], L = Ls[i], d = nailPath(shape, W, L);
      s += '<g transform="translate(' + xs[i] + ' ' + (ys[i] + 26) + ') rotate(' + rot[i] + ')">';
      s += '<rect x="' + (-W * 0.72) + '" y="-8" width="' + (W * 1.44) + '" height="60" rx="' + (W * 0.72) + '" fill="' + sk[0] + '"/>';
      s += '<g transform="translate(0 0)"><clipPath id="' + id + 'c' + i + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + 'c' + i + ')">' +
        layers({ hex: sh.hex, kind: sh.kind, style: style, W: W, L: L, finger: i === 1 ? 3 : 0, pat: id + 'gl' }, id + i) +
        '<path d="' + glossPath(W, L) + '" stroke="#fff" stroke-width="' + (W * 0.12) + '" stroke-linecap="round" fill="none" opacity="' + (style === 'matte' ? 0 : 0.6) + '"/></g>' +
        '<path d="' + d + '" fill="none" stroke="#000" stroke-opacity=".08"/></g></g>';
    }
    return s + '</svg>';
  }

  window.Nails = { Hand: Hand, nailPath: nailPath, nailArt: nailArt, shadeOf: shadeOf, SHAPES: SHAPES, mix: mix, light: light, FINGERS: FINGERS };
})();
