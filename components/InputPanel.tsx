"use client";

import { TicketType, Section } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { SectionSelector } from "./SectionSelector";

interface InputPanelProps {
  inputText: string;
  ticketType: TicketType;
  selectedSections: Section[];
  loading: boolean;
  error: string | null;
  onInputChange: (text: string) => void;
  onTicketTypeChange: (type: TicketType) => void;
  onSectionsChange: (sections: Section[]) => void;
  onGenerate: () => void;
}

export function InputPanel({
  inputText,
  ticketType,
  selectedSections,
  loading,
  error,
  onInputChange,
  onTicketTypeChange,
  onSectionsChange,
  onGenerate,
}: InputPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-7 space-y-7 h-fit">
      <div>
        <Label htmlFor="input-text" className="mb-3 block text-sm font-semibold text-gray-900">
          Input Text
        </Label>
        <Textarea
          id="input-text"
          placeholder="Paste your problem statement, chat logs, or bug report here..."
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          className="min-h-[260px] resize-none text-sm leading-relaxed"
          disabled={loading}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {inputText.length} characters
          </p>
          {inputText.length > 0 && (
            <p className={`text-xs ${inputText.length < 10 ? 'text-amber-600' : 'text-gray-500'}`}>
              {inputText.length < 10 ? `Need ${10 - inputText.length} more` : 'Ready'}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="ticket-type" className="mb-3 block text-sm font-semibold text-gray-900">
          Ticket Type
        </Label>
        <Select
          id="ticket-type"
          value={ticketType}
          onChange={(e) => onTicketTypeChange(e.target.value as TicketType)}
          disabled={loading}
          className="w-full"
        >
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Story">Story</option>
        </Select>
      </div>

      <div className="border-t border-gray-100 pt-7">
        <SectionSelector
          selectedSections={selectedSections}
          onChange={onSectionsChange}
        />
      </div>

      {error && (
        <div className="bg-red-50/80 border border-red-200/60 rounded-lg p-4 animate-in fade-in duration-200">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 font-medium leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <Button
        onClick={onGenerate}
        disabled={loading || inputText.trim().length < 10 || selectedSections.length === 0}
        className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow transition-shadow"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Ticket"
        )}
      </Button>
    </div>
  );
}
