import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cool Coo Sauna — Fort William, Scottish Highlands",
  description:
    "Book a sauna session in the Scottish Highlands, near Ben Nevis, Fort William. Enjoy a wood-fired sauna, cold plunge, and cosy fireplace. Cool Coo Sauna — the ultimate outdoor Highland experience.",
  keywords: [
    "sauna",
    "Cool Coo Sauna",
    "Fort William sauna",
    "Highlands sauna",
    "Ben Nevis sauna",
    "Scottish Highlands",
    "cold plunge",
    "fireplace sauna",
    "outdoor sauna Scotland",
    "wood-fired sauna Fort William",
  ],
  openGraph: {
    title: "Cool Coo Sauna — Fort William, Scottish Highlands",
    description:
      "Experience a wood-fired sauna, cold plunge, and fireplace retreat in the Scottish Highlands near Ben Nevis. Book your session at Cool Coo Sauna today.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
