import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { CreditsProvider } from "@/components/credits-provider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });


export const metadata: Metadata = {
  title: "Once | Reclaim the Narrative",
  description: "The fuel is ready. Bring the spark.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable}  font-outfit antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {/* <LenisProvider> */}
          {/* <EmberCursor /> */}
          <CreditsProvider>
            {/* <ConstellationLoader /> */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  color: 'var(--foreground)',
                },
              }}
            />
            {children}
          </CreditsProvider>
          {/* </LenisProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}