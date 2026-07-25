'use client'

import { Card } from './ui/card';
import { useDashboardGeral } from '@/hooks/useDashboardGeral';
import { formatCurrency } from '@/utils/format';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, CalendarPlus, LogIn, LogOut, BedDouble,
  Package, CalendarCheck, Wallet,
} from 'lucide-react';

const CHANNEL_COLORS: Record<string, string> = {
  agenciador: '#a855f7',
  booking: '#3b82f6',
  motorista: '#f59e0b',
  chefe_romaria: '#10b981',
  direto: '#64748b',
};

const STATUS_LABELS: Record<string, string> = {
  reserved: 'Reservado',
  confirmed: 'Confirmada',
  checked_in: 'Check-in',
  checked_out: 'Check-out',
  pending: 'Pendente',
};

const STATUS_COLORS: Record<string, string> = {
  reserved: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  checked_in: 'bg-emerald-100 text-emerald-700',
  checked_out: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
};

export function DashboardGeral() {
  const {
    loading,
    totalRevenueThisMonth,
    newBookingsThisMonth,
    checkInsToday,
    checkOutsToday,
    roomOccupancy,
    revenueTrend,
    revenueByChannel,
    recentActivity,
    recentBookings,
  } = useDashboardGeral();

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <p className="text-slate-500">Carregando visão geral do hotel...</p>
      </main>
    );
  }

  const occupancyPct = roomOccupancy.total > 0 ? Math.round((roomOccupancy.occupied / roomOccupancy.total) * 100) : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-sm">Visão geral do funcionamento e progresso do hotel.</p>
        </div>

        {/* Cards de topo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Faturamento do Mês</p>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenueThisMonth)}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Novas Reservas</p>
              <CalendarPlus className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{newBookingsThisMonth}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Check-in Hoje</p>
              <LogIn className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{checkInsToday}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Check-out Hoje</p>
              <LogOut className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{checkOutsToday}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                Faturamento (últimos 6 meses)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Faturamento" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Faturamento por Canal (mês)</h2>
                {revenueByChannel.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-10">Sem faturamento lançado este mês.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={revenueByChannel} dataKey="total" nameKey="label" innerRadius={45} outerRadius={75} paddingAngle={2}>
                        {revenueByChannel.map((entry) => (
                          <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {revenueByChannel.map(c => (
                    <span key={c.channel} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[c.channel] }} />
                      {c.label}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-slate-500" />
                  Ocupação de Quartos
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-slate-900">{roomOccupancy.total}</span>
                  <span className="text-sm text-slate-500">quartos no total</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
                  <div className="h-full bg-red-500" style={{ width: `${(roomOccupancy.occupied / (roomOccupancy.total || 1)) * 100}%` }} />
                  <div className="h-full bg-blue-500" style={{ width: `${(roomOccupancy.reserved / (roomOccupancy.total || 1)) * 100}%` }} />
                  <div className="h-full bg-yellow-400" style={{ width: `${(roomOccupancy.notReady / (roomOccupancy.total || 1)) * 100}%` }} />
                  <div className="h-full bg-green-500" style={{ width: `${(roomOccupancy.available / (roomOccupancy.total || 1)) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {roomOccupancy.occupied} Ocupados</p>
                  <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {roomOccupancy.reserved} Reservados</p>
                  <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> {roomOccupancy.available} Disponíveis</p>
                  <p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> {roomOccupancy.notReady} Não prontos</p>
                </div>
                <p className="text-xs text-slate-500 mt-3">Taxa de ocupação atual: <strong>{occupancyPct}%</strong></p>
              </Card>
            </div>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Reservas Recentes</h2>
              {recentBookings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">Nenhuma reserva registrada ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                        <th className="py-2 pr-3 w-full">Hóspede/Romaria</th>
                        <th className="py-2 px-3 whitespace-nowrap">Quarto</th>
                        <th className="py-2 px-3 whitespace-nowrap">Check-in</th>
                        <th className="py-2 px-3 whitespace-nowrap">Check-out</th>
                        <th className="py-2 pl-3 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map(b => (
                        <tr key={b.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-3 font-medium text-slate-900 truncate max-w-[200px]">{b.guestName}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-600">Nº {b.roomNumber}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-600">{new Date(b.checkIn + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-600">{new Date(b.checkOut + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 pl-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                              {STATUS_LABELS[b.status] || b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Coluna lateral: informações essenciais */}
          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-slate-500" />
                Atividade Recente
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhuma atividade recente.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'reservation' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {item.type === 'reservation' ? (
                          <CalendarPlus className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Package className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.description}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
