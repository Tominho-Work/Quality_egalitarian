'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OverallTrendPoint {
  cycle: string
  value: number
}

interface OverallTrendChartProps {
  data: OverallTrendPoint[]
  lineColor?: string
  label?: string
}

export function OverallTrendChart({ data, lineColor = '#3b82f6', label = 'Overall score' }: OverallTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cycle" />
          <YAxis domain={[0, 5]} />
          <Tooltip formatter={(value: any) => [value, label]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            name={label}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


