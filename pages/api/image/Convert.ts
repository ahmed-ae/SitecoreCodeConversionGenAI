import { NextResponse } from "next/server";
import { generateImage2CodePrompt } from "@/lib/util";
import { createAnthropic } from "@ai-sdk/anthropic";

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, LanguageModel, convertToCoreMessages } from "ai";

const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openAiProvider = createOpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});
export const runtime = "edge";
const temperature = Number(process.env.MODEL_TEMPERATURE);
const max_tokens = Number(process.env.MODEL_MAX_TOKENS);

export default async function POST(req: Request) {
  try {
    const { prompt, image } = await req.json();
    const {
      model,
      customInstructions,
      additionalInstructions,
      messageHistory,
      previouslyGeneratedCode,
    } = JSON.parse(prompt);
    let languageModel: LanguageModel = openAiProvider(
      process.env.CLAUDE_3_SONNET_MODEL_ID!
    );
    const promtMessages = generateImage2CodePrompt(
      customInstructions,
      additionalInstructions,
      messageHistory,
      previouslyGeneratedCode
    );

    //console.log("customInstructions  : ", customInstructions);
    //console.log("additionalInstructions  : ", additionalInstructions);
    //console.log(
    //  "Generating Code using " +
    //    model +
    //    " using temp/max-tokens: " +
    //    temperature +
    //    "/" +
    //    max_tokens
    //);
    let selectedModel: String = "";
    if (model === "claude3opus") {
      selectedModel = process.env.CLAUDE_3_OPUS_MODEL_ID!;
      languageModel = anthropicProvider(process.env.CLAUDE_3_OPUS_MODEL_ID!);
    } else if (model === "claude3sonnet") {
      selectedModel = process.env.CLAUDE_3_SONNET_MODEL_ID!;
      languageModel = anthropicProvider(process.env.CLAUDE_3_SONNET_MODEL_ID!);
    } else if (model === "claude3haiku") {
      selectedModel = process.env.CLAUDE_3_HAIKU_MODEL_ID!;
      languageModel = anthropicProvider(process.env.CLAUDE_3_HAIKU_MODEL_ID!);
    } else if (model === "gpt4") {
      selectedModel = process.env.GPT_4_MODEL_ID!;
      languageModel = openAiProvider(process.env.GPT_4_MODEL_ID!);
    } else if (model === "gpt4o") {
      selectedModel = process.env.GPT_4_O_MODEL_ID!;
      languageModel = openAiProvider(process.env.GPT_4_O_MODEL_ID!);
    }

    console.log("Generating Code using " + selectedModel);

    if (selectedModel === undefined || selectedModel === "") {
      return NextResponse.json(
        { error: "Model selected not found" },
        { status: 500 }
      );
    }

    console.log("system message ----------------", promtMessages[0].content);
    console.log("user message ----------------", promtMessages[1].content);

    if (promtMessages.length === 2) {
      const result = await streamText({
        model: languageModel,
        maxTokens: max_tokens,
        temperature: temperature,
        system: promtMessages[0].content,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promtMessages[1].content,
              },
              {
                type: "image",
                image: image,
              },
            ],
          },
        ],
      });

      return result.toDataStreamResponse();
    } else {
      console.log(
        "assistant message ----------------",
        promtMessages[2].content
      );
      console.log("user message 2 ----------------", promtMessages[3].content);
      const result = await streamText({
        model: languageModel,
        maxTokens: max_tokens,
        temperature: temperature,
        system: promtMessages[0].content,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promtMessages[1].content,
              },
              {
                type: "image",
                image: image,
              },
            ],
          },
          {
            role: "assistant",
            content: promtMessages[2].content,
          },
          {
            role: "user",
            content: promtMessages[3].content,
          },
        ],
      });

      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.error(error);

    return { type: "unknown-error", error };
  }
}
