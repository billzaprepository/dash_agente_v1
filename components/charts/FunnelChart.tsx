'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Lead } from '@/types'

interface FunnelChartProps {
  leads: Lead[]
}

export default function FunnelChart({ leads }: FunnelChartProps) {
  const { chartData, colors } = useMemo(() => {
    const etapas = leads.reduce((acc, lead) => {
      const etapa = lead.etapa_funil || 'Sem etapa'
      acc[etapa] = (acc[etapa] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#f97316']
    const chartData = Object.entries(etapas).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))

    return { chartData, colors }
  }, [leads])

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="space-y-2">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
