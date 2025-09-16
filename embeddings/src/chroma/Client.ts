import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });

async function main() {
  // Delete old collection if exists
  try {
    await client.deleteCollection({ name: "test_collections" });
  } catch {}

  // Create collection with default embedder
  const collection = await client.createCollection({
    name: "test_collections",
    embeddingFunction: new DefaultEmbeddingFunction(),
  });

  await collection.add({
    ids: ["id1"],
    documents: ["This is a test document."],
  });
  // Retrieve all documents
  const allDocs = await collection.get({
    limit: 10, // number of documents to retrieve
    include: ["documents", "embeddings"],
  });
  console.log("Documents in collection:", allDocs);
  console.log("Document added successfully!");
}

main().catch(console.error);
