import { LanguageModel, streamText } from "ai";

export async function convertJson(
  languageModel: LanguageModel,
  maxTokens: number,
  temperature: number
) {
  // TODO: Implement JSON conversion logic
  return await streamText({
    model: languageModel,
    maxTokens: maxTokens,
    temperature: temperature,
    messages: [],
  });
}
