import { adminFetch } from "@/lib/adminApi";
import { ModuleCard } from "@/components/ModuleCard";
import { FlashBanner } from "@/components/FlashBanner";
import { saveSitemapNow } from "@/lib/actions/sitemaps";
import type { SitemapFile } from "@/types/sitemap";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso.endsWith("Z") ? iso : iso + "Z").toLocaleString("es-MX", {
    timeZone: "America/Tijuana",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SitemapsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const files = await adminFetch<SitemapFile[]>("/api/admin/sitemaps");

  return (
    <ModuleCard
      title="Sitemaps"
      subtitle="Copias diarias del sitemap.xml guardadas en el servidor"
      actions={
        <>
          <a
            href="/sitemaps/live"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
            style={{ background: "var(--color-cta)" }}
          >
            Descargar sitemap actual
          </a>
          <form action={saveSitemapNow}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold border cursor-pointer"
              style={{ borderColor: "var(--color-line)" }}
            >
              Guardar copia ahora
            </button>
          </form>
        </>
      }
    >
      <FlashBanner ok={ok} error={error} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Copias del sitemap guardadas por día</caption>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-line)" }}>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Día</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Archivo</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Guardado</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Tamaño</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">
                <span className="sr-only">Descargar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-[var(--color-ink-soft)]">
                  Todavía no hay copias guardadas. Usa «Guardar copia ahora» o espera al siguiente corte.
                </td>
              </tr>
            )}
            {files.map((file) => (
              <tr key={file.fileName} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                <td className="px-4 sm:px-6 py-3 font-tabular text-[var(--color-ink)]">{file.date}</td>
                <td className="px-4 py-3 text-[var(--color-ink-soft)]">{file.fileName}</td>
                <td className="px-4 py-3 font-tabular text-[var(--color-ink-soft)]">{formatDate(file.savedAtUtc)}</td>
                <td className="px-4 py-3 font-tabular text-[var(--color-ink-soft)]">{formatSize(file.sizeBytes)}</td>
                <td className="px-4 sm:px-6 py-3">
                  <a
                    href={`/sitemaps/download?file=${encodeURIComponent(file.fileName)}`}
                    className="px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[var(--color-line)] cursor-pointer"
                  >
                    Descargar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}