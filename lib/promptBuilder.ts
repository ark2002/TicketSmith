import { TicketType, Section } from "./types";
import { buildSchemaDescription } from "./schemaBuilder";

export function buildSystemPrompt(): string {
  return `You are a senior engineering lead writing Jira tickets.

Rules:
- Write concise, professional Jira content
- Use ONLY the requested sections
- Do NOT invent new sections
- Use bullet points where appropriate
- Do NOT use markdown
- Output VALID JSON only`;
}

export function buildUserPrompt(
  input: string,
  ticketType: TicketType,
  sections: Section[],
  schema: string
): string {
  const sectionsList = sections.join(", ");

  return `Generate a Jira ticket.

Ticket Type:
${ticketType}

Input:
"""
${input}
"""

Include ONLY these sections:
${sectionsList}

JSON Schema:
${schema}

Return ONLY valid JSON without any markdown code blocks or explanations.`;
}

export function buildRetryPrompt(
  input: string,
  ticketType: TicketType,
  sections: Section[],
  schema: string
): string {
  const basePrompt = buildUserPrompt(input, ticketType, sections, schema);

  return `${basePrompt}

IMPORTANT: Your previous response contained invalid JSON. Fix JSON formatting errors silently and return ONLY valid JSON without any explanation or markdown code blocks.`;
}
