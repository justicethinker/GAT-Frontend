import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 1. Class Name Merger (Standard)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 2. Currency Formatter
// Usage: formatCurrency(1234.56) -> "$1,234.56"
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// 3. Percentage Formatter
// Usage: formatPercentage(12.5) -> "+12.50%"
export function formatPercentage(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
  
  return value > 0 ? `+${formatted}` : formatted
}

// 4. Date Formatter
// Usage: formatDate("2023-01-01") -> "Jan 1, 2023"
export function formatDate(dateString: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(dateString))
}

// 5. Compact Number Formatter (for charts/large volumes)
// Usage: formatCompactNumber(1500000) -> "1.5M"
export function formatCompactNumber(number: number) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number)
}