import { NextRequest, NextResponse } from "next/server";

// Maximum request body size (1MB)
const MAX_BODY_SIZE = 1024 * 1024;

// Maximum input text length
const MAX_INPUT_LENGTH = 10000;

// Maximum sections array length
const MAX_SECTIONS = 20;

export function validateRequestSize(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get("content-length");

  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: "Request body too large" },
      {
        status: 413,
        headers: getSecurityHeaders(),
      }
    );
  }

  return null;
}

export function sanitizeInput(input: string): string {
  // Remove null bytes and control characters (except newlines and tabs)
  return input
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

export function validateInput(input: string): { valid: boolean; error?: string } {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Input text is required" };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length < 10) {
    return { valid: false, error: "Input text must be at least 10 characters" };
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: `Input text must not exceed ${MAX_INPUT_LENGTH} characters`
    };
  }

  return { valid: true };
}

export function validateSections(sections: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(sections)) {
    return { valid: false, error: "Sections must be an array" };
  }

  if (sections.length === 0) {
    return { valid: false, error: "At least one section must be selected" };
  }

  if (sections.length > MAX_SECTIONS) {
    return {
      valid: false,
      error: `Maximum ${MAX_SECTIONS} sections allowed`
    };
  }

  return { valid: true };
}

export function getSecurityHeaders(): HeadersInit {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  includeDetails: boolean = false
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(includeDetails && process.env.NODE_ENV === "development" ? {
        timestamp: new Date().toISOString(),
      } : {}),
    },
    {
      status,
      headers: getSecurityHeaders(),
    }
  );
}

export function createSuccessResponse(data: unknown): NextResponse {
  return NextResponse.json(data, {
    headers: getSecurityHeaders(),
  });
}
