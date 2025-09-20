import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { chatModel, customEmbeddings, generateEmbeddings } from "../config";

const myData = [
  "My name is sachin",
  "I love programming",
  "I live in Dehradun",
  "I am learning Langchain",
  "My favorite food is pizza",
  "I love to play football",
];

const question = "Where do I live?";

async function main() {
  try {
    // Create MemoryVectorStore with custom embeddings
    const vectorStore = new MemoryVectorStore(customEmbeddings);

    // Add documents with precomputed embeddings
    const embeddings = await generateEmbeddings(myData);
    myData.forEach((text, idx) => {
      vectorStore.addVectors(
        [embeddings[idx]],
        [new Document({ pageContent: text })]
      );
    });

    console.log("Vector store populated.");

    // Use retriever to get top-k relevant documents
    const retriever = vectorStore.asRetriever({ k: 2 });
    const relevantDocs = await retriever.invoke(question);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

    console.log("Retrieved context:\n", context);

    // Create chat prompt including context
    const template = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant. Answer the user question using the provided context:\n\n{context}",
      ],
      ["user", "{input}"],
    ]);

    // Generate answer
    const response = await template
      .pipe(chatModel)
      .invoke({ input: question, context });

    console.log("\nAnswer:", response.content);
  } catch (error) {
    console.error("Error in RAG process:", error);
  }
}

main();
