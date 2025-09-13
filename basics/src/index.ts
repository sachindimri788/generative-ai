import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const prompt = "What is the meaning of life?";
  const model = "gpt-4o";

  // Calculate and log the token count for the prompt
  const tokenCount = encodePrompt(prompt, model);
  console.log(`Token count for prompt: ${tokenCount}`);

  const completion = await openai.chat.completions.create({
    model: `openai/${model}`, // The AI model to use
    messages: [
      // 'system' sets the behavior or style of the AI
      {
        role: "system",
        content: `You respond like a cool bro, and you respond in JSON format, like this:
                coolnessLevel: 1-10,
                answer: your answer
            `,
      },
      // 'user' is what the human asks or says
      {
        role: "user",
        content: prompt, // The user's question
      },
      // 'assistant' is the AI response role; use it to provide previous AI responses for context
      // {
      //   role: "assistant",
      //   content:
      //     "The meaning of life is to find your own path and make the most of it, bro.",
      // },
    ],
    max_tokens: 500, // Maximum length of AI's response
    temperature: 1, // Higher = more creative/random (min 0, max 2, default 1)
    top_p: 1, // Nucleus sampling: higher value means the model considers more likely or common words when generating text(min 0, max 1, default 1)
    n: 1, // Number of completions to generate
    stream: false, // Stream response in real-time
    stop: null, // Stop when certain words/phrases are seen
    presence_penalty: 0, // Encourage new ideas, less repetition (min -2.0, max 2.0, default 0)
    frequency_penalty: 0, // Discourage repeating same words (min -2.0, max 2.0, default 0)
    logit_bias: {}, // Make some words more/less likely
    // user: "user-123", // Unique ID for the user (optional)
    // tools: [], // Let AI use extra functions/tools
    // tool_choice: 'auto', // Pick which tool the AI should use
    // seed: undefined, // Make output repeatable if set
    // response_format: { type: 'text' }, // Get answer as text or JSON
  });

  console.log(completion.choices[0].message.content);
}

function encodePrompt(prompt: string, model: any): number {
  // Returns the number of tokens in a prompt for a given model
  const encoding = encoding_for_model(model);
  const tokens = encoding.encode(prompt);
  return tokens.length;
}

main();
