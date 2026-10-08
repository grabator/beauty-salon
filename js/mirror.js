/* "Ogledalo": isprobavanje boje na vlastitoj ruci kroz kameru ili sa slike.
 * Prepoznavanje ruke: MediaPipe Hand Landmarker (Apache 2.0), učitava se tek na klik.
 * Kamera i slike ostaju na uređaju: ništa se ne šalje i ništa se ne snima. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, N = window.Nails, $ = APP.$, esc = APP.esc;
  var VER = '0.10.21', CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + VER;
  var MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  var TIPS = [4, 8, 12, 16, 20], DIPS = [3, 7, 11, 15, 19], KEEP = [0, 5, 17].concat(TIPS, DIPS);
  var el, canvas, ctx, video, stream = null, lm = null, lmP = null, raf = 0, facing = 'user', look, opener = null;
  var mode = '', photo = null, lastHands = null, lost = 0, frameT = [], procW = 480, proc = document.createElement('canvas'), pctx = proc.getContext('2d');
  var imgs = {}, filters = {};

  /* ---------- One Euro filter (mirnije pozicije bez kašnjenja kod brzih pokreta) ---------- */
  function alpha(cut, dt) { var tau = 1 / (2 * Math.PI * cut); return 1 / (1 + tau / dt); }
  function OneEuro(minCut, beta) { this.mc = minCut; this.b = beta; this.x = null; this.dx = 0; this.t = 0; }
  OneEuro.prototype.f = function (v, t) {
    if (this.x == null) { this.x = v; this.t = t; return v; }
    var dt = Math.max(0.001, (t - this.t) / 1000); this.t = t;
    var dv = (v - this.x) / dt; this.dx += alpha(1, dt) * (dv - this.dx);
    var cut = this.mc + this.b * Math.abs(this.dx);
    this.x += alpha(cut, dt) * (v - this.x); return this.x;
  };
  function smooth(k, v, t) { var f = filters[k] || (filters[k] = new OneEuro(1.4, 0.006)); return f.f(v, t); }

  /* ---------- MediaPipe ---------- */
  function loadLM() {
    if (lmP) return lmP;
    lmP = import(CDN + '/vision_bundle.mjs').then(function (m) {
      return m.FilesetResolver.forVisionTasks(CDN + '/wasm').then(function (fs) {
        var opt = function (d) { return { baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.5, minTrackingConfidence: 0.5 }; };
        return m.HandLandmarker.createFromOptions(fs, opt('GPU')).catch(function () { return m.HandLandmarker.createFromOptions(fs, opt('CPU')); });
      });
    }).then(function (l) { lm = l; mode = 'VIDEO'; return l; });
    lmP.catch(function () { lmP = null; });
    return lmP;
  }
  function setMode(m) { if (lm && mode !== m) { lm.setOptions({ runningMode: m }); mode = m; } }

  /* ---------- izgled noktiju (isti materijali kao na ilustrovanoj ruci) ---------- */
  function nailImg() {
    var k = [look.shade, look.shape, look.len, look.style, N.getLightMode()].join('.');
    if (!imgs[k]) {
      var r = N.nailSVG(look), im = new Image();
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(r.svg); imgs[k] = { im: im, r: r };
    }
    return imgs[k];
  }

  /* ---------- crtanje ---------- */
  // pokrivanje platna slikom (cover) ili cijela slika (contain), uz ogledalo za prednju kameru
  function fit(sw, sh, cover) {
    var cw = canvas.width, ch = canvas.height, k = cover ? Math.max(cw / sw, ch / sh) : Math.min(cw / sw, ch / sh);
    return { k: k, ox: (cw - sw * k) / 2, oy: (ch - sh * k) / 2, w: sw * k, h: sh * k };
  }
  function toCanvas(p, sw, sh, f, mirror) { var x = f.ox + p.x * sw * f.k, y = f.oy + p.y * sh * f.k; return { x: mirror ? canvas.width - x : x, y: y }; }
  // nadlanica prema kameri? Smjer od zgloba prema kažiprstu i malom prstu, zajedno sa oznakom ruke
  // (provjereno na nezrcaljenim slikama: desna nadlanica daje 'Right' i pozitivan proizvod)
  function dorsal(P, label) { var v1x = P[5].x - P[0].x, v1y = P[5].y - P[0].y, v2x = P[17].x - P[0].x, v2y = P[17].y - P[0].y, c = v1x * v2y - v1y * v2x; return label === 'Right' ? c > 0 : c < 0; }
  function drawNails(C) {
    var n = nailImg(); if (!n.im.complete) return;
    var vb = n.r.vb;
    for (var i = 0; i < 5; i++) {
      var tip = C[TIPS[i]], dip = C[DIPS[i]], dx = tip.x - dip.x, dy = tip.y - dip.y, len = Math.hypot(dx, dy);
      if (len < 4) continue;
      var nb = i === 0 ? null : C[DIPS[i < 4 ? i + 1 : i - 1]], fw = nb ? Math.hypot(nb.x - dip.x, nb.y - dip.y) * 0.85 : len * 0.95;
      fw = Math.max(len * 0.55, Math.min(len * 1.15, fw));
      var s = fw * 0.74 / n.r.W, bx = dip.x + dx * 0.4, by = dip.y + dy * 0.4;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2); ctx.scale(s, s);
      ctx.drawImage(n.im, vb[0], vb[1], vb[2], vb[3]); ctx.restore();
    }
  }
  function hint(t) { var h = $('.mr-hint', el); h.textContent = t || ''; h.hidden = !t; }

  /* ---------- kamera ---------- */
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!video || video.readyState < 2) return;
    var vw = video.videoWidth, vh = video.videoHeight; if (!vw) return;
    var mirror = facing === 'user', f = fit(vw, vh, true);
    ctx.save(); if (mirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); } ctx.drawImage(video, f.ox, f.oy, f.w, f.h); ctx.restore();
    // obrada na manjoj slici; veličina se prilagođava brzini uređaja
    proc.width = procW; proc.height = Math.round(procW * vh / vw); pctx.drawImage(video, 0, 0, proc.width, proc.height);
    var r; try { r = lm.detectForVideo(proc, now); } catch (e) { return; }
    frameT.push(now); if (frameT.length > 20) frameT.shift();
    if (frameT.length === 20) { var fps = 19000 / (frameT[19] - frameT[0]); if (fps < 22 && procW > 256) { procW = Math.max(256, Math.round(procW * 0.8)); frameT = []; } else if (fps > 40 && procW < 640) { procW = Math.min(640, procW + 64); frameT = []; } }
    var P = r && r.landmarks && r.landmarks[0];
    if (!P) { if (now - lost > 500) filters = {}; hint(APP.T().mirror.noHand); lastHands = null; return; }
    lost = now;
    if (!dorsal(P, r.handedness && r.handedness[0] && r.handedness[0][0] && r.handedness[0][0].categoryName)) { hint(APP.T().mirror.turn); lastHands = null; return; }
    hint('');
    var C = [];
    KEEP.forEach(function (k) { var c = toCanvas(P[k], vw, vh, f, mirror); C[k] = { x: smooth(k + 'x', c.x, now), y: smooth(k + 'y', c.y, now) }; });
    lastHands = C; drawNails(C);
  }
  function startCamera() {
    var T = APP.T().mirror;
    showStage(); hint(T.loading);
    var cam = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }) : Promise.reject(new Error('nocam'));
    cam.then(function (s) {
      stream = s; video.srcObject = s; video.play().catch(function () {});
      return loadLM().then(function () { setMode('VIDEO'); filters = {}; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }, function () { stopCamera(); showError(T.noModel, false); });
    }, function () { showError(T.denied, true); });
  }
  function stopCamera() { cancelAnimationFrame(raf); raf = 0; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; if (video) video.srcObject = null; }

  /* ---------- slika ruke ---------- */
  function fromPhoto(file) {
    var T = APP.T().mirror, url = URL.createObjectURL(file), im = new Image();
    stopCamera(); showStage(); hint(T.loading);
    im.onload = function () {
      loadLM().then(function () {
        setMode('IMAGE'); photo = im; var r = lm.detect(im), P = r.landmarks && r.landmarks[0];
        drawPhoto();
        if (!P || !dorsal(P, r.handedness[0][0].categoryName)) { hint(T.noHandPhoto); lastHands = null; return; }
        hint(''); var f = fit(im.naturalWidth, im.naturalHeight, false), C = [];
        KEEP.forEach(function (k) { C[k] = toCanvas(P[k], im.naturalWidth, im.naturalHeight, f, false); });
        lastHands = C; drawNails(C);
      }, function () { showError(T.noModel, false); });
    };
    im.onerror = function () { showError(T.noHandPhoto, true); };
    im.src = url;
  }
  function drawPhoto() {
    if (!photo) return; var f = fit(photo.naturalWidth, photo.naturalHeight, false);
    ctx.fillStyle = '#120509'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(photo, f.ox, f.oy, f.w, f.h);
  }
  function redraw() { if (!stream && photo && lastHands) { drawPhoto(); var n = nailImg(); if (n.im.complete) drawNails(lastHands); else n.im.onload = redraw; } }

  /* ---------- snimak: samo područje ruke, bez lica ---------- */
  function snap() {
    if (!lastHands) { APP.toast(APP.T().mirror.noHand); return; }
    var xs = [], ys = []; lastHands.forEach(function (p) { if (p) { xs.push(p.x); ys.push(p.y); } });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var side = Math.max(x1 - x0, y1 - y0) * 1.35, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    var sx = Math.max(0, cx - side / 2), sy = Math.max(0, cy - side / 2), sw = Math.min(side, canvas.width - sx), sh = Math.min(side, canvas.height - sy);
    var o = document.createElement('canvas'); o.width = 1080; o.height = 1240; var x = o.getContext('2d');
    x.fillStyle = '#FBF6F3'; x.fillRect(0, 0, 1080, 1240);
    x.drawImage(canvas, sx, sy, sw, sh, 0, 0, 1080, Math.round(1080 * sh / sw));
    x.fillStyle = '#FBF6F3'; x.fillRect(0, 1080, 1080, 160);
    x.fillStyle = '#4A1F33'; x.textAlign = 'center'; x.font = '64px "Instrument Serif", serif'; x.fillText(S.name, 540, 1160);
    x.font = '700 28px Manrope, sans-serif'; x.fillStyle = '#9C4F66'; x.fillText(APP.tr(N.shadeOf(look.shade).name) + ' · @' + S.contact.instagram, 540, 1210);
    o.toBlob(function (b) {
      var file = new File([b], 'glaze-ogledalo.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: S.name }).catch(function () {});
      else { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
      APP.lastMirror = b;
    }, 'image/png');
  }

  /* ---------- prozor ---------- */
  function shelf() {
    return S.shades.map(function (s) { return '<button type="button" role="option" data-mr-shade="' + s.id + '" aria-selected="' + (s.id === look.shade) + '" aria-label="' + esc(APP.tr(s.name)) + '" style="--c:' + s.hex + '"></button>'; }).join('');
  }
  function build() {
    var T = APP.T().mirror;
    el = document.createElement('div'); el.className = 'mirror'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'mr-h');
    el.innerHTML = '<video playsinline muted aria-hidden="true"></video><canvas class="mr-canvas" aria-hidden="true"></canvas>' +
      '<div class="mr-top"><h2 id="mr-h">' + esc(T.title) + '</h2><button type="button" class="mr-x" data-mr="close" aria-label="' + esc(T.close) + '"><svg class="ic"><use href="#i-x"/></svg></button></div>' +
      '<p class="mr-hint" aria-live="polite" hidden></p>' +
      '<div class="mr-intro"><span class="mr-ic"><svg class="ic"><use href="#i-hand"/></svg></span><p class="mr-lead">' + esc(T.intro) + '</p><p class="mr-priv">' + esc(T.privacy) + '</p>' +
      '<div class="mr-btns"><button type="button" class="btn btn-plum btn-lg" data-mr="start"><svg class="ic"><use href="#i-sparkle"/></svg><span>' + esc(T.start) + '</span></button>' +
      '<label class="btn btn-ghost btn-lg mr-up"><svg class="ic"><use href="#i-plus"/></svg><span>' + esc(T.upload) + '</span><input type="file" accept="image/*" class="sr mr-file"></label></div>' +
      '<p class="mr-err err-t" hidden></p><button type="button" class="btn btn-text mr-back" data-mr="close">' + esc(T.back) + '</button></div>' +
      '<div class="mr-bar" hidden><div class="mr-shelf" role="listbox" aria-label="' + esc(APP.T().tryon.shade) + '">' + shelf() + '</div>' +
      '<div class="mr-acts"><button type="button" class="mr-act" data-mr="flip"><svg class="ic"><use href="#i-shuffle"/></svg><span>' + esc(T.flip) + '</span></button>' +
      '<label class="mr-act"><svg class="ic"><use href="#i-plus"/></svg><span>' + esc(T.upload) + '</span><input type="file" accept="image/*" class="sr mr-file"></label>' +
      '<button type="button" class="mr-act" data-mr="snap"><svg class="ic"><use href="#i-share"/></svg><span>' + esc(T.snap) + '</span></button>' +
      '<button type="button" class="btn btn-plum mr-want" data-mr="want"><svg class="ic"><use href="#i-cal"/></svg><span>' + esc(T.want) + '</span></button></div></div>';
    document.body.appendChild(el);
    canvas = $('.mr-canvas', el); ctx = canvas.getContext('2d'); video = $('video', el);
    size(); window.addEventListener('resize', size);
    el.addEventListener('click', onClick);
    el.addEventListener('change', function (e) { if (e.target.classList.contains('mr-file') && e.target.files[0]) { var f = e.target.files[0]; e.target.value = ''; fromPhoto(f); } });
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return; // fokus ostaje u prozoru
      var f = [].slice.call(el.querySelectorAll('button, input, [tabindex="0"]')).filter(function (x) { return x.offsetParent !== null || x.type === 'file'; });
      if (!f.length) return; var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }
  function size() { if (!canvas) return; var d = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(innerWidth * d); canvas.height = Math.round(innerHeight * d); redraw(); }
  function showStage() { $('.mr-intro', el).hidden = true; $('.mr-bar', el).hidden = false; el.classList.add('live'); }
  function showError(msg, canUpload) {
    stopCamera(); el.classList.remove('live'); $('.mr-intro', el).hidden = false; $('.mr-bar', el).hidden = true; hint('');
    var e = $('.mr-err', el); e.textContent = msg; e.hidden = false;
    $('[data-mr="start"]', el).hidden = !canUpload; $('.mr-up', el).hidden = !canUpload;
  }
  function onClick(e) {
    var b = e.target.closest('[data-mr]'), s = e.target.closest('[data-mr-shade]');
    if (s) {
      var sh = N.shadeOf(s.getAttribute('data-mr-shade')); look.shade = sh.id;
      if (sh.kind === 'chrome' && look.style === 'solid') look.style = 'chrome';
      if (sh.kind !== 'chrome' && look.style === 'chrome') look.style = 'solid';
      el.querySelectorAll('[data-mr-shade]').forEach(function (x) { x.setAttribute('aria-selected', String(x === s)); });
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
      redraw(); return;
    }
    if (!b) return;
    var a = b.getAttribute('data-mr');
    if (a === 'close') close();
    else if (a === 'start') startCamera();
    else if (a === 'flip') { facing = facing === 'user' ? 'environment' : 'user'; stopCamera(); startCamera(); }
    else if (a === 'snap') snap();
    else if (a === 'want') { var l = Object.assign({}, look); close(); APP.bookLook(l); }
  }
  function onKey(e) { if (e.key === 'Escape' && el) close(); }
  function close() {
    stopCamera(); photo = null; lastHands = null;
    window.removeEventListener('resize', size); document.removeEventListener('keydown', onKey);
    if (el) el.remove(); el = null; canvas = null; video = null;
    document.documentElement.classList.remove('mirror-on');
    if (opener && opener.focus) opener.focus();
  }

  window.Mirror = {
    open: function () {
      if (el) return;
      opener = document.activeElement;
      look = Object.assign({ shade: 'ballet', shape: 'almond', len: 1, style: 'solid', skin: 1 }, APP.look || (APP.tryon && APP.tryon.state) || {});
      build(); document.documentElement.classList.add('mirror-on'); document.addEventListener('keydown', onKey);
      $('[data-mr="start"]', el).focus();
    },
    _dorsal: dorsal, _loop: function () { return lastHands; }, _stats: function () { return { procW: procW, fps: frameT.length > 1 ? Math.round((frameT.length - 1) * 1000 / (frameT[frameT.length - 1] - frameT[0])) : 0 }; }
  };
})();
