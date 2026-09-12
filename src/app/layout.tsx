import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Localbox — Browser PDF & Audio Tools",
  description:
    "Free, open-source browser-based PDF and audio utilities. No uploads, everything runs locally in your browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
