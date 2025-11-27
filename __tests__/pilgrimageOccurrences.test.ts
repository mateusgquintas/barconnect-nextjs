/**
 * @jest-environment jsdom
 */

import { Pilgrimage, PilgrimageOccurrence } from '@/types';

describe('Pilgrimage Multiple Occurrences', () => {
  describe('Data Structure', () => {
    it('should support pilgrimage with single occurrence', () => {
      const pilgrimage: Pilgrimage = {
        id: '1',
        name: 'Romaria Aparecida',
        busGroup: 'Ônibus 1',
        numberOfPeople: 45,
        contactPhone: '(11) 99999-9999',
        arrivalDate: '2025-12-01',
        departureDate: '2025-12-03',
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '1',
            arrivalDate: '2025-12-01',
            departureDate: '2025-12-03',
            status: 'scheduled'
          }
        ]
      };

      expect(pilgrimage.occurrences).toHaveLength(1);
      expect(pilgrimage.occurrences[0].status).toBe('scheduled');
    });

    it('should support pilgrimage with multiple occurrences', () => {
      const pilgrimage: Pilgrimage = {
        id: '2',
        name: 'Romaria Recorrente',
        busGroup: 'Ônibus 2',
        numberOfPeople: 30,
        contactPhone: '(11) 88888-8888',
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '2',
            arrivalDate: '2025-12-01',
            departureDate: '2025-12-03',
            status: 'scheduled'
          },
          {
            id: 'occ-2',
            pilgrimageId: '2',
            arrivalDate: '2026-01-15',
            departureDate: '2026-01-17',
            status: 'scheduled'
          },
          {
            id: 'occ-3',
            pilgrimageId: '2',
            arrivalDate: '2026-02-20',
            departureDate: '2026-02-22',
            status: 'scheduled'
          }
        ]
      };

      expect(pilgrimage.occurrences).toHaveLength(3);
      expect(pilgrimage.occurrences.every(occ => occ.pilgrimageId === '2')).toBe(true);
    });

    it('should maintain backward compatibility with deprecated fields', () => {
      const pilgrimage: Pilgrimage = {
        id: '3',
        name: 'Legacy Pilgrimage',
        busGroup: 'Ônibus 3',
        numberOfPeople: 25,
        contactPhone: '(11) 77777-7777',
        arrivalDate: '2025-12-10',
        departureDate: '2025-12-12',
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '3',
            arrivalDate: '2025-12-10',
            departureDate: '2025-12-12',
            status: 'scheduled'
          }
        ]
      };

      // Campos deprecated devem estar presentes
      expect(pilgrimage.arrivalDate).toBe('2025-12-10');
      expect(pilgrimage.departureDate).toBe('2025-12-12');
      
      // Mas occurrences é a fonte da verdade
      expect(pilgrimage.occurrences[0].arrivalDate).toBe(pilgrimage.arrivalDate);
    });
  });

  describe('Helper Functions', () => {
    const getPilgrimageDates = (p: Pilgrimage) => {
      const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate || '';
      const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate || '';
      return { arrivalDate, departureDate };
    };

    it('should extract dates from deprecated fields when available', () => {
      const pilgrimage: Pilgrimage = {
        id: '1',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        arrivalDate: '2025-12-01',
        departureDate: '2025-12-03',
        occurrences: []
      };

      const dates = getPilgrimageDates(pilgrimage);
      expect(dates.arrivalDate).toBe('2025-12-01');
      expect(dates.departureDate).toBe('2025-12-03');
    });

    it('should fallback to first occurrence when deprecated fields are missing', () => {
      const pilgrimage: Pilgrimage = {
        id: '2',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '2',
            arrivalDate: '2025-12-05',
            departureDate: '2025-12-07',
            status: 'scheduled'
          }
        ]
      };

      const dates = getPilgrimageDates(pilgrimage);
      expect(dates.arrivalDate).toBe('2025-12-05');
      expect(dates.departureDate).toBe('2025-12-07');
    });

    it('should return empty strings when no dates available', () => {
      const pilgrimage: Pilgrimage = {
        id: '3',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        occurrences: []
      };

      const dates = getPilgrimageDates(pilgrimage);
      expect(dates.arrivalDate).toBe('');
      expect(dates.departureDate).toBe('');
    });
  });

  describe('Occurrence Status', () => {
    it('should identify scheduled occurrences', () => {
      const occurrence: PilgrimageOccurrence = {
        id: 'occ-1',
        pilgrimageId: '1',
        arrivalDate: '2026-06-01',
        departureDate: '2026-06-03',
        status: 'scheduled'
      };

      expect(occurrence.status).toBe('scheduled');
    });

    it('should identify active occurrences', () => {
      const occurrence: PilgrimageOccurrence = {
        id: 'occ-2',
        pilgrimageId: '1',
        arrivalDate: '2025-11-25',
        departureDate: '2025-11-27',
        status: 'active'
      };

      expect(occurrence.status).toBe('active');
    });

    it('should identify completed occurrences', () => {
      const occurrence: PilgrimageOccurrence = {
        id: 'occ-3',
        pilgrimageId: '1',
        arrivalDate: '2025-10-01',
        departureDate: '2025-10-03',
        status: 'completed'
      };

      expect(occurrence.status).toBe('completed');
    });

    it('should identify cancelled occurrences', () => {
      const occurrence: PilgrimageOccurrence = {
        id: 'occ-4',
        pilgrimageId: '1',
        arrivalDate: '2025-11-01',
        departureDate: '2025-11-03',
        status: 'cancelled'
      };

      expect(occurrence.status).toBe('cancelled');
    });
  });

  describe('Sorting by Next Active Occurrence', () => {
    const isOccurrenceActive = (occ: PilgrimageOccurrence) => {
      const today = new Date('2025-11-26');
      const arrival = new Date(occ.arrivalDate);
      const departure = new Date(occ.departureDate);
      return occ.status !== 'cancelled' && occ.status !== 'completed' && arrival <= today && today <= departure;
    };

    const getNextOccurrence = (p: Pilgrimage) => {
      const today = new Date('2025-11-26');
      const active = p.occurrences?.filter(isOccurrenceActive);
      if (active && active.length > 0) return active[0];
      
      const future = p.occurrences
        ?.filter(occ => new Date(occ.arrivalDate) > today && occ.status === 'scheduled')
        .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());
      
      return future?.[0];
    };

    it('should prioritize active occurrences over future ones', () => {
      const pilgrimage: Pilgrimage = {
        id: '1',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '1',
            arrivalDate: '2025-11-25',
            departureDate: '2025-11-27',
            status: 'active'
          },
          {
            id: 'occ-2',
            pilgrimageId: '1',
            arrivalDate: '2025-12-01',
            departureDate: '2025-12-03',
            status: 'scheduled'
          }
        ]
      };

      const next = getNextOccurrence(pilgrimage);
      expect(next?.id).toBe('occ-1');
      expect(next?.status).toBe('active');
    });

    it('should return nearest future occurrence when none are active', () => {
      const pilgrimage: Pilgrimage = {
        id: '2',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '2',
            arrivalDate: '2025-12-15',
            departureDate: '2025-12-17',
            status: 'scheduled'
          },
          {
            id: 'occ-2',
            pilgrimageId: '2',
            arrivalDate: '2025-12-01',
            departureDate: '2025-12-03',
            status: 'scheduled'
          }
        ]
      };

      const next = getNextOccurrence(pilgrimage);
      expect(next?.id).toBe('occ-2');
      expect(next?.arrivalDate).toBe('2025-12-01');
    });

    it('should ignore cancelled and completed occurrences', () => {
      const pilgrimage: Pilgrimage = {
        id: '3',
        name: 'Test',
        busGroup: 'Bus',
        numberOfPeople: 10,
        occurrences: [
          {
            id: 'occ-1',
            pilgrimageId: '3',
            arrivalDate: '2025-10-01',
            departureDate: '2025-10-03',
            status: 'completed'
          },
          {
            id: 'occ-2',
            pilgrimageId: '3',
            arrivalDate: '2025-11-01',
            departureDate: '2025-11-03',
            status: 'cancelled'
          },
          {
            id: 'occ-3',
            pilgrimageId: '3',
            arrivalDate: '2025-12-01',
            departureDate: '2025-12-03',
            status: 'scheduled'
          }
        ]
      };

      const next = getNextOccurrence(pilgrimage);
      expect(next?.id).toBe('occ-3');
      expect(next?.status).toBe('scheduled');
    });
  });

  describe('Date Overlap Detection', () => {
    const hasDateOverlap = (
      range1: { start: Date; end: Date },
      range2: { start: Date; end: Date }
    ) => {
      return range1.start < range2.end && range2.start < range1.end;
    };

    it('should detect overlapping date ranges', () => {
      const range1 = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-05')
      };
      const range2 = {
        start: new Date('2025-12-03'),
        end: new Date('2025-12-07')
      };

      expect(hasDateOverlap(range1, range2)).toBe(true);
    });

    it('should detect non-overlapping date ranges', () => {
      const range1 = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-05')
      };
      const range2 = {
        start: new Date('2025-12-10'),
        end: new Date('2025-12-15')
      };

      expect(hasDateOverlap(range1, range2)).toBe(false);
    });

    it('should detect adjacent non-overlapping ranges', () => {
      const range1 = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-05')
      };
      const range2 = {
        start: new Date('2025-12-05'),
        end: new Date('2025-12-10')
      };

      // Com intervalo [start, end) não deve sobrepor
      expect(hasDateOverlap(range1, range2)).toBe(false);
    });

    it('should detect when one range contains another', () => {
      const range1 = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-10')
      };
      const range2 = {
        start: new Date('2025-12-03'),
        end: new Date('2025-12-07')
      };

      expect(hasDateOverlap(range1, range2)).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate occurrence date range', () => {
      const validateOccurrence = (occ: Omit<PilgrimageOccurrence, 'id' | 'pilgrimageId'>) => {
        if (!occ.arrivalDate || !occ.departureDate) {
          return { valid: false, error: 'Datas são obrigatórias' };
        }
        if (new Date(occ.arrivalDate) >= new Date(occ.departureDate)) {
          return { valid: false, error: 'Data de partida deve ser posterior à chegada' };
        }
        return { valid: true };
      };

      const validOcc = {
        arrivalDate: '2025-12-01',
        departureDate: '2025-12-03',
        status: 'scheduled' as const
      };
      expect(validateOccurrence(validOcc).valid).toBe(true);

      const invalidOcc = {
        arrivalDate: '2025-12-05',
        departureDate: '2025-12-03',
        status: 'scheduled' as const
      };
      expect(validateOccurrence(invalidOcc).valid).toBe(false);
      expect(validateOccurrence(invalidOcc).error).toContain('posterior');
    });

    it('should validate required fields', () => {
      const validateOccurrence = (occ: Partial<PilgrimageOccurrence>) => {
        if (!occ.arrivalDate || !occ.departureDate) {
          return { valid: false, error: 'Datas são obrigatórias' };
        }
        return { valid: true };
      };

      const missingDates = {
        status: 'scheduled' as const
      };
      expect(validateOccurrence(missingDates).valid).toBe(false);
    });
  });
});
