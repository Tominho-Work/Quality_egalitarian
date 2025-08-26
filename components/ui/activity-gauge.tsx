'use client'

import React from 'react'
import { formatMetricValue, getMetricColor } from '@/lib/utils'

interface ActivityGaugeProps {
  title: string
  value: number
  target: number
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  showTarget?: boolean
  className?: string
}

export function ActivityGauge({
  title,
  value,
  target,
  unit,
  size = 'md',
  showTarget = true,
  className = '',
}: ActivityGaugeProps) {
  const percentage = Math.min((value / target) * 100, 100)
  const strokeColor = getMetricColor(value, target, 'gauge')
  
  // Size configurations
  const sizeConfig = {
    sm: { radius: 40, strokeWidth: 8, fontSize: 'text-sm', titleSize: 'text-xs' },
    md: { radius: 60, strokeWidth: 12, fontSize: 'text-lg', titleSize: 'text-sm' },
    lg: { radius: 80, strokeWidth: 16, fontSize: 'text-2xl', titleSize: 'text-base' },
  }
  
  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const svgSize = (config.radius + config.strokeWidth) * 2 + 20
  const center = svgSize / 2

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            stroke={strokeColor}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-2000 ease-out"
            style={{
              animation: 'gauge-fill 2s ease-out',
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${config.fontSize} text-gray-900`}>
            {formatMetricValue(value, unit)}
          </div>
          {showTarget && (
            <div className="text-xs text-gray-900 font-semibold">
              of {formatMetricValue(target, unit)}
            </div>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div className={`text-center font-medium ${config.titleSize} text-gray-900`}>
        {title}
      </div>
      
      {/* Percentage indicator */}
      <div className="flex items-center space-x-2">
        <div className="text-xs font-bold text-gray-900">
          {percentage.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-900 font-semibold">of target</div>
      </div>
    </div>
  )
}

// Optional: Pre-configured gauge components
export function SatisfactionGauge({ value, target = 100, ...props }: Omit<ActivityGaugeProps, 'title' | 'unit'>) {
  return (
    <ActivityGauge
      title="Satisfaction Score"
      value={value}
      target={target}
      unit="%"
      {...props}
    />
  )
}

export function EngagementGauge({ value, target = 100, ...props }: Omit<ActivityGaugeProps, 'title' | 'unit'>) {
  return (
    <ActivityGauge
      title="Engagement Rate"
      value={value}
      target={target}
      unit="%"
      {...props}
    />
  )
}

export function AttendanceGauge({ value, target = 100, ...props }: Omit<ActivityGaugeProps, 'title' | 'unit'>) {
  return (
    <ActivityGauge
      title="Attendance Rate"
      value={value}
      target={target}
      unit="%"
      {...props}
    />
  )
} 