import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google"; // Using Outfit for Headings, Inter for Body
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NexusEdu - School Management",
  description: "Bespoke School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased text-slate-800 bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
