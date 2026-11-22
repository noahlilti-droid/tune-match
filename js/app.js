(function () {
  'use strict';
  const C = window.Chords;
  const ALBUM = window.ALBUM;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const FINGER = {
    guitar: { 1: 'index', 2: 'middle', 3: 'ring', 4: 'pinky' },
    piano: { 1: 'thumb', 2: 'index', 3: 'middle', 4: 'ring', 5: 'pinky' }
  };
  const COLORS = {};
  const css = getComputedStyle(document.documentElement);
  for (const k of ['thumb', 'index', 'middle', 'ring', 'pinky']) COLORS[k] = css.getPropertyValue('--f-' + k).trim();
  const INK = '#02030a', LINE = '#16255e', ICE = '#dde6ff', MIST = '#8794c4', NAVY = '#0a1640';

  /* ---------- storage (per-browser convenience) ---------- */
  const KEY = 'abbeyroad:v1:';
  const store = {
    get(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(KEY + k); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- song model ---------- */
  function parseLine(spec) {
    let s = spec.trim();
    const instr = s.startsWith('~');
    if (instr) s = s.slice(1).trim();
    const chords = s.split(/\s+/).filter(t => t && t !== '|').map(tok => {
      const m = /^(.+?)(?::(\d+(?:\.\d+)?))?$/.exec(tok);
      return { c: m[1], b: m[2] ? parseFloat(m[2]) : 4 };
    });
    return { instr, chords, lyric: '' };
  }

  function defaultModel(song) {
    const sections = [];
    for (const [label, key, opt = {}] of song.form) {
      const reps = opt.repeat || 1;
      sections.push({
        label: reps > 1 ? `${label} ×${reps}` : label,
        bpm: opt.bpm || song.bpm,
        lines: Array.from({ length: reps }, () => song.parts[key].map(parseLine)).flat()
      });
    }
    return sections;
  }

  function serialize(sections, songBpm) {
    return sections.map(sec => {
      const head = '# ' + sec.label + (sec.bpm !== songBpm ? ' @' + sec.bpm : '');
      const body = sec.lines.map(l => {
        const ch = l.chords.map(x => `${x.c}:${x.b}`).join(' ');
        return (l.instr ? '~ ' : '') + ch + (l.lyric ? ' | ' + l.lyric : '');
      });
      return [head, ...body].join('\n');
    }).join('\n\n');
  }

  function parseText(text, songBpm) {
    const sections = [];
    let cur = null;
    const errors = [];
    text.split('\n').forEach((raw, n) => {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) return;
      if (line.startsWith('#')) {
        const m = /^#\s*(.*?)\s*(?:@(\d{2,3}))?$/.exec(line);
        cur = { label: m[1] || 'Section', bpm: m[2] ? parseInt(m[2], 10) : songBpm, lines: [] };
        sections.push(cur);
        return;
      }
      if (!cur) { cur = { label: 'Section', bpm: songBpm, lines: [] }; sections.push(cur); }
      const bar = line.indexOf('|');
      const left = bar >= 0 ? line.slice(0, bar) : line;
      const lyric = bar >= 0 ? line.slice(bar + 1).trim() : '';
      const l = parseLine(left);
      l.lyric = l.instr ? '' : lyric;
      const bad = l.chords.filter(x => !C.parse(x.c));
      if (!l.chords.length) errors.push(`Ligne ${n + 1} : aucun accord.`);
      else if (bad.length) errors.push(`Ligne ${n + 1} : accord inconnu « ${bad[0].c} ».`);
      else cur.lines.push(l);
    });
    return { sections: sections.filter(s => s.lines.length), errors };
  }

  function loadModel(song) {
    const saved = store.get('song:' + song.id);
    if (saved) {
      const r = parseText(saved, song.bpm);
      if (r.sections.length) return r.sections;
    }
    return defaultModel(song);
  }

  // Flatten into timed events. Time is in seconds at 100 % tempo.
  function buildEvents(sections) {
    const events = [];
    let t = 0, beat = 0, li = 0;
    sections.forEach((sec, si) => {
      sec.lines.forEach((line, lj) => {
        line.idx = li++;
        line.chords.forEach((ch, k) => {
          const dur = ch.b * 60 / sec.bpm;
          events.push({ i: events.length, si, line, k, c: ch.c, b: ch.b, bpm: sec.bpm, start: t, dur, beat });
          t += dur; beat += ch.b;
        });
      });
    });
    return { events, total: t, beats: beat };
  }

  /* ---------- state ---------- */
  const S = {
    song: null, sections: [], events: [], total: 0,
    transpose: 0, capo: 0, inst: 'both',
    tempo: 1, metro: true, sound: false, countIn: true,
    playing: false, pos: 0, cur: -1, last: 0, lastBeat: null, userScroll: 0
  };
  try { const inst = localStorage.getItem(KEY + 'inst'); if (inst) S.inst = inst; } catch (e) { /* ignore */ }

  const shapeName = c => C.transpose(c, S.transpose - S.capo);
  const soundName = c => C.transpose(c, S.transpose);

  /* ---------- SVG: guitar ---------- */
  function guitarSVG(name, big) {
    const v = C.guitar(name);
    const sx = big ? 30 : 11, sy = big ? 34 : 12, top = big ? 34 : 13, left = big ? 34 : 9;
    const rows = 5, W = left + sx * 5 + (big ? 22 : 7), H = top + sy * rows + (big ? 34 : 4);
    const dot = big ? 22 : 8;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-label="Diagramme guitare ${esc(name)}">`;
    if (!v) return s + `<text x="${W / 2}" y="${H / 2}" fill="${MIST}" font-size="10" text-anchor="middle">?</text></svg>`;
    const fretted = v.frets.filter(f => f > 0);
    const maxF = fretted.length ? Math.max(...fretted) : 0;
    const minF = fretted.length ? Math.min(...fretted) : 1;
    const start = maxF <= 5 ? 1 : minF;
    // fret lines
    for (let r = 0; r <= rows; r++) {
      const y = top + r * sy;
      const thick = r === 0 && start === 1;
      s += `<rect x="${left}" y="${y - (thick ? (big ? 3 : 1) : 0)}" width="${sx * 5 + 2}" height="${thick ? (big ? 6 : 3) : (big ? 2 : 1)}" fill="${thick ? ICE : LINE}"/>`;
    }
    // strings
    for (let i = 0; i < 6; i++) {
      const x = left + i * sx;
      s += `<rect x="${x}" y="${top}" width="${big ? 2 : 1}" height="${sy * rows}" fill="${i < 3 ? '#5a6aa8' : '#7b8acb'}"/>`;
    }
    if (start > 1) s += `<text x="${left - (big ? 10 : 3)}" y="${top + sy * .5 + (big ? 5 : 3)}" fill="${MIST}" font-family="Pixelify Sans, monospace" font-size="${big ? 14 : 7}" text-anchor="end">${start}</text>`;
    // open / mute markers
    v.frets.forEach((f, i) => {
      const x = left + i * sx + (big ? 1 : 0);
      const y = top - (big ? 16 : 7);
      const m = big ? 10 : 4;
      if (f === 0) s += `<rect x="${x - m / 2}" y="${y - m / 2}" width="${m}" height="${m}" fill="none" stroke="${ICE}" stroke-width="${big ? 2 : 1}"/>`;
      if (f < 0) {
        const p = big ? 2 : 1;
        for (let k = -2; k <= 2; k++) {
          s += `<rect x="${x + k * p * 2 - p}" y="${y + k * p * 2 - p}" width="${p * 2}" height="${p * 2}" fill="${MIST}"/>`;
          if (k) s += `<rect x="${x - k * p * 2 - p}" y="${y + k * p * 2 - p}" width="${p * 2}" height="${p * 2}" fill="${MIST}"/>`;
        }
      }
    });
    // barre
    if (v.barre) {
      const r = v.barre.fret - start;
      const y = top + r * sy + (sy - dot) / 2;
      const x1 = left + v.barre.from * sx - dot / 2 + 1, x2 = left + v.barre.to * sx + dot / 2 + 1;
      s += `<rect x="${x1}" y="${y + dot * .25}" width="${x2 - x1}" height="${dot * .5}" fill="${COLORS.index}"/>`;
    }
    // finger dots
    v.frets.forEach((f, i) => {
      if (f <= 0) return;
      const r = f - start;
      const fg = v.fingers[i] || 1;
      const col = COLORS[FINGER.guitar[fg]] || ICE;
      const x = left + i * sx - dot / 2 + 1, y = top + r * sy + (sy - dot) / 2;
      s += `<rect x="${x}" y="${y}" width="${dot}" height="${dot}" fill="${col}"/>`;
      if (big) s += `<text x="${x + dot / 2}" y="${y + dot / 2 + 5}" fill="${INK}" font-family="Pixelify Sans, monospace" font-weight="700" font-size="14" text-anchor="middle">${fg}</text>`;
    });
    if (big) {
      v.frets.forEach((f, i) => {
        const label = f < 0 ? '×' : C.spell(C.TUNING[i] + f, true);
        s += `<text x="${left + i * sx + 1}" y="${H - 8}" fill="${f < 0 ? LINE : MIST}" font-family="IBM Plex Mono, monospace" font-size="11" text-anchor="middle">${label}</text>`;
      });
    }
    return s + '</svg>';
  }

  /* ---------- SVG: piano ---------- */
  const BLACK = new Set([1, 3, 6, 8, 10]);
  function pianoSVG(name, big) {
    const p = C.piano(name);
    const lo = big ? 36 : 48, hi = big ? 76 : 74;
    const whites = [];
    for (let m = lo; m <= hi; m++) if (!BLACK.has(m % 12)) whites.push(m);
    const ww = big ? 11 : 6, wh = big ? 74 : 34, bw = ww * .62, bh = wh * .6;
    const W = whites.length * ww + 2, H = wh + (big ? 22 : 2);
    const on = new Map();
    if (p) {
      p.rh.forEach(n => on.set(n.midi, { f: n.finger, hand: 'D' }));
      if (big) on.set(p.lh.midi, { f: p.lh.finger, hand: 'G' });
    }
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-label="Clavier ${esc(name)}">`;
    const xOf = {};
    whites.forEach((m, i) => {
      xOf[m] = 1 + i * ww;
      const a = on.get(m);
      const col = a ? COLORS[FINGER.piano[a.f]] : '#c9d3f2';
      s += `<rect x="${1 + i * ww}" y="0" width="${ww - 1}" height="${wh}" fill="${col}"/>`;
      if (a && big) {
        s += `<text x="${1 + i * ww + (ww - 1) / 2}" y="${wh - 6}" fill="${INK}" font-family="Pixelify Sans, monospace" font-weight="700" font-size="10" text-anchor="middle">${a.f}</text>`;
        s += `<text x="${1 + i * ww + (ww - 1) / 2}" y="${wh + 15}" fill="${a.hand === 'G' ? MIST : ICE}" font-family="Pixelify Sans, monospace" font-size="9" text-anchor="middle">${a.hand === 'G' ? 'MG' : 'MD'}</text>`;
      }
      if (m % 12 === 0 && big) s += `<rect x="${1 + i * ww}" y="${wh - 2}" width="${ww - 1}" height="2" fill="${MIST}"/>`;
    });
    for (let m = lo; m <= hi; m++) {
      if (!BLACK.has(m % 12)) continue;
      const x = (xOf[m - 1] || 1) + ww - bw / 2 - .5;
      const a = on.get(m);
      const col = a ? COLORS[FINGER.piano[a.f]] : '#070b1c';
      s += `<rect x="${x}" y="0" width="${bw}" height="${bh}" fill="${col}"/>`;
      if (a && big) {
        s += `<text x="${x + bw / 2}" y="${bh - 5}" fill="${INK}" font-family="Pixelify Sans, monospace" font-weight="700" font-size="9" text-anchor="middle">${a.f}</text>`;
        s += `<text x="${x + bw / 2}" y="${wh + 15}" fill="${a.hand === 'G' ? MIST : ICE}" font-family="Pixelify Sans, monospace" font-size="9" text-anchor="middle">${a.hand === 'G' ? 'MG' : 'MD'}</text>`;
      }
    }
    return s + '</svg>';
  }

  /* ---------- chord placement over lyrics ---------- */
  function place(lyric, chords) {
    const hasMarks = lyric.includes('^');
    const text = lyric.replace(/\^/g, '');
    const L = text.length;
    let idx = [];
    if (hasMarks) {
      let k = 0;
      for (const ch of lyric) { if (ch === '^') idx.push(k); else k++; }
    }
    const totalB = chords.reduce((a, c) => a + c.b, 0);
    let acc = 0;
    const starts = [0];
    for (let w = 1; w < text.length; w++) if (text[w - 1] === ' ' && text[w] !== ' ') starts.push(w);
    const out = [];
    chords.forEach((ch, k) => {
      let pos;
      if (k < idx.length) pos = idx[k];
      else {
        const target = Math.round(acc / totalB * L);
        pos = starts.reduce((best, s0) => Math.abs(s0 - target) < Math.abs(best - target) ? s0 : best, starts[0]);
      }
      const prev = out.length ? out[out.length - 1] : -1;
      if (pos <= prev) pos = Math.min(L, prev + 1);
      out.push(pos);
      acc += ch.b;
    });
    return { text, pos: out };
  }

  /* ---------- rendering ---------- */
  function renderTracks() {
    $('tracks').innerHTML = ALBUM.songs.map((s, i) => `
      <li class="${i === 7 ? 'side-b' : ''}"><button type="button" data-id="${s.id}">
        <span class="no">${String(i + 1).padStart(2, '0')}</span><span>${esc(s.title)}</span><span class="len">${s.length}</span>
      </button></li>`).join('');
    $('tracks').addEventListener('click', e => {
      const b = e.target.closest('button[data-id]');
      if (b) location.hash = b.dataset.id;
    });
  }

  function renderHead() {
    const s = S.song;
    const n = ALBUM.songs.indexOf(s) + 1;
    $('trackNo').textContent = String(n).padStart(2, '0');
    $('songTitle').textContent = s.title;
    $('songCredit').textContent = `${s.writer} · chant : ${s.voice}`;
    const shownKey = S.transpose ? `${s.key} ${S.transpose > 0 ? '+' : ''}${S.transpose}` : s.key;
    const ok = s.conf === 'solide';
    $('songChips').innerHTML = [
      ['Tonalité', shownKey], ['Tempo', s.bpm + ' BPM'], ['Mesure', s.meter], ['Durée', s.length],
      ['Capo', S.capo ? 'case ' + S.capo : 'aucun']
    ].map(([k, v]) => `<span class="chip"><b>${k}</b>${esc(v)}</span>`).join('') +
      `<span class="chip ${ok ? 'ok' : 'warn'}" title="${ok ? 'Grille connue, simplifiée' : 'Transcription simplifiée : vérifiez à l’oreille et corrigez avec « Éditer la grille »'}">${ok ? 'Grille solide' : 'Grille à vérifier'}</span>` +
      (store.get('song:' + s.id) ? '<span class="chip"><b>✎</b>modifiée</span>' : '');
    $('songTip').textContent = s.tip;
    $('trVal').textContent = (S.transpose > 0 ? '+' : '') + S.transpose;
    $('capoVal').textContent = S.capo;
    document.title = `${s.title} · Abbey Road Songbook`;
    document.querySelectorAll('#tracks button').forEach(b => b.classList.toggle('on', b.dataset.id === s.id));
    const on = document.querySelector('#tracks button.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function renderStrip() {
    const seen = [];
    S.events.forEach(e => { if (!seen.includes(e.c)) seen.push(e.c); });
    $('stripCount').textContent = `· ${seen.length}`;
    $('strip').innerHTML = seen.map(c => {
      const g = S.inst !== 'piano';
      return `<button type="button" class="mini" data-c="${esc(c)}" title="${esc(C.describe(soundName(c)))}">
        <span class="nm">${esc(shapeName(c))}</span>${g ? guitarSVG(shapeName(c), false) : pianoSVG(soundName(c), false)}</button>`;
    }).join('');
  }

  function renderScore() {
    const anyLyrics = S.sections.some(sec => sec.lines.some(l => l.lyric));
    $('lyricsNote').hidden = anyLyrics;
    let vocal = 0;
    $('score').innerHTML = S.sections.map(sec => {
      const bars = sec.lines.reduce((a, l) => a + l.chords.reduce((x, c) => x + c.b, 0), 0) / 4;
      const lines = sec.lines.map(line => {
        const evs = S.events.filter(e => e.line === line);
        const num = line.instr ? '' : ++vocal;
        let inner;
        if (!line.instr && line.lyric) {
          const { text, pos } = place(line.lyric, line.chords);
          const parts = [];
          if (pos[0] > 0) parts.push(`<span class="seg-w"><span class="c"></span><span class="t">${esc(text.slice(0, pos[0]))}</span></span>`);
          pos.forEach((p, k) => {
            const end = k + 1 < pos.length ? pos[k + 1] : text.length;
            const chunk = text.slice(p, end) || ' ';
            parts.push(`<span class="seg-w"><span class="c" data-ev="${evs[k].i}">${esc(shapeName(line.chords[k].c))}</span><span class="t">${esc(chunk)}</span></span>`);
          });
          inner = `<div class="lyr">${parts.join('')}</div>`;
        } else {
          inner = `<div class="grid">${evs.map(e => `
            <div class="cell" data-ev="${e.i}" style="flex:${e.b} 1 0">
              <span class="c">${esc(shapeName(e.c))}</span>
              <span class="ticks">${Array.from({ length: Math.round(e.b) }, () => '<i></i>').join('')}</span>
            </div>`).join('')}</div>` +
            (line.instr ? '' : `<div class="placeholder">ligne ${num} · paroles à ajouter</div>`);
        }
        return `<div class="line${line.instr ? ' instr' : ''}" data-line="${line.idx}"><span class="num">${num}</span>${inner}</div>`;
      }).join('');
      return `<article class="section px"><div class="section-title"><h2>${esc(sec.label)}</h2><span>${bars} mesures${sec.bpm !== S.song.bpm ? ' · ' + sec.bpm + ' BPM' : ''}</span></div>${lines}</article>`;
    }).join('');
  }

  function renderLegend() {
    const g = [[1, 'index'], [2, 'majeur'], [3, 'annulaire'], [4, 'auriculaire']];
    const p = [[1, 'pouce'], [2, 'index'], [3, 'majeur'], [4, 'annulaire'], [5, 'auriculaire']];
    $('legend').innerHTML =
      `<div class="lt">Doigts guitare</div>` + g.map(([n, l]) => `<div><i style="background:${COLORS[FINGER.guitar[n]]}"></i>${n} ${l}</div>`).join('') +
      `<div class="lt" style="margin-top:6px">Doigts piano</div>` + p.map(([n, l]) => `<div><i style="background:${COLORS[FINGER.piano[n]]}"></i>${n} ${l}</div>`).join('');
  }

  function renderDock(ev) {
    const e = ev || S.events[0];
    if (!e) return;
    const nx = S.events.slice(e.i + 1).find(x => x.c !== e.c);
    const shape = shapeName(e.c), sound = soundName(e.c);
    $('nowName').textContent = shape;
    $('nowDesc').textContent = C.describe(sound) + ' · ' + C.noteNames(sound).join(' ') + (S.capo ? ` · son réel ${sound}` : '');
    $('nextName').textContent = nx ? shapeName(nx.c) : '—';
    $('guitarFig').innerHTML = `<figcaption><span>Guitare</span><span>${S.capo ? 'capo ' + S.capo : 'accordage standard'}</span></figcaption>${guitarSVG(shape, true)}`;
    const p = C.piano(sound);
    $('pianoFig').innerHTML = `<figcaption><span>Piano</span><span>${p ? 'MD ' + p.rh.map(n => C.midiName(n.midi)).join(' ') : ''}</span></figcaption>${pianoSVG(sound, true)}` +
      (p ? `<div class="sub">Main gauche : ${C.midiName(p.lh.midi)} (5) · main droite : ${p.rh.map(n => n.finger).join('-')}</div>` : '');
  }

  function renderAll() {
    S.events = [];
    const built = buildEvents(S.sections);
    S.events = built.events; S.total = built.total; S.beats = built.beats;
    renderHead();
    renderStrip();
    renderScore();
    $('bpmInfo').textContent = Math.round(S.song.bpm * S.tempo) + ' BPM';
    S.cur = -1;
    update(true);
  }

  /* ---------- playback engine ---------- */
  let audio = null;
  function ac() {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = null; } }
    if (audio && audio.state === 'suspended') audio.resume();
    return audio;
  }
  function click(down) {
    const a = ac(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'square'; o.frequency.value = down ? 1560 : 1040;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(down ? 0.16 : 0.09, a.currentTime + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.05);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.06);
  }
  function strum(name, dur) {
    const a = ac(); if (!a) return;
    const p = C.piano(name); if (!p) return;
    const notes = [p.lh.midi, ...p.rh.map(n => n.midi)];
    const len = Math.min(dur, 2.4);
    notes.forEach((m, k) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      const t0 = a.currentTime + k * 0.018;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(k === 0 ? 0.11 : 0.07, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + len + 0.05);
    });
  }

  function eventAt(pos) {
    const ev = S.events;
    if (!ev.length) return null;
    if (pos <= 0) return ev[0];
    let lo = 0, hi = ev.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ev[mid].start <= pos) lo = mid; else hi = mid - 1;
    }
    return ev[lo];
  }

  function fmt(t) { t = Math.max(0, t); return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); }

  function update(force) {
    const e = eventAt(S.pos);
    if (!e) return;
    const inCount = S.pos < 0;
    const frac = inCount ? 0 : Math.min(1, (S.pos - e.start) / e.dur);
    const beatInEv = inCount ? 0 : Math.floor(frac * e.b);
    const gBeat = inCount ? Math.floor(S.pos / (60 / S.song.bpm)) : e.beat + beatInEv;

    if (e.i !== S.cur || force) {
      const prev = S.events[S.cur];
      document.querySelectorAll('.score .on').forEach(x => x.classList.remove('on'));
      document.querySelectorAll(`[data-ev="${e.i}"]`).forEach(x => x.classList.add('on'));
      if (!prev || prev.line !== e.line || force) {
        document.querySelectorAll('.line.active').forEach(x => { x.classList.remove('active'); x.style.removeProperty('--p'); });
        const el = document.querySelector(`.line[data-line="${e.line.idx}"]`);
        if (el) {
          el.classList.add('active');
          if (S.playing && performance.now() - S.userScroll > 2500) scrollToLine(el);
        }
      }
      document.querySelectorAll('.mini').forEach(m => m.classList.toggle('on', m.dataset.c === e.c));
      renderDock(e);
      if (S.playing && S.sound && !inCount && (!prev || prev.i !== e.i)) strum(soundName(e.c), e.dur / S.tempo);
      S.cur = e.i;
    }
    // line progress
    const lineEl = document.querySelector('.line.active');
    if (lineEl) {
      const evs = S.events.filter(x => x.line === e.line);
      const ls = evs[0].start, le = evs[evs.length - 1].start + evs[evs.length - 1].dur;
      lineEl.style.setProperty('--p', inCount ? 0 : Math.max(0, Math.min(1, (S.pos - ls) / (le - ls))).toFixed(4));
    }
    // ticks inside the active grid cell
    document.querySelectorAll('.cell.on .ticks i').forEach((t, k) => t.classList.toggle('on', !inCount && k <= beatInEv));
    // beat lights
    const b4 = ((gBeat % 4) + 4) % 4;
    document.querySelectorAll('#beats i').forEach((d, k) => {
      d.classList.toggle('on', S.playing && k === b4);
      d.classList.toggle('down', k === 0);
    });
    $('barInfo').textContent = inCount ? `Décompte ${4 + Math.floor(S.pos / (60 / S.song.bpm)) + 1}` : `Mesure ${Math.floor(gBeat / 4) + 1} / ${Math.ceil(S.beats / 4)}`;
    $('timeInfo').textContent = `${fmt(S.pos)} / ${fmt(S.total)}`;
    $('progressFill').style.width = (Math.max(0, S.pos) / S.total * 100).toFixed(2) + '%';

    // metronome
    if (S.playing && S.metro && gBeat !== S.lastBeat) click(b4 === 0);
    else if (S.playing && inCount && gBeat !== S.lastBeat) click(b4 === 0);
    S.lastBeat = gBeat;
  }

  function scrollToLine(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const dockH = window.innerWidth <= 820 ? ($('dock').offsetHeight || 0) : 0;
    const target = window.scrollY + r.top - (vh - dockH) * 0.38;
    window.scrollTo({ top: Math.max(0, target), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function frame(now) {
    if (!S.playing) return;
    const dt = Math.min(0.1, (now - S.last) / 1000);
    S.last = now;
    S.pos += dt * S.tempo;
    if (S.pos >= S.total) { S.pos = S.total - 0.001; update(); setPlaying(false); return; }
    update();
    requestAnimationFrame(frame);
  }

  function setPlaying(on) {
    S.playing = on;
    $('playBtn').classList.toggle('on', on);
    $('playBtn').setAttribute('aria-label', on ? 'Pause' : 'Lecture');
    $('playIcon').innerHTML = on
      ? '<path fill="currentColor" d="M3 2h4v12H3zM9 2h4v12H9z"/>'
      : '<path fill="currentColor" d="M4 2h2v1h2v1h2v1h2v1h2v4h-2v1h-2v1H8v1H6v1H4z"/>';
    if (on) {
      ac();
      if (S.pos >= S.total - 0.01) S.pos = 0;
      if (S.countIn && S.pos <= 0.001) S.pos = -4 * 60 / S.song.bpm;
      S.lastBeat = null;
      S.cur = -1;
      S.last = performance.now();
      S.userScroll = 0;
      update(true);
      requestAnimationFrame(frame);
    } else {
      if (S.pos < 0) S.pos = 0;
      update(true);
    }
  }

  function seek(i) {
    const e = S.events[Math.max(0, Math.min(S.events.length - 1, i))];
    if (!e) return;
    S.pos = e.start + 0.0001;
    S.lastBeat = null;
    S.userScroll = 0;
    update(true);
    if (!S.playing) {
      const el = document.querySelector(`.line[data-line="${e.line.idx}"]`);
      if (el) scrollToLine(el);
    }
  }

  /* ---------- song loading ---------- */
  function loadSong(id) {
    const song = ALBUM.songs.find(s => s.id === id) || ALBUM.songs[0];
    if (S.playing) setPlaying(false);
    S.song = song;
    S.transpose = 0;
    S.capo = song.capo || 0;
    S.pos = 0;
    S.sections = loadModel(song);
    renderAll();
    window.scrollTo({ top: 0 });
  }

  /* ---------- modals ---------- */
  function vocalLines() { return S.sections.flatMap(sec => sec.lines.filter(l => !l.instr)); }

  function saveModel() {
    store.set('song:' + S.song.id, serialize(S.sections, S.song.bpm));
  }

  function openLyrics() {
    const vl = vocalLines();
    $('lyricsSong').textContent = S.song.title;
    $('lyricsCount').textContent = vl.length;
    $('lyricsText').value = vl.map(l => l.lyric).join('\n').replace(/\n+$/, '');
    $('lyricsStatus').textContent = '';
    if (S.playing) setPlaying(false);
    $('lyricsDlg').showModal();
  }
  $('lyricsText').addEventListener('input', () => {
    const n = $('lyricsText').value.split('\n').filter(x => x.trim()).length;
    const want = vocalLines().length;
    $('lyricsStatus').textContent = n === want ? '' : `${n} ligne${n > 1 ? 's' : ''} collée${n > 1 ? 's' : ''} pour ${want} lignes chantées${n > want ? ' : les dernières seront ignorées' : ''}.`;
  });
  $('lyricsDlg').addEventListener('close', () => {
    if ($('lyricsDlg').returnValue !== 'save') return;
    const rows = $('lyricsText').value.split('\n').map(x => x.trim()).filter(Boolean);
    vocalLines().forEach((l, k) => { l.lyric = rows[k] || ''; });
    saveModel();
    renderAll();
  });

  function openEdit() {
    $('editSong').textContent = S.song.title;
    $('editText').value = serialize(S.sections, S.song.bpm);
    $('editStatus').textContent = '';
    $('resetBtn').dataset.armed = '';
    $('resetBtn').textContent = 'Rétablir l’original';
    if (S.playing) setPlaying(false);
    $('editDlg').showModal();
  }
  $('editForm').addEventListener('submit', e => {
    if (e.submitter && e.submitter.value === 'save') {
      const r = parseText($('editText').value, S.song.bpm);
      if (r.errors.length || !r.sections.length) {
        e.preventDefault();
        $('editStatus').textContent = r.errors[0] || 'La grille est vide.';
        return;
      }
      S.sections = r.sections;
      saveModel();
      S.pos = 0;
      renderAll();
    }
  });
  $('resetBtn').addEventListener('click', () => {
    const b = $('resetBtn');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Confirmer : tout effacer'; return; }
    store.del('song:' + S.song.id);
    S.sections = defaultModel(S.song);
    S.pos = 0;
    $('editDlg').close('reset');
    renderAll();
  });

  /* ---------- controls ---------- */
  $('playBtn').addEventListener('click', () => setPlaying(!S.playing));
  $('restartBtn').addEventListener('click', () => { S.pos = 0; S.lastBeat = null; if (S.playing) { setPlaying(false); setPlaying(true); } else { update(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
  $('prevBtn').addEventListener('click', () => seek((S.cur < 0 ? 0 : S.cur) - 1));
  $('nextBtn').addEventListener('click', () => seek((S.cur < 0 ? 0 : S.cur) + 1));
  $('tempo').addEventListener('input', e => {
    S.tempo = e.target.value / 100;
    $('tempoVal').textContent = e.target.value + ' %';
    $('bpmInfo').textContent = Math.round(S.song.bpm * S.tempo) + ' BPM';
  });
  $('metroChk').addEventListener('change', e => { S.metro = e.target.checked; });
  $('soundChk').addEventListener('change', e => { S.sound = e.target.checked; if (S.sound) ac(); });
  $('countChk').addEventListener('change', e => { S.countIn = e.target.checked; });
  $('trDown').addEventListener('click', () => { S.transpose--; renderAll(); });
  $('trUp').addEventListener('click', () => { S.transpose++; renderAll(); });
  $('capoDown').addEventListener('click', () => { if (S.capo > 0) { S.capo--; renderAll(); } });
  $('capoUp').addEventListener('click', () => { if (S.capo < 11) { S.capo++; renderAll(); } });
  $('lyricsBtn').addEventListener('click', openLyrics);
  $('editBtn').addEventListener('click', openEdit);

  function setInst(v) {
    S.inst = v;
    document.querySelector('.app').dataset.inst = v;
    document.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.inst === v));
    try { localStorage.setItem(KEY + 'inst', v); } catch (e) { /* ignore */ }
  }
  document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => { setInst(b.dataset.inst); renderStrip(); update(true); }));

  // tap tempo: match the record by tapping along
  let taps = [];
  $('tapBtn').addEventListener('click', () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < 2500);
    taps.push(now);
    if (taps.length >= 3) {
      const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      const bpm = 60000 / iv;
      const pct = Math.max(50, Math.min(130, Math.round(bpm / S.song.bpm * 100 / 5) * 5));
      $('tempo').value = pct;
      $('tempo').dispatchEvent(new Event('input'));
    }
    $('tapBtn').textContent = taps.length >= 3 ? `Tap · ${Math.round(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)))}` : 'Tap…';
  });

  $('score').addEventListener('click', e => {
    const t = e.target.closest('[data-ev]');
    if (t) seek(+t.dataset.ev);
  });
  $('strip').addEventListener('click', e => {
    const m = e.target.closest('.mini');
    if (!m) return;
    const from = S.cur < 0 ? 0 : S.cur + 1;
    const nx = S.events.slice(from).find(x => x.c === m.dataset.c) || S.events.find(x => x.c === m.dataset.c);
    if (nx) seek(nx.i);
  });
  $('progress').addEventListener('click', e => {
    const r = $('progress').getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width * S.total;
    seek(eventAt(t).i);
  });

  ['wheel', 'touchmove'].forEach(ev => window.addEventListener(ev, () => { S.userScroll = performance.now(); }, { passive: true }));
  window.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, dialog')) return;
    if (e.code === 'Space') { e.preventDefault(); setPlaying(!S.playing); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seek(S.cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(S.cur - 1); }
    else if (e.key === 'r' || e.key === 'R') $('restartBtn').click();
  });

  window.addEventListener('hashchange', () => loadSong(location.hash.slice(1)));

  /* ---------- pixel gradient background ---------- */
  (function background() {
    const cv = $('bg');
    const ctx = cv.getContext('2d');
    const PAL = [[1, 2, 7], [3, 5, 20], [4, 9, 32], [6, 14, 48], [9, 21, 68], [13, 30, 92], [19, 42, 124], [27, 56, 158]];
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
    const SCALE = 5;
    let img, w, h;
    function size() {
      w = Math.ceil(innerWidth / SCALE); h = Math.ceil(innerHeight / SCALE);
      cv.width = w; cv.height = h;
      img = ctx.createImageData(w, h);
    }
    function draw(t) {
      const d = img.data, n = PAL.length - 1;
      for (let y = 0; y < h; y++) {
        const gy = y / h;
        for (let x = 0; x < w; x++) {
          const gx = x / w;
          let v = 0.12 + gy * 0.42 + gx * 0.08
            + 0.16 * Math.sin(gx * 3.1 + t * 0.00011 + Math.sin(gy * 2.3 - t * 0.00007) * 1.6)
            + 0.1 * Math.sin(gy * 5.2 - gx * 1.7 + t * 0.00017);
          v = v * n + BAYER[(y & 3) * 4 + (x & 3)];
          const c = PAL[Math.max(0, Math.min(n, Math.round(v)))];
          const o = (y * w + x) * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    size();
    addEventListener('resize', () => { size(); draw(performance.now()); });
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastT = 0;
    function loop(t) {
      if (t - lastT > 80) { draw(t); lastT = t; }
      requestAnimationFrame(loop);
    }
    if (still) draw(0); else requestAnimationFrame(loop);
  })();

  /* ---------- boot ---------- */
  renderTracks();
  renderLegend();
  setInst(S.inst);
  loadSong(location.hash.slice(1) || ALBUM.songs[0].id);
})();
