import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { generatePromptMessages } from "@/lib/util";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export default async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log(prompt);
    const { language, sourceCode } = JSON.parse(prompt);

    const promtMessages = generatePromptMessages(language, sourceCode);

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
      stream: true,
      model: "gpt-4-turbo-preview",
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
    return new StreamingTextResponse(stream);
  } catch (error) {
    // Check if the error is an APIError
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}
