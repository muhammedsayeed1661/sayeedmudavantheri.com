/* Jantar Mantar 2.0 — story renderer (1080 × 1920). Everything is drawn locally on a canvas; nothing is uploaded. */
(function (global) {
  'use strict';
  const W = 1080, H = 1920;
  const FRAME = { x: 200, y: 650, w: 680, h: 750 };          // rectangular photo window
  const C = { red: '#e3191c', yellow: '#ffd23f', white: '#ffffff', black: '#0b0708',
              saffron: '#ff9933', green: '#138808', navy: '#0b2a8a' };
  const ML = 'ഞാനും ഈ പ്രതിഷേധത്തിനൊപ്പം';
  const EN = 'I TOO STAND WITH THIS PROTEST';
  const TAG = '#JANTARMANTAR2';
  const URL_TXT = 'sayeedmudavantheri.com/jantar-mantar';

  /* deterministic random so every story looks the same */
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const layer = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- India Gate silhouette (unit width, origin at base centre, y up) ---------- */
  function gatePath(cx, baseY, s) {
    const p = new Path2D(), R = (u, v, w, h) => p.rect(cx + u * s, baseY - (v + h) * s, w * s, h * s);
    R(-0.5, 0, 1.0, 0.035); R(-0.47, 0.035, 0.94, 0.025);
    R(-0.46, 0.06, 0.30, 0.58); R(0.16, 0.06, 0.30, 0.58); R(-0.16, 0.06, 0.32, 0.58);
    R(-0.49, 0.64, 0.98, 0.05); R(-0.5, 0.69, 1.0, 0.025);
    R(-0.42, 0.715, 0.84, 0.17); R(-0.44, 0.885, 0.88, 0.022);
    R(-0.31, 0.907, 0.62, 0.058); R(-0.23, 0.965, 0.46, 0.05); R(-0.15, 1.015, 0.30, 0.035);
    p.ellipse(cx, baseY - 1.05 * s, 0.12 * s, 0.05 * s, 0, Math.PI, 0); p.rect(cx - 0.12 * s, baseY - 1.05 * s, 0.24 * s, 0.012 * s);
    return p;
  }
  function gateOpening(cx, baseY, s) {
    const p = new Path2D(), r = 0.155;
    p.moveTo(cx - r * s, baseY - 0.06 * s); p.lineTo(cx - r * s, baseY - 0.46 * s);
    p.arc(cx, baseY - 0.46 * s, r * s, Math.PI, 0); p.lineTo(cx + r * s, baseY - 0.06 * s); p.closePath();
    /* side niches in the piers */
    [-0.31, 0.31].forEach(u => { const q = 0.055; p.moveTo(cx + (u - q) * s, baseY - 0.12 * s); p.lineTo(cx + (u - q) * s, baseY - 0.42 * s);
      p.arc(cx + u * s, baseY - 0.42 * s, q * s, Math.PI, 0); p.lineTo(cx + (u + q) * s, baseY - 0.12 * s); p.closePath(); });
    return p;
  }

  /* ---------- background: sunset sky, sun, rays, India Gate, haze, crowd ---------- */
  function buildBackground() {
    const c = layer(), x = c.getContext('2d'), r = rng(7);
    const sky = x.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#120406'); sky.addColorStop(.22, '#3b0a0e'); sky.addColorStop(.42, '#8e1a12');
    sky.addColorStop(.55, '#e2531a'); sky.addColorStop(.63, '#ff9a3c'); sky.addColorStop(.70, '#6d1a10'); sky.addColorStop(1, '#0b0405');
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    const SX = 540, SY = 600;
    /* sun glow + disc */
    let g = x.createRadialGradient(SX, SY, 0, SX, SY, 900);
    g.addColorStop(0, 'rgba(255,214,120,.95)'); g.addColorStop(.12, 'rgba(255,170,70,.75)'); g.addColorStop(.35, 'rgba(240,90,30,.35)'); g.addColorStop(1, 'rgba(120,20,10,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffd690'; x.globalAlpha = .9; x.beginPath(); x.arc(SX, SY, 120, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    /* light rays */
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const a = -Math.PI + (i / 26) * Math.PI + r() * .06, wd = .018 + r() * .03, len = 1500;
      const rg = x.createRadialGradient(SX, SY, 80, SX, SY, len); rg.addColorStop(0, 'rgba(255,200,120,.16)'); rg.addColorStop(1, 'rgba(255,120,60,0)');
      x.fillStyle = rg; x.beginPath(); x.moveTo(SX, SY); x.arc(SX, SY, len, a - wd, a + wd); x.closePath(); x.fill(); }
    x.restore();
    /* drifting smoke bands */
    for (let i = 0; i < 18; i++) { const cx = r() * W, cy = 900 + r() * 700, rw = 220 + r() * 380, rh = 50 + r() * 90;
      const sg = x.createRadialGradient(cx, cy, 0, cx, cy, rw); sg.addColorStop(0, `rgba(${40 + r() * 40|0},10,8,${.25 + r() * .25})`); sg.addColorStop(1, 'rgba(20,5,5,0)');
      x.save(); x.translate(cx, cy); x.scale(1, rh / rw); x.translate(-cx, -cy); x.fillStyle = sg; x.beginPath(); x.arc(cx, cy, rw, 0, Math.PI * 2); x.fill(); x.restore(); }
    /* India Gate, rim-lit, with the sun through the arch */
    const gc = layer(), gx = gc.getContext('2d'), GS = 1150, GB = 1730, GX = 540;
    gx.fillStyle = '#170708'; gx.fill(gatePath(GX, GB, GS));
    gx.globalCompositeOperation = 'destination-out'; gx.fill(gateOpening(GX, GB, GS)); gx.globalCompositeOperation = 'source-over';
    /* stone texture + inscription */
    gx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 2600; i++) { gx.fillStyle = `rgba(${90 + r() * 60|0},${30 + r() * 20|0},20,${r() * .07})`; gx.fillRect(r() * W, 400 + r() * 1200, 2 + r() * 30, 1 + r() * 3); }
    gx.fillStyle = 'rgba(255,150,80,.16)'; gx.font = `${GS * .07}px Anton, Impact, sans-serif`; gx.textAlign = 'center'; gx.fillText('INDIA', GX, GB - .77 * GS);
    const lg = gx.createLinearGradient(GX - GS / 2, 0, GX + GS / 2, 0); lg.addColorStop(0, 'rgba(255,120,50,.22)'); lg.addColorStop(.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(255,120,50,.22)');
    gx.fillStyle = lg; gx.fillRect(0, 0, W, H); gx.globalCompositeOperation = 'source-over';
    x.save(); x.shadowColor = 'rgba(255,140,60,.85)'; x.shadowBlur = 40; x.drawImage(gc, 0, 0); x.restore();
    x.drawImage(gc, 0, 0);
    /* ground haze */
    g = x.createLinearGradient(0, 1380, 0, 1640); g.addColorStop(0, 'rgba(60,12,8,0)'); g.addColorStop(1, 'rgba(25,6,6,.95)');
    x.fillStyle = g; x.fillRect(0, 1380, W, 260);
    drawCrowd(x, r);
    /* vignette */
    g = x.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.72)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    return c;
  }

  function flag(x, px, py, len, t, dark) {
    const fw = 150, fh = 96, segs = 14;
    x.save(); x.translate(px, py);
    x.strokeStyle = dark; x.lineWidth = 7; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, len); x.stroke();
    const cols = ['#a8551c', '#9d8e86', '#0f4a12'];
    for (let b = 0; b < 3; b++) { x.fillStyle = cols[b]; x.beginPath();
      for (let i = 0; i <= segs; i++) { const u = i / segs, wv = Math.sin(u * 5 + t) * 12 * u; x.lineTo(u * fw, b * fh / 3 + wv); }
      for (let i = segs; i >= 0; i--) { const u = i / segs, wv = Math.sin(u * 5 + t) * 12 * u; x.lineTo(u * fw, (b + 1) * fh / 3 + wv); }
      x.closePath(); x.fill(); }
    x.strokeStyle = 'rgba(30,30,90,.8)'; x.lineWidth = 3; x.beginPath(); x.arc(fw * .5, fh * .5 + Math.sin(.5 * 5 + t) * 6, 12, 0, Math.PI * 2); x.stroke();
    x.restore();
  }
  function drawCrowd(x, r) {
    const dark = '#070304';
    /* back row (lighter, smaller) then front row */
    [[1680, .78, 'rgba(25,8,8,1)'], [1760, 1, dark]].forEach(([base, k, col], row) => {
      for (let px = -40; px < W + 60; px += (70 + r() * 50) * k) {
        const hy = base - (r() * 60) * k, hr = (26 + r() * 10) * k, sw = (100 + r() * 50) * k;
        x.fillStyle = col;
        x.beginPath(); x.arc(px, hy, hr, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.roundRect ? x.roundRect(px - sw / 2, hy + hr * .8, sw, H - hy, 30 * k) : x.rect(px - sw / 2, hy + hr * .8, sw, H - hy); x.fill();
        const roll = r();
        if (roll < .28) {            /* raised fist */
          const side = r() < .5 ? -1 : 1, ax = px + side * sw * .38, ay = hy + hr;
          x.save(); x.translate(ax, ay); x.rotate(side * (.15 + r() * .2)); x.fillRect(-11 * k, -170 * k, 22 * k, 175 * k);
          x.beginPath(); x.arc(0, -180 * k, 19 * k, 0, Math.PI * 2); x.fill(); x.restore();
        } else if (roll < .36 && row === 1) {
          flag(x, px + 30, hy - 330, 330, r() * 6, dark);
        } else if (roll < .42) {     /* placard */
          x.save(); x.translate(px, hy - 150 * k); x.rotate((r() - .5) * .3); x.fillRect(-4, 0, 8, 150 * k); x.fillRect(-75 * k, -95 * k, 150 * k, 95 * k); x.restore();
        }
      }
    });
  }

  /* ---------- grain + dust (applied over everything, photo included) ---------- */
  function buildGrain() {
    const c = layer(540, 960), x = c.getContext('2d'), id = x.createImageData(540, 960), d = id.data, r = rng(3);
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() - .5) * 120; d[i] = v; d[i + 1] = v * .96; d[i + 2] = v * .92; d[i + 3] = 255; }
    x.putImageData(id, 0, 0);
    const big = layer(), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, W, H);
    /* scratches and dust */
    for (let i = 0; i < 70; i++) { bx.strokeStyle = `rgba(${r() < .5 ? 255 : 0},${r() < .5 ? 240 : 0},${r() < .5 ? 220 : 0},${.15 + r() * .3})`; bx.lineWidth = .6 + r() * 1.4;
      const sx = r() * W, sy = r() * H; bx.beginPath(); bx.moveTo(sx, sy); bx.lineTo(sx + (r() - .5) * 40, sy + 60 + r() * 260); bx.stroke(); }
    for (let i = 0; i < 900; i++) { bx.fillStyle = r() < .5 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.6)'; bx.beginPath(); bx.arc(r() * W, r() * H, r() * 2.4, 0, Math.PI * 2); bx.fill(); }
    return big;
  }

  /* distressed text: draw, then punch speckle holes */
  function distress(c, seed, density) {
    const x = c.getContext('2d'), r = rng(seed); x.save(); x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < density; i++) { x.globalAlpha = .4 + r() * .6; x.beginPath(); x.arc(r() * c.width, r() * c.height, .6 + r() * 3.2, 0, Math.PI * 2); x.fill(); }
    for (let i = 0; i < density / 30; i++) { x.globalAlpha = .5; x.lineWidth = 1 + r() * 2; x.beginPath(); const sx = r() * c.width, sy = r() * c.height; x.moveTo(sx, sy); x.lineTo(sx + 60 + r() * 200, sy + (r() - .5) * 20); x.stroke(); }
    x.restore(); return c;
  }
  function fitFont(x, text, family, weight, maxW, start) { let s = start; do { x.font = `${weight} ${s}px ${family}`; s -= 2; } while (x.measureText(text).width > maxW && s > 10); return s + 2; }

  /* ---------- foreground: tricolour, title, messages, hashtag ---------- */
  function buildForeground() {
    const c = layer(), x = c.getContext('2d');
    /* tricolour bar */
    [[C.saffron, 0], ['#f4f1ea', 1], [C.green, 2]].forEach(([col, i]) => { x.fillStyle = col; x.fillRect(80 + i * 307, 70, 300, 12); });
    x.fillStyle = C.navy; x.beginPath(); x.arc(540, 76, 9, 0, Math.PI * 2); x.fill();
    /* kicker */
    x.font = '800 40px Archivo, Arial, sans-serif'; x.fillStyle = C.yellow; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    if ('letterSpacing' in x) x.letterSpacing = '10px';
    x.fillText('I STAND WITH', 540, 168);
    if ('letterSpacing' in x) x.letterSpacing = '0px';
    /* title, distressed */
    const t = layer(W, 420), tx = t.getContext('2d'); tx.textAlign = 'center'; tx.textBaseline = 'alphabetic';
    const s1 = fitFont(tx, 'JANTAR MANTAR', 'Anton, Impact, sans-serif', '', 900, 168);
    tx.font = `${s1}px Anton, Impact, sans-serif`; tx.fillStyle = C.white; tx.fillText('JANTAR MANTAR', 540, s1 * .95);
    distress(t, 11, 2600);
    x.save(); x.shadowColor = 'rgba(0,0,0,.75)'; x.shadowBlur = 24; x.shadowOffsetY = 8; x.drawImage(t, 0, 176); x.restore();
    /* "2.0" on a red brush block */
    const b = layer(W, 300), bx = b.getContext('2d'); bx.textAlign = 'center';
    bx.fillStyle = C.red; bx.beginPath(); bx.moveTo(392, 30); bx.lineTo(694, 18); bx.lineTo(689, 178); bx.lineTo(386, 190); bx.closePath(); bx.fill();
    bx.font = '150px Anton, Impact, sans-serif'; bx.fillStyle = C.white; bx.fillText('2.0', 540, 167);
    distress(b, 5, 1400);
    x.save(); x.translate(540, 0); x.rotate(-.025); x.translate(-540, 0); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 20; x.drawImage(b, 0, 176 + s1 * .98 - 22); x.restore();
    /* Malayalam banner */
    const MY = 1500;
    x.save(); x.translate(540, MY); x.rotate(-.02);
    const ms = fitFont(x, ML, '"Noto Sans Malayalam", "NML", sans-serif', 800, 860, 70);
    const mw = x.measureText(ML).width;
    x.fillStyle = 'rgba(8,4,4,.92)'; x.fillRect(-mw / 2 - 40, -ms * 1.05, mw + 80, ms * 1.6);
    x.fillStyle = C.yellow; x.fillRect(-mw / 2 - 40, -ms * 1.05, 10, ms * 1.6);
    x.fillStyle = C.yellow; x.textAlign = 'center'; x.fillText(ML, 0, ms * .3);
    x.restore();
    /* hashtag + link */
    x.textAlign = 'center'; x.font = '84px Anton, Impact, sans-serif';
    x.save(); x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 18; x.fillStyle = C.yellow; x.fillText(TAG, 540, 1818); x.restore();
    x.font = '600 28px Archivo, Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,.78)'; x.fillText(URL_TXT, 540, 1870);
    return c;
  }

  function drawMessage(x, text) {
    if (!text) return;
    const fam = 'Archivo, "Noto Sans Malayalam", "NML", Arial, sans-serif', maxW = 880;
    x.save(); x.translate(540, 1622); x.rotate(-.02); x.textAlign = 'center';
    let size = fitFont(x, text, fam, 800, maxW, 56), lines = [text];
    if (size < 40) {                       /* split into two balanced lines */
      const words = text.split(/\s+/); let best = null;
      for (let i = 1; i < words.length; i++) { const l1 = words.slice(0, i).join(' '), l2 = words.slice(i).join(' ');
        x.font = `800 50px ${fam}`; const m = Math.max(x.measureText(l1).width, x.measureText(l2).width); if (!best || m < best.m) best = { m, l: [l1, l2] }; }
      if (best) { lines = best.l; size = Math.min(52, fitFont(x, lines[0].length > lines[1].length ? lines[0] : lines[1], fam, 800, maxW, 52)); }
    }
    x.font = `800 ${size}px ${fam}`;
    const lh = size * 1.22, w = Math.max(...lines.map(l => x.measureText(l).width)), h = lh * lines.length + size * .35;
    x.fillStyle = C.red; x.fillRect(-w / 2 - 26, -size * .95, w + 52, h);
    x.fillStyle = C.white; lines.forEach((l, i) => x.fillText(l, 0, size * .2 + i * lh));
    x.restore();
  }

  let BG = null, FG = null, GR = null;
  function prepare() { BG = buildBackground(); FG = buildForeground(); GR = buildGrain(); }

  /* ---------- compose one story ---------- */
  function render(ctx, st) {
    if (!BG) prepare();
    const F = FRAME;
    ctx.save(); ctx.clearRect(0, 0, W, H); ctx.drawImage(BG, 0, 0);
    /* frame shadow + white print border + tricolour edge */
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; ctx.fillStyle = '#f2ede4';
    ctx.fillRect(F.x - 16, F.y - 16, F.w + 32, F.h + 32); ctx.restore();
    [[C.saffron, 0], ['#f4f1ea', 1], [C.green, 2]].forEach(([col, i]) => { ctx.fillStyle = col; ctx.fillRect(F.x - 16 - 22, F.y + 30 + i * (F.h / 3 - 10), 14, F.h / 3 - 30); });
    /* photo or placeholder */
    ctx.save(); ctx.beginPath(); ctx.rect(F.x, F.y, F.w, F.h); ctx.clip();
    if (st.img) {
      const base = Math.max(F.w / st.iw, F.h / st.ih), dw = st.iw * base * st.zoom, dh = st.ih * base * st.zoom;
      ctx.drawImage(st.img, F.x + F.w / 2 + st.ox - dw / 2, F.y + F.h / 2 + st.oy - dh / 2, dw, dh);
      /* gentle warm grade so the photo sits in the scene */
      ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,120,60,.22)'; ctx.fillRect(F.x, F.y, F.w, F.h);
      ctx.globalCompositeOperation = 'source-over';
      const vg = ctx.createRadialGradient(F.x + F.w / 2, F.y + F.h / 2, F.h * .35, F.x + F.w / 2, F.y + F.h / 2, F.h * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
      ctx.fillStyle = vg; ctx.fillRect(F.x, F.y, F.w, F.h);
    } else {
      const pg = ctx.createLinearGradient(0, F.y, 0, F.y + F.h); pg.addColorStop(0, '#2a1416'); pg.addColorStop(1, '#120809');
      ctx.fillStyle = pg; ctx.fillRect(F.x, F.y, F.w, F.h);
      ctx.strokeStyle = 'rgba(255,210,63,.55)'; ctx.setLineDash([22, 16]); ctx.lineWidth = 5; ctx.strokeRect(F.x + 30, F.y + 30, F.w - 60, F.h - 60); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.arc(540, F.y + 290, 110, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(540, F.y + 640, 220, 190, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '800 46px Archivo, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(st.placeholder || 'YOUR PHOTO HERE', 540, F.y + F.h - 64);
    }
    ctx.restore();
    /* tape corners */
    [[F.x - 10, F.y - 6, -.6], [F.x + F.w + 10, F.y - 6, .6]].forEach(([tx, ty, a]) => { ctx.save(); ctx.translate(tx, ty); ctx.rotate(a); ctx.fillStyle = 'rgba(235,225,200,.82)'; ctx.fillRect(-70, -20, 140, 40); ctx.restore(); });
    ctx.drawImage(FG, 0, 0);
    /* personal message line (preset or custom; wraps to two lines when long) */
    drawMessage(ctx, (st.message == null ? EN : st.message).trim().toUpperCase());
    /* name tag */
    const name = (st.name || '').trim().toUpperCase();
    if (name) {
      ctx.save(); ctx.translate(F.x - 30, F.y + F.h - 26); ctx.rotate(-.035);
      ctx.font = '800 50px Archivo, "Noto Sans Malayalam", "NML", Arial, sans-serif';
      let label = '— ' + name; while (ctx.measureText(label).width > 820 && label.length > 4) label = label.slice(0, -2) + '…';
      const lw = ctx.measureText(label).width;
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 18; ctx.fillStyle = C.red; ctx.fillRect(-10, -58, lw + 48, 80); ctx.shadowBlur = 0;
      ctx.fillStyle = C.white; ctx.textAlign = 'left'; ctx.fillText(label, 14, 2); ctx.restore();
    }
    /* film grain over everything */
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .32; ctx.drawImage(GR, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.restore();
  }

  global.JMStory = { W, H, FRAME, render, prepare, ML, EN, TAG };
})(window);
