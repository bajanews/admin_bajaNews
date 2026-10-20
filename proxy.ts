import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import {
  TOKEN_COOKIE,
  USER_COOKIE,
  REFRESH_COOKIE,
  TODAS_LAS_COOKIES,
  cookieDefaults,
  leerToken,
  tokenVencido,
  idEnCookieUsuario,
} from "@/lib/sesionCookies";

const PUBLIC_PATHS = ["/login"];

const MARGEN_SEGUNDOS = 120;

interface RespuestaRefresh {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  user: { id: number; email: string; name: string; lastName: string; roles: string[] };
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

function borrarSesion(response: NextResponse) {
  for (const nombre of TODAS_LAS_COOKIES) {
    response.cookies.set(nombre, "", { ...cookieDefaults, maxAge: 0, expires: new Date(0) });
  }
  return response;
}

function irAlLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const { pathname } = request.nextUrl;
  if (pathname !== "/" && !pathname.startsWith("/api/")) loginUrl.searchParams.set("from", pathname);
  return borrarSesion(NextResponse.redirect(loginUrl));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const esLogin = PUBLIC_PATHS.includes(pathname);
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const datos = leerToken(token);
  const idUsuarioCookie = idEnCookieUsuario(request.cookies.get(USER_COOKIE)?.value);

  if (datos && idUsuarioCookie !== null && idUsuarioCookie !== datos.userId) {
    return esLogin ? borrarSesion(NextResponse.next()) : irAlLogin(request);
  }

  const sesionValida = Boolean(datos) && !tokenVencido(datos);

  if (esLogin) {
    if (sesionValida) return NextResponse.redirect(new URL("/", request.url));
    return borrarSesion(NextResponse.next());
  }

  if (refreshToken && tokenVencido(datos, MARGEN_SEGUNDOS)) {
    const idRefresh = leerToken(refreshToken)?.userId ?? null;
    const idEsperado = datos?.userId ?? idUsuarioCookie;
    const mismoUsuario = idRefresh !== null && (idEsperado === null || idEsperado === idRefresh);

    const nueva = mismoUsuario ? await renovarSesion(refreshToken) : null;

    if (nueva && nueva.user?.id === idRefresh) {
      const maxAge = Math.max(
        60,
        Math.floor((new Date(nueva.expiresAtUtc).getTime() - Date.now()) / 1000)
      );
      const userJson = JSON.stringify(nueva.user);

      request.cookies.set(TOKEN_COOKIE, nueva.accessToken);
      request.cookies.set(USER_COOKIE, userJson);
      request.cookies.set(REFRESH_COOKIE, nueva.refreshToken);

      const response = NextResponse.next({ request: { headers: request.headers } });

      response.cookies.set(TOKEN_COOKIE, nueva.accessToken, { ...cookieDefaults, maxAge });
      response.cookies.set(USER_COOKIE, userJson, { ...cookieDefaults, maxAge });
      response.cookies.set(REFRESH_COOKIE, nueva.refreshToken, {
        ...cookieDefaults,
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  }

  if (!sesionValida) return irAlLogin(request);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};