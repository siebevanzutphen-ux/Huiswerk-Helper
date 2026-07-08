// Generate background music + SFX for the Huiswerk-Helper ad.
// Designed to sit UNDER a voice-over: soft, warm, low-passed, no harsh transients.
// Writes WAV files to public/ so Remotion can pick them up via staticFile().

const fs = require("fs");
const path = require("path");

const SR = 44100;

function writeWav(filepath, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filepath, buf);
  console.log(`Wrote ${filepath} (${(n / SR).toFixed(2)}s)`);
}

// 1-pole low-pass — gently filters out harsh highs
function lowPass(samples, cutoffHz) {
  const dt = 1 / SR;
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = dt / (rc + dt);
  let prev = 0;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    prev = prev + alpha * (samples[i] - prev);
    out[i] = prev;
  }
  return out;
}

// Gentle saturation — soft-knee compression
function softClip(samples, drive = 1.0) {
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = Math.tanh(samples[i] * drive) * 0.85;
  }
  return out;
}

// Simple comb-delay reverb-ish wash (3 short delays, each attenuated)
function gentleReverb(samples, wetMix = 0.18) {
  const out = new Float32Array(samples.length);
  const delays = [
    { d: Math.floor(SR * 0.037), g: 0.55 },
    { d: Math.floor(SR * 0.059), g: 0.45 },
    { d: Math.floor(SR * 0.083), g: 0.35 },
  ];
  for (let i = 0; i < samples.length; i++) {
    let wet = 0;
    for (const { d, g } of delays) {
      if (i - d >= 0) wet += samples[i - d] * g;
    }
    out[i] = samples[i] * (1 - wetMix) + wet * wetMix;
  }
  return out;
}

// =============== Background music ===============
// 15 seconds total. Soft pad + gentle arpeggio + sustained bass.
// NO percussion thump, NO bell hits — must sit politely under speech.
// Progression: C - G - Am - F (repeat) → resolves on C
function makeBGM() {
  const dur = 15;
  const n = SR * dur;
  const out = new Float32Array(n);

  const chords = [
    { bass: 130.81, voicing: [261.63, 329.63, 392.0] }, // C
    { bass: 98.0,   voicing: [196.0, 246.94, 392.0] },  // G
    { bass: 110.0,  voicing: [220.0, 261.63, 329.63] }, // Am
    { bass: 87.31,  voicing: [174.61, 220.0, 261.63] }, // F
    { bass: 130.81, voicing: [261.63, 329.63, 392.0] }, // C return
  ];

  const chordDur = 3.0; // seconds per chord

  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let cIdx = Math.floor(t / chordDur);
    if (cIdx >= chords.length) cIdx = chords.length - 1;
    const chord = chords[cIdx];

    // Slow chord-crossfade — never an abrupt change
    const local = (t / chordDur) - cIdx;
    const fadeNext = local > 0.9 && cIdx < chords.length - 1 ? (local - 0.9) * 10 : 0;
    const nextChord = chords[Math.min(chords.length - 1, cIdx + 1)];

    let sig = 0;

    // Sustained pad — soft sines, slight chorus detune for warmth
    for (const f of chord.voicing) {
      sig += Math.sin(2 * Math.PI * f * t) * 0.025 * (1 - fadeNext);
      sig += Math.sin(2 * Math.PI * f * 1.006 * t) * 0.015 * (1 - fadeNext);
    }
    for (const f of nextChord.voicing) {
      sig += Math.sin(2 * Math.PI * f * t) * 0.025 * fadeNext;
    }

    // Sustained sub-bass — no thump
    sig += Math.sin(2 * Math.PI * chord.bass * t) * 0.08;
    sig += Math.sin(2 * Math.PI * chord.bass * 2 * t) * 0.025; // soft octave

    // Soft pluck arpeggio — slow, generous envelope
    const arpRate = 1.5; // notes/sec — gentle, not busy
    const arpStep = Math.floor(t * arpRate);
    const arpFreq = chord.voicing[arpStep % chord.voicing.length] * 2;
    const arpT = (t * arpRate) % 1;
    // Slow attack + slow release — no click
    const atk = Math.min(1, arpT * 8);
    const rel = Math.exp(-arpT * 1.2);
    const arpEnv = atk * rel;
    sig += Math.sin(2 * Math.PI * arpFreq * t) * 0.04 * arpEnv;

    // Very subtle high sparkle (4th octave)
    const sparkleFreq = chord.voicing[1] * 4;
    sig += Math.sin(2 * Math.PI * sparkleFreq * t) * 0.008 * arpEnv;

    // Long fade in/out
    const fadeIn = Math.min(1, t * 0.8);
    const fadeOut = Math.min(1, (dur - t) * 0.8);
    sig *= fadeIn * fadeOut;

    out[i] = sig;
  }

  // Low-pass for warmth — NO reverb (comb delays were causing a "blowing" phasing artefact)
  let processed = lowPass(out, 2400);
  processed = lowPass(processed, 2400); // second pass for steeper roll-off
  processed = softClip(processed, 0.9);
  // Final volume — sits low under voice
  for (let i = 0; i < processed.length; i++) processed[i] *= 0.4;
  return processed;
}

// =============== Bloom (soft musical transition — replaces whoosh) ===============
// Brief pad swell instead of noise — no "blowing" effect.
function makeBloom() {
  const dur = 0.7;
  const n = SR * dur;
  const out = new Float32Array(n);
  const freqs = [523.25, 659.25, 783.99]; // C-E-G major triad
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let sig = 0;
    for (const f of freqs) {
      sig += Math.sin(2 * Math.PI * f * t) * 0.08;
    }
    // Bell-curve swell
    const env = Math.exp(-Math.pow((t - 0.3) * 3, 2));
    out[i] = sig * env;
  }
  return softClip(lowPass(out, 2500), 0.9);
}

// =============== Ding (soft chime, no harsh attack) ===============
function makeDing() {
  const dur = 1.5;
  const n = SR * dur;
  const out = new Float32Array(n);
  const notes = [659.25, 783.99, 987.77]; // E5, G5, B5 — major triad
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let sig = 0;
    for (const f of notes) {
      sig += Math.sin(2 * Math.PI * f * t) * 0.12;
      sig += Math.sin(2 * Math.PI * f * 2 * t) * 0.02;
    }
    const atk = Math.min(1, t * 25);
    const rel = Math.exp(-t * 2.4);
    out[i] = sig * atk * rel * 0.6;
  }
  return softClip(lowPass(out, 3500), 0.9);
}

// =============== Pop (tiny soft tick) ===============
function makePop() {
  const dur = 0.18;
  const n = SR * dur;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 600 - 350 * (t / dur);
    const sig = Math.sin(2 * Math.PI * freq * t);
    // Smooth envelope — short attack, smooth decay
    const atk = Math.min(1, t * 60);
    const rel = Math.exp(-t * 18);
    out[i] = sig * atk * rel * 0.2;
  }
  return lowPass(out, 2500);
}

// =============== Shimmer (gentle ascending arpeggio for logo) ===============
function makeShimmer() {
  const dur = 1.2;
  const n = SR * dur;
  const out = new Float32Array(n);
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const step = Math.min(notes.length - 1, Math.floor(t * notes.length / dur));
    const freq = notes[step];
    const localT = t - step * (dur / notes.length);
    const atk = Math.min(1, localT * 15);
    const rel = Math.exp(-localT * 5);
    out[i] = Math.sin(2 * Math.PI * freq * t) * atk * rel * 0.18;
  }
  return softClip(lowPass(out, 4000), 0.9);
}

const outDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

writeWav(path.join(outDir, "bgm.wav"), makeBGM());
writeWav(path.join(outDir, "bloom.wav"), makeBloom());
writeWav(path.join(outDir, "ding.wav"), makeDing());
writeWav(path.join(outDir, "pop.wav"), makePop());
writeWav(path.join(outDir, "shimmer.wav"), makeShimmer());

// Remove old whoosh if present — we don't use it anymore
const oldWhoosh = path.join(outDir, "whoosh.wav");
if (fs.existsSync(oldWhoosh)) {
  fs.rmSync(oldWhoosh);
  console.log("Removed old whoosh.wav");
}
