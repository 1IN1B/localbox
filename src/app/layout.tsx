import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const TITLE = "Localbox — Browser PDF & Audio Tools";
const DESCRIPTION =
  "Free, open-source browser-based PDF and audio utilities. No uploads, no login — merge, trim, and convert PDFs and audio entirely in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: "%s | Localbox",
  },
  description: DESCRIPTION,
  applicationName: "Localbox",
  authors: [{ name: "Localbox Community" }],
  creator: "Localbox Community",
  publisher: "Localbox",
  keywords: [
    "localbox",
    "pdf tools",
    "pdf merge",
    "pdf trim",
    "images to pdf",
    "docx to pdf",
    "audio merge",
    "audio trim",
    "browser pdf editor",
    "free online pdf tools",
    "private pdf tools",
    "no upload pdf",
  ],
  category: "utilities",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Localbox",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-thumbnail.png",
        width: 1000,
        height: 546,
        alt: "Localbox — free, private PDF & audio tools that run 100% in your browser",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-thumbnail.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Apply theme before first paint to avoid flash + hydration mismatch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('localbox-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t!=='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
