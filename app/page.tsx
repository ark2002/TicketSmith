"use client";

import { useState } from "react";
import { TicketType, Section, TicketData, GenerateTicketRequest, Provider } from "@/lib/types";
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
  const [provider, setProvider] = useState<Provider>("openrouter");
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
        provider,
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">TicketSmith</h1>
          <p className="text-sm text-gray-600">
            Convert unstructured text into structured Jira tickets using AI
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="flex flex-col">
            <div className="mb-4 bg-white rounded-xl border border-gray-200/80 p-4">
              <label htmlFor="provider-select" className="block text-sm font-semibold text-gray-900 mb-2">
                AI Provider
              </label>
              <select
                id="provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="openrouter">OpenRouter (Free Models)</option>
                <option value="gemini">Google Gemini</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                {provider === "openrouter"
                  ? "Using free models via OpenRouter"
                  : "Using Google Gemini API"}
              </p>
            </div>
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

          <div className="flex flex-col">
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
