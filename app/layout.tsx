import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketSmith - AI Jira Ticket Generator",
  description: "Convert unstructured text into structured Jira tickets using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
