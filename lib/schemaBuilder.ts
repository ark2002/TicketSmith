import { Section } from "./types";

const sectionToFieldMap: Record<Section, string> = {
  Summary: "summary",
  Type: "type",
  Description: "description",
  Scope: "scope",
  "Acceptance Criteria": "acceptance_criteria",
  "Expected Outcome": "expected_outcome",
  Risks: "risks",
  Dependencies: "dependencies",
  "Validation Plan": "validation_plan",
};

const arraySections: Section[] = [
  "Scope",
  "Acceptance Criteria",
  "Expected Outcome",
  "Risks",
  "Dependencies",
  "Validation Plan",
];

export function buildSchemaDescription(sections: Section[]): string {
  if (sections.length === 0) {
    return "{}";
  }

  const fields = sections.map((section) => {
    const fieldName = sectionToFieldMap[section];
    const isArray = arraySections.includes(section);
    const type = isArray ? "string[]" : "string";
    return `  ${fieldName}: ${type}`;
  });

  return `{\n${fields.join("\n")}\n}`;
}
