import React from "react";
import { mockStoryText } from "./mock-data";

interface DesignLayoutProps {
  title: string;
  codexSidebar: React.ReactNode;
  protagonistSidebar: React.ReactNode;
}

export function DesignLayout({
  title,
  codexSidebar,
  protagonistSidebar,
}: DesignLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-center dotted-border-b gap-2 md:gap-4 p-2">
        <h1 className="text-2xl tracking-widest text-accent italic">{title}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Codex Sidebar (Left) */}
        <aside className="hidden lg:block w-64 shrink-0 overflow-y-auto px-6 py-4 dotted-border-r">
          {codexSidebar}
        </aside>

        {/* Main Content (Center) */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-4xl space-y-6 prose dark:prose-invert">
              {mockStoryText.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className="whitespace-pre-line text-lg leading-relaxed text-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="dotted-border-t p-4 flex justify-center">
            <div className="w-full max-w-2xl rounded-lg border border-line bg-surface p-3 text-muted italic text-center">
              Write what happens next...
            </div>
          </div>
        </main>

        {/* Protagonist Sidebar (Right) */}
        <aside className="hidden lg:block w-64 shrink-0 overflow-y-auto px-6 py-4 dotted-border-l">
          {protagonistSidebar}
        </aside>
      </div>
    </div>
  );
}
