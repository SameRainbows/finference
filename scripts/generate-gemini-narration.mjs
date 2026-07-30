import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Set GEMINI_API_KEY in the process environment.");
}

const inputPath = path.resolve(
  process.argv[2] ?? "submission/narration.txt",
);
const outputPath = path.resolve(
  process.argv[3] ?? "submission/narration-gemini.wav",
);
const narration = (await readFile(inputPath, "utf8")).trim();
const model =
  process.env.GEMINI_TTS_MODEL ?? "gemini-2.5-flash-preview-tts";

const style = [
  "Narrate the following premium SaaS product demo.",
  "Use a polished, confident, intelligent, and trustworthy delivery.",
  "Speak at a purposeful medium-brisk pace, approximately 150 words per minute.",
  "Use natural sentence-level pauses and subtle emphasis on financial outcomes.",
  "Avoid hype, announcer theatrics, and exaggerated emotion.",
  "Pronounce Finference as FIN-fer-ence.",
].join(" ");

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${style}\n\nNarration:\n${narration}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Charon",
            },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(120_000),
  },
);

if (!response.ok) {
  const error = await response.text();
  throw new Error(`Gemini TTS failed (${response.status}): ${error}`);
}

const result = await response.json();
const part = result.candidates?.[0]?.content?.parts?.find(
  (candidate) => candidate.inlineData?.data,
);
if (!part?.inlineData?.data) {
  throw new Error("Gemini returned no audio data.");
}

const pcm = Buffer.from(part.inlineData.data, "base64");
const mimeType = part.inlineData.mimeType ?? "audio/L16;rate=24000";
const sampleRateMatch = mimeType.match(/rate=(\d+)/);
const sampleRate = Number(sampleRateMatch?.[1] ?? 24_000);
const channels = 1;
const bitsPerSample = 16;
const byteRate = (sampleRate * channels * bitsPerSample) / 8;
const blockAlign = (channels * bitsPerSample) / 8;

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(blockAlign, 32);
header.writeUInt16LE(bitsPerSample, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

await writeFile(outputPath, Buffer.concat([header, pcm]));

const durationSeconds = pcm.length / byteRate;
console.log(
  JSON.stringify(
    {
      outputPath,
      model,
      voice: "Charon",
      mimeType,
      bytes: pcm.length,
      durationSeconds: Number(durationSeconds.toFixed(2)),
    },
    null,
    2,
  ),
);
