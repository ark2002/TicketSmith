import { NextRequest } from "next/server";
import { generateTicketWithOpenRouter } from "@/lib/openrouter";
import { generateTicketWithGemini } from "@/lib/gemini";
import { GenerateTicketRequest, GenerateTicketResponse, TicketType, Section, Provider } from "@/lib/types";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import {
  validateRequestSize,
  validateInput,
  validateSections,
  sanitizeInput,
  createErrorResponse,
  createSuccessResponse,
  getSecurityHeaders,
} from "@/lib/security";

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 10; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Request timeout (30 seconds - allows more time for detailed responses)
const REQUEST_TIMEOUT = 30000;

export async function POST(request: NextRequest) {
  try {
    // 1. Check request size
    const sizeCheck = validateRequestSize(request);
    if (sizeCheck) {
      return sizeCheck;
    }

    // 2. Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset);
      const response = createErrorResponse(
        "Too many requests. Please try again later.",
        429
      );
      response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
      response.headers.set("X-RateLimit-Reset", resetDate.toISOString());
      response.headers.set("Retry-After", Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString());
      return response;
    }

    // 3. Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return createErrorResponse("Content-Type must be application/json", 415);
    }

    // 4. Parse and validate request body with timeout
    let body: GenerateTicketRequest;
    try {
      const bodyPromise = request.json();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
      );

      body = (await Promise.race([bodyPromise, timeoutPromise])) as GenerateTicketRequest;
    } catch (error) {
      if (error instanceof Error && error.message === "Request timeout") {
        return createErrorResponse("Request timeout", 408);
      }
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    // 5. Validate input
    const inputValidation = validateInput(body.input);
    if (!inputValidation.valid) {
      return createErrorResponse(inputValidation.error || "Invalid input", 400);
    }

    // 6. Validate ticket type
    if (!body.ticketType || !["Bug", "Task", "Story"].includes(body.ticketType)) {
      return createErrorResponse(
        "Valid ticket type is required (Bug, Task, or Story)",
        400
      );
    }

    // 7. Validate sections
    const sectionsValidation = validateSections(body.sections);
    if (!sectionsValidation.valid) {
      return createErrorResponse(sectionsValidation.error || "Invalid sections", 400);
    }

    // 8. Validate section values
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

    const invalidSections = (body.sections as Section[]).filter(
      (s) => !validSections.includes(s)
    );

    if (invalidSections.length > 0) {
      return createErrorResponse(
        `Invalid sections: ${invalidSections.join(", ")}`,
        400
      );
    }

    // 9. Sanitize input
    const sanitizedInput = sanitizeInput(body.input);

    // 10. Determine provider (check request body, then env var, then default to openrouter)
    const defaultProvider = (process.env.DEFAULT_PROVIDER as Provider) || "openrouter";
    const provider: Provider = body.provider || defaultProvider;

    // Validate provider
    if (provider !== "openrouter" && provider !== "gemini") {
      return createErrorResponse(
        "Invalid provider. Must be 'openrouter' or 'gemini'",
        400
      );
    }

    // 11. Generate ticket with timeout protection
    let ticket;
    try {
      const generatePromise = provider === "gemini"
        ? generateTicketWithGemini(
            sanitizedInput,
            body.ticketType as TicketType,
            body.sections as Section[]
          )
        : generateTicketWithOpenRouter(
            sanitizedInput,
            body.ticketType as TicketType,
            body.sections as Section[]
          );

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Generation timeout")), REQUEST_TIMEOUT)
      );

      ticket = await Promise.race([generatePromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        return createErrorResponse("Request timeout. Please try again.", 408);
      }
      // Don't expose internal error details
      console.error(`Error generating ticket with ${provider}:`, error);
      return createErrorResponse(
        `Failed to generate ticket with ${provider}. Please try again.`,
        500
      );
    }

    const response: GenerateTicketResponse = {
      ticket,
    };

    const successResponse = createSuccessResponse(response);
    successResponse.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    successResponse.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    successResponse.headers.set("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString());

    return successResponse;
  } catch (error) {
    // Catch-all error handler
    console.error("Unexpected error in API route:", error);
    return createErrorResponse(
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}

// Add security headers to all responses
export const runtime = "nodejs";
