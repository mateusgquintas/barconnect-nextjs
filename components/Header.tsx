'use client'

import { Receipt, Calendar, Package, TrendingUpDown, ShoppingBag, LogOut, User as UserIcon, Hotel as HotelIcon, ChevronDown, Bed, Users } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
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
}

export function Header({ onNewComanda, onDirectSale, onQuickComanda, currentView, onViewChange, dashboardView, onDashboardViewChange, userRole, userName, onLogout }: HeaderProps) {
  const permissions = usePermissions();
  
  // Gerar iniciais do usuário para o avatar
  const getUserInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };
  
  const allNavItems = [
    { id: 'pdv' as PageView, label: 'PDV', icon: ShoppingBag, permission: 'pdv' as const },
    { id: 'inventory' as PageView, label: 'Estoque', icon: Package, permission: 'estoque' as const },
    { id: 'hotel' as PageView, label: 'Hotel', icon: HotelIcon, permission: 'hotel' as const },
    { id: 'transactions' as PageView, label: 'Financeiro', icon: TrendingUpDown, permission: 'financeiro' as const },
  ];

  const navItems = allNavItems.filter(item => permissions[item.permission]);

  return (
    <header className="h-18 bg-slate-900 text-white px-6 flex items-center justify-between border-b border-slate-800 shadow-lg">
      <div className="flex items-center gap-8">
        {/* Logo Clicável */}
        <button
          onClick={() => onViewChange('pdv')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="Voltar para página inicial"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-md">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-white tracking-tight">HotelConnect</h1>
            <p className="text-slate-400 text-xs font-medium hidden md:block">Sistema de Gestão Hoteleira</p>
          </div>
        </button>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || 
                           (item.id === 'transactions' && currentView === 'dashboard') ||
                           (item.id === 'hotel' && (currentView === 'hotel-agenda' || currentView === 'hotel-pilgrimages'));
            
            // Financeiro com dropdown (Dashboards + Registros)
            if (item.id === 'transactions') {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label="Menu Financeiro"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-t-full" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="bg-slate-900 border-slate-700 text-white min-w-[220px] shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewChange('transactions')}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'transactions'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <TrendingUpDown className="w-4 h-4 mr-2" />
                      Registros
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={() => {
                        onViewChange('dashboard');
                        onDashboardViewChange('bar');
                      }}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'dashboard' && dashboardView === 'bar'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Dashboard Bar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onViewChange('dashboard');
                        onDashboardViewChange('controladoria');
                      }}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'dashboard' && dashboardView === 'controladoria'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Dashboard Controladoria
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Hotel com dropdown
            if (item.id === 'hotel') {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label="Menu Hotel"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-t-full" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="bg-slate-900 border-slate-700 text-white min-w-[220px] shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel-agenda')}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'hotel-agenda'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agenda do Hotel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel')}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'hotel'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Bed className="w-4 h-4 mr-2" />
                      Gestão de Quartos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onViewChange('hotel-pilgrimages')}
                      className={`cursor-pointer py-2.5 ${
                        currentView === 'hotel-pilgrimages'
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
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
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                aria-label={`Navegar para ${item.label}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* User Menu com Avatar Melhorado */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              aria-label="Menu do usuário"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md font-semibold text-white text-sm">
                  {getUserInitials(userName)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-slate-400 capitalize">{userRole === 'admin' ? 'Administrador' : 'Operador'}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-slate-900 border-slate-700 text-white min-w-[200px] shadow-xl"
          >
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">
                {userRole === 'admin' ? 'Administrador' : 'Operador'}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}