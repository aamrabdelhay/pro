"use client";

import type { ReactNode } from "react";

export function StoreCTA({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("rosy:open"))}
      className={className}
    >
      {children}
    </button>
  );
}
