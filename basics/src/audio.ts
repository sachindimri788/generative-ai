import OpenAI from "openai";
import { writeFileSync, createReadStream } from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes spoken audio into text in the same language.
 *
 * @async
 * @function createTranscription
 * @returns {Promise<void>} Logs the transcription result to the console.
 *
 * @example
 * // English audio → English text
 */

async function createTranscription() {
  const response = await openai.audio.transcriptions.create({
    file: createReadStream("AudioSample.m4a"),
    model: "whisper-1",
    language: "en",
  });
  console.log(response);
}

/**
 * Translates spoken audio into English text.
 *
 * @async
 * @function translate
 * @returns {Promise<void>} Logs the translated result to the console.
 *
 * @example
 * // French audio → English text
 */
async function translate() {
  const response = await openai.audio.translations.create({
    file: createReadStream("FrenchSample.m4a"),
    model: "whisper-1",
  });
  console.log(response);
}

/**
 * Converts text into speech (text-to-speech) and saves it as an MP3 file.
 *
 * @async
 * @function textToSpeech
 * @returns {Promise<void>} Generates an MP3 file containing spoken audio.
 *
 * @example
 * // Text → MP3 audio
 */
async function textToSpeech() {
  const sampleText =
    "France is a country from Europe. It is located in Western Europe and is known for its rich history, world-famous cuisine, and stunning architecture.";

  const response = await openai.audio.speech.create({
    input: sampleText,
    voice: "alloy",
    model: "tts-1",
    response_format: "mp3",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync("France.mp3", buffer);
}

textToSpeech();
