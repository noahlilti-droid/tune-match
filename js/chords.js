/* Chord engine: parsing, transposition, guitar voicings with fingering, piano voicings.
   Fingers (anatomical, shared by guitar and piano):
   T = thumb, 1 = index, 2 = middle, 3 = ring, 4 = pinky.
   Guitar uses 1–4. Piano uses classical numbers 1–5 (1 = thumb … 5 = pinky). */
(function (global) {
  'use strict';

  const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const MIXED = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const FRENCH = { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

  // Chord qualities → intervals (semitones above root). Order matters: longest suffix first.
  const QUALITIES = [
    ['mMaj7', [0, 3, 7, 11]], ['m(maj7)', [0, 3, 7, 11]], ['maj9', [0, 4, 7, 11, 14]],
    ['maj7', [0, 4, 7, 11]], ['m7b5', [0, 3, 6, 10]], ['ø7', [0, 3, 6, 10]], ['ø', [0, 3, 6, 10]],
    ['7#9', [0, 4, 7, 10, 15]], ['7sus4', [0, 5, 7, 10]], ['dim7', [0, 3, 6, 9]],
    ['add9', [0, 4, 7, 14]], ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]], ['dim', [0, 3, 6]],
    ['aug', [0, 4, 8]], ['m9', [0, 3, 7, 10, 14]], ['m7', [0, 3, 7, 10]], ['m6', [0, 3, 7, 9]],
    ['+', [0, 4, 8]], ['9', [0, 4, 7, 10, 14]], ['7', [0, 4, 7, 10]], ['6', [0, 4, 7, 9]],
    ['m', [0, 3, 7]], ['', [0, 4, 7]]
  ];

  const QUALITY_FR = {
    '': 'majeur', m: 'mineur', '7': 'septième', m7: 'mineur 7', maj7: 'majeur 7', mMaj7: 'mineur maj 7',
    'm(maj7)': 'mineur maj 7', dim: 'diminué', dim7: 'diminué 7', '+': 'augmenté', aug: 'augmenté',
    '9': 'neuvième', m9: 'mineur 9', maj9: 'majeur 9', m7b5: 'demi-diminué', 'ø': 'demi-diminué',
    'ø7': 'demi-diminué', '7#9': '7 dièse 9', '6': 'sixte', m6: 'mineur 6', sus4: 'sus 4', sus2: 'sus 2',
    '7sus4': '7 sus 4', add9: 'add 9'
  };

  function pcOf(name) {
    const base = NOTE_PC[name[0]];
    let acc = 0;
    for (const ch of name.slice(1)) acc += ch === '#' ? 1 : ch === 'b' ? -1 : 0;
    return (base + acc + 12) % 12;
  }

  const cache = new Map();
  function parse(name) {
    if (cache.has(name)) return cache.get(name);
    const m = /^([A-G])([#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(name.trim());
    if (!m) return null;
    const rootName = m[1] + m[2];
    let rest = m[3];
    let quality = null;
    for (const [suf, iv] of QUALITIES) {
      if (rest === suf) { quality = { suf, iv }; break; }
    }
    if (!quality) quality = { suf: rest, iv: [0, 4, 7] }; // unknown → major triad
    const root = pcOf(rootName);
    const bass = m[4] ? pcOf(m[4]) : root;
    const res = {
      name, rootName, root, bass, bassName: m[4] || rootName, suffix: quality.suf,
      intervals: quality.iv, pcs: [...new Set(quality.iv.map(i => (root + i) % 12))]
    };
    if (!res.pcs.includes(bass)) res.pcs.push(bass);
    cache.set(name, res);
    return res;
  }

  function spell(pc, preferSharp) {
    return (preferSharp ? SHARP : MIXED)[((pc % 12) + 12) % 12];
  }

  function transpose(name, semis) {
    if (!semis) return name;
    const c = parse(name);
    if (!c) return name;
    const sharp = c.rootName.includes('#');
    const r = spell(c.root + semis, sharp);
    const b = c.bassName !== c.rootName ? '/' + spell(c.bass + semis, c.bassName.includes('#')) : '';
    return r + c.suffix + b;
  }

  function describe(name) {
    const c = parse(name);
    if (!c) return name;
    const fr = n => FRENCH[n[0]] + n.slice(1).replace('#', '♯').replace('b', '♭');
    let d = fr(c.rootName) + ' ' + (QUALITY_FR[c.suffix] || c.suffix);
    if (c.bassName !== c.rootName) d += ', basse ' + fr(c.bassName);
    return d;
  }

  function noteNames(name) {
    const c = parse(name);
    if (!c) return [];
    const sharp = c.rootName.includes('#') || ['E', 'B', 'A', 'D'].includes(c.rootName);
    return c.intervals.map(i => spell(c.root + i, sharp));
  }

  /* ---------- Guitar ---------- */
  // Strings low → high: E A D G B e. frets: -1 mute, 0 open. fingers: 0 none, 1–4.
  const TUNING = [40, 45, 50, 55, 59, 64];

  // Hand-checked standard voicings (the shapes guitarists actually learn).
  const SHAPES = {
    'A': [[-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]],
    'A7': [[-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]],
    'Am': [[-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]],
    'Am7': [[-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]],
    'AmMaj7': [[-1, 0, 2, 1, 1, 0], [0, 0, 3, 1, 2, 0]],
    'Adim': [[-1, 0, 1, 2, 1, -1], [0, 0, 1, 3, 2, 0]],
    'B': [[-1, 2, 4, 4, 4, 2], [0, 1, 2, 3, 4, 1], 2],
    'B7': [[-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]],
    'Bm': [[-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1], 2],
    'Bm7': [[-1, 2, 4, 2, 3, 2], [0, 1, 3, 1, 2, 1], 2],
    'Bm7b5': [[-1, 2, 3, 2, 3, -1], [0, 1, 3, 2, 4, 0]],
    'Bb': [[-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], 1],
    'Bb7': [[-1, 1, 3, 1, 3, 1], [0, 1, 3, 1, 4, 1], 1],
    'C': [[-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]],
    'C7': [[-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]],
    'Cmaj7': [[-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]],
    'C#m': [[-1, 4, 6, 6, 5, 4], [0, 1, 3, 4, 2, 1], 4],
    'C#7': [[-1, 4, 6, 4, 6, 4], [0, 1, 3, 1, 4, 1], 4],
    'D': [[-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]],
    'D7': [[-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]],
    'D9': [[-1, 5, 4, 5, 5, 5], [0, 2, 1, 3, 3, 3]],
    'Ddim': [[-1, -1, 0, 1, 3, 1], [0, 0, 0, 1, 3, 2]],
    'Dm': [[-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
    'Dm7': [[-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]],
    'Dm/C': [[-1, 3, 0, 2, 3, 1], [0, 3, 0, 2, 4, 1]],
    'D#m7b5': [[-1, -1, 1, 2, 2, 2], [0, 0, 1, 2, 3, 4]],
    'E': [[0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]],
    'E7': [[0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]],
    'E7#9': [[-1, 7, 6, 7, 8, -1], [0, 2, 1, 3, 4, 0]],
    'E+': [[0, 3, 2, 1, 1, 0], [0, 4, 3, 1, 2, 0]],
    'Em': [[0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]],
    'Eb': [[-1, -1, 1, 3, 4, 3], [0, 0, 1, 2, 4, 3]],
    'F': [[1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1],
    'Fmaj7': [[-1, -1, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]],
    'F#m': [[2, 4, 4, 2, 2, 2], [1, 3, 4, 1, 1, 1], 2],
    'F#7': [[2, 4, 2, 3, 2, 2], [1, 3, 1, 2, 1, 1], 2],
    'G': [[3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]],
    'G7': [[3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]],
    'Gmaj7': [[3, -1, 0, 0, 0, 2], [2, 0, 0, 0, 0, 1]],
    'Gm': [[3, 5, 5, 3, 3, 3], [1, 3, 4, 1, 1, 1], 3],
    'G#7': [[4, 6, 4, 5, 4, 4], [1, 3, 1, 2, 1, 1], 4]
  };
  const ALIAS = { 'Am(maj7)': 'AmMaj7', 'Bø': 'Bm7b5', 'Eaug': 'E+', 'D#ø': 'D#m7b5' };

  // Turn shape [frets, fingers, barreFret?] into a full voicing object.
  function fromShape(s) {
    const [frets, fingers, barreFret] = s;
    let barre = null;
    if (barreFret) {
      const idx = frets.map((f, i) => (f === barreFret && fingers[i] === 1 ? i : -1)).filter(i => i >= 0);
      if (idx.length > 1) barre = { fret: barreFret, from: idx[0], to: idx[idx.length - 1] };
    }
    return { frets, fingers, barre };
  }

  // Assign fingers to a fret pattern; returns null when not playable with 4 fingers.
  function assignFingers(frets) {
    const fretted = frets.map((f, i) => ({ f, i })).filter(x => x.f > 0);
    const fingers = frets.map(() => 0);
    if (!fretted.length) return { fingers, barre: null };
    const min = Math.min(...fretted.map(x => x.f));
    let barre = null;
    let pool = fretted;
    let next = 1;
    const atMin = fretted.filter(x => x.f === min);
    if (fretted.length > 4 || (atMin.length >= 3)) {
      const from = atMin[0].i;
      const to = Math.max(...atMin.map(x => x.i));
      // a barre must not cross open strings
      if (frets.slice(from, to + 1).some(f => f === 0)) return null;
      barre = { fret: min, from, to };
      atMin.forEach(x => { fingers[x.i] = 1; });
      pool = fretted.filter(x => x.f !== min);
      next = 2;
    }
    pool.sort((a, b) => a.f - b.f || a.i - b.i);
    for (const x of pool) {
      // leave room for the stretch: one finger per fret above the first
      const want = barre ? 1 + (x.f - min) : next;
      const fing = Math.max(next, Math.min(want, 4));
      if (fing > 4) return null;
      fingers[x.i] = fing;
      next = fing + 1;
    }
    if (next - 1 > 4) return null;
    return { fingers, barre };
  }

  // Search a playable voicing when no hand-checked shape exists.
  function searchVoicing(c) {
    let best = null;
    const needed = new Set(c.pcs);
    const fifth = (c.root + 7) % 12;
    for (let base = 0; base <= 10; base++) {
      const options = TUNING.map(open => {
        const o = [-1];
        if (base === 0 && needed.has(open % 12)) o.push(0);
        for (let f = Math.max(1, base); f <= base + 3; f++) if (needed.has((open + f) % 12)) o.push(f);
        return o;
      });
      const cur = [];
      const walk = s => {
        if (s === 6) { evaluate(cur.slice(), base); return; }
        for (const f of options[s]) { cur[s] = f; walk(s + 1); }
      };
      walk(0);
    }
    function evaluate(frets, base) {
      const sounding = frets.map((f, i) => (f >= 0 ? i : -1)).filter(i => i >= 0);
      if (sounding.length < 4) return;
      // only mutes on the outside (no muted string in the middle)
      const first = sounding[0], last = sounding[sounding.length - 1];
      if (last - first + 1 !== sounding.length) return;
      if (first > 2) return;
      const bassPc = (TUNING[first] + frets[first]) % 12;
      if (bassPc !== c.bass) return;
      const got = new Set(sounding.map(i => (TUNING[i] + frets[i]) % 12));
      let missing = 0;
      for (const pc of needed) if (!got.has(pc)) missing += pc === fifth ? 1 : 10;
      if (missing >= 10) return;
      const fr = frets.filter(f => f > 0);
      const span = fr.length ? Math.max(...fr) - Math.min(...fr) : 0;
      if (span > 3) return;
      const fing = assignFingers(frets);
      if (!fing) return;
      const score = missing * 4 + base * 1.2 + span + (6 - sounding.length) * 1.5 +
        (fing.barre ? 2 : 0) + fr.length * 0.3 + (last < 5 ? 1 : 0);
      if (!best || score < best.score) best = { score, frets, fingers: fing.fingers, barre: fing.barre };
    }
    return best;
  }

  const gCache = new Map();
  function guitar(name) {
    if (gCache.has(name)) return gCache.get(name);
    const key = ALIAS[name] || name;
    let v = null;
    if (SHAPES[key]) v = fromShape(SHAPES[key]);
    else {
      const c = parse(name);
      if (c) v = searchVoicing(c);
      if (!v && c && c.bass !== c.root) v = guitar(name.split('/')[0]); // drop slash bass
    }
    gCache.set(name, v);
    return v;
  }

  /* ---------- Piano ---------- */
  // Right hand, root position, within C3–E5. Left hand plays the bass note an octave below.
  function piano(name) {
    const c = parse(name);
    if (!c) return null;
    const rootMidi = 48 + c.root; // C3..B3
    const notes = c.intervals.map(i => rootMidi + i);
    const n = notes.length;
    const fingering = n === 3 ? [1, 3, 5] : n === 4 ? [1, 2, 3, 5] : [1, 2, 3, 4, 5];
    const bass = 36 + c.bass; // C2..B2
    return { rh: notes.map((m, k) => ({ midi: m, finger: fingering[k] })), lh: { midi: bass, finger: 5 } };
  }

  function midiName(m) { return SHARP[m % 12] + (Math.floor(m / 12) - 1); }

  global.Chords = { parse, transpose, describe, noteNames, guitar, piano, midiName, pcOf, spell, TUNING };
})(window);
