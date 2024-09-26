import { LanguageModel, streamText } from "ai";
import { Message } from "./util";
export async function convertJson(
  languageModel: LanguageModel,
  maxTokens: number,
  temperature: number,
  promptMessages: Message[]
) {
  if (promptMessages.length === 2) {
    return await streamText({
      model: languageModel,
      maxTokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: promptMessages[0].content,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
        {
          role: "user",
          content: [{ type: "text", text: promptMessages[1].content }],
        },
      ],
    });
  } else {
    return await streamText({
      model: languageModel,
      maxTokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: promptMessages[0].content,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
        {
          role: "user",
          content: [{ type: "text", text: promptMessages[1].content }],
        },
        { role: "assistant", content: promptMessages[2].content },
        { role: "user", content: promptMessages[3].content },
      ],
    });
  }
}
