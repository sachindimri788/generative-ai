import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.8,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  maxTokens: 500,
  // verbose:true   # 👈 Logs chain execution
});

async function main() {
  // Example 1: Single prompt using `invoke`
  // This waits until the full response is ready before printing it
  const response = await model.invoke("Give me 4 good books to read");
  console.log(response.content);
  //
  // Example 2: Multiple prompts at once using `batch`
  // This sends an array of prompts and returns an array of results
  const response2 = await model.batch([
    "hello",
    "What is the meaning of life?",
    "What is 2 + 2?",
  ]);
  console.log(response2);
  //
  // Example 3: Streaming response using `stream`
  //   Instead of waiting for the whole answer, it gives chunks (tokens) in real time
  //   This is useful for chat UIs or real-time apps
  const response3 = await model.stream("Tell me a joke about computers");
  for await (const chunk of response3) {
    // `chunk.text` contains the piece of text being streamed
    process.stdout.write(chunk.text);
  }
}

main();
