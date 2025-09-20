import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { chatModel, customEmbeddings } from "../config";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const question = "What are langschain libraries?";

async function main() {
  try {
    // Create Loader
    const loader = new CheerioWebBaseLoader(
      "https://js.langchain.com/docs/getting-started/introduction"
    );
    const docs = await loader.load();

    // split the docs
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const textsplittedDocs = await splitter.splitDocuments(docs);
    console.log("Splitted docs", textsplittedDocs);

    // Create MemoryVectorStore with custom embeddings
    const vectorStore = new MemoryVectorStore(customEmbeddings);
    // Add documents with precomputed embeddings
    await vectorStore.addDocuments(textsplittedDocs);

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
