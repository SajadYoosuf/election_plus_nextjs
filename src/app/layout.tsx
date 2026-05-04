import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Noto_Serif_Malayalam } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoMalayalam = Noto_Serif_Malayalam({
  variable: "--font-noto-malayalam",
  subsets: ["malayalam"],
});

export const metadata: Metadata = {
  title: "Kerala Election Pulse 2026",
  description: "Live results and AI analysis for Kerala Assembly Elections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceMono.variable} ${notoMalayalam.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
