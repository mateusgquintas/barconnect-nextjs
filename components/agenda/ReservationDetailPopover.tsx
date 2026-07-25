'use client'

import { useState } from 'react';
import { MoreHorizontal, Users, Calendar, BedDouble, DollarSign, Bus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';

export interface ReservationDetail {
  id: string;
  title: string;
  statusLabel: string;
  statusColor: 'green' | 'blue' | 'amber' | 'red' | 'gray';
  pilgrimageName?: string | null;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople?: number | null;
  totalValue?: number | null;
  openAmount?: number | null;
  roomLabels: string[];
}

const STATUS_TAG_STYLE: Record<ReservationDetail['statusColor'], string> = {
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-200 text-slate-600',
};

function formatDateExtenso(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

interface Props {
  children: React.ReactNode;
  detail: ReservationDetail;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function ReservationDetailPopover({ children, detail, onEdit, onCancel }: Props) {
  const [open, setOpen] = useState(false);
  const nights = nightsBetween(detail.checkInDate, detail.checkOutDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_TAG_STYLE[detail.statusColor]}`}>
              {detail.statusLabel}
            </span>
            {(onEdit || onCancel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mt-1 -mr-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && <DropdownMenuItem onClick={() => { setOpen(false); onEdit(); }}>Editar</DropdownMenuItem>}
                  {onCancel && <DropdownMenuItem onClick={() => { setOpen(false); onCancel(); }} className="text-red-600">Cancelar reserva</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">{detail.title}</h3>
            <p className="text-sm text-slate-500">{formatDateExtenso(detail.checkInDate)} — check-in</p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" />Hóspedes</p>
                <p className="text-slate-900">{detail.numberOfPeople ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><BedDouble className="w-3 h-3" />Diárias</p>
                <p className="text-slate-900">{nights}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Check-in</p>
                <p className="text-slate-900">{detail.checkInDate.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Check-out</p>
                <p className="text-slate-900">{detail.checkOutDate.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" />Valor total</p>
                <p className="text-slate-900">{detail.totalValue != null ? formatCurrency(detail.totalValue) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" />Em aberto</p>
                <p className="text-slate-900">{detail.openAmount != null ? formatCurrency(detail.openAmount) : (detail.totalValue != null ? formatCurrency(detail.totalValue) : '—')}</p>
              </div>
            </div>
            {detail.pilgrimageName && (
              <div className="pt-1">
                <p className="text-xs text-slate-400 flex items-center gap-1"><Bus className="w-3 h-3" />Grupo</p>
                <p className="text-slate-900 text-sm">{detail.pilgrimageName}</p>
              </div>
            )}
            <div className="pt-1">
              <p className="text-xs text-slate-400">Quarto(s)</p>
              <p className="text-slate-900 text-sm">{detail.roomLabels.join(', ') || '—'}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
