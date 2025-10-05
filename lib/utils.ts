import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função auxiliar para unir classes CSS do Tailwind de forma segura.
 * Exemplo: cn("p-4", isActive && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

