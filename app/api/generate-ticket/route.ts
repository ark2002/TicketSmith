import { NextRequest, NextResponse } from "next/server";
import { generateTicket } from "@/lib/openrouter";
import { GenerateTicketRequest, GenerateTicketResponse, TicketType, Section } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateTicketRequest = await request.json();

    // Validation
    if (!body.input || typeof body.input !== "string") {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    if (body.input.trim().length < 10) {
      return NextResponse.json(
        { error: "Input text must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!body.ticketType || !["Bug", "Task", "Story"].includes(body.ticketType)) {
      return NextResponse.json(
        { error: "Valid ticket type is required (Bug, Task, or Story)" },
        { status: 400 }
      );
    }

    if (!body.sections || !Array.isArray(body.sections) || body.sections.length === 0) {
      return NextResponse.json(
        { error: "At least one section must be selected" },
        { status: 400 }
      );
    }

    // Validate sections
    const validSections: Section[] = [
      "Summary",
      "Type",
      "Description",
      "Scope",
      "Acceptance Criteria",
      "Expected Outcome",
      "Risks",
      "Dependencies",
      "Validation Plan",
    ];

    const invalidSections = body.sections.filter(
      (s) => !validSections.includes(s as Section)
    );

    if (invalidSections.length > 0) {
      return NextResponse.json(
        { error: `Invalid sections: ${invalidSections.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate ticket
    const ticket = await generateTicket(
      body.input,
      body.ticketType as TicketType,
      body.sections as Section[]
    );

    const response: GenerateTicketResponse = {
      ticket,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating ticket:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while generating the ticket";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
