import { TicketType, Section } from "./types";
import { buildSchemaDescription } from "./schemaBuilder";

export function buildSystemPrompt(): string {
  return `You are a senior engineering lead writing professional, detailed Jira tickets.

Your task is to analyze the provided input and create a comprehensive Jira ticket with the requested sections.

Guidelines:
- Write detailed, professional content that provides clear context and actionable information
- Be specific and technical - include relevant details, systems, environments, and technical context
- Use bullet points for lists (Scope, Acceptance Criteria, Expected Outcome, etc.)
- Each section should be substantial and informative, not generic or vague
- For Bug tickets: Include investigation steps, root cause analysis, and technical details
- For Task tickets: Include clear objectives, technical approach, and implementation details
- For Story tickets: Include user context, business value, and detailed requirements
- Output ONLY valid JSON - no markdown formatting, no code blocks, no explanations
- Use ONLY the sections requested by the user`;
}

export function buildUserPrompt(
  input: string,
  ticketType: TicketType,
  sections: Section[],
  schema: string
): string {
  const sectionsList = sections.join(", ");

  return `Generate a detailed, professional Jira ticket based on the following information.

Ticket Type: ${ticketType}

User Input:
"""
${input}
"""

Required Sections (include ALL of these):
${sectionsList}

JSON Schema (follow this exact structure):
${schema}

Instructions:
- Analyze the input thoroughly and extract all relevant technical details, context, and requirements
- Write detailed, professional content for each requested section
- For Summary: Create a clear, descriptive title (50-100 characters) that captures the essence of the ticket
- For Description: Write 2-4 paragraphs with technical context, problem statement, and relevant details
- For Scope: List specific items, systems, components, or areas affected (use bullet points as array items)
- For Acceptance Criteria: List specific, testable conditions that must be met (use bullet points as array items)
- For Expected Outcome: Describe the desired end state and benefits (use bullet points as array items)
- For Risks, Dependencies, Validation Plan: Provide detailed, specific information (use bullet points as array items)
- Be specific and technical - avoid generic phrases like "Test the app" or "Make it work"
- Include relevant technical details, system names, environments, API names, etc. from the input

Return ONLY valid JSON matching the schema above. No markdown, no code blocks, no explanations.`;
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
