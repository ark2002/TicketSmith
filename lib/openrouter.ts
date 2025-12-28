import {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterMessage,
  TicketData,
} from "./types";
import { buildSystemPrompt, buildUserPrompt, buildRetryPrompt } from "./promptBuilder";
import { buildSchemaDescription } from "./schemaBuilder";
import { TicketType, Section } from "./types";

// Using free, fast models for better response times
// Alternative free models: "qwen/qwen-2.5-7b-instruct", "mistralai/mistral-7b-instruct-v0.2"
// Check https://openrouter.ai/models for current free models
const PRIMARY_MODEL = "qwen/qwen-2.5-7b-instruct"; // Free, better quality than 3B models
const FALLBACK_MODEL = "meta-llama/llama-3.2-3b-instruct"; // Free, fast fallback
const TEMPERATURE = 0.3; // Slightly higher for more detailed responses
const MAX_RETRIES = 1; // Reduced retries for faster failure
const MAX_TOKENS = 2500; // Increased for more detailed responses
const API_TIMEOUT = 30000; // 30 second timeout for API calls

function extractJsonFromResponse(content: string): string {
  // Remove markdown code blocks if present
  let cleaned = content.trim();

  // Remove ```json or ``` markers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
    cleaned = cleaned.replace(/\n?```$/i, "");
  }

  return cleaned.trim();
}

function parseJsonResponse(content: string): TicketData {
  const cleaned = extractJsonFromResponse(content);

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as TicketData;
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  isRetry: boolean = false
): Promise<TicketData> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter");
    }

    const content = data.choices[0].message.content;
    return parseJsonResponse(content);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error("Request timeout. Please try again.");
      }
    }
    throw error;
  }
}

export async function generateTicketWithOpenRouter(
  input: string,
  ticketType: TicketType,
  sections: Section[]
): Promise<TicketData> {
  const schema = buildSchemaDescription(sections);
  const systemPrompt = buildSystemPrompt();
  let userPrompt = buildUserPrompt(input, ticketType, sections, schema);

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let lastError: Error | null = null;
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  // Try primary model first
  for (const model of models) {
    try {
      const result = await callOpenRouter(model, messages, false);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's a JSON parsing error, try retry with same model
      if (error instanceof Error && error.message.includes("Invalid JSON")) {
        try {
          const retryPrompt = buildRetryPrompt(input, ticketType, sections, schema);
          const retryMessages: OpenRouterMessage[] = [
            { role: "system", content: messages[0].content },
            { role: "user", content: retryPrompt },
          ];
          const result = await callOpenRouter(model, retryMessages, true);
          return result;
        } catch (retryError) {
          // If retry fails, continue to next model
          if (model === PRIMARY_MODEL && models.length > 1) {
            continue; // Try fallback model
          }
        }
      }

      // For timeout or other errors, try next model if available
      if (model === PRIMARY_MODEL && models.length > 1) {
        continue; // Try fallback model
      }
    }
  }

  // If all attempts failed, throw the last error
  throw lastError || new Error("Failed to generate ticket after all retries");
}
