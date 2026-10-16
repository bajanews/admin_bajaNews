import { NextResponse } from "next/server";
import { adminFetch, AdminApiError } from "@/lib/adminApi";

const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL ?? "http://localhost:5000";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    const data = await adminFetch<{ url: string }>("/api/admin/uploads/image", {
      method: "POST",
      body: formData,
    });
    
    return NextResponse.json({ url: `${ASSET_URL}${data.url}` });
  } catch (err) {
    const message = err instanceof AdminApiError ? err.message : "No se pudo subir la imagen";
    const status = err instanceof AdminApiError ? err.status : 500;
    return NextResponse.json({ error: { message } }, { status });
  }
}