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

export function PreviewPanel({
  ticketData,
  selectedSections,
  loading,
}: PreviewPanelProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  useEffect(() => {
    if (copiedSection) {
      const timer = setTimeout(() => setCopiedSection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedSection]);

  useEffect(() => {
    if (copiedFull) {
      const timer = setTimeout(() => setCopiedFull(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedFull]);

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

  const copyFullTicket = async () => {
    if (!ticketData) return;
    try {
      const text = JSON.stringify(ticketData, null, 2);
      await navigator.clipboard.writeText(text);
      setCopiedFull(true);
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
            onClick={copyFullTicket}
            className="h-8 px-2 text-xs"
          >
            {copiedFull ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy Full
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
