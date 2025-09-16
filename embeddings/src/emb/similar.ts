import {
  DataWithEmbeddings,
  generateEmbeddings,
  loadJSONData,
} from "./dataHandling";

function dotProduct(a: number[], b: number[]) {
  return a
    .map((value, index) => value * b[index])
    .reduce((sum, curr) => sum + curr, 0);
}

function cosineSimilarity(a: number[], b: number[]) {
  const dotProd = dotProduct(a, b);
  const magnitudeA = Math.sqrt(dotProduct(a, a));
  const magnitudeB = Math.sqrt(dotProduct(b, b));
  return dotProd / (magnitudeA * magnitudeB);
}

async function main() {
  const dataWithEmbeddings = loadJSONData<DataWithEmbeddings[]>(
    "dataWithEmbeddings.json"
  );
  const input = "animal";
  const inputEmbedding = await generateEmbeddings([input]);
  console.log("Input embedding:", inputEmbedding);
  const similarities: { input: string; similarity: number }[] = [];

  for (const entry of dataWithEmbeddings) {
    const similarity = cosineSimilarity(entry.embedding, inputEmbedding[0]);
    similarities.push({ input: entry.input, similarity });
  }
  console.log(`Similarities for input: "${input}"`);
  similarities
    .sort((a, b) => b.similarity - a.similarity)
    .forEach((item) =>
      console.log(`Input: "${item.input}", Similarity: ${item.similarity}`)
    );
}

main();
