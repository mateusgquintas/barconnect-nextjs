'use client';

import React, { useState, useMemo } from 'react';
import { Room } from '@/types/agenda';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomSelectorProps {
  availableRooms: Room[];
  selectedRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  className?: string;
}

export function RoomSelector({
  availableRooms,
  selectedRoomId,
  onSelectRoom,
  className
}: RoomSelectorProps) {
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  // Extract unique values for filters
  const uniqueFloors = useMemo(() => {
    const floors = [...new Set(availableRooms.map(room => room.floor).filter((f): f is number => f !== undefined))].sort((a, b) => a - b);
    return floors;
  }, [availableRooms]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(availableRooms.map(room => room.type).filter((t): t is string => t !== undefined))].sort();
    return types;
  }, [availableRooms]);

  const uniqueCapacities = useMemo(() => {
    const capacities = [...new Set(availableRooms.map(room => room.capacity))].sort((a, b) => a - b);
    return capacities;
  }, [availableRooms]);

  // Apply filters
  const filteredRooms = useMemo(() => {
    return availableRooms.filter(room => {
      if (floorFilter !== 'all' && room.floor !== parseInt(floorFilter)) return false;
      if (typeFilter !== 'all' && room.type !== typeFilter) return false;
      if (capacityFilter !== 'all' && room.capacity !== parseInt(capacityFilter)) return false;
      return true;
    });
  }, [availableRooms, floorFilter, typeFilter, capacityFilter]);

  // Group rooms by floor for better organization
  const roomsByFloor = useMemo(() => {
    const grouped = filteredRooms.reduce((acc, room) => {
      const floor = room.floor ?? 0; // Use 0 for undefined floors
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(room);
      return acc;
    }, {} as Record<number, Room[]>);

    // Sort rooms within each floor by room number
    Object.keys(grouped).forEach(floor => {
      grouped[parseInt(floor)].sort((a, b) => {
        const aNum = String(a.number ?? '');
        const bNum = String(b.number ?? '');
        return aNum.localeCompare(bNum);
      });
    });

    return grouped;
  }, [filteredRooms]);

  const sortedFloors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="floor-filter">Andar</Label>
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger id="floor-filter">
              <SelectValue placeholder="Todos os andares" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os andares</SelectItem>
              {uniqueFloors.map(floor => (
                <SelectItem key={floor} value={floor.toString()}>
                  {floor}º Andar
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type-filter">Tipo</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity-filter">Capacidade</Label>
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger id="capacity-filter">
              <SelectValue placeholder="Todas as capacidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as capacidades</SelectItem>
              {uniqueCapacities.map(capacity => (
                <SelectItem key={capacity} value={capacity.toString()}>
                  {capacity} {capacity === 1 ? 'pessoa' : 'pessoas'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredRooms.length} {filteredRooms.length === 1 ? 'quarto disponível' : 'quartos disponíveis'}
      </div>

      {/* Room cards grouped by floor */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum quarto disponível com os filtros selecionados
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFloors.map(floor => (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {floor}º Andar
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roomsByFloor[floor].map(room => (
                  <Card
                    key={room.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedRoomId === room.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    )}
                    onClick={() => onSelectRoom(room.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Quarto {room.number}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {room.type}
                          </p>
                        </div>
                        {selectedRoomId === room.id && (
                          <div className="rounded-full bg-primary p-1">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}</span>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span>{room.beds || 1} {(room.beds || 1) === 1 ? 'cama' : 'camas'}</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{floor}º andar</span>
                        </Badge>
                      </div>

                      {room.customName && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {room.customName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
