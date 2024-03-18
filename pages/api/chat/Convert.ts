import { NextResponse } from "next/server";
import { generatePromptMessages } from "@/lib/util";
1;
import Anthropic from "@anthropic-ai/sdk";
import {
  AnthropicStream,
  StreamingTextResponse as AnthropicStreamingTextResponse,
} from "ai";
import OpenAI from "openai";
import {
  OpenAIStream,
  StreamingTextResponse as OpenAIStreamingTextResponse,
} from "ai";

// Create an Anthropic API client (that's edge friendly)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export default async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { language, sourceCode, model } = JSON.parse(prompt);
    console.log("Generating Code using " + model);
    let selectedModel: String = "";
    if (model === "claude3opus") {
      selectedModel = process.env.CLAUDE_3_OPUS_MODEL_ID!;
    } else if (model === "claude3sonnet") {
      selectedModel = process.env.CLAUDE_3_SONNET_MODEL_ID!;
    } else if (model === "claude3haiku") {
      selectedModel = process.env.CLAUDE_3_HAIKU_MODEL_ID!;
    } else if (model === "gpt4") {
      selectedModel = process.env.GPT_4_MODEL_ID!;
    }
    const promtMessages = generatePromptMessages(language, sourceCode);
    console.log("Generating Code using " + selectedModel);

    if (selectedModel === undefined || selectedModel === "") {
      return NextResponse.json(
        { error: "Model selected not found" },
        { status: 500 }
      );
    }

    if (model == "gpt4") {
      // Ask OpenAI for a streaming chat completion given the prompt
      const response = await openai.chat.completions.create({
        stream: true,
        model: selectedModel.valueOf(),
        messages: [
          { role: "user", content: promtMessages[0].content },
          { role: "system", content: promtMessages[1].content },
        ],
        temperature: 0.8,
        max_tokens: 4024,
      });

      // Convert the response into a friendly text-stream
      const stream = OpenAIStream(response);
      // Respond with the stream
      return new OpenAIStreamingTextResponse(stream);
    } else {
      const response = await anthropic.messages.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promtMessages[0].content,
              },
            ],
          },
        ],
        system: promtMessages[1].content,
        model: selectedModel.valueOf(),
        stream: true,
        temperature: 0.8,
        max_tokens: 4024,
      });
      // Convert the response into a friendly text-stream
      const stream = AnthropicStream(response);

      // Respond with the stream
      return new AnthropicStreamingTextResponse(stream);
    }
  } catch (error) {
    // Check if the error is an APIError
    if (error instanceof Anthropic.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}
