"use client";

import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";

interface TicketSectionProps {
  title: string;
  value: string | string[] | undefined;
  showRawJson: boolean;
  onCopy: () => void;
  copied: boolean;
}

function formatValue(value: string | string[] | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => `• ${item}`).join("\n");
  }

  return String(value);
}

function renderFormattedContent(value: string | string[] | undefined): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-gray-400 italic text-sm">Not provided</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic text-sm">Empty</span>;
    }
    return (
      <ul className="list-none space-y-2.5">
        {value.map((item, index) => (
          <li key={index} className="flex items-start group">
            <span className="mr-3 text-gray-400 mt-0.5 flex-shrink-0">•</span>
            <span className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed flex-1">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const stringValue = String(value);
  const lines = stringValue.split("\n");

  return (
    <div className="space-y-2.5">
      {lines.map((line, index) => (
        <p key={index} className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {line || "\u00A0"}
        </p>
      ))}
    </div>
  );
}

export function TicketSection({
  title,
  value,
  showRawJson,
  onCopy,
  copied,
}: TicketSectionProps) {
  const jsonValue = JSON.stringify(value, null, 2);

  return (
    <div className="border-b border-gray-100/80 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-7 px-2.5 text-xs transition-all hover:bg-gray-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
              <span className="text-green-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
              <span className="text-gray-600">Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="bg-gray-50/60 rounded-lg border border-gray-100/60 p-4.5 min-h-[50px] transition-colors hover:bg-gray-50/80">
        {showRawJson ? (
          <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {jsonValue}
          </pre>
        ) : (
          <div className="text-sm text-gray-800 leading-relaxed">
            {renderFormattedContent(value)}
          </div>
        )}
      </div>
    </div>
  );
}
