"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm">
        <img src="/bajanews-logo.jpg" alt="BajaNews.mx" className="h-9 w-auto mx-auto mb-8 rounded" />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={emailId} className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              Correo
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              className="w-full rounded-md border-2 px-3 py-2.5 text-[var(--color-ink)] bg-[var(--color-paper-raised)] focus:outline-none"
              style={{ borderColor: "var(--color-input-border)" }}
            />
          </div>

          <div>
            <label htmlFor={passwordId} className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              Contraseña
            </label>
            <input
              id={passwordId}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              className="w-full rounded-md border-2 px-3 py-2.5 text-[var(--color-ink)] bg-[var(--color-paper-raised)] focus:outline-none"
              style={{ borderColor: "var(--color-input-border)" }}
            />
          </div>

          {error && (
            <p
              className="text-sm font-medium rounded-md px-3 py-2"
              style={{ color: "var(--color-danger)", background: "var(--color-danger-tint)" }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-3 py-2.5 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: "var(--color-cta)" }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
