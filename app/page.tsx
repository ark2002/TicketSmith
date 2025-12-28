"use client";

import { useState } from "react";
import {
  TicketType,
  Section,
  TicketData,
  GenerateTicketRequest,
} from "@/lib/types";
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
  const [selectedSections, setSelectedSections] =
    useState<Section[]>(DEFAULT_SECTIONS);
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            TicketSmith
          </h1>
          <p className="text-sm text-gray-600">
            Convert unstructured text into structured Jira tickets using AI
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="flex flex-col">
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

        <footer className="mt-16 pt-8 border-t border-gray-200/80">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Created by</span>
            <a
              href="https://github.com/ark2002"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C21.138 20.197 24 16.425 24 12.017 24 6.484 19.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              ark2002
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
