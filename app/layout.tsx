import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";
import { isSimulatedMode } from "@/features/charges";
import "./globals.css";

// DM Sans comes from the shadcn preset; Geist Mono is for references and operation numbers.
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Cobros",
  description: "Asistente de cobros en pesos para PyMEs, sobre Celo y Ripio.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Read at build time for static pages (the mode is a deployment setting), and never throws:
  // a broken payments setup must not take down pages that do not charge, like the landing.
  const testMode = isSimulatedMode(process.env);

  return (
    <html lang="es" className={cn(dmSans.variable, geistMono.variable, "font-sans")}>
      <body className={cn(testMode && "border-t-[3px] border-test")}>
        {testMode && (
          <p
            role="note"
            title="Los pagos son simulados: no se mueve dinero real"
            className="mx-auto w-fit rounded-b-lg bg-test px-3 pb-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-test-foreground"
          >
            Modo prueba
          </p>
        )}
        {children}
      </body>
    </html>
  );
}
