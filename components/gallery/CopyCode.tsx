"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
        
    }
  }

  return (
    <div className="grid gap-3">
      <textarea
        readOnly
        value={code}
        rows={8}
        aria-label="Código de la galería"
        onFocus={(e) => e.currentTarget.select()}
        className="w-full text-xs font-mono p-3 rounded-md border bg-transparent text-[var(--color-ink)]"
        style={{ borderColor: "var(--color-line)" }}
      />
      <button
        type="button"
        onClick={copy}
        className="justify-self-start px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
        style={{ background: "var(--color-cta)" }}
      >
        {copied ? "¡Copiado!" : "Copiar código"}
      </button>
    </div>
  );
}