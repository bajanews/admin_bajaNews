import "server-only";

export async function avisarSitioPublico() {
  const base = process.env.REVALIDATE_URL || process.env.NEXT_PUBLIC_PUBLIC_SITE_URL;
  const secreto = process.env.REVALIDATE_SECRET;
  if (!base || !secreto) return;

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/revalidar`, {
      method: "POST",
      headers: { "x-revalidate-secret": secreto },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[avisarSitioPublico] el sitio respondió ${res.status}`);
  } catch (err) {
    console.error("[avisarSitioPublico] no se pudo avisar al sitio:", err);
  }
}
