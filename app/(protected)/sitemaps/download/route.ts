import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import { getSession } from "@/lib/session";

const FILE_NAME = /^sitemap-\d{4}-\d{2}-\d{2}\.xml$/;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse("No autorizado", { status: 401 });

  const file = request.nextUrl.searchParams.get("file") ?? "";
  if (!FILE_NAME.test(file)) return new NextResponse("Archivo inválido", { status: 400 });

  const res = await fetch(`${BACKEND_URL}/api/admin/sitemaps/${file}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return new NextResponse("Archivo no encontrado", { status: res.status === 404 ? 404 : 502 });

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "no-store",
    },
  });
}