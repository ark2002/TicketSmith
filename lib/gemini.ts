import { TicketData } from "./types";
import { buildSystemPrompt, buildUserPrompt, buildRetryPrompt } from "./promptBuilder";
import { buildSchemaDescription } from "./schemaBuilder";
import { TicketType, Section } from "./types";

// Model configuration from environment variables
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || "0.3");
const MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || "1", 10);
const MAX_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || "2500", 10);
const API_TIMEOUT = parseInt(process.env.GEMINI_API_TIMEOUT || "30000", 10);

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

interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<TicketData> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not set");
  }

  const requestBody: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_TOKENS,
    },
  };

  // Add system instruction if provided
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      const errorMsg = data.error?.message || "No response from Gemini";
      throw new Error(`Gemini API error: ${errorMsg}`);
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    const content = candidate.content.parts[0].text;
    if (!content) {
      throw new Error("Empty response from Gemini");
    }

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

export async function generateTicketWithGemini(
  input: string,
  ticketType: TicketType,
  sections: Section[]
): Promise<TicketData> {
  const schema = buildSchemaDescription(sections);
  const systemPrompt = buildSystemPrompt();
  let userPrompt = buildUserPrompt(input, ticketType, sections, schema);

  let lastError: Error | null = null;

  try {
    const result = await callGemini(userPrompt, systemPrompt);
    return result;
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));

    // If it's a JSON parsing error, try retry
    if (error instanceof Error && error.message.includes("Invalid JSON")) {
      try {
        const retryPrompt = buildRetryPrompt(input, ticketType, sections, schema);
        const result = await callGemini(retryPrompt, systemPrompt);
        return result;
      } catch (retryError) {
        throw lastError;
      }
    }

    throw lastError;
  }
}
