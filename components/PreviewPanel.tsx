"use client";

import { useState, useEffect } from "react";
import { TicketData, Section } from "@/lib/types";
import { TicketSection } from "./TicketSection";
import { Button } from "./ui/button";
import { Copy, Check, Code, Eye } from "lucide-react";

const sectionToFieldMap: Record<Section, keyof TicketData> = {
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

interface PreviewPanelProps {
  ticketData: TicketData | null;
  selectedSections: Section[];
  loading: boolean;
}

function formatTicketAsMarkdown(
  ticketData: TicketData,
  selectedSections: Section[]
): string {
  const lines: string[] = [];

  selectedSections.forEach((section) => {
    const fieldName = sectionToFieldMap[section];
    const value = ticketData[fieldName];

    if (value === undefined) {
      return;
    }

    lines.push(`## ${section}`);
    lines.push("");

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push("*Empty*");
      } else {
        value.forEach((item) => {
          lines.push(`- ${item}`);
        });
      }
    } else {
      const stringValue = String(value);
      const paragraphs = stringValue.split("\n").filter((p) => p.trim());
      paragraphs.forEach((para) => {
        lines.push(para);
      });
    }

    lines.push("");
  });

  return lines.join("\n");
}

export function PreviewPanel({
  ticketData,
  selectedSections,
  loading,
}: PreviewPanelProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<"md" | "json" | null>(null);

  useEffect(() => {
    if (copiedSection) {
      const timer = setTimeout(() => setCopiedSection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedSection]);

  useEffect(() => {
    if (copiedFormat) {
      const timer = setTimeout(() => setCopiedFormat(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedFormat]);

  const copySection = async (sectionTitle: string, value: any) => {
    try {
      const text = showRawJson
        ? JSON.stringify(value, null, 2)
        : Array.isArray(value)
        ? value.join("\n")
        : String(value);
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionTitle);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copyAsMarkdown = async () => {
    if (!ticketData) return;
    try {
      const text = formatTicketAsMarkdown(ticketData, selectedSections);
      await navigator.clipboard.writeText(text);
      setCopiedFormat("md");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copyAsJson = async () => {
    if (!ticketData) return;
    try {
      const text = JSON.stringify(ticketData, null, 2);
      await navigator.clipboard.writeText(text);
      setCopiedFormat("json");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Generating ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Generated ticket will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-sm font-medium text-gray-700">Ticket Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
            className="h-8 px-2 text-xs"
          >
            {showRawJson ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Formatted
              </>
            ) : (
              <>
                <Code className="h-3 w-3 mr-1" />
                Raw JSON
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={copyAsMarkdown}
            className="h-8 px-2 text-xs"
          >
            {copiedFormat === "md" ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy MD
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={copyAsJson}
            className="h-8 px-2 text-xs"
          >
            {copiedFormat === "json" ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy JSON
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {selectedSections.map((section) => {
          const fieldName = sectionToFieldMap[section];
          const value = ticketData[fieldName];

          if (value === undefined) {
            return null;
          }

          return (
            <TicketSection
              key={section}
              title={section}
              value={value}
              showRawJson={showRawJson}
              onCopy={() => copySection(section, value)}
              copied={copiedSection === section}
            />
          );
        })}
      </div>
    </div>
  );
}
