export const TOKEN_COOKIE = "bn_token";
export const USER_COOKIE = "bn_user";
export const REFRESH_COOKIE = "bn_refresh";
export const TODAS_LAS_COOKIES = [TOKEN_COOKIE, USER_COOKIE, REFRESH_COOKIE];

export const cookieDefaults = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export interface DatosToken {
  userId: number;
  email: string;
  roles: string[];
  exp: number | null;
}

const CLAIM_NAMEID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function leerToken(token: string | undefined | null): DatosToken | null {
  if (!token) return null;
  try {
    const parte = token.split(".")[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const conRelleno = base64 + "===".slice((base64.length + 3) % 4);
    const json = JSON.parse(atob(conRelleno)) as Record<string, unknown>;

    const userId = Number(json.sub ?? json.nameid ?? json[CLAIM_NAMEID]);
    if (!Number.isFinite(userId) || userId <= 0) return null;

    const rolesCrudos = json.role ?? json.roles ?? json[CLAIM_ROLE] ?? [];
    const roles = (Array.isArray(rolesCrudos) ? rolesCrudos : [rolesCrudos]).map(String);

    return {
      userId,
      email: String(json.email ?? json[CLAIM_EMAIL] ?? ""),
      roles,
      exp: typeof json.exp === "number" ? json.exp : null,
    };
  } catch {
    return null;
  }
}

export function tokenVencido(datos: DatosToken | null, margenSegundos = 0): boolean {
  if (!datos) return true;
  if (datos.exp === null) return false;
  return datos.exp - Date.now() / 1000 < margenSegundos;
}

export function idEnCookieUsuario(valor: string | undefined | null): number | null {
  if (!valor) return null;
  try {
    const id = Number((JSON.parse(valor) as { id?: unknown }).id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}