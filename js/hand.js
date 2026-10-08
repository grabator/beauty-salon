/* Ruka sa noktima (v2): anatomski oblikovani prsti, koža u pet tonova, nokat sa kutikulom,
 * bočnim naborima i C krivinom, materijali laka i svjetlo salona.
 * Koristi se u heroju, u "Isprobaj boju", u galeriji i za sliku za story. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function f2(n) { return Math.round(n * 100) / 100; }

  /* ---------- boje (sRGB i OKLab) ---------- */
  function hx(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function toHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function unlin(c) { c = Math.max(0, Math.min(1, c)); return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055); }
  function rgbLab(rgb) {
    var c = rgb.map(lin);
    var l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]);
    var m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]);
    var s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function oklab(h) { return rgbLab(hx(h)); }
  function fromLab(L) {
    var l = L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2], m = L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2], s = L[0] - 0.0894841775 * L[1] - 1.291485548 * L[2];
    l = l * l * l; m = m * m * m; s = s * s * s;
    return toHex([4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(unlin));
  }
  function mix(a, b, t) { var x = oklab(a), y = oklab(b); return fromLab([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function adj(h, dL, k) { var c = oklab(h); return fromLab([c[0] + dL, c[1] * k, c[2] * k]); }
  function light(c) { return oklab(c)[0]; }
  function dE(a, b) { var x = Array.isArray(a) ? a : oklab(a), y = Array.isArray(b) ? b : oklab(b); return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2)); }

  /* ---------- svjetlo salona ---------- */
  var LIGHTS = {
    day: { hl: '#F6FAFF', tint: '#B9D0FF', tOp: 0.08, skin: '#E2EBFF', sAmt: 0.08, sh: 0.13, lx: -0.45, env: ['#FFFFFF', '#C4D3EA'] },
    salon: { hl: '#FFFFFF', tint: '#FFFFFF', tOp: 0, skin: '#FFFFFF', sAmt: 0, sh: 0.15, lx: -0.2, env: ['#FFF7F9', '#DCC4D0'] },
    evening: { hl: '#FFE1B8', tint: '#FF9248', tOp: 0.12, skin: '#FFA868', sAmt: 0.13, sh: 0.24, lx: 0.35, env: ['#FFDDB2', '#5A2C34'] }
  };
  var lightMode = 'salon';
  // tonovi kože: [osnova, sjena, crvenilo, svjetlo, nabor], blago obojeni svjetlom
  function tones(skin, lm) {
    var L = LIGHTS[lm] || LIGHTS.salon, t = (window.SALON.skins[skin] || window.SALON.skins[0]);
    return L.sAmt ? t.map(function (c) { return mix(c, L.skin, L.sAmt); }) : t.slice();
  }

  /* ---------- oblik nokta ----------
   * Ishodište je sredina baze nokta, vrh je prema gore (negativan y). Svi oblici imaju
   * istu strukturu (M + 4 C + Z), pa se mogu glatko pretvarati jedan u drugi. Baza je ista za sve. */
  var SHAPES = ['almond', 'oval', 'square', 'squoval', 'coffin', 'stiletto'];
  function nailPath(shape, W, L) {
    var h = W / 2, k = W * 0.3;
    var Rx, Ls, t1, t2;
    switch (shape) {
      case 'square': Rx = h; Ls = L - W * 0.09; t1 = [h, -L]; t2 = [-h, -L]; break;
      case 'squoval': Rx = h; Ls = L - W * 0.24; t1 = [h * 0.98, -L - W * 0.02]; t2 = [-h * 0.98, -L - W * 0.02]; break;
      case 'oval': Rx = h; Ls = L - h; t1 = [h, -Ls - h * 1.33]; t2 = [-h, -Ls - h * 1.33]; break;
      case 'coffin': Rx = W * 0.3; Ls = L - W * 0.02; t1 = [W * 0.12, -L - W * 0.01]; t2 = [-W * 0.12, -L - W * 0.01]; break;
      case 'stiletto': Rx = W * 0.1; Ls = L - W * 0.08; t1 = [W * 0.03, -L - W * 0.1]; t2 = [-W * 0.03, -L - W * 0.1]; break;
      default: Rx = W * 0.4; Ls = L - W * 0.5; t1 = [W * 0.3, -L - W * 0.18]; t2 = [-W * 0.3, -L - W * 0.18]; // badem
    }
    var sideTop = -Ls, mid = (-k + sideTop) / 2;
    return 'M' + f2(-h) + ' ' + f2(-k) +
      'C' + f2(-h) + ' ' + f2(k * 0.55) + ' ' + f2(h) + ' ' + f2(k * 0.55) + ' ' + f2(h) + ' ' + f2(-k) +
      'C' + f2(h) + ' ' + f2(mid) + ' ' + f2(Rx + (h - Rx) * 0.35) + ' ' + f2(sideTop + (Ls - k) * 0.18) + ' ' + f2(Rx) + ' ' + f2(sideTop) +
      'C' + f2(t1[0]) + ' ' + f2(t1[1]) + ' ' + f2(t2[0]) + ' ' + f2(t2[1]) + ' ' + f2(-Rx) + ' ' + f2(sideTop) +
      'C' + f2(-Rx - (h - Rx) * 0.35) + ' ' + f2(sideTop + (Ls - k) * 0.18) + ' ' + f2(-h) + ' ' + f2(mid) + ' ' + f2(-h) + ' ' + f2(-k) + 'Z';
  }
  // rub kože koji prelazi preko baze nokta (eponihijum)
  function foldEdge(W) { var h = W / 2, k = W * 0.3; return 'M' + f2(-h - 2.2) + ' ' + f2(-k - 2.6) + 'C' + f2(-h - 0.6) + ' ' + f2(k * 0.55 - 2.8) + ' ' + f2(h + 0.6) + ' ' + f2(k * 0.55 - 2.8) + ' ' + f2(h + 2.2) + ' ' + f2(-k - 2.6); }
  function crescent(W) { var h = W / 2, k = W * 0.3; return foldEdge(W) + 'L' + f2(h + 1.6) + ' ' + f2(-k + 0.6) + 'C' + f2(h) + ' ' + f2(k * 0.55 + 0.4) + ' ' + f2(-h) + ' ' + f2(k * 0.55 + 0.4) + ' ' + f2(-h - 1.6) + ' ' + f2(-k + 0.6) + 'Z'; }

  /* ---------- lak (materijali) ---------- */
  var BARE = '#F1D2CA';
  function shadeOf(id) { var s = (window.SALON.shades || []).filter(function (x) { return x.id === id; })[0]; return s || { id: 'bare', hex: BARE, kind: 'bare' }; }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function grad(id, x1, y1, x2, y2, stops, extra) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f2(x1) + '" y1="' + f2(y1) + '" x2="' + f2(x2) + '" y2="' + f2(y2) + '"' + (extra || '') + '>' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
  }
  // sloj boje jednog nokta u lokalnim koordinatama nokta
  function layers(o, uid) {
    var c = o.hex, W = o.W, L = o.L, k = W * 0.3, st = o.style || 'solid', kind = o.kind || 'solid', T = o.tones, Lg = LIGHTS[o.light] || LIGHTS.salon;
    var box = '<rect x="' + f2(-W) + '" y="' + f2(-L * 1.6) + '" width="' + f2(W * 2) + '" height="' + f2(L * 1.9) + '"', s = '';
    var bare = kind === 'bare';
    if (bare || st === 'french') {
      // prirodna ploča: vidi se ležište nokta i lunula
      s += box + ' fill="' + mix(T[2], '#F8D9D6', 0.55) + '"/>';
      s += '<ellipse cx="0" cy="' + f2(-W * 0.02) + '" rx="' + f2(W * 0.34) + '" ry="' + f2(W * 0.24) + '" fill="#FFF6F2" opacity=".42"/>';
      var tip = bare ? '#F9EEE6' : (light(c) > 0.86 ? '#FFFDFB' : c), yc = bare ? -o.tip + W * 0.06 : -W * 0.8, ys = yc - W * 0.36;
      var smile = 'M' + f2(-W) + ' ' + f2(ys) + 'Q0 ' + f2(yc + W * 0.32) + ' ' + f2(W) + ' ' + f2(ys);
      s += '<path d="' + smile + 'V' + f2(-L * 2) + 'H' + f2(-W) + 'Z" fill="' + tip + '"' + (bare ? ' opacity=".92"' : '') + '/>';
      s += '<path d="' + smile + '" fill="none" stroke="' + tip + '" stroke-width="2.2" opacity=".45"/>';
    } else if (st === 'ombre') {
      var nude = mix(T[2], '#F6DCD6', 0.6);
      s += grad('og' + uid, 0, -L, 0, -k, [0, 0.25, 0.5, 0.75, 1].map(function (t) { return [t, mix(c, nude, Math.pow(t, 1.15))]; }));
      s += box + ' fill="url(#og' + uid + ')"/>';
    } else if (st === 'chrome' || kind === 'chrome') {
      // podloga, pa chrome puder koji se utrlja (sloj .chr)
      var e0 = Lg.env[0], e1 = Lg.env[1], pearl = light(c) > 0.85;
      s += box + ' fill="' + mix(c, '#3A2030', pearl ? 0.04 : 0.1) + '"/>';
      s += '<g class="chr">' + grad('cg' + uid, 0, -L, 0, 0, [[0, mix(c, e0, 0.55)], [0.24, mix(c, e0, 0.22)], [0.42, mix(c, '#1E0E16', pearl ? 0.08 : 0.18)], [0.6, c], [0.82, mix(c, e0, 0.42)], [1, mix(c, e1, 0.3)]], ' class="envg"');
      s += box + ' fill="url(#cg' + uid + ')"/>';
      if (pearl) {
        s += grad('ir' + uid, -W / 2, -L, W / 2, 0, [[0, '#F8CFE2'], [0.35, '#D2E0FA'], [0.7, '#F6E7C4'], [1, '#F1CFEA']]);
        s += box + ' fill="url(#ir' + uid + ')" opacity=".42"/>';
      }
      s += '</g>';
    } else {
      s += box + ' fill="' + (st === 'matte' ? adj(c, 0.035, 0.8) : c) + '"/>';
    }
    if (kind === 'glitter' || st === 'glitter') {
      // četiri grupe čestica, da se pri lakiranju pojavljuju postepeno
      var r = rng(31 + o.finger * 97), n = Math.min(34, Math.round(W * L / 30)), gq = ['', '', '', ''], soft = mix(c, '#fff', 0.5);
      for (var i = 0; i < n; i++) {
        var big = i % 3 === 0, x = (r() - 0.5) * W, y = -r() * L, col = big ? (r() > 0.5 ? '#FFF6E6' : '#E9C9A6') : (r() > 0.5 ? '#FFFFFF' : soft);
        gq[i % 4] += '<circle class="gp" data-a="' + f2(r() * 6.283) + '" cx="' + f2(x) + '" cy="' + f2(y) + '" r="' + f2(big ? 0.9 + r() * 0.6 : 0.45 + r() * 0.35) + '" fill="' + col + '"/>';
      }
      s += '<g class="glt">' + gq.map(function (q) { return '<g class="gq">' + q + '</g>'; }).join('') + '</g>';
    }
    if (st === 'deco' && o.finger === 3) { // prstenjak: brušeni kamenčić i tačkice
      var gy = -k - W * 0.34, gs = W * 0.15;
      s += '<path d="M0 ' + f2(gy - gs) + 'L' + f2(gs * 0.85) + ' ' + f2(gy) + 'L0 ' + f2(gy + gs) + 'L' + f2(-gs * 0.85) + ' ' + f2(gy) + 'Z" fill="#F4F0FF" stroke="' + mix(c, '#000', 0.3) + '" stroke-width=".6"/>';
      s += '<path d="M0 ' + f2(gy - gs) + 'L' + f2(gs * 0.85) + ' ' + f2(gy) + 'H' + f2(-gs * 0.85) + 'Z" fill="#fff"/><path d="M0 ' + f2(gy - gs) + 'L' + f2(gs * 0.3) + ' ' + f2(gy) + 'L0 ' + f2(gy + gs) + 'Z" fill="#DCD3F2" opacity=".7"/>';
      for (var d = 1; d <= 3; d++) s += '<circle cx="0" cy="' + f2(gy - gs - d * W * 0.19) + '" r="' + f2(W * 0.042) + '" fill="#FFFDF8"/>';
    }
    return s;
  }
  // odsjaji: duga refleksija po C krivini, mala tačka bliže vrhu, slabi drugi odsjaj, mokri sjaj
  function highlights(st, kind, W, L, hl) {
    var x0 = -W * 0.17, y1 = -W * 0.14, y2 = -Math.min(L * 0.84, L - W * 0.18), ym = (y1 + y2) / 2, s = '';
    var streak = 'M' + f2(x0) + ' ' + f2(y1) + 'Q' + f2(x0 - W * 0.13) + ' ' + f2(ym) + ' ' + f2(x0 + W * 0.05) + ' ' + f2(y2) + 'Q' + f2(x0 + W * 0.02) + ' ' + f2(ym) + ' ' + f2(x0) + ' ' + f2(y1) + 'Z';
    if (st === 'matte') return '<ellipse cx="' + f2(-W * 0.08) + '" cy="' + f2(-L * 0.48) + '" rx="' + f2(W * 0.42) + '" ry="' + f2(L * 0.42) + '" fill="url(#__soft)"/>';
    var chrome = st === 'chrome' || kind === 'chrome';
    s += '<path d="' + streak + '" fill="' + hl + '" data-l="hl" opacity="' + (chrome ? 0.95 : 0.82) + '"/>';
    s += '<ellipse cx="' + f2(W * 0.17) + '" cy="' + f2(y2 + W * 0.12) + '" rx="' + f2(W * 0.05) + '" ry="' + f2(W * 0.08) + '" fill="' + hl + '" data-l="hl" opacity=".75"/>';
    s += '<path d="M' + f2(W * 0.3) + ' ' + f2(y1 - W * 0.1) + 'Q' + f2(W * 0.36) + ' ' + f2(ym) + ' ' + f2(W * 0.24) + ' ' + f2(y2 + W * 0.25) + '" fill="none" stroke="' + hl + '" data-l="hls" stroke-width="' + f2(W * 0.07) + '" stroke-linecap="round" opacity=".16"/>';
    s += '<path class="wet" d="M' + f2(-W * 0.05) + ' ' + f2(y1) + 'Q' + f2(-W * 0.2) + ' ' + f2(ym) + ' ' + f2(W * 0.02) + ' ' + f2(y2) + '" fill="none" stroke="' + hl + '" data-l="hls" stroke-width="' + f2(W * 0.34) + '" stroke-linecap="round" opacity="0"/>';
    return s;
  }

  /* ---------- prsti i poze ---------- */
  var FINGERS = [ // bx, by = baza prsta; a = ugao; len = dužina; w = širina; bend = blaga zakrivljenost
    { bx: 124, by: 388, a: -35, len: 124, w: 47, bend: 0.02, thumb: true }, // palac
    { bx: 160, by: 283, a: -9, len: 166, w: 41, bend: 0.025 },  // kažiprst
    { bx: 200, by: 270, a: -1.5, len: 185, w: 43, bend: 0.008 }, // srednji
    { bx: 244, by: 279, a: 7.5, len: 168, w: 40.5, bend: -0.03 }, // prstenjak
    { bx: 280, by: 304, a: 16, len: 127, w: 35, bend: -0.075 },  // mali, blago povijen prema prstenjaku
  ];
  var POSES = {
    spread: { fingers: FINGERS, g: '', shadow: [[13, 19, 0.3], [8, 12, 0.35], [4, 6, 0.4]], cast: 1 },
    table: {
      fingers: FINGERS.map(function (f, i) { return Object.assign({}, f, { len: f.len * (i ? 0.95 : 1), bend: f.bend * 1.6 + (i ? 0.02 : 0) }); }),
      g: 'translate(200 330) rotate(-24) scale(1 .86) translate(-200 -330)', shadow: [[5, 8, 1.5], [12, 18, 0.7]], cast: 0.7, blur: 1
    }
  };
  var CROP = '58 66 250 250'; // kadar na vrhove prstiju za pozu "na stolu"
  var LEN = [0.88, 1.27, 1.72];
  function geo(f) {
    if (f._g) return f._g;
    var L = f.len, w = f.w, b = f.bend || 0;
    var prof = f.thumb ? [[30, 0.57], [-0.16, 0.55], [-0.36, 0.53], [-0.55, 0.54], [-0.7, 0.5], [-0.84, 0.49], [-0.92, 0.47]]
      : [[30, 0.56], [-0.12, 0.54], [-0.27, 0.5], [-0.4, 0.515], [-0.53, 0.48], [-0.7, 0.468], [-0.8, 0.478], [-0.9, 0.468]];
    function ax(y) { var u = Math.max(0, -y / L); return b * L * u * u; }
    var R = [], Lf = [];
    prof.forEach(function (p) { var y = p[0] > 0 ? p[0] : p[0] * L, hw = p[1] * w, a = ax(y); R.push([a + hw, y]); Lf.unshift([a - hw, y]); });
    var yt = R[R.length - 1][1], yc = yt + (-L - yt) * 4 / 3, xr = R[R.length - 1][0], xl = Lf[0][0];
    var cap = 'C' + f2(xr) + ' ' + f2(yc) + ' ' + f2(xl) + ' ' + f2(yc) + ' ' + f2(xl) + ' ' + f2(yt);
    var side = 'M' + f2(R[0][0]) + ' ' + f2(R[0][1]) + cr(R) + cap + cr(Lf);
    var Ru = R.slice(2), Lu = Lf.slice(0, Lf.length - 2), up = 'M' + f2(Ru[0][0]) + ' ' + f2(Ru[0][1]) + cr(Ru) + cap + cr(Lu);
    var yb = -L + 0.8 * w, u = -yb / L;
    var j = f.thumb ? [-0.55] : [-0.4, -0.7], cre = '', crl = '';
    j.forEach(function (t, n) {
      var y = t * L, a = ax(y), ww = w * (n ? 0.17 : 0.22), cnt = n ? 2 : 3;
      for (var q = 0; q < cnt; q++) {
        var yy = y + (q - (cnt - 1) / 2) * 3.4, bow = 2.2 + q * 0.6;
        cre += 'M' + f2(a - ww) + ' ' + f2(yy + 0.8) + 'Q' + f2(a) + ' ' + f2(yy - bow) + ' ' + f2(a + ww * (0.8 + q * 0.12)) + ' ' + f2(yy + 0.6);
      }
      crl += 'M' + f2(a - ww * 0.8) + ' ' + f2(y + 6.4) + 'Q' + f2(a) + ' ' + f2(y + 3.6) + ' ' + f2(a + ww * 0.8) + ' ' + f2(y + 6.2);
    });
    f._g = { side: side, d: side + 'Z', up: up, ax: ax, yb: yb, xb: ax(yb), th: Math.atan(2 * b * u) * 180 / Math.PI, W: w * 0.74, tip: 0.8 * w, cre: cre, crl: crl, j: j };
    return f._g;
  }
  function cr(P) { // Catmull-Rom kroz tačke, kao kubne krive
    var s = '';
    for (var i = 0; i < P.length - 1; i++) {
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      s += 'C' + f2(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f2(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f2(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f2(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f2(p2[0]) + ' ' + f2(p2[1]);
    }
    return s;
  }
  function nailL(f, len) { return f.w * LEN[len || 0]; }
  function rot(x, y, deg) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; }

  // zrnatost kože: mali šum nacrtan jednom na canvasu
  var texURL = '';
  function texture() {
    if (texURL) return texURL;
    try {
      var a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = a.height = 64; b.width = b.height = 96;
      var x = a.getContext('2d'), d = x.createImageData(64, 64);
      for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); var y = b.getContext('2d'); y.imageSmoothingEnabled = true; y.drawImage(a, 0, 0, 96, 96);
      texURL = b.toDataURL('image/png');
    } catch (e) { texURL = ''; }
    return texURL;
  }

  /* ---------- crtanje cijele ruke kao SVG markup ---------- */
  var PALM = 'M152 566C150 506 122 462 106 414C96 380 104 342 126 312L142 272C160 244 290 246 297 296C303 346 297 402 291 450C285 492 279 530 277 566Z';
  function tA(i, attr) { return ' data-t="' + i + '" data-ta="' + attr + '"'; }
  function build(p, st, o) {
    var P = POSES[o.pose] || POSES.spread, Lg = LIGHTS[o.light] || LIGHTS.salon, T = tones(st.skin, o.light), sh = shadeOf(st.shade), F = P.fingers, h = '', tx = texture();
    var stop = function (off, t, op) { return '<stop offset="' + off + '" stop-color="' + T[t] + '"' + tA(t, 'stop-color') + (op != null ? ' stop-opacity="' + op + '"' : '') + '/>'; };
    h += '<defs>' +
      '<linearGradient id="' + p + 'fl" x1="0" y1="0" x2="0" y2="1">' + stop(0, 2) + stop(0.16, 0) + stop(1, 0) + '</linearGradient>' +
      '<linearGradient id="' + p + 'cy" x1="0" y1="0" x2="1" y2="0">' + stop(0, 1, 0.75) + stop(0.16, 1, 0.3) + stop(0.36, 3, 0.05) + stop(0.48, 3, 0.4) + stop(0.62, 3, 0.18) + stop(0.84, 1, 0.22) + stop(1, 1, 0.7) + '</linearGradient>' +
      '<linearGradient id="' + p + 'vf" x1="0" y1="0" x2="0" y2="1"><stop offset=".87" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<mask id="' + p + 'mf" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#' + p + 'vf)"/></mask>' +
      '<linearGradient id="' + p + 'vp" x1="0" y1="0" x2="0" y2="1"><stop offset=".1" stop-color="#000"/><stop offset=".3" stop-color="#fff"/></linearGradient>' +
      '<mask id="' + p + 'mp" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#' + p + 'vp)"/></mask>' +
      '<radialGradient id="' + p + 'bl">' + stop(0, 2, 0.6) + stop(1, 2, 0) + '</radialGradient>' +
      '<radialGradient id="' + p + 'kn">' + stop(0, 3, 0.75) + stop(1, 3, 0) + '</radialGradient>' +
      '<radialGradient id="' + p + 'ao"><stop offset="0" stop-color="#3A1418" stop-opacity=".34"/><stop offset="1" stop-color="#3A1418" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + p + 'pl" x1="0" y1="0" x2="0" y2="1">' + stop(0, 0) + stop(0.55, 0) + stop(1, 1) + '</linearGradient>' +
      '<linearGradient id="' + p + 'fm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E0A12" stop-opacity=".3"/><stop offset=".2" stop-color="#1E0A12" stop-opacity=".08"/><stop offset=".5" stop-color="#1E0A12" stop-opacity="0"/><stop offset=".8" stop-color="#1E0A12" stop-opacity=".06"/><stop offset="1" stop-color="#1E0A12" stop-opacity=".26"/></linearGradient>' +
      '<linearGradient id="' + p + 'cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E0A12" stop-opacity="0"/><stop offset=".55" stop-color="#1E0A12" stop-opacity="0"/><stop offset="1" stop-color="#1E0A12" stop-opacity=".2"/></linearGradient>' +
      '<radialGradient id="' + p + 'soft"><stop offset="0" stop-color="' + Lg.hl + '" data-l="hl" data-la="stop-color" stop-opacity=".3"/><stop offset="1" stop-color="' + Lg.hl + '" data-l="hl" data-la="stop-color" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + p + 'cf" x1="0" y1="0" x2="1" y2=".6"><stop offset="0" stop-color="#F8F2F7"/><stop offset=".3" stop-color="#EAD6E5"/><stop offset=".55" stop-color="#F6EEF5"/><stop offset=".78" stop-color="#D8D1EC"/><stop offset="1" stop-color="#F1E3EB"/></linearGradient>' +
      '<linearGradient id="' + p + 'cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A0F18" stop-opacity="0"/><stop offset="1" stop-color="#2A0F18" stop-opacity=".22"/></linearGradient>' +
      (tx ? '<pattern id="' + p + 'tx" width="48" height="48" patternUnits="userSpaceOnUse"><image href="' + tx + '" width="48" height="48"/></pattern>' : '') +
      '<clipPath id="' + p + 'pc"><path d="' + PALM + '"/></clipPath>' +
      '</defs>';
    var body = '';
    // sjena ruke na podlozi (ruka lebdi iznad površine)
    var sil = '<path d="' + PALM + '"/>' + F.map(function (f) { return '<path transform="translate(' + f.bx + ' ' + f.by + ') rotate(' + f.a + ')" d="' + geo(f).d + '"/>'; }).join('');
    if (P.blur) h = h.replace('</defs>', '<filter id="' + p + 'sb" x="-.2" y="-.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation="5"/></filter></defs>');
    P.shadow.forEach(function (s, n) { body += '<g fill="#2A0F18" opacity="' + f2(Lg.sh * s[2]) + '" data-l="sh" data-k="' + s[2] + '" transform="translate(' + f2(s[0] + Lg.lx * 6) + ' ' + s[1] + ')"' + (P.blur ? ' filter="url(#' + p + 'sb)"' : '') + '>' + sil + '</g>'; });
    // nadlanica
    body += '<path d="' + PALM + '" fill="url(#' + p + 'pl)"/>';
    body += '<g clip-path="url(#' + p + 'pc)">' +
      '<ellipse cx="128" cy="356" rx="26" ry="34" fill="url(#' + p + 'ao)" opacity=".5"/>' +
      [[160, 300], [200, 290], [243, 298], [278, 318]].map(function (k) { return '<path d="M' + k[0] + ' ' + (k[1] + 18) + 'Q' + ((k[0] + 210) / 2) + ' ' + (k[1] + 90) + ' ' + (196 + (k[0] - 210) * 0.25) + ' 470" fill="none" stroke="' + T[3] + '"' + tA(3, 'stroke') + ' stroke-width="9" stroke-linecap="round" opacity=".1"/>'; }).join('') +
      (tx ? '<path d="' + PALM + '" fill="url(#' + p + 'tx)" opacity=".035"/>' : '') + '</g>';
    // prsti, od onih ispod prema onima iznad
    var nails = '';
    [0, 4, 3, 1, 2].forEach(function (i) { var r = finger(p, i, F[i], st, sh, T, Lg, o, P); body += r[0]; nails += r[1]; });
    // valjkasto sjenčenje nadlanice preko baza prstiju, utapa se prema zglobovima
    body += '<path d="' + PALM + '" fill="url(#' + p + 'cy)" opacity=".7" mask="url(#' + p + 'mp)"/>';
    // zglobovi na nadlanici (MCP): svjetliji vrhovi i udubljenja između
    [1, 2, 3, 4].forEach(function (i) {
      var f = F[i];
      body += '<ellipse transform="translate(' + f.bx + ' ' + f.by + ') rotate(' + f.a + ')" cx="0" cy="-2" rx="' + f2(f.w * 0.36) + '" ry="11" fill="url(#' + p + 'kn)" opacity=".75"/>';
      if (i < 4) { var g2 = F[i + 1]; body += '<ellipse cx="' + f2((f.bx + g2.bx) / 2) + '" cy="' + f2((f.by + g2.by) / 2 + 12) + '" rx="8" ry="18" fill="url(#' + p + 'ao)" opacity=".45"/>'; }
    });
    // svilena manžeta sa naborima i sjenom na zglobu
    body += '<path d="M124 506C170 488 254 488 300 506L300 494C254 476 170 476 124 494Z" fill="url(#' + p + 'cw)"/>' +
      '<path d="M96 720L124 506C170 488 254 488 300 506L324 720Z" fill="url(#' + p + 'cf)"/>' +
      '<path d="M146 512C158 530 156 550 150 566S140 640 136 720M196 505C204 527 204 548 199 566S200 650 198 720M250 509C258 529 258 548 253 566S262 650 266 720" fill="none" stroke="#fff" stroke-width="3.5" opacity=".75" stroke-linecap="round"/>' +
      '<path d="M170 506C178 528 178 548 174 566S170 650 168 720M224 505C230 527 230 548 226 566S230 650 232 720M276 512C282 530 282 548 280 566S292 650 296 720" fill="none" stroke="#B9A6C9" stroke-width="5" opacity=".25" stroke-linecap="round"/>' +
      '<path d="M124 506C170 488 254 488 300 506" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/><path d="M124 509C170 491 254 491 300 509" fill="none" stroke="#C8879A" stroke-width="1.2" opacity=".35"/>';
    var wrap = function (x) { return P.g ? '<g transform="' + P.g + '">' + x + '</g>' : x; }, soft = function (x) { return x.replace(/url\(#__soft\)/g, 'url(#' + p + 'soft)'); };
    var br = o.brush ? '<g class="brush" opacity="0" style="pointer-events:none">' + brushSVG(sh.hex) + '</g>' : '';
    // dijelovi: defs, koža (statična) i nokti (živi)
    return { defs: soft(h), skin: wrap(body), nails: soft(wrap(nails)) + br, all: soft(h + wrap(body + nails)) + br };
  }
  function finger(p, i, f, st, sh, T, Lg, o, P) {
    var g = geo(f), L = f.len, w = f.w, W = g.W, NL = nailL(f, st.len), d = nailPath(st.shape, W, NL);
    var cast = rot(Lg.lx * 3 + 2, 4, -f.a);
    var gt = '<g transform="translate(' + f.bx + ' ' + f.by + ') rotate(' + f.a + ')">', s = gt;
    s += '<clipPath id="' + p + 'f' + i + '"><path d="' + g.d + '"/></clipPath>';
    // bačena sjena prsta na ono ispod njega
    s += '<path d="' + g.up + 'Z" transform="translate(' + f2(cast[0] * P.cast) + ' ' + f2(cast[1] * P.cast) + ')" fill="#2A0F18" opacity="' + f2(Lg.sh * 0.9) + '" data-l="sh" data-k=".9"/>';
    s += '<g mask="url(#' + p + 'mf)"><path d="' + g.d + '" fill="url(#' + p + 'fl)"/>';
    s += '<g clip-path="url(#' + p + 'f' + i + ')">';
    s += '<path d="' + g.d + '" fill="url(#' + p + 'cy)"/>';
    s += '<ellipse cx="' + f2(g.ax(-L)) + '" cy="' + f2(-0.95 * L) + '" rx="' + f2(w * 0.5) + '" ry="' + f2(w * 0.5) + '" fill="url(#' + p + 'bl)"/>';
    g.j.forEach(function (t, n) { s += '<ellipse cx="' + f2(g.ax(t * L)) + '" cy="' + f2(t * L) + '" rx="' + f2(w * (n ? 0.3 : 0.38)) + '" ry="' + f2(w * (n ? 0.26 : 0.34)) + '" fill="url(#' + p + 'bl)" opacity="' + (n ? 0.55 : 0.8) + '"/>'; });
    s += '<path d="' + g.cre + '" fill="none" stroke="' + T[4] + '"' + tA(4, 'stroke') + ' stroke-width=".9" stroke-linecap="round" opacity=".55"/>';
    s += '<path d="' + g.crl + '" fill="none" stroke="' + T[3] + '"' + tA(3, 'stroke') + ' stroke-width="1.1" stroke-linecap="round" opacity=".55"/>';
    if (texURL) s += '<path d="' + g.d + '" fill="url(#' + p + 'tx)" opacity=".04"/>';
    s += '</g></g>';
    s += '<path d="' + g.up + '" fill="none" stroke="' + T[4] + '"' + tA(4, 'stroke') + ' stroke-opacity=".3" stroke-width=".9"/>';
    s += '</g>';
    var skin = s; s = gt;
    // nokat
    s += '<g data-n="' + i + '" transform="translate(' + f2(g.xb) + ' ' + f2(g.yb) + ') rotate(' + f2(g.th) + ')">';
    s += '<clipPath id="' + p + 'c' + i + '"><path class="ns" d="' + d + '"/></clipPath>';
    s += '<clipPath id="' + p + 'k' + i + '"><path d="' + g.d + '" transform="rotate(' + f2(-g.th) + ') translate(' + f2(-g.xb) + ' ' + f2(-g.yb) + ')"/></clipPath>';
    s += '<clipPath id="' + p + 'e' + i + '"><rect x="-80" y="-300" width="160" height="' + f2(300 - g.tip + 1.5) + '"/></clipPath>';
    if (o.brush) s += '<mask id="' + p + 'm' + i + '" maskUnits="userSpaceOnUse" x="-80" y="-200" width="160" height="260"><path class="ms" d="M0 ' + f2(W * 0.4) + 'V' + f2(-NL * 1.12) + '" stroke="#fff" stroke-width="' + f2(W * 1.7) + '" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/></mask>';
    s += '<linearGradient id="' + p + 'sf' + i + '" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="' + f2(-W * 0.68) + '">' + ['0" stop-opacity=".9', '.7" stop-opacity=".6', '1" stop-opacity="0'].map(function (q) { return '<stop offset="' + q + '" stop-color="' + T[0] + '"' + tA(0, 'stop-color') + '/>'; }).join('') + '</linearGradient>';
    s += '<path class="ns" d="' + d + '" transform="translate(.5 1.7)" fill="#2A0F18" opacity=".26" clip-path="url(#' + p + 'k' + i + ')"/>';
    s += '<g clip-path="url(#' + p + 'c' + i + ')"><g class="lo">' + layers({ hex: sh.hex, kind: sh.kind, style: st.style, W: W, L: NL, finger: i, tones: T, light: o.light, tip: g.tip }, p + i + 'a') + '</g>';
    if (o.brush) s += '<g class="ln" mask="url(#' + p + 'm' + i + ')"></g>';
    s += '<rect x="' + f2(-W / 2) + '" y="-300" width="' + f2(W) + '" height="320" fill="url(#' + p + 'fm)"/>';
    s += '<rect x="' + f2(-W) + '" y="' + f2(-W * 0.32) + '" width="' + f2(W * 2) + '" height="' + f2(W * 0.5) + '" fill="url(#' + p + 'cs)"/>';
    s += '<rect class="tint" x="-80" y="-300" width="160" height="320" fill="' + Lg.tint + '" data-l="tint" opacity="' + Lg.tOp + '"/>';
    s += '<g class="hlg">' + highlights(st.style, sh.kind, W, NL, Lg.hl) + '</g>';
    if (o.brush) s += '<rect class="sheen" x="' + f2(-W * 1.4) + '" y="' + f2(-NL * 1.5) + '" width="' + f2(W * 0.35) + '" height="' + f2(NL * 2) + '" fill="#fff" opacity="0" transform="skewX(-18)"/>';
    s += '</g>';
    // debljina slobodne ivice, bočni nabori i kutikula
    s += '<path class="ns" d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.3" clip-path="url(#' + p + 'e' + i + ')"/>';
    s += '<path class="ns" d="' + d + '" fill="none" stroke="#1E0A12" stroke-opacity=".14" stroke-width=".8"/>';
    s += '<path class="ns" d="' + d + '" fill="none" stroke="url(#' + p + 'sf' + i + ')" stroke-width="2.2"/>';
    var fe = foldEdge(W), cs = crescent(W);
    s += '<path d="' + fe + '" transform="translate(0 -1.3)" fill="none" stroke="#1E0A12" stroke-opacity=".2" stroke-width="1.4"/>';
    s += '<path d="' + cs + '" fill="' + T[0] + '"' + tA(0, 'fill') + '/><path d="' + cs + '" fill="' + T[2] + '"' + tA(2, 'fill') + ' opacity=".22"/>';
    s += '<path d="' + fe + '" fill="none" stroke="' + T[3] + '"' + tA(3, 'stroke') + ' stroke-opacity=".55" stroke-width=".8"/>';
    s += '</g></g>';
    return [skin, s];
  }
  function brushSVG(c) { // vrh četkice je u (0,0), drška ide prema gore
    return '<g class="bt"><path class="bristle" d="M0 2C-5 -4 -7 -12 -6.5 -20H6.5C7 -12 5 -4 0 2Z" fill="' + c + '"/><path d="M-2.5 -4C-4 -9 -4.6 -14 -4.4 -19" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/>' +
      '<rect x="-7.5" y="-36" width="15" height="17" rx="2.5" fill="#E8E1EA"/><rect x="-7.5" y="-36" width="5" height="17" rx="2" fill="#fff" opacity=".7"/>' +
      '<path d="M-6.5 -36L-4.5 -160C-4.4 -164 4.4 -164 4.5 -160L6.5 -36Z" fill="#4A1F33"/><path d="M-3.8 -40L-2.6 -150" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/></g>';
  }

  /* ---------- Hand ---------- */
  var count = 0;
  function Hand(svg, opts) {
    opts = opts || {};
    this.svg = svg; this.id = 'h' + (++count);
    this.state = Object.assign({ shade: 'bare', shape: 'almond', len: 1, style: 'solid', skin: 0 }, opts.state || {});
    this.brushOn = opts.brush !== false; this.pose = opts.pose || 'spread'; this.light = opts.light || lightMode;
    this.tilt = [0, 0];
    this.render();
  }
  Hand.prototype.render = function () {
    var self = this, b = build(this.id, this.state, { pose: this.pose, light: this.light, brush: this.brushOn });
    this.svg.innerHTML = b.defs + '<g class="skin-live">' + b.skin + '</g>' + b.nails;
    this.nails = [0, 1, 2, 3, 4].map(function (i) { return self.svg.querySelector('[data-n="' + i + '"]'); });
    this.brush = this.svg.querySelector('.brush');
    this.applyTilt();
    this.bake(b);
  };
  // koža se jednom pretvori u sliku, pa se za vrijeme lakiranja ne crta ponovo
  Hand.prototype.bake = function (b) {
    if (!window.Blob || !URL.createObjectURL) return;
    var self = this, vb = this.svg.getAttribute('viewBox') || '0 0 400 566', v = vb.split(' ').map(Number), seq = this.bakeId = (this.bakeId || 0) + 1;
    var src = URL.createObjectURL(new Blob(['<svg xmlns="' + NS + '" viewBox="' + vb + '">' + b.defs + b.skin + '</svg>'], { type: 'image/svg+xml' }));
    var r = this.svg.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2.5), cw = Math.round(Math.max(r.width, 200) * dpr * 1.15), ch = Math.round(cw * v[3] / v[2]);
    var pic = new Image();
    pic.onload = function () {
      URL.revokeObjectURL(src);
      if (seq !== self.bakeId) return;
      var c = document.createElement('canvas'); c.width = cw; c.height = ch;
      try { c.getContext('2d').drawImage(pic, 0, 0, cw, ch); } catch (e) { return; }
      c.toBlob(function (png) {
        if (!png || seq !== self.bakeId) return;
        var url = URL.createObjectURL(png), im = document.createElementNS(NS, 'image');
        im.setAttribute('class', 'skin-img'); im.setAttribute('x', v[0]); im.setAttribute('y', v[1]); im.setAttribute('width', v[2]); im.setAttribute('height', v[3]); im.setAttribute('preserveAspectRatio', 'none');
        im.addEventListener('load', function () {
          if (seq !== self.bakeId) return;
          self.svg.querySelectorAll('.skin-live, .skin-img').forEach(function (e) { if (e !== im) { if (e.classList.contains('skin-img')) URL.revokeObjectURL(e.getAttribute('href')); e.remove(); } });
        });
        im.setAttribute('href', url);
        var first = self.svg.querySelector('.skin-live, .skin-img');
        self.svg.insertBefore(im, first ? first.nextSibling : self.svg.firstChild);
      }, 'image/png');
    };
    pic.src = src;
  };
  // koža i svjetlo: mijenja samo boje, bez ponovnog crtanja
  Hand.prototype.recolor = function () {
    var T = tones(this.state.skin, this.light), Lg = LIGHTS[this.light] || LIGHTS.salon;
    this.bake(build(this.id + 'b' + (++count), this.state, { pose: this.pose, light: this.light, brush: false }));
    this.svg.querySelectorAll('[data-t]').forEach(function (e) { e.setAttribute(e.getAttribute('data-ta'), T[+e.getAttribute('data-t')]); });
    this.svg.querySelectorAll('[data-l]').forEach(function (e) {
      var k = e.getAttribute('data-l');
      if (k === 'sh') e.setAttribute('opacity', f2(Lg.sh * (+e.getAttribute('data-k'))));
      else if (k === 'tint') { e.setAttribute('fill', Lg.tint); e.setAttribute('opacity', Lg.tOp); }
      else if (k === 'hl' || k === 'hls') e.setAttribute(e.getAttribute('data-la') || (k === 'hls' ? 'stroke' : 'fill'), Lg.hl);
    });
  };
  Hand.prototype.setLight = function (m) {
    if (!LIGHTS[m] || m === this.light) return;
    this.light = m; this.recolor(); this.paint({ animate: false });
  };
  // pomak odsjaja (nagib telefona ili miš), x i y od -1 do 1
  Hand.prototype.setTilt = function (x, y) {
    this.tilt = [x, y]; var self = this;
    if (!this.tiltRaf) this.tiltRaf = requestAnimationFrame(function () { self.tiltRaf = 0; self.applyTilt(); });
  };
  Hand.prototype.applyTilt = function () {
    var Lg = LIGHTS[this.light] || LIGHTS.salon, x = this.tilt[0], y = this.tilt[1], F = POSES[this.pose].fingers, st = this.state, ang = Math.atan2(y, x + Lg.lx * 2);
    this.nails.forEach(function (n, i) {
      var W = geo(F[i]).W, hg = n.querySelector('.hlg');
      if (hg) hg.setAttribute('transform', 'translate(' + f2((Lg.lx + 0.2 + x * 0.55) * W * 0.16) + ' ' + f2(y * nailL(F[i], st.len) * 0.07) + ')');
      n.querySelectorAll('.envg').forEach(function (e) { e.setAttribute('gradientTransform', 'translate(0 ' + f2((y * 0.6 + x * 0.3 + Lg.lx * 0.3) * W * 0.5) + ')'); });
      n.querySelectorAll('.gp').forEach(function (e) { var c = Math.cos(+e.getAttribute('data-a') - ang); e.setAttribute('opacity', f2(0.35 + 0.65 * Math.pow(Math.max(0, c), 3))); });
    });
  };
  // promjena stanja: oblik i dužina odmah (sa morphom), boja i stil sa lakiranjem
  Hand.prototype.set = function (next, o) {
    o = o || {};
    var prev = this.state, st = this.state = Object.assign({}, prev, next), F = POSES[this.pose].fingers;
    if (next.skin != null && next.skin !== prev.skin) this.recolor();
    var geomChanged = st.shape !== prev.shape || st.len !== prev.len;
    if (geomChanged) {
      this.nails.forEach(function (n, i) {
        var d = nailPath(st.shape, geo(F[i]).W, nailL(F[i], st.len));
        n.querySelectorAll('.ns').forEach(function (p) { p.setAttribute('d', d); p.style.d = 'path("' + d + '")'; });
      });
    }
    var paintChanged = st.shade !== prev.shade || st.style !== prev.style || (geomChanged && o.repaint !== false);
    if (paintChanged) this.paint(o);
    else if (geomChanged) this.refreshHL();
  };
  Hand.prototype.refreshHL = function () {
    var st = this.state, sh = shadeOf(st.shade), Lg = LIGHTS[this.light] || LIGHTS.salon, F = POSES[this.pose].fingers, p = this.id;
    this.nails.forEach(function (n, i) { n.querySelector('.hlg').innerHTML = highlights(st.style, sh.kind, geo(F[i]).W, nailL(F[i], st.len), Lg.hl).replace(/url\(#__soft\)/g, 'url(#' + p + 'soft)'); });
    this.applyTilt();
  };
  Hand.prototype.paint = function (o) {
    o = o || {};
    var self = this, st = this.state, sh = shadeOf(st.shade), stagger = o.stagger == null ? 140 : o.stagger, dur = o.dur || 420, F = POSES[this.pose].fingers;
    var animate = o.animate !== false && this.brushOn, T = tones(st.skin, this.light), chrome = st.style === 'chrome' || sh.kind === 'chrome';
    var seq = [4, 3, 2, 1, 0];
    this.paintId = (this.paintId || 0) + 1; var pid = this.paintId;
    this.refreshHL();
    seq.forEach(function (i, k) {
      var n = self.nails[i], g = geo(F[i]), NL = nailL(F[i], st.len);
      var html = layers({ hex: sh.hex, kind: sh.kind, style: st.style, W: g.W, L: NL, finger: i, tones: T, light: self.light, tip: g.tip }, self.id + i + 'p' + pid);
      var lo = n.querySelector('.lo'), ln = n.querySelector('.ln'), ms = n.querySelector('.ms');
      if (!animate || !ln) { lo.innerHTML = html; if (ln) ln.innerHTML = ''; self.applyTilt(); return; }
      ms.setAttribute('d', 'M0 ' + f2(g.W * 0.4) + 'V' + f2(-NL * 1.12)); ms.setAttribute('stroke-width', f2(g.W * 1.7));
      ln.innerHTML = html;
      var done = function () {
        if (pid !== self.paintId) return;
        lo.innerHTML = html; ln.innerHTML = ''; ms.style.strokeDashoffset = '0';
        self.applyTilt();
        if (!reduced) { self.wet(i); if (chrome) self.rub(i, T); }
      };
      if (reduced) { // samo pretapanje
        ms.style.strokeDashoffset = '0';
        var c = ln.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: k * 50, fill: 'forwards' }); c.onfinish = function () { done(); c.cancel(); };
        return;
      }
      ms.style.strokeDashoffset = '1';
      if (chrome) { var ch = ln.querySelector('.chr'); if (ch) ch.setAttribute('opacity', '0'); }
      ln.querySelectorAll('.gq').forEach(function (e, q) { e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, delay: k * stagger + (q + Math.random()) * dur / 4, fill: 'backwards' }); });
      var a = ms.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: k * stagger, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
      a.onfinish = function () { done(); a.cancel(); };
    });
    if (animate && !reduced && this.brush) this.moveBrush(seq, stagger, dur, sh.hex);
  };
  // mokri lak: jači široki sjaj koji se smiri za 600 ms
  Hand.prototype.wet = function (i) {
    var n = this.nails[i], w = n.querySelector('.wet'), r = n.querySelector('.sheen'), W = geo(POSES[this.pose].fingers[i]).W;
    if (w) w.animate([{ opacity: 0.4 }, { opacity: 0.3, offset: 0.3 }, { opacity: 0 }], { duration: 650, easing: 'ease-out' });
    if (r) r.animate([{ transform: 'skewX(-18deg) translateX(0)', opacity: 0 }, { opacity: 0.45, offset: 0.3 }, { transform: 'skewX(-18deg) translateX(' + (W * 2.6) + 'px)', opacity: 0 }], { duration: 650, easing: 'ease-out' });
  };
  // chrome puder se utrljava kružnim pokretom jagodice
  Hand.prototype.rub = function (i, T) {
    var n = this.nails[i], ch = n.querySelector('.lo .chr'); if (!ch) return;
    var f = POSES[this.pose].fingers[i], W = geo(f).W, cy = -nailL(f, this.state.len) * 0.45, rr = W * 0.16;
    var pad = document.createElementNS(NS, 'ellipse');
    pad.setAttribute('rx', f2(W * 0.4)); pad.setAttribute('ry', f2(W * 0.48)); pad.setAttribute('fill', T[0]); pad.setAttribute('stroke', T[1]); pad.setAttribute('stroke-opacity', '.5'); pad.setAttribute('opacity', '0');
    n.appendChild(pad);
    var kf = []; for (var q = 0; q <= 12; q++) { var t = q / 12 * Math.PI * 4; kf.push({ transform: 'translate(' + f2(Math.cos(t) * rr) + 'px,' + f2(cy + Math.sin(t) * rr * 1.3) + 'px)', opacity: q === 0 || q === 12 ? 0 : 0.92 }); }
    pad.animate(kf, { duration: 900, easing: 'ease-in-out' }).onfinish = function () { pad.remove(); };
    ch.animate([{ opacity: 0 }, { opacity: 0.4, offset: 0.4 }, { opacity: 1 }], { duration: 900, easing: 'ease-in' });
  };
  Hand.prototype.moveBrush = function (seq, stagger, dur, hex) {
    var b = this.brush, self = this, st = this.state, F = POSES[this.pose].fingers, t0 = performance.now(), total = (seq.length - 1) * stagger + dur;
    b.querySelector('.bristle').setAttribute('fill', hex);
    cancelAnimationFrame(this.brushRaf);
    function frame(now) {
      var t = Math.max(0, now - t0), idx = Math.min(seq.length - 1, Math.floor(t / stagger)), i = seq[idx], f = F[i], g = geo(f), NL = nailL(f, st.len);
      var lt = Math.max(0, Math.min(1, (t - idx * stagger) / dur));
      var q = rot(0, g.W * 0.2 - (NL * 1.05) * lt, g.th), r = rot(q[0] + g.xb, q[1] + g.yb, f.a);
      var op = t < 80 ? t / 80 : t > total - 120 ? Math.max(0, (total - t) / 120) : 1;
      b.setAttribute('transform', 'translate(' + f2(r[0] + f.bx) + ' ' + f2(r[1] + f.by) + ') rotate(' + f2(f.a + g.th + 28) + ')');
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

  // cijela ruka kao samostalan SVG (story slika, galerija)
  var strN = 0;
  function svgString(look, o) {
    o = o || {};
    var st = Object.assign({ shade: 'bare', shape: 'almond', len: 1, style: 'solid', skin: 0 }, look);
    var inner = build('s' + (++strN), st, { pose: o.pose || 'table', light: o.light || lightMode, brush: false }).all;
    return '<svg xmlns="' + NS + '" viewBox="' + (o.viewBox || '0 0 400 566') + '"' + (o.w ? ' width="' + o.w + '" height="' + o.h + '"' : '') + '>' + inner + '</svg>';
  }

  // jedan nokat kao samostalan SVG (Ogledalo): ishodište je baza nokta, vrh prema gore
  var nailN = 0;
  function nailSVG(look, o) {
    o = o || {};
    var st = Object.assign({ shade: 'ballet', shape: 'almond', len: 1, style: 'solid', skin: 1 }, look), sh = shadeOf(st.shade), Lg = LIGHTS[o.light || lightMode] || LIGHTS.salon;
    var W = 40, L = W / 0.74 * LEN[st.len || 0], id = 'nv' + (++nailN), d = nailPath(st.shape, W, L), T = tones(st.skin, o.light || lightMode);
    var vb = [-W * 0.8, -L - W * 0.4, W * 1.6, L + W * 0.75];
    var s = '<svg xmlns="' + NS + '" viewBox="' + vb.map(f2).join(' ') + '" width="' + Math.round(vb[2] * 4) + '" height="' + Math.round(vb[3] * 4) + '"><defs><clipPath id="' + id + 'c"><path d="' + d + '"/></clipPath>' +
      '<linearGradient id="' + id + 'fm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E0A12" stop-opacity=".3"/><stop offset=".2" stop-color="#1E0A12" stop-opacity=".08"/><stop offset=".5" stop-color="#1E0A12" stop-opacity="0"/><stop offset=".8" stop-color="#1E0A12" stop-opacity=".06"/><stop offset="1" stop-color="#1E0A12" stop-opacity=".26"/></linearGradient>' +
      '<radialGradient id="' + id + 'soft"><stop offset="0" stop-color="' + Lg.hl + '" stop-opacity=".3"/><stop offset="1" stop-color="' + Lg.hl + '" stop-opacity="0"/></radialGradient></defs>';
    s += '<path d="' + d + '" transform="translate(.6 1.6)" fill="#2A0F18" opacity=".22"/>';
    s += '<g clip-path="url(#' + id + 'c)">' + layers({ hex: sh.hex, kind: sh.kind, style: st.style, W: W, L: L, finger: 3, tones: T, light: o.light || lightMode, tip: W * 1.08 }, id) +
      '<rect x="' + f2(-W / 2) + '" y="-300" width="' + W + '" height="320" fill="url(#' + id + 'fm)"/>' +
      '<rect x="-80" y="-300" width="160" height="320" fill="' + Lg.tint + '" opacity="' + Lg.tOp + '"/>' + highlights(st.style, sh.kind, W, L, Lg.hl).replace(/url\(#__soft\)/g, 'url(#' + id + 'soft)') + '</g>';
    s += '<path d="' + d + '" fill="none" stroke="#1E0A12" stroke-opacity=".18" stroke-width=".8"/></svg>';
    return { svg: s, W: W, L: L, vb: vb };
  }

  /* ---------- male slike noktiju (galerija, omiljeni, zakazivanje) ----------
   * Renderuju se u slobodnom vremenu preglednika i čuvaju u memoriji kao slike. */
  var cache = {}, queue = [], busy = false;
  function lookOf(o) { return { shade: o.shade, shape: o.shape || 'almond', len: o.len == null ? 1 : o.len, style: o.style || 'solid', skin: o.skin || 0 }; }
  function keyOf(l) { return [l.shade, l.shape, l.len, l.style, l.skin, lightMode].join('.'); }
  function nailArt(o, size) {
    var l = lookOf(o), k = keyOf(l), url = cache[k];
    if (!url && queue.indexOf(k) < 0) { queue.push(k); pump(); }
    return '<span class="na' + (url ? ' ok' : '') + '" data-na="' + k + '" data-look="' + [l.shade, l.shape, l.len, l.style, l.skin].join('.') + '" style="--s:' + (size || 120) + 'px">' + (url ? '<img src="' + url + '" alt="" decoding="async">' : '') + '</span>';
  }
  function fill(k) {
    document.querySelectorAll('.na[data-na="' + k + '"]:not(.ok)').forEach(function (e) {
      var im = new Image(); im.alt = ''; im.decoding = 'async'; im.onload = function () { e.classList.add('ok'); }; im.src = cache[k]; e.innerHTML = ''; e.appendChild(im);
    });
  }
  function pump() {
    if (busy) return; busy = true;
    var idle = window.requestIdleCallback || function (cb) { return setTimeout(function () { cb({ timeRemaining: function () { return 8; } }); }, 40); };
    idle(function run(dl) {
      while (queue.length && dl.timeRemaining() > 4) {
        var k = queue.shift(), p = k.split('.');
        if (!cache[k]) cache[k] = URL.createObjectURL(new Blob([svgString({ shade: p[0], shape: p[1], len: +p[2], style: p[3], skin: +p[4] }, { pose: 'table', light: p[5], viewBox: CROP })], { type: 'image/svg+xml' }));
        fill(k);
      }
      if (queue.length) idle(run, { timeout: 600 }); else busy = false;
    }, { timeout: 600 });
  }
  // promjena svjetla: sve male slike dobijaju nove ključeve
  function setLightMode(m) {
    if (!LIGHTS[m]) return; lightMode = m;
    document.querySelectorAll('.na[data-look]').forEach(function (e) {
      var p = e.getAttribute('data-look').split('.'), k = keyOf({ shade: p[0], shape: p[1], len: +p[2], style: p[3], skin: +p[4] });
      if (e.getAttribute('data-na') === k) return;
      e.setAttribute('data-na', k); e.classList.remove('ok');
      if (cache[k]) fill(k); else if (queue.indexOf(k) < 0) queue.push(k);
    });
    pump();
  }

  window.Nails = {
    Hand: Hand, nailPath: nailPath, nailArt: nailArt, svgString: svgString, nailSVG: nailSVG, shadeOf: shadeOf, SHAPES: SHAPES, FINGERS: FINGERS, LIGHTS: LIGHTS,
    mix: mix, adj: adj, light: light, oklab: oklab, rgbLab: rgbLab, fromLab: fromLab, dE: dE,
    setLightMode: setLightMode, getLightMode: function () { return lightMode; }
  };
})();
