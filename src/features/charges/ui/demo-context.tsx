"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { pollStatusResult } from "./charge-card-model";
import { type DemoAction, type DemoState, demoReducer, initialDemoState } from "./demo-state";

const POLL_INTERVAL_MS = 3000;
/** The status route accepts up to 50 ids; the most recently watched charges go first. */
const MAX_IDS_PER_POLL = 50;

type Watch = (chargeId: string) => () => void;

const DemoContext = createContext<{ state: DemoState; dispatch: Dispatch<DemoAction>; watch: Watch } | undefined>(
  undefined,
);

/**
 * One status poll for every pending charge card: a single request (and a single server-side
 * reconciliation) per interval, however many cards the chat shows. Cards subscribe with `watch`.
 */
function useSharedStatusPoll(dispatch: Dispatch<DemoAction>): Watch {
  // How many cards watch each charge: two cards can show the same one.
  const watchers = useRef(new Map<string, number>());

  useEffect(() => {
    let inFlight: AbortController | undefined;
    const timer = setInterval(async () => {
      const ids = [...watchers.current.keys()].slice(-MAX_IDS_PER_POLL);
      // Skip while the previous poll is still waiting, so slow answers never pile up.
      if (ids.length === 0 || inFlight) {
        return;
      }
      inFlight = new AbortController();
      try {
        const response = await fetch(`/api/charges?ids=${encodeURIComponent(ids.join(","))}`, {
          signal: inFlight.signal,
        });
        const result = pollStatusResult(ids, response.status, await response.json().catch(() => undefined));
        if (result.kind === "update") {
          for (const id of result.gone) {
            watchers.current.delete(id);
          }
          for (const charge of result.charges) {
            dispatch({ type: "charge-seen", charge });
          }
        }
      } catch {
        // A failed poll is retried on the next tick.
      } finally {
        inFlight = undefined;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      inFlight?.abort();
    };
  }, [dispatch]);

  return useCallback<Watch>((chargeId) => {
    watchers.current.set(chargeId, (watchers.current.get(chargeId) ?? 0) + 1);
    return () => {
      const count = watchers.current.get(chargeId);
      if (count === undefined) {
        return; // Already dropped: the server no longer has it.
      }
      if (count > 1) {
        watchers.current.set(chargeId, count - 1);
      } else {
        watchers.current.delete(chargeId);
      }
    };
  }, []);
}

/** Shares the demo state (charges, the customer's phone, the active tab) between both sides. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const watch = useSharedStatusPoll(dispatch);
  return <DemoContext value={{ state, dispatch, watch }}>{children}</DemoContext>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used inside <DemoProvider>");
  }
  return context;
}
