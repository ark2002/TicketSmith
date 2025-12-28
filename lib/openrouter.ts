import {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterMessage,
  TicketData,
} from "./types";
import { buildSystemPrompt, buildUserPrompt, buildRetryPrompt } from "./promptBuilder";
import { buildSchemaDescription } from "./schemaBuilder";
import { TicketType, Section } from "./types";

const PRIMARY_MODEL = "deepseek/deepseek-r1";
const FALLBACK_MODEL = "qwen/qwen-2.5-72b-instruct";
const TEMPERATURE = 0.2;
const MAX_RETRIES = 2;

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
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

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
    if (error instanceof Error && error.message.includes("timeout")) {
      throw new Error("Request timeout. Please try again.");
    }
    throw error;
  }
}

export async function generateTicket(
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
  let models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    for (const model of models) {
      try {
        // Use retry prompt after first attempt
        if (attempt > 0) {
          userPrompt = buildRetryPrompt(input, ticketType, sections, schema);
          messages[messages.length - 1] = { role: "user", content: userPrompt };
        }

        const result = await callOpenRouter(model, messages, attempt > 0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If it's a JSON parsing error and we have retries left, continue
        if (error instanceof Error && error.message.includes("Invalid JSON")) {
          continue;
        }

        // For other errors, try next model or retry
        if (model === PRIMARY_MODEL && models.length > 1) {
          continue; // Try fallback model
        }
      }
    }
  }

  // If all attempts failed, throw the last error
  throw lastError || new Error("Failed to generate ticket after all retries");
}
