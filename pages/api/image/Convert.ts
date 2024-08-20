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
    const { messages, model, customInstructions } = await req.json();
    let languageModel: LanguageModel = openAiProvider(
      process.env.GPT_4_O_MODEL_ID!
    );
    const promtMessages = generateImage2CodePrompt(customInstructions);
    console.log(
      "Generating Code using " +
        model +
        " using temp/max-tokens: " +
        temperature +
        "/" +
        max_tokens
    );
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

    //    console.log(JSON.stringify(promtMessages));
    var coreMessages = convertToCoreMessages(messages);

    coreMessages[0].content = promtMessages[0].content;
    console.log(JSON.stringify(coreMessages[0].content));
    const result = await streamText({
      model: languageModel,
      maxTokens: max_tokens,
      temperature: temperature,
      system: promtMessages[1].content,
      messages: coreMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);

    return { type: "unknown-error", error };
  }
}
