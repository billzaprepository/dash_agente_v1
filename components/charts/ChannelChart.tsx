'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Lead } from '@/types'

interface ChannelChartProps {
  leads: Lead[]
}

export default function ChannelChart({ leads }: ChannelChartProps) {
  const chartData = useMemo(() => {
    const channels = leads.reduce((acc, lead) => {
      const canal = lead.origem_lead || 'Não informado'
      if (!acc[canal]) {
        acc[canal] = { leads: 0, conversoes: 0 }
      }
      acc[canal].leads += 1
      if (lead.status_atendimento === 'Convertido' || lead.status_atendimento === 'convertido') {
        acc[canal].conversoes += 1
      }
      return acc
    }, {} as Record<string, { leads: number; conversoes: number }>)

    return Object.entries(channels).map(([canal, data]) => ({
      canal,
      ...data
    }))
  }, [leads])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        layout="horizontal"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="canal" type="category" width={80} />
        <Tooltip />
        <Legend />
        <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[0, 4, 4, 0]} />
        <Bar dataKey="conversoes" fill="#10b981" name="Conversões" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
