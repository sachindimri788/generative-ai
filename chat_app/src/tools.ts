import OpenAI from "openai";
import { openai } from "./config";

function getTimeOfDay() {
  return new Date().toLocaleTimeString();
}

function getOrderStatus(orderId: string) {
  // Mock order status
  const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  return `Order ${orderId} is currently: ${status}`;
}

async function callOpenAIChatCompletion(options: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  tools?: any[];
  tool_choice?: any;
  max_tokens?: number;
}) {
  const payload: any = {
    model: options.model || "openai/gpt-4o",
    messages: options.messages,
    temperature: options.temperature ?? 0.0,
    tools: options.tools,
    max_tokens: options.max_tokens ?? 500,
  };
  if (options.tool_choice !== undefined) {
    payload.tool_choice = options.tool_choice;
  }
  return await openai.chat.completions.create(payload);
}

async function callOpenAIWithTools() {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the time of day and order status",
    },
    {
      role: "user",
      // content: "What time is it?", for testing getTimeOfDay
      content: "What is the status of my order 12345?", // for testing getOrderStatus
    },
  ];

  // configure chat tools (first openAI call)
  const response = await callOpenAIChatCompletion({
    model: "openai/gpt-4o",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfDay",
          description: "Get the current time of day",
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the status of an order by its ID",
          parameters: {
            type: "object",
            properties: {
              orderId: { type: "string", description: "The ID of the order" },
            },
            required: ["orderId"],
          },
        },
      },
    ],
    tool_choice: "auto", // let the model decide if and which tool to use
    max_tokens: 500,
  });

  // decide which tool to call (if any)
  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
  if (willInvokeFunction) {
    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (
      toolCall &&
      toolCall.type === "function" &&
      toolCall.function?.name === "getTimeOfDay"
    ) {
      const toolResponse = getTimeOfDay();
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResponse,
      });
    }

    if (
      toolCall &&
      toolCall.type === "function" &&
      toolCall.function?.name === "getOrderStatus"
    ) {
      const rawArgument = toolCall.function.arguments;
      const parsedArgument = JSON.parse(rawArgument || "{}");
      const toolResponse = getOrderStatus(parsedArgument.orderId);
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResponse,
      });
    }
  }

  const secondResponse = await callOpenAIChatCompletion({
    model: "openai/gpt-4o",
    messages: context,
    max_tokens: 500,
  });

  console.log("Response:", secondResponse.choices[0].message.content);
}

callOpenAIWithTools();
