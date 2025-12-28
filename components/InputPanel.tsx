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
    <div className="space-y-6">
      <div>
        <Label htmlFor="input-text" className="mb-2 block">
          Input Text
        </Label>
        <Textarea
          id="input-text"
          placeholder="Paste your problem statement, chat logs, or bug report here..."
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          className="min-h-[200px]"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="ticket-type" className="mb-2 block">
          Ticket Type
        </Label>
        <Select
          id="ticket-type"
          value={ticketType}
          onChange={(e) => onTicketTypeChange(e.target.value as TicketType)}
          disabled={loading}
        >
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Story">Story</option>
        </Select>
      </div>

      <SectionSelector
        selectedSections={selectedSections}
        onChange={onSectionsChange}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        onClick={onGenerate}
        disabled={loading || inputText.trim().length < 10 || selectedSections.length === 0}
        className="w-full"
      >
        {loading ? "Generating..." : "Generate Ticket"}
      </Button>
    </div>
  );
}
