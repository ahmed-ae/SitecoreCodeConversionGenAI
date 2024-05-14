import { NextResponse } from "next/server";
import { generatePromptMessages, Message } from "@/lib/util";
1;
import Anthropic from "@anthropic-ai/sdk";
import {
  GenerateContentRequest,
  GoogleGenerativeAI,
  RequestOptions,
} from "@google/generative-ai";

import OpenAI from "openai";
import {
  OpenAIStream,
  StreamingTextResponse,
  AnthropicStream,
  GoogleGenerativeAIStream,
  HuggingFaceStream,
} from "ai";
import { HfInference } from "@huggingface/inference";
// Create an Anthropic API client (that's edge friendly)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});
import { experimental_buildOpenAssistantPrompt } from "ai/prompts";
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});
const geminiAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
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
    } else if (model === "gpt4o") {
      selectedModel = process.env.GPT_4_O_MODEL_ID!;
    } else if (model === "gemini") {
      selectedModel = process.env.GEMINI_MODEL_ID!;
    } else if (model === "CodeLlama") {
      selectedModel = process.env.HuggingFace_MODEL_ID!;
    }
    const promtMessages = generatePromptMessages(language, sourceCode);
    console.log("Generating Code using " + selectedModel);

    if (selectedModel === undefined || selectedModel === "") {
      return NextResponse.json(
        { error: "Model selected not found" },
        { status: 500 }
      );
    }
    if (
      sourceCode === "" ||
      sourceCode ===
        "<!--paste your source code that you want to convert here -->"
    ) {
      return NextResponse.json(
        { error: "Please fill in source code section you want to convert." },
        { status: 500 }
      );
    }

    if (model == "gpt4" || model == "gpt4o") {
      console.log(JSON.stringify(promtMessages));
      // Ask OpenAI for a streaming chat completion given the prompt
      const response = await openai.chat.completions.create({
        stream: true,
        model: selectedModel.valueOf(),
        messages: [
          { role: "user", content: promtMessages[0].content },
          { role: "system", content: promtMessages[1].content },
        ],
        temperature: 0.6,
        max_tokens: 4024,
      });

      // Convert the response into a friendly text-stream
      const stream = OpenAIStream(response);
      // Respond with the stream
      return new StreamingTextResponse(stream);
    } else if (
      model == "claude3opus" ||
      model == "claude3sonnet" ||
      model == "claude3haiku"
    ) {
      console.log(JSON.stringify(promtMessages));
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
        temperature: 0.6,
        max_tokens: 4024,
      });
      // Convert the response into a friendly text-stream
      const stream = AnthropicStream(response);

      // Respond with the stream
      return new StreamingTextResponse(stream);
    } else if (model == "gemini") {
      const generationConfig = {
        maxOutputTokens: 4024,
        temperature: 0.6,
      };
      const geminiMessages: GenerateContentRequest = {
        contents: promtMessages
          .filter(
            (message) => message.role === "user" || message.role === "assistant"
          )
          .map((message) => ({
            role: message.role === "user" ? "user" : "model",
            parts: [{ text: message.content }],
          })),
      };
      console.log(JSON.stringify(geminiMessages));
      const options: RequestOptions = { apiVersion: "v1beta" };
      const geminiStream = await geminiAI
        .getGenerativeModel(
          {
            model: selectedModel.valueOf(),
            generationConfig,
          },
          options
        )
        .generateContentStream(geminiMessages);

      // Convert the response into a friendly text-stream
      const stream = GoogleGenerativeAIStream(geminiStream);

      // Respond with the stream
      return new StreamingTextResponse(stream);
    } else if (model == "CodeLlama") {
      const response = Hf.textGenerationStream({
        model: selectedModel.valueOf(),
        //inputs: `<|prompter|>${prompt}<|endoftext|><|assistant|>`,
        inputs: promtMessages[0].content,
        parameters: {
          max_new_tokens: 4000,
          // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
          typical_p: 0.2,
          repetition_penalty: 1,
          truncate: 1000,
          return_full_text: false,
        },
      });

      // Convert the response into a friendly text-stream
      const stream = HuggingFaceStream(response);

      // Respond with the stream
      return new StreamingTextResponse(stream);
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
