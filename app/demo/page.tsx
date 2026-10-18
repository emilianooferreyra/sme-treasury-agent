import type { Metadata } from "next";
import { DemoScreen } from "./demo";

export const metadata: Metadata = {
  title: "Demo",
  description: "Pedile un cobro al asistente y pagalo desde el celular del cliente, con pagos simulados.",
};

// A Server Component, so the page can export metadata; the interactive demo is the client part.
export default function DemoPage() {
  return <DemoScreen />;
}
