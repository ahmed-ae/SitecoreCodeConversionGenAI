import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openAiProvider = createOpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

export function getLanguageModel(model: string): {
  languageModel: LanguageModel;
  selectedModel: string;
} {
  let languageModel: LanguageModel;
  let selectedModel: string = "";

  switch (model) {
    case "claude3opus":
      selectedModel = process.env.CLAUDE_3_OPUS_MODEL_ID!;
      languageModel = anthropicProvider(selectedModel);
      break;
    case "claude3sonnet":
      selectedModel = process.env.CLAUDE_3_SONNET_MODEL_ID!;
      languageModel = anthropicProvider(selectedModel, { cacheControl: true });
      break;
    case "claude3haiku":
      selectedModel = process.env.CLAUDE_3_HAIKU_MODEL_ID!;
      languageModel = anthropicProvider(selectedModel);
      break;
    case "gpt4":
      selectedModel = process.env.GPT_4_MODEL_ID!;
      languageModel = openAiProvider(selectedModel);
      break;
    case "gpt4o":
      selectedModel = process.env.GPT_4_O_MODEL_ID!;
      languageModel = openAiProvider(selectedModel);
      break;
    default:
      throw new Error("Model selected not found");
  }

  return { languageModel, selectedModel };
}
