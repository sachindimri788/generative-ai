import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

function getTimeOfDay() {
  return new Date().toLocaleTimeString();
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
      content: "What time is it?",
    },
  ];

  // configure chat tools (first openAI call)
  const response = await openai.chat.completions.create({
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
    ],
    tool_choice: "auto", // let the model decide if and which tool to use
    max_tokens: 500,
  });

  // decide which tool to call (if any)
  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (
    willInvokeFunction &&
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

  const secondResponse = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: context,
    max_tokens: 500,
  });

  console.log("Second response:", secondResponse.choices[0].message.content);
}

callOpenAIWithTools();
