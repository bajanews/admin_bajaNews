import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

const PUBLIC_PATHS = ["/login"];

const TOKEN_COOKIE = "bn_token";
const USER_COOKIE = "bn_user";
const REFRESH_COOKIE = "bn_refresh";

const MARGEN_SEGUNDOS = 120;

const cookieDefaults = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

interface RespuestaRefresh {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  user: { id: number; email: string; name: string; lastName: string; roles: string[] };
}

function tokenPorExpirar(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    if (!exp) return false;
    return exp - Date.now() / 1000 < MARGEN_SEGUNDOS;
  } catch {
    return true;
  }
}

async function renovarSesion(refreshToken: string): Promise<RespuestaRefresh | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as RespuestaRefresh;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth/");
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!isPublic && refreshToken && tokenPorExpirar(token)) {
    const nueva = await renovarSesion(refreshToken);

    if (nueva) {
      const maxAge = Math.max(
        60,
        Math.floor((new Date(nueva.expiresAtUtc).getTime() - Date.now()) / 1000)
      );
      const userJson = JSON.stringify(nueva.user);

      request.cookies.set(TOKEN_COOKIE, nueva.accessToken);
      request.cookies.set(USER_COOKIE, userJson);
      request.cookies.set(REFRESH_COOKIE, nueva.refreshToken);

      const response =
        pathname === "/login"
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next({ request: { headers: request.headers } });

      response.cookies.set(TOKEN_COOKIE, nueva.accessToken, { ...cookieDefaults, maxAge });
      response.cookies.set(USER_COOKIE, userJson, { ...cookieDefaults, maxAge });
      response.cookies.set(REFRESH_COOKIE, nueva.refreshToken, {
        ...cookieDefaults,
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(REFRESH_COOKIE);
      response.cookies.delete(USER_COOKIE);
      return response;
    }
  }

  const hasSession = request.cookies.has(TOKEN_COOKIE);

  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};