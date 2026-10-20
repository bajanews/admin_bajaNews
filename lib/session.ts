import "server-only";
import { cookies } from "next/headers";
import {
  TOKEN_COOKIE,
  USER_COOKIE,
  REFRESH_COOKIE,
  TODAS_LAS_COOKIES,
  cookieDefaults,
  leerToken,
  tokenVencido,
} from "@/lib/sesionCookies";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  lastName: string;
  roles: string[];
}

export interface Session {
  accessToken: string;
  user: SessionUser;
}

export async function createSession(params: {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: SessionUser;
}) {
  const store = await cookies();
  const secondsUntilExpiry = Math.floor(
    (new Date(params.expiresAtUtc).getTime() - Date.now()) / 1000
  );
  const maxAge = Math.max(60, secondsUntilExpiry);

  store.set(TOKEN_COOKIE, params.accessToken, { ...cookieDefaults, maxAge });
  store.set(USER_COOKIE, JSON.stringify(params.user), { ...cookieDefaults, maxAge });
  store.set(REFRESH_COOKIE, params.refreshToken, {
    ...cookieDefaults,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  for (const nombre of TODAS_LAS_COOKIES) {
    store.set(nombre, "", { ...cookieDefaults, maxAge: 0, expires: new Date(0) });
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const datos = leerToken(token);
  if (!token || !datos || tokenVencido(datos)) return null;

  let name = "";
  let lastName = "";
  try {
    const guardado = JSON.parse(store.get(USER_COOKIE)?.value ?? "null") as Partial<SessionUser> | null;
    if (guardado && Number(guardado.id) === datos.userId) {
      name = guardado.name ?? "";
      lastName = guardado.lastName ?? "";
    }
  } catch {
    
  }

  return {
    accessToken: token,
    user: { id: datos.userId, email: datos.email, name, lastName, roles: datos.roles },
  };
}