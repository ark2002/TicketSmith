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
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-3.5 block">
          Sections
        </Label>
        <div className="space-y-2 bg-gray-50/60 rounded-lg p-3.5 border border-gray-100/60">
          {DEFAULT_SECTIONS.map((section) => (
            <div key={section} className="flex items-center space-x-3 group cursor-pointer">
              <Checkbox
                id={section}
                checked={selectedSections.includes(section)}
                onChange={() => handleToggle(section)}
                className="transition-all"
              />
              <Label
                htmlFor={section}
                className="text-sm text-gray-700 cursor-pointer font-normal group-hover:text-gray-900 transition-colors flex-1 select-none"
              >
                {section}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {OPTIONAL_SECTIONS.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-3.5 block">
            Optional
          </Label>
          <div className="space-y-2 bg-gray-50/60 rounded-lg p-3.5 border border-gray-100/60">
            {OPTIONAL_SECTIONS.map((section) => (
              <div key={section} className="flex items-center space-x-3 group cursor-pointer">
                <Checkbox
                  id={section}
                  checked={selectedSections.includes(section)}
                  onChange={() => handleToggle(section)}
                  className="transition-all"
                />
                <Label
                  htmlFor={section}
                  className="text-sm text-gray-700 cursor-pointer font-normal group-hover:text-gray-900 transition-colors flex-1 select-none"
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
