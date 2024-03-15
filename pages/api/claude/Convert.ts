import { NextResponse } from "next/server";
import { generatePromptMessages } from "@/lib/util";
1;
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicStream, StreamingTextResponse } from "ai";

// Create an Anthropic API client (that's edge friendly)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export default async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { language, sourceCode, model } = JSON.parse(prompt);

    let selectedModel = "claude-3-opus-20240229";
    if (model === "claude3opus") {
      selectedModel = "claude-3-opus-20240229";
    } else if (model === "claude3sonnet") {
      selectedModel = "claude-3-sonnet-20240229";
    } else if (model === "claude3haiku") {
      selectedModel = "claude-3-haiku-20240307";
    }
    const promtMessages = generatePromptMessages(language, sourceCode);
    console.log("Generating Code using " + selectedModel);
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
      model: selectedModel,
      stream: true,
      temperature: 0.8,
      max_tokens: 4024,
    });

    // Convert the response into a friendly text-stream
    const stream = AnthropicStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
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
