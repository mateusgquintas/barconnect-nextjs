'use client'

import { useState } from 'react';
import {
  Receipt,
  Calendar,
  Package,
  TrendingUpDown,
  ShoppingBag,
  LogOut,
  Hotel as HotelIcon,
  ChevronDown,
  Bed,
  Users,
  LayoutGrid,
  Wallet,
  BarChart3,
  ClipboardList,
  UserSquare2,
  LayoutDashboard,
  LineChart,
} from 'lucide-react';
import { UserRole } from '@/types/user';
import { usePermissions } from '@/hooks/usePermissions';

export type PageView = 'pdv' | 'dashboard' | 'dashboard-geral' | 'hotel' | 'hotel-agenda' | 'hotel-pilgrimages' | 'inventory' | 'transactions' | 'controladoria-financeira' | 'faturamento-canal' | 'financial-reports' | 'sops' | 'team';

interface SidebarProps {
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  dashboardView: 'bar' | 'controladoria';
  onDashboardViewChange: (view: 'bar' | 'controladoria') => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ currentView, onViewChange, dashboardView, onDashboardViewChange, userRole, userName, onLogout }: SidebarProps) {
  const permissions = usePermissions();

  const getUserInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const isHotelActive = currentView === 'hotel' || currentView === 'hotel-agenda' || currentView === 'hotel-pilgrimages';
  const isFinanceActive = currentView === 'transactions' || currentView === 'dashboard' || currentView === 'controladoria-financeira' || currentView === 'faturamento-canal' || currentView === 'financial-reports';

  const [hotelOpen, setHotelOpen] = useState(isHotelActive);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive);

  const navGroupButtonClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors font-medium text-sm ${
      active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  const subItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 pl-11 pr-3.5 py-2 rounded-lg transition-colors text-sm ${
      active ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <button
        onClick={() => onViewChange('pdv')}
        className="flex items-center gap-3 px-5 py-5 hover:opacity-80 transition-opacity shrink-0"
        aria-label="Voltar para página inicial"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-base font-bold text-white tracking-tight leading-tight">HotelConnect</h1>
          <p className="text-slate-400 text-[11px] font-medium">Gestão Hoteleira</p>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {permissions.hotel && (
          <button
            onClick={() => onViewChange('dashboard-geral')}
            className={navGroupButtonClass(currentView === 'dashboard-geral')}
            aria-label="Navegar para Dashboard Geral"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </button>
        )}

        {permissions.pdv && (
          <button
            onClick={() => onViewChange('pdv')}
            className={navGroupButtonClass(currentView === 'pdv')}
            aria-label="Navegar para PDV"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            PDV
          </button>
        )}

        {permissions.estoque && (
          <button
            onClick={() => onViewChange('inventory')}
            className={navGroupButtonClass(currentView === 'inventory')}
            aria-label="Navegar para Estoque"
          >
            <Package className="w-4.5 h-4.5" />
            Estoque
          </button>
        )}

        <button
          onClick={() => onViewChange('sops')}
          className={navGroupButtonClass(currentView === 'sops')}
          aria-label="Navegar para Processos"
        >
          <ClipboardList className="w-4.5 h-4.5" />
          Processos (SOPs)
        </button>

        {permissions.hotel && (
          <div>
            <button
              onClick={() => setHotelOpen(o => !o)}
              className={navGroupButtonClass(isHotelActive)}
              aria-label="Menu Hotel"
              aria-expanded={hotelOpen}
            >
              <HotelIcon className="w-4.5 h-4.5" />
              <span className="flex-1 text-left">Hotel</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${hotelOpen ? 'rotate-180' : ''}`} />
            </button>
            {hotelOpen && (
              <div className="mt-1 space-y-0.5">
                <button onClick={() => onViewChange('hotel-agenda')} className={subItemClass(currentView === 'hotel-agenda')}>
                  <Calendar className="w-3.5 h-3.5" />
                  Agenda do Hotel
                </button>
                <button onClick={() => onViewChange('hotel')} className={subItemClass(currentView === 'hotel')}>
                  <Bed className="w-3.5 h-3.5" />
                  Gestão de Quartos
                </button>
                <button onClick={() => onViewChange('hotel-pilgrimages')} className={subItemClass(currentView === 'hotel-pilgrimages')}>
                  <Users className="w-3.5 h-3.5" />
                  Gestão de Romarias
                </button>
              </div>
            )}
          </div>
        )}

        {permissions.financeiro && (
          <div>
            <button
              onClick={() => setFinanceOpen(o => !o)}
              className={navGroupButtonClass(isFinanceActive)}
              aria-label="Menu Financeiro"
              aria-expanded={financeOpen}
            >
              <TrendingUpDown className="w-4.5 h-4.5" />
              <span className="flex-1 text-left">Financeiro</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${financeOpen ? 'rotate-180' : ''}`} />
            </button>
            {financeOpen && (
              <div className="mt-1 space-y-0.5">
                <button onClick={() => onViewChange('controladoria-financeira')} className={subItemClass(currentView === 'controladoria-financeira')}>
                  <Wallet className="w-3.5 h-3.5" />
                  Controladoria Financeira
                </button>
                <button onClick={() => onViewChange('transactions')} className={subItemClass(currentView === 'transactions')}>
                  <TrendingUpDown className="w-3.5 h-3.5" />
                  Fluxo de Caixa
                </button>
                <button onClick={() => onViewChange('faturamento-canal')} className={subItemClass(currentView === 'faturamento-canal')}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  Faturamento por Canal
                </button>
                <button onClick={() => onViewChange('financial-reports')} className={subItemClass(currentView === 'financial-reports')}>
                  <LineChart className="w-3.5 h-3.5" />
                  Gráficos e Relatórios
                </button>
                <button
                  onClick={() => { onViewChange('dashboard'); onDashboardViewChange('bar'); }}
                  className={subItemClass(currentView === 'dashboard' && dashboardView === 'bar')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Dashboard Bar
                </button>
              </div>
            )}
          </div>
        )}

        {permissions.financeiro && (
          <button
            onClick={() => onViewChange('team')}
            className={navGroupButtonClass(currentView === 'team')}
            aria-label="Navegar para Equipe"
          >
            <UserSquare2 className="w-4.5 h-4.5" />
            Equipe
          </button>
        )}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md font-semibold text-white text-sm shrink-0">
            {getUserInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">{userRole === 'admin' ? 'Administrador' : 'Operador'}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            aria-label="Sair da conta"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
