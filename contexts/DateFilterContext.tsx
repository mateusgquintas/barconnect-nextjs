'use client'

import React, { createContext, useContext, useState } from 'react';

interface DateFilterContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  isInPeriod: (dateStr: string) => boolean;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <DateFilterContext.Provider value={{
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      isInPeriod,
    }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}