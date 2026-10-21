"use client";

// Monkey-patch Performance.measure in dev mode to catch Turbopack / Chromium negative timestamp bugs
if (typeof window !== "undefined") {
  try {
    const proto = (window.Performance?.prototype || window.performance) as Performance | undefined;
    if (proto && typeof proto.measure === "function") {
      const origMeasure = proto.measure;
      proto.measure = function (this: Performance, ...args: Parameters<Performance["measure"]>) {
        try {
          return origMeasure.apply(this, args);
        } catch (err: unknown) {
          if (
            err instanceof Error &&
            (err.message.includes("negative") || err.name === "TypeError")
          ) {
            return undefined as unknown as PerformanceMeasure;
          }
          throw err;
        }
      };
    }

    if (
      window.performance &&
      typeof window.performance.measure === "function" &&
      proto &&
      window.performance.measure !== proto.measure
    ) {
      const origInstMeasure = window.performance.measure;
      window.performance.measure = function (
        this: Performance,
        ...args: Parameters<Performance["measure"]>
      ) {
        try {
          return origInstMeasure.apply(this, args);
        } catch (err: unknown) {
          if (
            err instanceof Error &&
            (err.message.includes("negative") || err.name === "TypeError")
          ) {
            return undefined as unknown as PerformanceMeasure;
          }
          throw err;
        }
      };
    }

    // Filter harmless dev warnings (like in-flight fetch unmounted, unmounted state updates, or animation aborted)
    const origConsoleError = console.error;
    console.error = function (...args: any[]) {
      const msg = typeof args[0] === "string" ? args[0] : (args[0]?.message || "");
      if (
        typeof msg === "string" &&
        (msg.includes("AbortError") ||
          msg.includes("signal is aborted") ||
          msg.includes("Failed to load animation data") ||
          msg.includes("Can't perform a React state update on a component that hasn't mounted yet"))
      ) {
        return;
      }
      return origConsoleError.apply(this, args);
    };
  } catch {
    // Silently continue if performance API is restricted
  }
}

export function PerformancePatch() {
  return null;
}

