'use client'

import { Receipt, ShoppingCart, Plus, LayoutDashboard, Package, TrendingUpDown, ShoppingBag, LogOut, User as UserIcon, Hotel as HotelIcon, ChevronDown, Zap, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserRole } from '@/types/user';
import { usePermissions } from '@/hooks/usePermissions';

export type PageView = 'pdv' | 'dashboard' | 'hotel' | 'hotel-agenda' | 'hotel-pilgrimages' | 'inventory' | 'transactions';

interface HeaderProps {
  onNewComanda: () => void;
  onDirectSale: () => void;
  onQuickComanda?: () => void;
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  dashboardView: 'bar' | 'controladoria';
  onDashboardViewChange: (view: 'bar' | 'controladoria') => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  onCreateUser?: () => void;
}

export function Header({ onNewComanda, onDirectSale, onQuickComanda, currentView, onViewChange, dashboardView, onDashboardViewChange, userRole, userName, onLogout, onCreateUser }: HeaderProps) {
  const permissions = usePermissions();
  
  const allNavItems = [
    { id: 'pdv' as PageView, label: 'PDV', icon: ShoppingBag, permission: 'pdv' as const },
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' as const },
    { id: 'hotel' as PageView, label: 'Hotel', icon: HotelIcon, permission: 'hotel' as const },
    { id: 'inventory' as PageView, label: 'Estoque', icon: Package, permission: 'estoque' as const },
    { id: 'transactions' as PageView, label: 'Financeiro', icon: TrendingUpDown, permission: 'financeiro' as const },
  ];

  const navItems = allNavItems.filter(item => permissions[item.permission]);

  return (
    <header className="h-16 bg-slate-900 text-white px-6 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white">ERP Hotelaria</h1>
            <p className="text-slate-400 text-sm">Sistema de Gestão</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Dashboard com dropdown
            if (item.id === 'dashboard') {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="bg-slate-900 border-slate-700 text-white min-w-[200px]"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        onViewChange('dashboard');
                        onDashboardViewChange('bar');
                      }}
                      className={`cursor-pointer ${
                        dashboardView === 'bar'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Bar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onViewChange('dashboard');
                        onDashboardViewChange('controladoria');
                      }}
                      className={`cursor-pointer ${
                        dashboardView === 'controladoria'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Controladoria
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            // Hotel com dropdown customizado
            if (item.id === 'hotel') {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="bg-slate-900 border-slate-700 text-white min-w-[200px]"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel-agenda')}
                      className={`cursor-pointer ${
                        currentView === 'hotel-agenda'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span role="img" aria-label="Agenda" className="mr-1">🗓️</span> Agenda do Hotel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel')}
                      className={`cursor-pointer ${
                        currentView === 'hotel'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Gestão de Quartos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel-pilgrimages')}
                      className={`cursor-pointer ${
                        currentView === 'hotel-pilgrimages'
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Gestão de Romarias
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Outros itens normais
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {userRole === 'admin' && onCreateUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateUser}
            className="text-white border-white/20 hover:bg-white/10 hover:text-white flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Usuário</span>
          </Button>
        )}
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="text-sm">{userName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-white hover:bg-white/10 hover:text-white"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}