'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendData {
  cycle: string
  satisfaction: number
  engagement: number
  attendance: number
}

interface TrendsChartProps {
  data: TrendData[]
}

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cycle" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="satisfaction" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Satisfaction %" 
          />
          <Line 
            type="monotone" 
            dataKey="engagement" 
            stroke="#22c55e" 
            strokeWidth={2}
            name="Engagement %" 
          />
          <Line 
            type="monotone" 
            dataKey="attendance" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Attendance %" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}