import { useState } from 'react';

export function useDateFilter() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const isInPeriod = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return false;
    // Cria datas sempre em UTC para evitar problemas de fuso
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(Date.UTC(sy, sm - 1, sd));
    const end = new Date(Date.UTC(ey, em - 1, ed));
    return date >= start && date <= end;
  };

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isInPeriod,
  };
}