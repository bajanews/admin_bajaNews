import { NextRequest, NextResponse } from "next/server";
import { TODAS_LAS_COOKIES, cookieDefaults } from "@/lib/sesionCookies";

function limpiar(response: NextResponse) {
  for (const nombre of TODAS_LAS_COOKIES) {
    response.cookies.set(nombre, "", { ...cookieDefaults, maxAge: 0, expires: new Date(0) });
  }
  response.headers.set("Clear-Site-Data", '"cookies", "storage"');
  response.headers.set("Cache-Control", "no-store, private");
  return response;
}

export async function GET(request: NextRequest) {
  return limpiar(NextResponse.redirect(new URL("/login", request.url), 303));
}

export async function POST() {
  return limpiar(NextResponse.json({ ok: true }));
}