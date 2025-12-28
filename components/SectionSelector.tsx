"use client";

import { Section } from "@/lib/types";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const DEFAULT_SECTIONS: Section[] = [
  "Summary",
  "Type",
  "Description",
  "Scope",
  "Acceptance Criteria",
  "Expected Outcome",
];

const OPTIONAL_SECTIONS: Section[] = [
  "Risks",
  "Dependencies",
  "Validation Plan",
];

interface SectionSelectorProps {
  selectedSections: Section[];
  onChange: (sections: Section[]) => void;
}

export function SectionSelector({
  selectedSections,
  onChange,
}: SectionSelectorProps) {
  const handleToggle = (section: Section) => {
    if (selectedSections.includes(section)) {
      onChange(selectedSections.filter((s) => s !== section));
    } else {
      onChange([...selectedSections, section]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Sections
        </Label>
        <div className="space-y-2">
          {DEFAULT_SECTIONS.map((section) => (
            <div key={section} className="flex items-center space-x-2">
              <Checkbox
                id={section}
                checked={selectedSections.includes(section)}
                onCheckedChange={() => handleToggle(section)}
              />
              <Label
                htmlFor={section}
                className="text-sm text-gray-800 cursor-pointer font-normal"
              >
                {section}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {OPTIONAL_SECTIONS.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Optional
          </Label>
          <div className="space-y-2">
            {OPTIONAL_SECTIONS.map((section) => (
              <div key={section} className="flex items-center space-x-2">
                <Checkbox
                  id={section}
                  checked={selectedSections.includes(section)}
                  onCheckedChange={() => handleToggle(section)}
                />
                <Label
                  htmlFor={section}
                  className="text-sm text-gray-800 cursor-pointer font-normal"
                >
                  {section}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
