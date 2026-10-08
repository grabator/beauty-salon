/* "Boja uz outfit": dominantne boje sa slike (k-means u OKLab) i tri prijedloga iz salona.
 * Slika se obrađuje samo u pregledniku. */
(function () {
  'use strict';
  var APP = window.APP, S = window.SALON, N = window.Nails, $ = APP.$, esc = APP.esc;

  function pixels(img) {
    var c = document.createElement('canvas'), k = Math.min(1, 96 / Math.max(img.width, img.height));
    c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
    var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
    var d = x.getImageData(0, 0, c.width, c.height).data, P = [];
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) continue;
      var L = N.rgbLab([d[i], d[i + 1], d[i + 2]]), ch = Math.hypot(L[1], L[2]);
      // bijela ili crna pozadina proizvoda manje utiče na rezultat
      P.push({ c: L, w: (ch < 0.025 && (L[0] > 0.93 || L[0] < 0.12)) ? 0.2 : 1 });
    }
    return P;
  }
  // k-means sa determinističkim k-means++ početkom
  function kmeans(P, k) {
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var C = [P[Math.floor(rnd() * P.length)].c.slice()];
    while (C.length < k) {
      var D = P.map(function (p) { return p.w * Math.min.apply(null, C.map(function (c) { return N.dE(p.c, c); })) ** 2; }), sum = D.reduce(function (a, b) { return a + b; }, 0), r = rnd() * sum, i = 0;
      if (!sum) break;
      while ((r -= D[i]) > 0 && i < P.length - 1) i++;
      C.push(P[i].c.slice());
    }
    var A = new Array(P.length), W = [];
    for (var it = 0; it < 12; it++) {
      P.forEach(function (p, i) { var b = 0, bd = 9; C.forEach(function (c, j) { var d = N.dE(p.c, c); if (d < bd) { bd = d; b = j; } }); A[i] = b; });
      var acc = C.map(function () { return [0, 0, 0, 0]; });
      P.forEach(function (p, i) { var a = acc[A[i]]; a[0] += p.c[0] * p.w; a[1] += p.c[1] * p.w; a[2] += p.c[2] * p.w; a[3] += p.w; });
      C = acc.map(function (a, j) { return a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : C[j]; });
      W = acc.map(function (a) { return a[3]; });
    }
    // spoji gotovo iste grupe (npr. sjene na istoj tkanini)
    var out = [];
    C.map(function (c, j) { return { c: c, w: W[j] }; }).filter(function (x) { return x.w > 0; }).sort(function (a, b) { return b.w - a.w; }).forEach(function (x) {
      var m = out.filter(function (o) { return N.dE(o.c, x.c) < 0.07; })[0];
      if (m) { var t = m.w + x.w; m.c = m.c.map(function (v, i) { return (v * m.w + x.c[i] * x.w) / t; }); m.w = t; } else out.push(x);
    });
    return out.sort(function (a, b) { return b.w - a.w; });
  }
  function hue(c) { return Math.atan2(c[2], c[1]); }
  function chroma(c) { return Math.hypot(c[1], c[2]); }
  function hueDist(a, b) { var d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; }

  function suggest(cl) {
    // glavna boja: najveća grupa, ali živa boja ima prednost pred neutralnom pozadinom
    var main = cl.slice().sort(function (a, b) { return b.w * (0.15 + Math.min(chroma(b.c), 0.15) * 10) - a.w * (0.15 + Math.min(chroma(a.c), 0.15) * 10); })[0].c;
    var shades = S.shades.map(function (s) { return { s: s, c: N.oklab(s.hex) }; }), used = {};
    function best(score) { var r = shades.filter(function (x) { return !used[x.s.id]; }).sort(function (a, b) { return score(a) - score(b); })[0]; used[r.s.id] = 1; return r.s; }
    var neutralOutfit = chroma(main) < 0.04;
    var match = best(function (x) { return neutralOutfit ? N.dE(x.c, main) : hueDist(hue(x.c), hue(main)) * 0.25 + Math.abs(x.c[0] - main[0]) * 0.3 + (chroma(x.c) < 0.04 ? 0.3 : 0); });
    var contrast = best(function (x) {
      if (neutralOutfit) return -chroma(x.c) + Math.abs(x.c[0] - 0.5) * 0.3; // uz neutralno: najživlja boja
      return hueDist(hue(x.c), hue(main) + Math.PI) * 0.12 - chroma(x.c) * 0.6 + Math.abs(x.c[0] - (main[0] > 0.6 ? 0.45 : 0.7)) * 0.4;
    });
    var nTarget = [Math.max(0.62, Math.min(0.86, main[0])), main[1] * 0.2 + 0.02, main[2] * 0.2 + 0.03];
    var neutral = best(function (x) { return N.dE(x.c, nTarget) + (x.s.kind === 'glitter' ? 0.05 : 0) + (x.s.g === 'nude' ? 0 : 0.04); });
    var warm = Math.cos(hue(main) - 0.9) > 0.3; // crveno-žuti tonovi
    return { main: main, tone: chroma(main) < 0.035 ? 2 : warm ? 0 : 1, picks: [['match', match], ['contrast', contrast], ['neutral', neutral]] };
  }

  function render(cl, res, src) {
    var T = APP.T().outfit, out = $('.of-out');
    var sw = cl.slice(0, 5).map(function (x) { return '<i style="background:' + N.fromLab(x.c) + '"></i>'; }).join('');
    out.innerHTML = '<div class="of-photo"><img src="' + src + '" alt=""><div class="of-sw" role="img" aria-label="' + esc(T.found) + '">' + sw + '</div></div>' +
      '<ul class="of-picks">' + res.picks.map(function (p) {
        var s = p[1], why = T.why[p[0]].replace('{tone}', T.tones[res.tone]);
        return '<li><button type="button" class="of-pick-shade" data-of-shade="' + s.id + '"><span class="of-dot" style="background:' + s.hex + '"></span><span><small>' + esc(T.kinds[p[0]]) + '</small><b>' + esc(APP.tr(s.name)) + '</b><em>' + esc(why) + '</em></span><span class="of-go">' + esc(T.tryIt) + '</span></button><button type="button" class="of-fav" data-of-fav="' + s.id + '" aria-label="' + esc(APP.T().tryon.fav + ': ' + APP.tr(s.name)) + '"><svg class="ic"><use href="#i-heart"/></svg></button></li>';
      }).join('') + '</ul>';
    $('.of-pick span').textContent = T.again;
  }

  window.Outfit = {
    run: function (file) {
      var T = APP.T().outfit, out = $('.of-out'), url = URL.createObjectURL(file), img = new Image();
      out.innerHTML = '<p class="note">' + esc(T.busy) + '</p>';
      img.onload = function () {
        try {
          var P = pixels(img); if (!P.length) throw 0;
          var cl = kmeans(P, 5); render(cl, suggest(cl), url);
        } catch (e) { out.innerHTML = '<p class="err-t">' + esc(T.error) + '</p>'; }
      };
      img.onerror = function () { out.innerHTML = '<p class="err-t">' + esc(T.error) + '</p>'; };
      img.src = url;
    },
    _suggest: suggest, _kmeans: kmeans
  };
  // izbor prijedloga: lakira ruku i vraća pogled na ruku
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-of-fav]');
    if (f) { var look = Object.assign({}, (APP.tryon && APP.tryon.state) || { shape: 'almond', len: 1, style: 'solid', skin: 0 }, { shade: f.getAttribute('data-of-fav') }); var on = APP.toggleFav(look); f.setAttribute('aria-pressed', String(!!on)); APP.toast(on ? APP.T().tryon.saved : APP.T().favs.removed); return; }
    var b = e.target.closest('[data-of-shade]'); if (!b) return;
    var sb = document.querySelector('.shelf [data-shade="' + b.getAttribute('data-of-shade') + '"]'); if (sb) sb.click();
    var st = document.querySelector('.try-stage'); if (st) st.scrollIntoView({ block: 'center', behavior: APP.reduced ? 'auto' : 'smooth' });
  });
})();
