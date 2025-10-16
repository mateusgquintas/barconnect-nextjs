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

export function clampToDay(date: Date): Date {
  const d = new Date(date); d.setHours(0,0,0,0); return d;
}
