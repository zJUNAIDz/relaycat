
import { Toaster } from "@/shared/components/ui/sonner";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { cn } from "@/shared/utils/cn";
import { ThemeProvider } from "@wrksz/themes";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RelayCat",
  description: "A Fast & Secure Communication Platform",

};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Shrink the layout viewport when the soft keyboard opens instead of overlaying it,
  // so a full-height chat view keeps its composer above the keyboard.
  interactiveWidget: "resizes-content",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storage="hybrid"
          enableSystem={false}
          storageKey="relaycat"
        >
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
