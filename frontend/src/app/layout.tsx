import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Replace with your real Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "1055555555555-google-client-id-here.apps.googleusercontent.com";

export const metadata: Metadata = {
  title: "Debuggers AI — Enterprise Multi-Agent Platform",
  description: "Enterprise-grade RAG platform with streaming AI agents, document ingestion, and intelligent debugging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--color-bg-body)] overflow-hidden`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
