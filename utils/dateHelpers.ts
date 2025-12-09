/**
 * Utilitários para manipulação de datas sem problemas de timezone
 * Todas as datas são tratadas como YYYY-MM-DD em horário local
 */

/**
 * Converte string YYYY-MM-DD para Date em horário local (12:00)
 * Evita problemas de timezone ao criar Date objects
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // 12:00 local
}

/**
 * Formata Date para string YYYY-MM-DD
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Subtrai N dias de uma data YYYY-MM-DD
 * Retorna nova string YYYY-MM-DD
 */
export function subtractDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() - days);
  return formatLocalDate(date);
}

/**
 * Adiciona N dias a uma data YYYY-MM-DD
 * Retorna nova string YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Compara duas datas YYYY-MM-DD
 * Retorna: -1 se d1 < d2, 0 se iguais, 1 se d1 > d2
 */
export function compareDates(d1: string, d2: string): number {
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Verifica se duas datas YYYY-MM-DD são iguais
 */
export function isSameDate(d1: string, d2: string): boolean {
  return d1 === d2;
}

/**
 * Formata data para exibição em português (dd/mm/aaaa)
 */
export function formatBrazilianDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Formata data e hora para exibição em português (dd/mm/aaaa HH:mm)
 */
export function formatBrazilianDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
