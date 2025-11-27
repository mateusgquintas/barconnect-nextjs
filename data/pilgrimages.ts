import { Pilgrimage } from '@/types';

export const pilgrimages: Pilgrimage[] = [
  {
    id: '1',
    name: 'Romaria Aparecida 2025',
    arrivalDate: '2025-10-12',
    departureDate: '2025-10-15',
    numberOfPeople: 45,
    busGroup: 'Ônibus 1 - Aparecida',
    occurrences: [
      {
        id: '1-occ-1',
        pilgrimageId: '1',
        arrivalDate: '2025-10-12',
        departureDate: '2025-10-15',
        status: 'scheduled'
      }
    ]
  },
  {
    id: '2',
    name: 'Grupo Nossa Senhora',
    arrivalDate: '2025-10-20',
    departureDate: '2025-10-22',
    numberOfPeople: 30,
    busGroup: 'Ônibus 2 - São Paulo',
    occurrences: [
      {
        id: '2-occ-1',
        pilgrimageId: '2',
        arrivalDate: '2025-10-20',
        departureDate: '2025-10-22',
        status: 'scheduled'
      }
    ]
  },
  {
    id: '3',
    name: 'Romaria São Paulo',
    arrivalDate: '2025-11-05',
    departureDate: '2025-11-08',
    numberOfPeople: 38,
    busGroup: 'Ônibus 3 - Capital',
    occurrences: [
      {
        id: '3-occ-1',
        pilgrimageId: '3',
        arrivalDate: '2025-11-05',
        departureDate: '2025-11-08',
        status: 'scheduled'
      }
    ]
  },
  {
    id: '4',
    name: 'Peregrinação Santos',
    arrivalDate: '2025-11-15',
    departureDate: '2025-11-17',
    numberOfPeople: 52,
    busGroup: 'Ônibus 4 - Litoral',
    occurrences: [
      {
        id: '4-occ-1',
        pilgrimageId: '4',
        arrivalDate: '2025-11-15',
        departureDate: '2025-11-17',
        status: 'scheduled'
      }
    ]
  },
  {
    id: '5',
    name: 'Grupo Fátima',
    arrivalDate: '2025-12-01',
    departureDate: '2025-12-03',
    numberOfPeople: 28,
    busGroup: 'Ônibus 5 - Interior',
    occurrences: [
      {
        id: '5-occ-1',
        pilgrimageId: '5',
        arrivalDate: '2025-12-01',
        departureDate: '2025-12-03',
        status: 'scheduled'
      }
    ]
  }
];