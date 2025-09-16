import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type DataWithEmbeddings = {
  input: string;
  embedding: number[];
};

export async function generateEmbeddings(text: string[]) {
  const apiKey = process.env.EMBEDDING_API_KEY;
  const url = process.env.EMBEDDING_BASE_URL as string;
  const model = process.env.EMBEDDING_MODEL;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text, // Input text as an array
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error: any) {
    console.error("Error fetching embedding:", error.message || error);
  }
}

export function loadJSONData<T>(fileName: string): T {
  const path = join(__dirname, fileName);
  const rawData = readFileSync(path);
  return JSON.parse(rawData.toString());
}

function saveDataToJsonFile(data: any, fileName: string) {
  const dataString = JSON.stringify(data);
  const dataBuffer = Buffer.from(dataString);
  const path = join(__dirname, fileName);
  writeFileSync(path, dataBuffer);
  console.log(`saved data to ${fileName}`);
}

async function dataHandling() {
  const data = loadJSONData<string[]>("data.json");
  const embeddings = await generateEmbeddings(data);
  const dataWithEmbeddings: DataWithEmbeddings[] = [];
  for (let i = 0; i < data.length; i++) {
    dataWithEmbeddings.push({
      input: data[i],
      embedding: embeddings[i],
    });
  }
  saveDataToJsonFile(dataWithEmbeddings, "dataWithEmbeddings.json");
}

if (require.main === module) {
  dataHandling();
}
