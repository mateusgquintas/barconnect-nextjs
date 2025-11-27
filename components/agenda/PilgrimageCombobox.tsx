'use client'
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Pilgrimage } from '@/types';

interface PilgrimageComboboxProps {
  pilgrimages: Pilgrimage[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PilgrimageCombobox({
  pilgrimages,
  value,
  onValueChange,
  placeholder = "Selecione a romaria...",
  disabled = false,
}: PilgrimageComboboxProps) {
  const [open, setOpen] = useState(false);

  // Ordenar romarias: ativas primeiro, depois futuras, depois finalizadas
  const sortedPilgrimages = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalizar para comparação de datas

    return [...pilgrimages].sort((a, b) => {
      // Verificar se alguma occurrence está ativa
      const aHasActiveOccurrence = a.occurrences?.some(occ => {
        const start = new Date(occ.arrivalDate);
        const end = new Date(occ.departureDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= now && end >= now;
      }) ?? false;

      const bHasActiveOccurrence = b.occurrences?.some(occ => {
        const start = new Date(occ.arrivalDate);
        const end = new Date(occ.departureDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= now && end >= now;
      }) ?? false;

      // 1. Romarias com occurrence ativa primeiro
      if (aHasActiveOccurrence && !bHasActiveOccurrence) return -1;
      if (!aHasActiveOccurrence && bHasActiveOccurrence) return 1;

      // 2. Depois, romarias com occurrences futuras
      const aNextOccurrence = a.occurrences
        ?.filter(occ => new Date(occ.arrivalDate) > now)
        .sort((x, y) => new Date(x.arrivalDate).getTime() - new Date(y.arrivalDate).getTime())[0];

      const bNextOccurrence = b.occurrences
        ?.filter(occ => new Date(occ.arrivalDate) > now)
        .sort((x, y) => new Date(x.arrivalDate).getTime() - new Date(y.arrivalDate).getTime())[0];

      if (aNextOccurrence && !bNextOccurrence) return -1;
      if (!aNextOccurrence && bNextOccurrence) return 1;

      // 3. Se ambas têm próximas occurrences, ordenar pela mais próxima
      if (aNextOccurrence && bNextOccurrence) {
        return new Date(aNextOccurrence.arrivalDate).getTime() - new Date(bNextOccurrence.arrivalDate).getTime();
      }

      // 4. Por fim, ordem alfabética
      return a.name.localeCompare(b.name);
    });
  }, [pilgrimages]);

  const selectedPilgrimage = pilgrimages.find((p) => p.id === value);

  // Pegar próxima occurrence ou primeira para exibir
  const getDisplayOccurrence = (pilgrimage: Pilgrimage) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Tentar pegar occurrence ativa
    const activeOcc = pilgrimage.occurrences?.find(occ => {
      const start = new Date(occ.arrivalDate);
      const end = new Date(occ.departureDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return start <= now && end >= now;
    });
    if (activeOcc) return activeOcc;

    // Ou próxima occurrence futura
    const futureOcc = pilgrimage.occurrences
      ?.filter(occ => new Date(occ.arrivalDate) > now)
      .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime())[0];
    if (futureOcc) return futureOcc;

    // Ou última occurrence passada
    const pastOcc = pilgrimage.occurrences
      ?.filter(occ => new Date(occ.departureDate) < now)
      .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())[0];
    if (pastOcc) return pastOcc;

    // Fallback: primeira occurrence ou valores deprecated
    return pilgrimage.occurrences?.[0] || {
      arrivalDate: pilgrimage.arrivalDate || '',
      departureDate: pilgrimage.departureDate || '',
    };
  };

  const selectedOccurrence = selectedPilgrimage ? getDisplayOccurrence(selectedPilgrimage) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedPilgrimage && selectedOccurrence ? (
            <span className="flex items-center gap-2 truncate">
              <Calendar className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{selectedPilgrimage.name}</span>
              {selectedOccurrence.arrivalDate && selectedOccurrence.departureDate && (
                <span className="text-xs text-muted-foreground shrink-0">
                  ({new Date(selectedOccurrence.arrivalDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - 
                   {new Date(selectedOccurrence.departureDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                  {selectedPilgrimage.occurrences && selectedPilgrimage.occurrences.length > 1 && (
                    <span className="ml-1 text-blue-600">+{selectedPilgrimage.occurrences.length - 1}</span>
                  )}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar romaria..." />
          <CommandList>
            <CommandEmpty>Nenhuma romaria encontrada.</CommandEmpty>
            <CommandGroup>
              {sortedPilgrimages.map((pilgrimage) => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                // Verificar status baseado em occurrences
                const hasActiveOccurrence = pilgrimage.occurrences?.some(occ => {
                  const start = new Date(occ.arrivalDate);
                  const end = new Date(occ.departureDate);
                  start.setHours(0, 0, 0, 0);
                  end.setHours(0, 0, 0, 0);
                  return start <= now && end >= now;
                }) ?? false;

                const hasFutureOccurrence = pilgrimage.occurrences?.some(occ => 
                  new Date(occ.arrivalDate) > now
                ) ?? false;

                const allPast = pilgrimage.occurrences?.every(occ => 
                  new Date(occ.departureDate) < now
                ) ?? false;

                const displayOccurrence = getDisplayOccurrence(pilgrimage);
                const occurrencesCount = pilgrimage.occurrences?.length || 0;

                return (
                  <CommandItem
                    key={pilgrimage.id}
                    value={`${pilgrimage.name} ${pilgrimage.occurrences?.map(o => `${o.arrivalDate} ${o.departureDate}`).join(' ')}`}
                    onSelect={() => {
                      onValueChange(pilgrimage.id === value ? '' : pilgrimage.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === pilgrimage.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{pilgrimage.name}</span>
                        {hasActiveOccurrence && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
                            🟢 ATIVA
                          </span>
                        )}
                        {!hasActiveOccurrence && hasFutureOccurrence && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                            🔵 FUTURA
                          </span>
                        )}
                        {allPast && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                            ⚪ FINALIZADA
                          </span>
                        )}
                        {occurrencesCount > 1 && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">
                            {occurrencesCount}x datas
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {displayOccurrence.arrivalDate && displayOccurrence.departureDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(displayOccurrence.arrivalDate).toLocaleDateString('pt-BR')} - 
                            {new Date(displayOccurrence.departureDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {pilgrimage.numberOfPeople && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {pilgrimage.numberOfPeople} pessoas
                          </span>
                        )}
                      </div>
                      {occurrencesCount > 1 && (
                        <div className="text-[10px] text-muted-foreground">
                          {occurrencesCount} datas agendadas
                        </div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
