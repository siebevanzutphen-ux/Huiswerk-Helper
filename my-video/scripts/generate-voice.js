// Generate voice-over narration using Microsoft Edge neural TTS (free, no API key).
// One MP3 per scene — they'll be played back in sync with on-screen text.

const { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } = require("msedge-tts");
const path = require("path");
const fs = require("fs");

// AIDA-tight copy: punchy, single thought per scene, mirrors on-screen text.
const LINES = [
  { id: "vo1", text: "Stuck on homework?" },                  // Attention
  { id: "vo2", text: "Meet Max." },                           // Interest — short mascot intro
  { id: "vo3", text: "Snap a photo, get every step." },       // Desire — benefit
  { id: "vo4", text: "Learn by playing." },                   // Differentiator
  { id: "vo5", text: "Huiswerk-Helper. Coming soon." },       // Action
];

const VOICE = "en-US-JennyNeural";

(async () => {
  const outDir = path.join(__dirname, "..", "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const prosody = new ProsodyOptions();
  prosody.rate = "0%";    // default rate — keeps things crisp
  prosody.pitch = "-2Hz"; // slightly lower — calmer, warmer
  prosody.volume = "+0%";

  for (const line of LINES) {
    // toFile expects a DIRECTORY — it writes audio.mp3 inside it.
    const tmpDir = path.join(outDir, `_tts_${line.id}`);
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });

    const { audioFilePath } = await tts.toFile(tmpDir, line.text, prosody);

    // Move audio.mp3 → ../vo1.mp3 (etc) so Remotion can reference it cleanly
    const finalPath = path.join(outDir, `${line.id}.mp3`);
    if (fs.existsSync(finalPath)) fs.rmSync(finalPath);
    fs.renameSync(audioFilePath, finalPath);
    fs.rmSync(tmpDir, { recursive: true, force: true });

    const size = fs.statSync(finalPath).size;
    console.log(`Wrote ${line.id}.mp3 (${(size / 1024).toFixed(1)} KB) — "${line.text}"`);
  }

  tts.close();
  console.log("All voice files generated.");
  // Force exit — WebSocket may keep process alive
  setTimeout(() => process.exit(0), 200);
})().catch((err) => {
  console.error("TTS failed:", err);
  process.exit(1);
});
