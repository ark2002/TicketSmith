import { TicketType, Section } from "./types";
import { buildSchemaDescription } from "./schemaBuilder";

export function buildSystemPrompt(): string {
  return `You are a senior engineering lead writing professional Jira tickets.

Guidelines:
- Write concise, clear, and professional content
- Be specific and technical but keep it brief - avoid excessive detail
- Use bullet points for lists (Scope, Acceptance Criteria, Expected Outcome, etc.)
- Keep descriptions to 2-3 sentences maximum per section
- For Summary: One clear, descriptive title (50-100 characters)
- For Description: 2-3 concise paragraphs with key technical context
- For Scope/Acceptance Criteria/Expected Outcome: 3-5 bullet points each, keep each bullet to one line
- Extract only the essential information from the input
- Output ONLY valid JSON - no markdown, no code blocks, no explanations
- Use ONLY the sections requested by the user`;
}

export function buildUserPrompt(
  input: string,
  ticketType: TicketType,
  sections: Section[],
  schema: string
): string {
  const sectionsList = sections.join(", ");

  return `Generate a concise, professional Jira ticket.

Ticket Type: ${ticketType}

Input:
"""
${input}
"""

Required Sections: ${sectionsList}

JSON Schema:
${schema}

Format Rules:
- Summary: One clear title (50-100 chars)
- Description: 2-3 concise paragraphs max
- Scope/Acceptance Criteria/Expected Outcome: 3-5 bullet points each, one line per bullet
- Risks/Dependencies/Validation Plan: 3-5 bullet points each, one line per bullet
- Keep all content concise and focused
- Extract only essential information from input
- Be specific but brief

Return ONLY valid JSON matching the schema. No markdown, no code blocks, no explanations.`;
}

export function buildRetryPrompt(
  input: string,
  ticketType: TicketType,
  sections: Section[],
  schema: string
): string {
  const basePrompt = buildUserPrompt(input, ticketType, sections, schema);

  return `${basePrompt}

CRITICAL: Your previous response had JSON formatting errors. Fix all JSON syntax errors and ensure:
- All strings are properly quoted
- All arrays use square brackets []
- All objects use curly braces {}
- No trailing commas
- Proper escaping of special characters
- The JSON structure exactly matches the provided schema

Return ONLY valid JSON - no markdown, no code blocks, no explanations.`;
}
