import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryWeaver - AI-Powered Interactive Storytelling",
  description: "Shape your own epic adventure through the power of AI. Your words create worlds, your choices forge destiny.",
  keywords: ["AI storytelling", "interactive fiction", "text adventure", "creative writing", "collaborative stories"],
  authors: [{ name: "StoryWeaver" }],
  openGraph: {
    title: "StoryWeaver - AI-Powered Interactive Storytelling",
    description: "Shape your own epic adventure through the power of AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
