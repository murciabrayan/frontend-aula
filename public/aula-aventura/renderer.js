'use strict';
(() => {
  class AdventureRenderer {
    constructor(canvas, getState) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.getState = getState;
      this.assets = {};
      this.bounds = {};
      this.hovered = null;
      this.scales = { monitor: 1, keyboard: 1, mouse: 1 };
      this.mouse = { x: 0, y: 0 };
      this.camera = { x: 0, y: 0 };
      this.particles = [];
      this.time = 0;
      this.last = performance.now();
      this.mood = 'wave';
      this.moodAt = 0;
      this.ready = false;
      this.sceneStart = 0;
      this.currentOwl = null;
      this.ambient = Array.from({ length: 5 }, (_, i) => ({ x: (i * .6180339) % 1, y: (i * .341) % 1, size: .8 + (i % 4) * .5, speed: .004 + (i % 3) * .002, phase: i * 2.3 }));
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement);
      canvas.parentElement.addEventListener('pointermove', event => {
        const box = this.canvas.getBoundingClientRect();
        this.mouse.x = (event.clientX - box.left) / box.width * 2 - 1;
        this.mouse.y = (event.clientY - box.top) / box.height * 2 - 1;
      });
      canvas.parentElement.addEventListener('pointerleave', () => { this.mouse = { x: 0, y: 0 }; });
      this.resize();
      this.tick = this.tick.bind(this);
      this.frame = requestAnimationFrame(this.tick);
    }
    async load(onProgress) {
      let completed = 0;
      const sources = { valley: 'assets/valley-minimal-v2.png', studio: 'assets/activity-studio.png', owl: 'assets/owl-atlas.png', devices: 'assets/devices-atlas-clean.png' };
      await Promise.all(Object.entries(sources).map(async ([name, src]) => {
        const image = new Image(); image.decoding = 'async';
        await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error(`No se pudo cargar ${src}`)); image.src = src; });
        if (image.decode) await image.decode();
        this.assets[name] = image; onProgress(++completed / Object.keys(sources).length);
      }));
      this.ready = true;
      this.measure();
    }
    resize() {
      const box = this.canvas.parentElement.getBoundingClientRect();
      this.width = box.width; this.height = box.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(box.width * ratio); this.canvas.height = Math.round(box.height * ratio);
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';
      this.measure();
    }
    measure() {
      const base = this.canvas.getBoundingClientRect();
      ['owl', 'monitor', 'keyboard', 'mouse'].forEach(id => {
        const element = id === 'owl' ? document.getElementById('owl-bounds') : document.querySelector(`[data-object="${id}"]`);
        if (!element) return;
        const r = element.getBoundingClientRect();
        this.bounds[id] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
      });
      // Keep the character's face and feet clear of both reading and action panels.
      if (['explore', 'lesson', 'challenge'].includes(this.getState().mode)) {
        const card = document.getElementById(this.getState().mode === 'challenge' ? 'challenge-card' : 'story-card');
        const dialogue = document.getElementById('dialogue') || document.getElementById('lesson-footer');
        if (card && !card.hidden && dialogue && !dialogue.hidden && this.bounds.owl) {
          const b = this.bounds.owl, reading = card.getBoundingClientRect(), actions = dialogue.getBoundingClientRect();
          const overlapsReading = b.x + b.w > reading.left - base.left && b.x < reading.right - base.left;
          const top = Math.max(b.y, overlapsReading ? reading.bottom - base.top + 7 : b.y);
          const size = Math.min(b.w, Math.max(64, actions.top - base.top - top - 8));
          this.bounds.owl = { x: b.x + (b.w - size) / 2, y: top, w: size, h: size };
        }
      }
    }
    setMood(mood) { this.mood = mood; this.moodAt = this.time; }
    transition() { this.sceneStart = this.time; this.previousBackdrop = this.currentBackdrop || this.assets.valley; }
    burst(id = 'owl') {
      const b = this.bounds[id]; if (!b) return;
      for (let i = 0; i < 26; i++) {
        const angle = i * 2.39996;
        this.particles.push({ x: b.x + b.w / 2, y: b.y + b.h * .5, vx: Math.cos(angle) * (45 + i * 2), vy: Math.sin(angle) * 65 - 45, life: 1, size: 2 + i % 4, color: ['#ffdf8b', '#fff5d0', '#b9d993'][i % 3] });
      }
    }
    drawCover(image, x, y, width, height) {
      const ratio = Math.max(width / image.width, height / image.height);
      const iw = image.width * ratio, ih = image.height * ratio;
      this.ctx.drawImage(image, x + (width - iw) / 2, y + (height - ih) / 2, iw, ih);
    }
    shadow(x, y, width, opacity = .24) {
      const ctx = this.ctx;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, .16);
      const localGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
      localGradient.addColorStop(0, `rgba(24,49,25,${opacity})`); localGradient.addColorStop(1, 'rgba(24,49,25,0)');
      ctx.fillStyle = localGradient; ctx.beginPath(); ctx.arc(0, 0, width / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    drawDevice(id, index, state, dt) {
      const b = this.bounds[id]; if (!b || b.w === 0) return;
      const ctx = this.ctx, image = this.assets.devices;
      const active = state.active === id || state.selected === id || this.hovered === id;
      const target = active ? 1.065 : 1;
      this.scales[id] += (target - this.scales[id]) * Math.min(1, dt * 13);
      const scale = state.reducedMotion ? 1 : this.scales[id];
      const lift = state.reducedMotion ? 0 : (scale - 1) * 100;
      const arrival = state.reducedMotion ? 1 : Math.min(1, Math.max(0, (this.time - this.sceneStart - index * .07) / .5));
      const easedArrival = 1 - Math.pow(1 - arrival, 3);
      const size = b.w * scale * (.88 + easedArrival * .12);
      let x = b.x + (b.w - size) / 2, y = b.y + (b.h - size) / 2 - lift;
      if (id === 'mouse' && state.mode === 'lesson' && state.active === 'mouse') { x += (state.cursor.x - .5) * 22; y += (state.cursor.y - .5) * 14; }
      if (active) {
        const glow = ctx.createRadialGradient(x + size / 2, y + size * .6, 4, x + size / 2, y + size * .6, size * .65);
        glow.addColorStop(0, '#fff0a255'); glow.addColorStop(1, '#fff0a200');
        ctx.fillStyle = glow; ctx.fillRect(x - size * .2, y - size * .2, size * 1.4, size * 1.4);
      }
      this.shadow(x + size / 2, y + size * (id === 'keyboard' ? .72 : .89), size * .9, .26);
      const cell = image.width / 3;
      ctx.save();
      ctx.globalAlpha = easedArrival;
      ctx.drawImage(image, index * cell, 0, cell, image.height, x, y, size, size);
      ctx.restore();
      if (id === 'monitor' && state.mode === 'lesson') this.drawScreen({ x: x + size * .126, y: y + size * .171, w: size * .716, h: size * .467 }, state);
    }
    drawScreen(rect, state) {
      const ctx = this.ctx, { x, y, w, h } = rect;
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, w * .025); ctx.clip();
      ctx.fillStyle = '#173d2c'; ctx.fillRect(x, y, w, h);
      if (state.display === 'image') {
        this.drawCover(this.assets.valley, x, y, w, h);
      } else if (state.display === 'word') {
        ctx.fillStyle = '#edf5d8'; ctx.font = `900 ${Math.min(h * .48, w / Math.max(state.typed.length, 2) * 1.25)}px Adventure, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(state.typed || '…', x + w / 2, y + h / 2, w * .9);
      } else if (state.display === 'pointer') {
        ctx.fillStyle = '#e9f1d7'; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#cbdcba'; ctx.lineWidth = 1;
        for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + w / 6 * i, y); ctx.lineTo(x + w / 6 * i, y + h); ctx.stroke(); }
        ctx.fillStyle = '#e9c678'; ctx.beginPath(); ctx.arc(x + w * .78, y + h * .24, h * .1, 0, Math.PI * 2); ctx.fill();
        const px = x + 5 + state.cursor.x * (w - 24), py = y + 5 + state.cursor.y * (h - 30);
        ctx.translate(px, py); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2, 23); ctx.lineTo(8, 16); ctx.lineTo(17, 14); ctx.closePath(); ctx.fillStyle = '#fffdf0'; ctx.strokeStyle = '#31583d'; ctx.lineWidth = 1.7; ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
    owlFrame(state) {
      if (state.reducedMotion) return this.mood === 'success' && this.time - this.moodAt < 1.5 ? 6 : 0;
      const t = this.time - this.moodAt;
      if (this.mood === 'wave' && t < 1.7) return [0, 4, 5, 4, 5, 4, 0][Math.min(6, Math.floor(t / .24))];
      if (this.mood === 'success' && t < 1.6) return t < .2 ? 4 : t < 1.25 ? 6 : 5;
      if (this.mood === 'think' && t < 1.8) return 7;
      const blink = this.time % 5.8;
      if (blink > 5.25 && blink < 5.38) return 1;
      if (blink >= 5.38 && blink < 5.52) return 2;
      if (blink >= 5.52 && blink < 5.65) return 1;
      return 0;
    }
    drawOwl(state, dt) {
      const target = this.bounds.owl; if (!target || !target.w) return;
      if (!this.currentOwl || state.reducedMotion) this.currentOwl = { ...target };
      else ['x', 'y', 'w', 'h'].forEach(key => this.currentOwl[key] += (target[key] - this.currentOwl[key]) * Math.min(dt * 7, 1));
      const b = this.currentOwl;
      const ctx = this.ctx, image = this.assets.owl, frame = this.owlFrame(state);
      const cellW = image.width / 4, cellH = image.height / 2;
      const t = this.time - this.moodAt;
      const jump = !state.reducedMotion && this.mood === 'success' && t < .7 ? Math.sin(t / .7 * Math.PI) * b.h * .06 : 0;
      const breathe = state.reducedMotion ? 0 : Math.sin(this.time * 1.6) * .003;
      this.shadow(b.x + b.w / 2, b.y + b.h * .94, b.w * .75, .3);
      ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h - jump); ctx.scale(1 + breathe, 1 - breathe);
      ctx.drawImage(image, frame % 4 * cellW, Math.floor(frame / 4) * cellH, cellW, cellH, -b.w / 2, -b.h, b.w, b.h); ctx.restore();
    }
    drawAtmosphere(state, dt) {
      if (state.reducedMotion) { this.particles = []; return; }
      const ctx = this.ctx;
      if (['intro', 'explore', 'finish'].includes(state.mode)) this.ambient.forEach(particle => {
        const x = ((particle.x + this.time * particle.speed) % 1) * this.width;
        const y = (particle.y + Math.sin(this.time * .25 + particle.phase) * .035) * this.height;
        const alpha = .15 + (Math.sin(this.time * .8 + particle.phase) + 1) * .15;
        ctx.beginPath(); ctx.arc(x, y, particle.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,242,174,${alpha})`; ctx.fill();
      });
      this.particles = this.particles.filter(p => p.life > 0);
      this.particles.forEach(p => {
        p.life -= dt * .65; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 45 * dt;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(this.time * 2);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
      });
    }
    tick(now) {
      const dt = Math.min((now - this.last) / 1000, .04); this.last = now;
      const state = this.getState();
      if (this.ready && !document.hidden && !state.paused) {
        this.time += dt;
        const ctx = this.ctx;
        this.camera.x += ((state.reducedMotion ? 0 : this.mouse.x * 5) - this.camera.x) * Math.min(dt * 3, 1);
        this.camera.y += ((state.reducedMotion ? 0 : this.mouse.y * 3) - this.camera.y) * Math.min(dt * 3, 1);
        this.currentBackdrop = state.mode === 'challenge' ? this.assets.studio : this.assets.valley;
        const backgroundAlpha = state.reducedMotion ? 1 : Math.min(1, (this.time - this.sceneStart) / .5);
        if (backgroundAlpha < 1 && this.previousBackdrop) this.drawCover(this.previousBackdrop, -12, -10, this.width + 24, this.height + 20);
        ctx.save(); ctx.globalAlpha = backgroundAlpha;
        this.drawCover(this.currentBackdrop, -12 + this.camera.x, -10 + this.camera.y, this.width + 24, this.height + 20);
        ctx.restore();
        if (['explore', 'lesson', 'challenge'].includes(state.mode)) ['monitor', 'keyboard', 'mouse'].forEach((id, i) => this.drawDevice(id, i, state, dt));
        if (state.mode !== 'loading') this.drawOwl(state, dt);
        this.drawAtmosphere(state, dt);
      }
      this.frame = requestAnimationFrame(this.tick);
    }
    destroy() { cancelAnimationFrame(this.frame); this.resizeObserver.disconnect(); }
  }
  window.AdventureRenderer = AdventureRenderer;
})();
