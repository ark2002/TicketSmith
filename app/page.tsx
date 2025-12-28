"use client";

import { useState } from "react";
import { TicketType, Section, TicketData, GenerateTicketRequest } from "@/lib/types";
import { InputPanel } from "@/components/InputPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

const DEFAULT_SECTIONS: Section[] = [
  "Summary",
  "Type",
  "Description",
  "Scope",
  "Acceptance Criteria",
  "Expected Outcome",
];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [ticketType, setTicketType] = useState<TicketType>("Task");
  const [selectedSections, setSelectedSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (inputText.trim().length < 10) {
      setError("Input text must be at least 10 characters");
      return;
    }

    if (selectedSections.length === 0) {
      setError("Please select at least one section");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const requestBody: GenerateTicketRequest = {
        input: inputText,
        ticketType,
        sections: selectedSections,
      };

      const response = await fetch("/api/generate-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ticket");
      }

      setTicketData(data.ticket);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">TicketSmith</h1>
          <p className="text-sm text-gray-600 mt-1">
            Convert unstructured text into structured Jira tickets
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InputPanel
              inputText={inputText}
              ticketType={ticketType}
              selectedSections={selectedSections}
              loading={loading}
              error={error}
              onInputChange={setInputText}
              onTicketTypeChange={setTicketType}
              onSectionsChange={setSelectedSections}
              onGenerate={handleGenerate}
            />
          </div>

          <div className="space-y-6">
            <PreviewPanel
              ticketData={ticketData}
              selectedSections={selectedSections}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
