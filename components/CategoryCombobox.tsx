'use client'
import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Tags } from 'lucide-react';
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

interface CategoryComboboxProps {
  categories: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function CategoryCombobox({ categories, value, onValueChange, placeholder = 'Selecione ou crie uma categoria', disabled = false, id }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const searchTrimmed = search.trim();
  const showCreateOption = searchTrimmed.length > 0 && !categories.some(c => c.toLowerCase() === searchTrimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(''); }}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-11 justify-between font-semibold text-base border-2 border-slate-300"
        >
          <span className={cn('flex items-center gap-2 truncate', !value && 'text-slate-400 font-normal')}>
            <Tags className="h-4 w-4 shrink-0 text-purple-600" />
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar ou criar categoria..." value={search} onValueChange={setSearch} />
          <CommandList>
            {filtered.length === 0 && !showCreateOption && (
              <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map(cat => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={() => {
                    onValueChange(cat === value ? '' : cat);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === cat ? 'opacity-100' : 'opacity-0')} />
                  {cat}
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem
                  value={`__create__${searchTrimmed}`}
                  onSelect={() => {
                    onValueChange(searchTrimmed);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar categoria "{searchTrimmed}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
