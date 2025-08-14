import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatMetricValue(value: number, unit?: string): string {
  if (!unit) return value.toString()
  
  if (unit === '%') {
    return formatPercentage(value)
  }
  
  if (unit === 'score') {
    return value.toFixed(1)
  }
  
  return `${value} ${unit}`
}

export function getMetricColor(value: number, target: number, type: 'gauge' | 'text' = 'text'): string {
  const percentage = (value / target) * 100
  
  if (type === 'gauge') {
    if (percentage >= 90) return '#22c55e' // green-500
    if (percentage >= 75) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }
  
  // Text colors
  if (percentage >= 90) return 'text-green-600'
  if (percentage >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600'
    case 'negative':
      return 'text-red-600'
    case 'neutral':
    default:
      return 'text-gray-600'
  }
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
} 