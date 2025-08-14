'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatMetricValue } from '@/lib/utils'

interface KPIDonutChartProps {
  title: string
  value: number
  target: number
  unit?: string
  thresholds?: {
    low: number
    medium: number
    high: number
  }
  colors?: {
    low: string
    medium: string
    high: string
    background: string
  }
  size?: number
  showPercentage?: boolean
  className?: string
}

const defaultThresholds = {
  low: 70,
  medium: 85,
  high: 90,
}

const defaultColors = {
  low: '#ef4444',      // red-500
  medium: '#f59e0b',   // amber-500
  high: '#22c55e',     // green-500
  background: '#f3f4f6' // gray-100
}

export function KPIDonutChart({
  title,
  value,
  target,
  unit,
  thresholds = defaultThresholds,
  colors = defaultColors,
  size = 200,
  showPercentage = true,
  className = '',
}: KPIDonutChartProps) {
  const percentage = (value / target) * 100
  
  // Determine color based on thresholds
  const getValueColor = () => {
    if (percentage >= thresholds.high) return colors.high
    if (percentage >= thresholds.medium) return colors.medium
    return colors.low
  }
  
  // Create data for the donut chart
  const chartData = [
    {
      name: 'Current',
      value: Math.min(value, target),
      percentage: Math.min(percentage, 100),
    },
    {
      name: 'Remaining',
      value: Math.max(target - value, 0),
      percentage: Math.max(100 - percentage, 0),
    },
  ]
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatMetricValue(data.value, unit)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={450}
              innerRadius={size * 0.3}
              outerRadius={size * 0.45}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getValueColor()} />
              <Cell fill={colors.background} />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: getValueColor() }}
            >
              {formatMetricValue(value, unit)}
            </div>
            {showPercentage && (
              <div className="text-sm text-gray-500 mt-1">
                {percentage.toFixed(1)}%
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Target: {formatMetricValue(target, unit)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="text-center">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      
      {/* Threshold indicators */}
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.high }}
          />
          <span>≥{thresholds.high}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.medium }}
          />
          <span>{thresholds.medium}%-{thresholds.high - 1}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.low }}
          />
          <span>&lt;{thresholds.medium}%</span>
        </div>
      </div>
    </div>
  )
}

// Pre-configured KPI components
export function SatisfactionKPI({ value, target = 100, ...props }: Omit<KPIDonutChartProps, 'title' | 'unit'>) {
  return (
    <KPIDonutChart
      title="Satisfaction KPI"
      value={value}
      target={target}
      unit="%"
      {...props}
    />
  )
}

export function EngagementKPI({ value, target = 100, ...props }: Omit<KPIDonutChartProps, 'title' | 'unit'>) {
  return (
    <KPIDonutChart
      title="Engagement KPI"
      value={value}
      target={target}
      unit="%"
      {...props}
    />
  )
}

export function LearningOutcomeKPI({ value, target = 5, ...props }: Omit<KPIDonutChartProps, 'title' | 'unit'>) {
  return (
    <KPIDonutChart
      title="Learning Outcome KPI"
      value={value}
      target={target}
      unit="score"
      thresholds={{ low: 60, medium: 75, high: 85 }}
      {...props}
    />
  )
} 