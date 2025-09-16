import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

function getAvailableFlights(departure: string, destination: string): string[] {
  console.log("Getting available flights");
  if (departure == "SFO" && destination == "LAX") {
    return ["UA 123", "AA 456"];
  }
  if (departure == "DFW" && destination == "LAX") {
    return ["AA 789"];
  }
  return ["66 FSFG"];
}

function reserveFlight(flightNumber: string): string | "FULLY_BOOKED" {
  if (flightNumber.length == 6) {
    console.log(`Reserving flight ${flightNumber}`);
    return "123456";
  } else {
    return "FULLY_BOOKED";
  }
}

const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that gives information about flights and makes reservations",
  },
];

async function callOpenAIChatCompletion(options: {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  tools?: any[];
  tool_choice?: string;
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

async function callOpenAIWithFunctions() {
  const response = await callOpenAIChatCompletion({
    model: "openai/gpt-4o",
    messages: context,
    temperature: 0.0,
    tools: [
      {
        type: "function",
        function: {
          name: "getAvailableFlights",
          description:
            "returns the available flights for a given departure and destination",
          parameters: {
            type: "object",
            properties: {
              departure: {
                type: "string",
                description: "The departure airport code",
              },
              destination: {
                type: "string",
                description: "The destination airport code",
              },
            },
            required: ["departure", "destination"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "reserveFlight",
          description: "makes a reservation for a given flight number",
          parameters: {
            type: "object",
            properties: {
              flightNumber: {
                type: "string",
                description: "The flight number to reserve",
              },
            },
            required: ["flightNumber"],
          },
        },
      },
    ],
    tool_choice: "auto",
    max_tokens: 500,
  });

  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
  if (willInvokeFunction) {
    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (
      toolCall &&
      toolCall.type === "function" &&
      toolCall.function?.name == "getAvailableFlights"
    ) {
      const rawArgument = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArgument);
      const flights = getAvailableFlights(
        parsedArguments.departure,
        parsedArguments.destination
      );

      const { role, content, tool_calls } = response.choices[0].message;
      const messageToPush: any = { role, content, tool_calls };
      context.push(messageToPush);

      context.push({
        role: "tool",
        content: flights.toString(),
        tool_call_id: toolCall.id,
      });
    }

    if (
      toolCall &&
      toolCall.type === "function" &&
      toolCall.function?.name == "reserveFlight"
    ) {
      const rawArgument = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArgument);
      const reservationNumber = reserveFlight(parsedArguments.flightNumber);

      const { role, content, tool_calls } = response.choices[0].message;
      const messageToPush: any = { role, content, tool_calls };
      context.push(messageToPush);

      context.push({
        role: "tool",
        content: reservationNumber,
        tool_call_id: toolCall.id,
      });
    }
  }

  const secondCallResponse = await callOpenAIChatCompletion({
    model: "openai/gpt-4o",
    messages: context,
    max_tokens: 500,
  });
  console.log(secondCallResponse.choices[0].message);
}

console.log("Hello from flight assistant chatbot!");
process.stdin.addListener("data", async function (input) {
  let userInput = input.toString().trim();
  context.push({
    role: "assistant",
    content: userInput,
  });
  await callOpenAIWithFunctions();
});
