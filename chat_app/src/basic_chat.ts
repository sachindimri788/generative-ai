import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";
import { openai } from "./config";

const encoder = encoding_for_model("gpt-4o-mini");

// Limit the total tokens in the conversation context
const MAX_TOKENS = 400;

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot that answers in a friendly manner.",
  },
];

async function createChatCompletion() {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: context,
      max_tokens: 500,
    });
    const respnseMessage = response.choices[0].message;
    context.push({ role: "assistant", content: respnseMessage.content });

    // All messages, including the previous conversation stored in `context` and the new user input,
    // are treated as a single prompt when sent to the model.
    // So `context` is part of the prompt, and we must keep the total tokens under the limit.
    if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
      deleteOlderMessages();
    }
    console.log(
      "AI:",
      respnseMessage.content,
      "\n",
      response.usage?.total_tokens
    );
  } catch (error) {
    console.error("Error communicating with AI:", error);
  }
}

// Show prompt for first user input
process.stdout.write(`Max Context: ${MAX_TOKENS} \n You: `);

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({ role: "user", content: userInput });
  await createChatCompletion();
  process.stdout.write("You: ");
});

function deleteOlderMessages() {
  let contextLength = getContextLength();
  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];
      if (message.role != "system") {
        context.splice(i, 1);
        contextLength = getContextLength();
        console.log("New context length: " + contextLength);
        break;
      }
    }
  }
}

function getContextLength() {
  let length = 0;
  context.forEach((message) => {
    if (typeof message.content == "string") {
      length += encoder.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach((messageContent) => {
        if (messageContent.type == "text") {
          length += encoder.encode(messageContent.text).length;
        }
      });
    }
  });
  return length;
}
