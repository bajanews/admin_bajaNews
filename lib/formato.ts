const ZONA = "America/Tijuana";

const formatoPartes = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

interface Partes {
  anio: string;
  mes: string;
  dia: string;
  hora: string;
  minuto: string;
  segundo: string;
  zona: string; // "PDT" o "PST"
}

function partesTijuana(fecha: Date): Partes {
  const p = formatoPartes.formatToParts(fecha);
  const v = (tipo: Intl.DateTimeFormatPartTypes) => p.find((x) => x.type === tipo)?.value ?? "";
  return {
    anio: v("year"),
    mes: v("month"),
    dia: v("day"),
    hora: v("hour"),
    minuto: v("minute"),
    segundo: v("second"),
    zona: v("timeZoneName"),
  };
}

function desfaseTijuana(instante: number): number {
  const p = partesTijuana(new Date(instante));
  const comoUtc = Date.UTC(+p.anio, +p.mes - 1, +p.dia, +p.hora, +p.minuto, +p.segundo);
  return Math.round((comoUtc - Math.floor(instante / 1000) * 1000) / 60000);
}

export function aFecha(valor: string): Date {
  if (!valor) return new Date(NaN);
  if (/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(valor.trim())) return new Date(valor);

  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return new Date(valor);

  const [, a, mes, d, h = "0", mi = "0", s = "0"] = m;
  const relojComoUtc = Date.UTC(+a, +mes - 1, +d, +h, +mi, +s);
  let instante = relojComoUtc - desfaseTijuana(relojComoUtc) * 60000;
  instante = relojComoUtc - desfaseTijuana(instante) * 60000;
  return new Date(instante);
}

export function fechaCorta(fechaIso: string): string {
  const d = aFecha(fechaIso);
  if (isNaN(d.getTime())) return "";
  const p = partesTijuana(d);
  return `${p.dia}-${p.mes}-${p.anio}`;
}

export function fechaLarga(fechaIso: string | null | undefined): string {
  if (!fechaIso) return "";
  const d = aFecha(fechaIso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fechaCompleta(fechaIso: string): string {
  const d = aFecha(fechaIso);
  if (isNaN(d.getTime())) return "";
  const p = partesTijuana(d);
  return `${p.dia}-${p.mes}-${p.anio} ${p.hora}:${p.minuto}:${p.segundo} ${p.zona}`;
}

export function truncar(texto: string, n: number, agregarSufijo = false): string {
  if (texto.length <= n) return texto;
  return texto.slice(0, n) + (agregarSufijo ? " .." : "");
}

export function tiempoRelativo(fechaIso: string): string {
  const fecha = aFecha(fechaIso);
  if (isNaN(fecha.getTime())) return "";
  const diffMs = Date.now() - fecha.getTime();
  const diffMinutos = Math.floor(diffMs / 60000);

  if (diffMinutos < 1) return "hace un momento";
  if (diffMinutos < 60) return `hace ${diffMinutos} minuto${diffMinutos === 1 ? "" : "s"}`;

  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `hace ${diffHoras} hora${diffHoras === 1 ? "" : "s"}`;

  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias < 30) return `hace ${diffDias} día${diffDias === 1 ? "" : "s"}`;

  return fecha.toLocaleDateString("es-MX", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
