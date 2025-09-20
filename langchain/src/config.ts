import { ChatOpenAI } from "@langchain/openai";

export const chatModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.8,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  maxTokens: 500,
  // verbose:true   # 👈 Logs chain execution
});

export async function generateEmbeddings(text: string[]): Promise<number[][]> {
  const apiKey = process.env.EMBEDDING_API_KEY;
  const url = process.env.EMBEDDING_BASE_URL as string;
  const model = process.env.EMBEDDING_MODEL;

  if (!apiKey || !url || !model) {
    throw new Error(
      "EMBEDDING_API_KEY, EMBEDDING_BASE_URL or EMBEDDING_MODEL is missing in .env"
    );
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    if (!data?.data) {
      throw new Error("No embedding data returned from API");
    }

    // Return embeddings as array of number arrays
    return data.data.map((item: any) => item.embedding as number[]);
  } catch (error: any) {
    console.error("Error fetching embedding:", error.message || error);
    return [];
  }
}
