import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("No autorizado", { status: 401 });

  const res = await fetch(`${BACKEND_URL}/api/admin/sitemaps/live`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return new NextResponse(`No se pudo obtener el sitemap (${res.status})`, { status: 502 });

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": res.headers.get("content-disposition") ?? 'attachment; filename="sitemap.xml"',
      "Cache-Control": "no-store",
    },
  });
}