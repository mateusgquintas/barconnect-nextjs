'use client'
import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react';
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

interface PilgrimageNameComboboxProps {
  pilgrimages: Pilgrimage[];
  value: string;
  onValueChange: (name: string, matched: Pilgrimage | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PilgrimageNameCombobox({ pilgrimages, value, onValueChange, placeholder = 'Digite o nome da romaria (opcional)...', disabled = false }: PilgrimageNameComboboxProps) {
  const [open, setOpen] = useState(false);

  const search = value.trim().toLowerCase();
  const filtered = search
    ? pilgrimages.filter(p => p.name.toLowerCase().includes(search))
    : pilgrimages;

  const exactMatch = pilgrimages.find(p => p.name.trim().toLowerCase() === search);
  const showCreateOption = search.length > 0 && !exactMatch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar ou digitar nome novo..."
            value={value}
            onValueChange={(text) => {
              const matched = pilgrimages.find(p => p.name.trim().toLowerCase() === text.trim().toLowerCase());
              onValueChange(text, matched || null);
            }}
          />
          <CommandList>
            {filtered.length === 0 && !showCreateOption && (
              <CommandEmpty>Nenhuma romaria encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map(p => {
                const occCount = p.occurrences?.length || 0;
                return (
                  <CommandItem
                    key={p.id}
                    value={p.id}
                    onSelect={() => {
                      onValueChange(p.name, p);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === p.name ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate">{p.name}</span>
                      {occCount > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> veio {occCount}x
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
              {showCreateOption && (
                <CommandItem
                  value={`__create__${value}`}
                  onSelect={() => {
                    onValueChange(value.trim(), null);
                    setOpen(false);
                  }}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar nova romaria "{value.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
