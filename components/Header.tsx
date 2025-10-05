'use client'

import { useState } from 'react';
import { Receipt, ShoppingCart, Plus, LayoutDashboard, Package, TrendingUpDown, ShoppingBag, LogOut, User as UserIcon, Hotel as HotelIcon, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserRole } from '@/types/user';

export type PageView = 'pdv' | 'dashboard' | 'hotel' | 'inventory' | 'transactions';

interface HeaderProps {
  onNewComanda: () => void;
  onDirectSale: () => void;
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  dashboardView: 'bar' | 'controladoria';
  onDashboardViewChange: (view: 'bar' | 'controladoria') => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export function Header({ onNewComanda, onDirectSale, currentView, onViewChange, dashboardView, onDashboardViewChange, userRole, userName, onLogout }: HeaderProps) {
  const allNavItems = [
    { id: 'pdv' as PageView, label: 'PDV', icon: ShoppingBag, roles: ['operator', 'admin'] },
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'hotel' as PageView, label: 'Hotel', icon: HotelIcon, roles: ['admin'] },
    { id: 'inventory' as PageView, label: 'Estoque', icon: Package, roles: ['admin'] },
    { id: 'transactions' as PageView, label: 'Financeiro', icon: TrendingUpDown, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <header className="h-16 bg-slate-900 text-white px-6 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white">BarConnect</h1>
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
        {currentView === 'pdv' && (
          <>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-2"
              onClick={onDirectSale}
            >
              <ShoppingCart className="w-4 h-4" />
              Venda Direta
            </Button>
            <Button 
              className="bg-white text-slate-900 hover:bg-slate-100 gap-2"
              onClick={onNewComanda}
            >
              <Plus className="w-4 h-4" />
              Nova Comanda
            </Button>
            <div className="w-px h-8 bg-white/20 mx-2" />
          </>
        )}
        
        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}