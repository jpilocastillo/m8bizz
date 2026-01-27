import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "$0"
  const numValue = typeof value === "string" ? parseFloat(value.replace(/[$,]/g, "")) : value
  if (isNaN(numValue) || numValue === null || numValue === undefined) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function parseCurrency(value: string): string {
  return value.replace(/[$,]/g, "")
}
