'use client'
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pilgrimage as PilgrimageType } from '@/types';

interface RoomReservation {
  id: string;
  room_id: string;
  pilgrimage_id?: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  notes?: string | null;
}

interface Room {
  id: string;
  number: number | string;
}

// Helper para pegar datas de uma romaria (compatível com occurrences)
const getPilgrimageDates = (p: PilgrimageType) => {
  const arrivalDate = p.arrivalDate || p.occurrences?.[0]?.arrivalDate || '';
  const departureDate = p.departureDate || p.occurrences?.[0]?.departureDate || '';
  return { arrivalDate, departureDate };
};

interface Props {
  month: Date;
  reservations: RoomReservation[];
  pilgrimages: PilgrimageType[];
  rooms: Room[];
  occupancy: Record<string, number>;
}

export function ExportAgendaPDF({ month, reservations, pilgrimages, rooms, occupancy }: Props) {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Gera HTML para impressão/PDF
      const monthName = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      // Estatísticas
      const totalPilgrimages = pilgrimages.filter(p => {
        const { arrivalDate, departureDate } = getPilgrimageDates(p);
        if (!arrivalDate || !departureDate) return false;
        const arrival = new Date(arrivalDate);
        const departure = new Date(departureDate);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        return arrival <= monthEnd && departure >= monthStart && p.status !== 'cancelled';
      }).length;

      const totalPeople = pilgrimages.reduce((sum, p) => sum + (p.numberOfPeople || 0), 0);
      
      const avgOccupancy = Object.values(occupancy).length > 0
        ? Math.round(Object.values(occupancy).reduce((a, b) => a + b, 0) / Object.values(occupancy).length)
        : 0;

      // Lista de romarias
      const activePilgrimages = pilgrimages.filter(p => p.status !== 'cancelled');
      
      // Monta HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Agenda - ${monthName}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 210mm;
              margin: 0 auto;
            }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            .stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .stat-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .stat-value {
              font-size: 2em;
              font-weight: bold;
              color: #3b82f6;
            }
            .stat-label {
              color: #6b7280;
              font-size: 0.9em;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .status-badge {
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 0.85em;
              font-weight: bold;
            }
            .status-confirmed { background-color: #dbeafe; color: #1e40af; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-checked_in { background-color: #d1fae5; color: #065f46; }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #9ca3af;
              font-size: 0.8em;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>📅 Relatório de Agenda - ${monthName}</h1>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalPilgrimages}</div>
              <div class="stat-label">Romarias</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalPeople}</div>
              <div class="stat-label">Pessoas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${avgOccupancy}%</div>
              <div class="stat-label">Ocupação Média</div>
            </div>
          </div>

          <h2>🚌 Romarias Agendadas</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ônibus</th>
                <th>Pessoas</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${activePilgrimages.map(p => {
                const { arrivalDate, departureDate } = getPilgrimageDates(p);
                return `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.busGroup || 'N/A'}</td>
                  <td>${p.numberOfPeople}</td>
                  <td>${arrivalDate ? new Date(arrivalDate).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>${departureDate ? new Date(departureDate).toLocaleDateString('pt-BR') : '-'}</td>
                  <td><span class="status-badge status-${p.status || 'confirmed'}">${p.status || 'Confirmada'}</span></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <h2>📊 Ocupação Diária</h2>
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Ocupação</th>
                <th>Quartos Ocupados</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(occupancy).sort().map(([date, percent]) => {
                const occupied = Math.round((percent / 100) * rooms.length);
                return `
                  <tr>
                    <td>${new Date(date).toLocaleDateString('pt-BR')}</td>
                    <td>${percent}%</td>
                    <td>${occupied} de ${rooms.length}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Relatório gerado em ${new Date().toLocaleString('pt-BR')} • ERP Hotelaria
          </div>
        </body>
        </html>
      `;

      // Abre em nova janela para impressão/salvar como PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Aguarda carregar e dispara impressão
        printWindow.onload = () => {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {exporting ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  );
}
