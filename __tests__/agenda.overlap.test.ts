import { hasOverlap } from '@/utils/agenda';

describe('hasOverlap', () => {
  const d = (s: string) => new Date(s);

  it('detects overlapping ranges', () => {
    expect(hasOverlap({ start: d('2025-10-10T10:00:00Z'), end: d('2025-10-10T12:00:00Z') },
                      { start: d('2025-10-10T11:00:00Z'), end: d('2025-10-10T13:00:00Z') })).toBe(true);
  });

  it('treats end as exclusive (touching end/start does not overlap)', () => {
    expect(hasOverlap({ start: d('2025-10-10T10:00:00Z'), end: d('2025-10-10T12:00:00Z') },
                      { start: d('2025-10-10T12:00:00Z'), end: d('2025-10-10T13:00:00Z') })).toBe(false);
  });

  it('handles identical ranges as overlap', () => {
    expect(hasOverlap({ start: d('2025-10-10T10:00:00Z'), end: d('2025-10-10T12:00:00Z') },
                      { start: d('2025-10-10T10:00:00Z'), end: d('2025-10-10T12:00:00Z') })).toBe(true);
  });

  it('returns false for invalid ranges', () => {
    expect(hasOverlap({ start: d('2025-10-10T12:00:00Z'), end: d('2025-10-10T10:00:00Z') },
                      { start: d('2025-10-10T09:00:00Z'), end: d('2025-10-10T11:00:00Z') })).toBe(false);
  });
});
