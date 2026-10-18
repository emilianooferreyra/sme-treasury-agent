"use client";

import { createContext, type Dispatch, type ReactNode, useContext, useReducer } from "react";
import { type DemoAction, type DemoState, demoReducer, initialDemoState } from "./demo-state";

const DemoContext = createContext<{ state: DemoState; dispatch: Dispatch<DemoAction> } | undefined>(undefined);

/** Shares the demo state (charges, the customer's phone, the active tab) between both sides. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  return <DemoContext value={{ state, dispatch }}>{children}</DemoContext>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used inside <DemoProvider>");
  }
  return context;
}
