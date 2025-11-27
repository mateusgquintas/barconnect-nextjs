import * as XLSX from 'xlsx';
import { Room } from '@/hooks/useRoomsDB';

interface ExportOptions {
  includeAmenities?: boolean;
  includeOccupancy?: boolean;
  occupancyData?: Record<string, number>;
  dateRange?: { start: string; end: string };
}

/**
 * Exporta a lista de quartos para um arquivo Excel
 * @param rooms - Array de quartos a serem exportados
 * @param options - Opções de exportação
 */
export function exportRoomsToExcel(rooms: Room[], options: ExportOptions = {}) {
  const {
    includeAmenities = true,
    includeOccupancy = false,
    occupancyData = {},
    dateRange,
  } = options;

  // Tradução de status
  const statusLabels: Record<string, string> = {
    available: 'Disponível',
    occupied: 'Ocupado',
    cleaning: 'Limpeza',
    maintenance: 'Manutenção',
    reserved: 'Reservado',
  };

  // Tradução de tipos
  const typeLabels: Record<string, string> = {
    single: 'Solteiro',
    double: 'Casal',
    suite: 'Suíte',
  };

  // Tradução de vista
  const viewLabels: Record<string, string> = {
    ocean: 'Oceano',
    city: 'Cidade',
    garden: 'Jardim',
    mountain: 'Montanha',
    pool: 'Piscina',
    internal: 'Interna',
  };

  // Preparar dados para exportação
  const exportData = rooms.map(room => {
    const baseData: any = {
      'Número': room.number,
      'Nome Customizado': room.custom_name || '-',
      'Tipo': typeLabels[room.type || ''] || room.type || '-',
      'Andar': room.floor || '-',
      'Capacidade': room.capacity || '-',
      'Camas': room.beds || '-',
      'Tamanho (m²)': room.room_size || '-',
      'Diária (R$)': room.daily_rate ? `R$ ${room.daily_rate.toFixed(2)}` : '-',
      'Status': statusLabels[room.status || ''] || room.status || '-',
    };

    // Adicionar informações de ocupação se disponível
    if (includeOccupancy && occupancyData[room.id] !== undefined) {
      baseData['Ocupação (%)'] = `${occupancyData[room.id]}%`;
    }

    // Adicionar amenidades se solicitado
    if (includeAmenities) {
      baseData['TV'] = room.has_tv ? 'Sim' : 'Não';
      baseData['Ar-condicionado'] = room.has_ac ? 'Sim' : 'Não';
      baseData['Wi-Fi'] = room.has_wifi ? 'Sim' : 'Não';
      baseData['Frigobar'] = room.has_minibar ? 'Sim' : 'Não';
      baseData['Varanda'] = room.has_balcony ? 'Sim' : 'Não';
      baseData['Banheira'] = room.has_bathtub ? 'Sim' : 'Não';
      baseData['Secador'] = room.has_hairdryer ? 'Sim' : 'Não';
      baseData['Cofre'] = room.has_safe ? 'Sim' : 'Não';
      baseData['Telefone'] = room.has_phone ? 'Sim' : 'Não';
      baseData['Roupão'] = room.has_bathrobe ? 'Sim' : 'Não';
      baseData['Vista'] = viewLabels[room.view_type || ''] || room.view_type || '-';
      baseData['Acessível'] = room.is_accessible ? 'Sim' : 'Não';
      baseData['Permite Fumantes'] = room.is_smoking_allowed ? 'Sim' : 'Não';
      baseData['Aceita Pets'] = room.is_pet_friendly ? 'Sim' : 'Não';
    }

    // Adicionar informações de hóspede se houver
    if (room.guest_name) {
      baseData['Hóspede'] = room.guest_name;
      baseData['CPF Hóspede'] = room.guest_cpf || '-';
      baseData['Telefone Hóspede'] = room.guest_phone || '-';
      baseData['Email Hóspede'] = room.guest_email || '-';
      baseData['Check-in'] = room.check_in_date 
        ? new Date(room.check_in_date).toLocaleDateString('pt-BR') 
        : '-';
      baseData['Check-out'] = room.check_out_date 
        ? new Date(room.check_out_date).toLocaleDateString('pt-BR') 
        : '-';
    }

    if (room.observations) {
      baseData['Observações'] = room.observations;
    }

    return baseData;
  });

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Configurar largura das colunas
  const columnWidths = [
    { wch: 10 },  // Número
    { wch: 20 },  // Nome Customizado
    { wch: 12 },  // Tipo
    { wch: 8 },   // Andar
    { wch: 12 },  // Capacidade
    { wch: 8 },   // Camas
    { wch: 12 },  // Tamanho
    { wch: 15 },  // Diária
    { wch: 15 },  // Status
  ];

  if (includeOccupancy) {
    columnWidths.push({ wch: 12 }); // Ocupação
  }

  if (includeAmenities) {
    // Adicionar largura para cada amenidade
    for (let i = 0; i < 14; i++) {
      columnWidths.push({ wch: 12 });
    }
  }

  ws['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Quartos');

  // Criar aba de resumo
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
  const occupancyRate = totalRooms > 0 
    ? ((occupiedRooms / totalRooms) * 100).toFixed(1) 
    : '0';

  const summaryData = [
    { 'Indicador': 'Total de Quartos', 'Valor': totalRooms },
    { 'Indicador': 'Disponíveis', 'Valor': availableRooms },
    { 'Indicador': 'Ocupados', 'Valor': occupiedRooms },
    { 'Indicador': 'Em Limpeza', 'Valor': cleaningRooms },
    { 'Indicador': 'Em Manutenção', 'Valor': maintenanceRooms },
    { 'Indicador': 'Taxa de Ocupação (%)', 'Valor': occupancyRate },
  ];

  if (dateRange) {
    summaryData.push(
      { 'Indicador': 'Período Filtrado - Início', 'Valor': new Date(dateRange.start).toLocaleDateString('pt-BR') },
      { 'Indicador': 'Período Filtrado - Fim', 'Valor': new Date(dateRange.end).toLocaleDateString('pt-BR') }
    );
  }

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Criar aba de amenidades (estatísticas)
  if (includeAmenities) {
    const amenitiesStats = [
      { 'Amenidade': 'TV', 'Quantidade': rooms.filter(r => r.has_tv).length, 'Percentual': `${((rooms.filter(r => r.has_tv).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Ar-condicionado', 'Quantidade': rooms.filter(r => r.has_ac).length, 'Percentual': `${((rooms.filter(r => r.has_ac).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Wi-Fi', 'Quantidade': rooms.filter(r => r.has_wifi).length, 'Percentual': `${((rooms.filter(r => r.has_wifi).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Frigobar', 'Quantidade': rooms.filter(r => r.has_minibar).length, 'Percentual': `${((rooms.filter(r => r.has_minibar).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Varanda', 'Quantidade': rooms.filter(r => r.has_balcony).length, 'Percentual': `${((rooms.filter(r => r.has_balcony).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Banheira', 'Quantidade': rooms.filter(r => r.has_bathtub).length, 'Percentual': `${((rooms.filter(r => r.has_bathtub).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Secador', 'Quantidade': rooms.filter(r => r.has_hairdryer).length, 'Percentual': `${((rooms.filter(r => r.has_hairdryer).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Cofre', 'Quantidade': rooms.filter(r => r.has_safe).length, 'Percentual': `${((rooms.filter(r => r.has_safe).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Telefone', 'Quantidade': rooms.filter(r => r.has_phone).length, 'Percentual': `${((rooms.filter(r => r.has_phone).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Roupão', 'Quantidade': rooms.filter(r => r.has_bathrobe).length, 'Percentual': `${((rooms.filter(r => r.has_bathrobe).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Acessível', 'Quantidade': rooms.filter(r => r.is_accessible).length, 'Percentual': `${((rooms.filter(r => r.is_accessible).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Permite Fumantes', 'Quantidade': rooms.filter(r => r.is_smoking_allowed).length, 'Percentual': `${((rooms.filter(r => r.is_smoking_allowed).length / totalRooms) * 100).toFixed(1)}%` },
      { 'Amenidade': 'Aceita Pets', 'Quantidade': rooms.filter(r => r.is_pet_friendly).length, 'Percentual': `${((rooms.filter(r => r.is_pet_friendly).length / totalRooms) * 100).toFixed(1)}%` },
    ];

    const wsAmenities = XLSX.utils.json_to_sheet(amenitiesStats);
    wsAmenities['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsAmenities, 'Estatísticas Amenidades');
  }

  // Gerar nome do arquivo
  const timestamp = new Date().toISOString().slice(0, 10);
  let filename = `quartos_${timestamp}`;
  
  if (dateRange) {
    const startDate = new Date(dateRange.start).toISOString().slice(0, 10);
    const endDate = new Date(dateRange.end).toISOString().slice(0, 10);
    filename = `quartos_${startDate}_a_${endDate}`;
  }

  // Baixar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
