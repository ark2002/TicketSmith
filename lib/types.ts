export type TicketType = "Bug" | "Task" | "Story";

export type Section =
  | "Summary"
  | "Type"
  | "Description"
  | "Scope"
  | "Acceptance Criteria"
  | "Expected Outcome"
  | "Risks"
  | "Dependencies"
  | "Validation Plan";

export interface TicketData {
  summary?: string;
  type?: string;
  description?: string;
  scope?: string[];
  acceptance_criteria?: string[];
  expected_outcome?: string[];
  risks?: string[];
  dependencies?: string[];
  validation_plan?: string[];
}

export interface AppState {
  inputText: string;
  ticketType: TicketType;
  selectedSections: Section[];
  loading: boolean;
  ticketData: TicketData | null;
  error: string | null;
}

export interface GenerateTicketRequest {
  input: string;
  ticketType: TicketType;
  sections: Section[];
}

export interface GenerateTicketResponse {
  ticket: TicketData;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
