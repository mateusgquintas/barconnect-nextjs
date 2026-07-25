export interface RangeLike {
  start: Date;
  end: Date;
}

// Policy: [start, end) — inclusive start, exclusive end
export function hasOverlap(a: RangeLike, b: RangeLike): boolean {
  const aStart = a.start.getTime();
  const aEnd = a.end.getTime();
  const bStart = b.start.getTime();
  const bEnd = b.end.getTime();
  if (!(aStart < aEnd) || !(bStart < bEnd)) return false; // invalid ranges don't overlap
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Verifica se um quarto está ocupado em uma data específica
 * 
 * LÓGICA [start, end) - Semi-aberto:
 * - Check-in INCLUSO: quarto ocupado a partir do check-in (>= check_in)
 * - Check-out EXCLUSO: quarto liberado no dia do check-out (< check_out)
 * 
 * Exemplo:
 * - Check-in: 2025-12-10, Check-out: 2025-12-12
 * - Ocupado em: 10/12 ✓, 11/12 ✓
 * - Livre em: 12/12 ✓ (dia do checkout, já liberado)
 * 
 * @param checkInDate String no formato YYYY-MM-DD ou ISO datetime
 * @param checkOutDate String no formato YYYY-MM-DD ou ISO datetime
 * @param targetDate String no formato YYYY-MM-DD
 * @returns true se o quarto está ocupado na data alvo
 */
export function isRoomOccupiedOnDate(
  checkInDate: string,
  checkOutDate: string,
  targetDate: string
): boolean {
  // Normalizar todas as datas para YYYY-MM-DD (primeiros 10 caracteres)
  const checkIn = checkInDate.slice(0, 10);
  const checkOut = checkOutDate.slice(0, 10);
  const target = targetDate.slice(0, 10);
  
  // Lógica [start, end): check_in <= target < check_out
  return checkIn <= target && checkOut > target;
}

export function clampToDay(date: Date): Date {
  const d = new Date(date); d.setHours(0,0,0,0); return d;
}

/**
 * Retorna a data local (YYYY-MM-DD) de um Date, sem conversão para UTC.
 * Usar SEMPRE que precisar do "dia de hoje" no fuso local — `date.toISOString().slice(0,10)`
 * converte para UTC primeiro, o que pode retornar o dia errado dependendo do horário/fuso
 * (ex: 23h de um dia no Brasil já é o dia seguinte em UTC).
 */
export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
