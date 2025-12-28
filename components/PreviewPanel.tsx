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
      <div className="bg-white rounded-xl border border-gray-200/80 p-10">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-100 border-t-gray-900 mx-auto mb-5"></div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Generating ticket...
            </p>
            <p className="text-xs text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 p-10">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center max-w-xs">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              No ticket generated yet
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Fill in the form and click &quot;Generate Ticket&quot; to create
              your Jira ticket
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 h-fit">
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white px-7 py-5 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-0.5">
              Ticket Preview
            </h2>
            <p className="text-xs text-gray-600">
              Review and copy your generated ticket
            </p>
          </div>
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
      </div>

      <div className="p-7 space-y-6">
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
