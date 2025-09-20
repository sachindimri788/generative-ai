import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  CommaSeparatedListOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import { chatModel } from "./config";

// Example 1: Create a prompt template from a string
// and use it to generate a prompt with variables
async function fromTemplate() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description for the following product: {product_name}"
  );
  const chain = await prompt
    .pipe(chatModel)
    .invoke({ product_name: "bicycle" });
  console.log(chain.content);
}

// Example 2: Create a prompt template from messages
// and use it to generate a prompt with variables
async function fromMessages() {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Write a short description for a product"],
    ["human", "The product is a {product_name}"],
  ]);
  const chain = await prompt.pipe(chatModel).invoke({
    product_name: "bicycle",
  });
  console.log(chain.content);
}

// Example 3: Using an output parser to transform the output
// Here we use a StringOutputParser to ensure the output is a string
async function stringParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description for the following product: {product_name}"
  );

  const parser = new StringOutputParser();
  const chain = await prompt
    .pipe(chatModel)
    .pipe(parser)
    .invoke({ product_name: "bicycle" });
  console.log(chain);
}

// Example 4: Using a CommaSeparatedListOutputParser to get a list output
async function commaSeperatedParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description for the following product: {product_name}"
  );

  const parser = new CommaSeparatedListOutputParser();
  const chain = await prompt
    .pipe(chatModel)
    .pipe(parser)
    .invoke({ product_name: "bicycle" });
  console.log(chain);
}

// Example 5: Using a StructuredOutputParser to get a structured output
async function structuredParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Extract the following fields from the following phrse. Formatting instructins: {format_instructions} Phrase: {phrase}"
  );

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    name: "The name of the product",
    color: "The color of the product",
    price: "The price of the product in USD",
  });

  const formatInstructions = outputParser.getFormatInstructions();
  const chain = await prompt.pipe(chatModel).pipe(outputParser).invoke({
    phrase: "A blue bicycle with a price of $100",
    format_instructions: formatInstructions,
  });
  console.log(chain);
}

// fromTemplate();
// fromMessages();
// stringParser();
// commaSeperatedParser();
structuredParser();
