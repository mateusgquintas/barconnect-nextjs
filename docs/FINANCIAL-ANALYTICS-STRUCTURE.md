# Estrutura de Análise Financeira de Quartos

## Objetivo
Criar visualizações e análises financeiras para otimizar a rentabilidade dos quartos do hotel.

## 📊 Métricas Principais

### 1. **Custo Total por Quarto**
```typescript
interface RoomCostBreakdown {
  roomId: string;
  roomNumber: number;
  fixedCostMonthly: number;      // Custo fixo mensal
  variableCostDaily: number;     // Custo variável por dia
  occupancyDays: number;         // Dias ocupados no período
  totalFixedCost: number;        // Custo fixo no período
  totalVariableCost: number;     // Custo variável total (occupancyDays * variableCostDaily)
  totalCost: number;             // Soma dos custos
  revenue: number;               // Receita do quarto (daily_rate * occupancyDays)
  profit: number;                // Lucro líquido (revenue - totalCost)
  roi: number;                   // ROI % ((profit / totalCost) * 100)
}
```

### 2. **Taxa de Ocupação vs Custo**
- **Objetivo**: Identificar quartos subutilizados com alto custo fixo
- **Fórmula**: `Custo por Dia Disponível = (fixedCostMonthly / 30) + (variableCostDaily * occupancyRate)`
- **Insights**: Quartos com baixa ocupação e alto custo fixo são candidatos a:
  - Aumento de marketing
  - Redução de preço estratégica
  - Reclassificação (ex: suite → standard)

### 3. **Análise de Lucratividade**
```typescript
interface ProfitabilityMetrics {
  roomId: string;
  avgDailyRate: number;          // Taxa média diária
  avgOccupancyRate: number;      // Taxa média de ocupação (%)
  breakEvenDays: number;         // Dias necessários para cobrir custo fixo
  profitPerOccupiedDay: number;  // Lucro por dia ocupado
  totalProfit: number;           // Lucro total no período
  profitMargin: number;          // Margem de lucro (%)
}
```

### 4. **Consumo Médio por Tipo de Quarto**
- **Objetivo**: Entender padrões de custo variável por categoria
- **Análise**:
  - Standard: R$ X/dia (amenidades básicas)
  - Suite: R$ Y/dia (minibar, room service, etc.)
  - Luxo: R$ Z/dia (serviços premium)

### 5. **Histórico de Manutenção**
```typescript
interface MaintenanceAnalysis {
  roomId: string;
  lastMaintenanceDate: string;
  daysSinceLastMaintenance: number;
  maintenanceFrequency: number;   // Meses entre manutenções
  avgMaintenanceCost: number;     // Custo médio de manutenção
  nextScheduledMaintenance: string; // Previsão
  maintenanceImpact: {            // Impacto da manutenção
    daysOutOfService: number;
    lostRevenue: number;
  }
}
```

---

## 🎨 Componentes Visuais Sugeridos

### **1. RoomFinancialDashboard** (Página Principal)
```tsx
// Componente: components/analytics/RoomFinancialDashboard.tsx

<div className="grid gap-4">
  {/* Cards de Resumo */}
  <div className="grid grid-cols-4 gap-4">
    <MetricCard title="Receita Total" value="R$ 45.230,00" trend="+12%" />
    <MetricCard title="Custo Total" value="R$ 18.450,00" trend="-3%" />
    <MetricCard title="Lucro Líquido" value="R$ 26.780,00" trend="+18%" />
    <MetricCard title="Margem de Lucro" value="59,2%" trend="+5%" />
  </div>

  {/* Gráficos */}
  <div className="grid grid-cols-2 gap-4">
    <ProfitabilityChart />
    <OccupancyVsCostChart />
  </div>

  {/* Tabela Detalhada */}
  <RoomFinancialTable />
</div>
```

### **2. ProfitabilityChart** (Gráfico de Barras)
- **Eixo X**: Número do quarto
- **Eixo Y**: Valores em R$
- **Barras**:
  - 🟢 Receita (verde)
  - 🔴 Custo Total (vermelho)
  - 🔵 Lucro (azul)

### **3. OccupancyVsCostChart** (Scatter Plot)
- **Eixo X**: Taxa de Ocupação (%)
- **Eixo Y**: Custo por Dia Disponível (R$)
- **Pontos**: Cada quarto
- **Cores**:
  - 🟢 Verde: Alta ocupação + Baixo custo (ótimo)
  - 🟡 Amarelo: Situação média
  - 🔴 Vermelho: Baixa ocupação + Alto custo (atenção!)

### **4. RoomCostBreakdownCard** (Card Individual)
```tsx
<Card>
  <CardHeader>
    <h3>Quarto 101 - Standard</h3>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-sm text-gray-500">Custo Fixo/Mês</p>
        <p className="text-lg font-bold">R$ 450,00</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Custo Variável/Dia</p>
        <p className="text-lg font-bold">R$ 35,00</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Taxa Ocupação</p>
        <p className="text-lg font-bold">78%</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">ROI</p>
        <p className="text-lg font-bold text-green-600">+142%</p>
      </div>
    </div>
    <Progress value={78} className="mt-4" />
    <p className="text-xs text-gray-500 mt-1">Break-even em 12 dias</p>
  </CardContent>
</Card>
```

### **5. MaintenanceCalendar** (Calendário de Manutenção)
```tsx
// Componente: components/analytics/MaintenanceCalendar.tsx

<Calendar
  events={[
    { date: '2025-01-10', room: 101, type: 'scheduled', cost: 'R$ 800' },
    { date: '2025-01-15', room: 203, type: 'emergency', cost: 'R$ 1.200' },
    { date: '2025-01-20', room: 305, type: 'preventive', cost: 'R$ 450' },
  ]}
/>
```

---

## 📁 Estrutura de Arquivos Sugerida

```
components/
  analytics/
    RoomFinancialDashboard.tsx     # Dashboard principal
    ProfitabilityChart.tsx         # Gráfico de lucratividade
    OccupancyVsCostChart.tsx       # Scatter plot ocupação x custo
    RoomCostBreakdownCard.tsx      # Card detalhado por quarto
    MaintenanceCalendar.tsx        # Calendário de manutenção
    MetricCard.tsx                 # Card de métrica genérico
    RoomFinancialTable.tsx         # Tabela com todos os quartos

hooks/
  useRoomFinancials.ts             # Hook para calcular métricas
  useMaintenanceSchedule.ts        # Hook para agendar manutenção

lib/
  financial-calculations.ts        # Funções de cálculo financeiro
```

---

## 🚀 Implementação Passo a Passo

### **Passo 1: Criar Hook de Cálculos Financeiros**
```typescript
// hooks/useRoomFinancials.ts

export function useRoomFinancials(startDate: Date, endDate: Date) {
  const { rooms } = useRoomsDB();
  const [metrics, setMetrics] = useState<RoomCostBreakdown[]>([]);

  useEffect(() => {
    async function calculateMetrics() {
      const roomMetrics = await Promise.all(
        rooms.map(async (room) => {
          // 1. Buscar reservas do período
          const bookings = await getBookingsForRoom(room.id, startDate, endDate);
          
          // 2. Calcular dias ocupados
          const occupancyDays = calculateOccupancyDays(bookings, startDate, endDate);
          
          // 3. Calcular custos
          const daysInPeriod = differenceInDays(endDate, startDate);
          const fixedCostForPeriod = (room.fixed_cost_monthly ?? 0) * (daysInPeriod / 30);
          const variableCost = occupancyDays * (room.variable_cost_daily ?? 0);
          
          // 4. Calcular receita
          const revenue = bookings.reduce((sum, b) => sum + (b.total_paid ?? 0), 0);
          
          // 5. Calcular lucro e ROI
          const totalCost = fixedCostForPeriod + variableCost;
          const profit = revenue - totalCost;
          const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
          
          return {
            roomId: room.id,
            roomNumber: room.number,
            fixedCostMonthly: room.fixed_cost_monthly ?? 0,
            variableCostDaily: room.variable_cost_daily ?? 0,
            occupancyDays,
            totalFixedCost: fixedCostForPeriod,
            totalVariableCost: variableCost,
            totalCost,
            revenue,
            profit,
            roi,
          };
        })
      );
      
      setMetrics(roomMetrics);
    }
    
    calculateMetrics();
  }, [rooms, startDate, endDate]);

  return { metrics, loading: !metrics.length };
}
```

### **Passo 2: Criar Componente MetricCard**
```typescript
// components/analytics/MetricCard.tsx

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  const trendColor = trend?.startsWith('+') ? 'text-green-600' : 'text-red-600';
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trendColor}`}>
                {trend} vs mês anterior
              </p>
            )}
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Passo 3: Criar Dashboard Principal**
```typescript
// components/analytics/RoomFinancialDashboard.tsx

export function RoomFinancialDashboard() {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  
  const { metrics, loading } = useRoomFinancials(dateRange.start, dateRange.end);
  
  const totals = useMemo(() => ({
    revenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
    cost: metrics.reduce((sum, m) => sum + m.totalCost, 0),
    profit: metrics.reduce((sum, m) => sum + m.profit, 0),
    avgRoi: metrics.reduce((sum, m) => sum + m.roi, 0) / metrics.length,
  }), [metrics]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Análise Financeira de Quartos</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(totals.revenue)}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(totals.cost)}
          icon={<TrendingDown className="w-6 h-6" />}
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(totals.profit)}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricCard
          title="ROI Médio"
          value={`${totals.avgRoi.toFixed(1)}%`}
          icon={<Percent className="w-6 h-6" />}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <ProfitabilityChart data={metrics} />
        <OccupancyVsCostChart data={metrics} />
      </div>
      
      <RoomFinancialTable data={metrics} />
    </div>
  );
}
```

---

## 📈 Funcionalidades Futuras

1. **Alertas Automáticos**
   - Quartos com ROI negativo por 2+ meses
   - Manutenção atrasada (>6 meses)
   - Custo variável acima da média

2. **Previsões**
   - Receita estimada para próximo mês
   - Necessidade de manutenção preventiva
   - Break-even forecast

3. **Exportação**
   - PDF com relatório completo
   - Excel com dados detalhados
   - Gráficos para apresentação

4. **Comparações**
   - Período atual vs período anterior
   - Quarto vs média do hotel
   - Tipo de quarto vs tipo de quarto

---

## 🎯 Próximos Passos

1. ✅ Migration 011 executada (campos criados)
2. ✅ Interfaces TypeScript atualizadas
3. ⏳ Implementar `useRoomFinancials` hook
4. ⏳ Criar componentes visuais (charts)
5. ⏳ Integrar com Header (novo item de menu)
6. ⏳ Testes e validação

---

**Observação**: Todos os cálculos devem considerar o timezone correto e usar datas no formato ISO para evitar problemas de fuso horário.
