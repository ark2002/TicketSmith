import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  title: {
    default: "TicketSmith - AI Jira Ticket Generator",
    template: "%s | TicketSmith",
  },
  description:
    "Convert unstructured text into structured Jira tickets using AI. Generate professional Bug, Task, and Story tickets with AI-powered automation.",
  keywords: [
    "Jira ticket generator",
    "AI ticket generator",
    "Jira automation",
    "ticket creation",
    "AI Jira",
    "project management",
    "bug tracking",
  ],
  authors: [{ name: "Aryak Lahane", url: "https://github.com/ark2002" }],
  creator: "Aryak Lahane",
  publisher: "Aryak Lahane",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ticketsmith.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "TicketSmith - AI Jira Ticket Generator",
    description:
      "Convert unstructured text into structured Jira tickets using AI. Generate professional Bug, Task, and Story tickets with AI-powered automation.",
    siteName: "TicketSmith",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TicketSmith - AI Jira Ticket Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TicketSmith - AI Jira Ticket Generator",
    description:
      "Convert unstructured text into structured Jira tickets using AI. Generate professional Bug, Task, and Story tickets with AI-powered automation.",
    creator: "@ark2002",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TicketSmith",
    description:
      "AI-powered tool to convert unstructured text into structured Jira tickets",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ticketsmith.vercel.app",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Person",
      name: "Aryak Lahane",
      url: "https://github.com/ark2002",
    },
    featureList: [
      "AI-powered ticket generation",
      "Multiple ticket types (Bug, Task, Story)",
      "Customizable sections",
      "Real-time preview",
      "Copy to clipboard",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
