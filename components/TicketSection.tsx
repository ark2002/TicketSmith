"use client";

import { useState } from "react";
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
    return <span className="text-gray-400 italic">Not provided</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty</span>;
    }
    return (
      <ul className="list-none space-y-1">
        {value.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-gray-600">•</span>
            <span className="text-sm text-gray-800 whitespace-pre-wrap">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const stringValue = String(value);
  const lines = stringValue.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={index} className="text-sm text-gray-800 whitespace-pre-wrap">
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
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-8 px-2 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="bg-gray-50 rounded-md p-3 min-h-[40px]">
        {showRawJson ? (
          <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words">
            {jsonValue}
          </pre>
        ) : (
          <div className="text-sm text-gray-800">
            {renderFormattedContent(value)}
          </div>
        )}
      </div>
    </div>
  );
}
