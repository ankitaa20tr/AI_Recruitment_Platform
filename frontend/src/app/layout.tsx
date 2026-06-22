import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { AppProvider } from "@/context/app-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RecruitIQ AI — AI-Augmented Recruitment Platform",
  description: "Screen 1,000 CVs. Surface the 10 who matter. Explain why.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AppProvider>
          <Navbar />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
