import { HotelRooms } from './HotelRooms';
import { HotelPilgrimages } from './HotelPilgrimages';

export type HotelView = 'rooms' | 'pilgrimages';

interface HotelProps {
  activeView: HotelView;
}

export function Hotel({ activeView }: HotelProps) {
  switch (activeView) {
    case 'pilgrimages':
      return <HotelPilgrimages />;
    case 'rooms':
    default:
      return <HotelRooms />;
  }
}
