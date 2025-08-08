'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Lead } from '@/types'

interface LeadsChartProps {
  leads: Lead[]
}

export default function LeadsChart({ leads }: LeadsChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const dayLeads = leads.filter(lead =>
        lead.created_at && lead.created_at.startsWith(dateStr)
      )
      const dayConversions = dayLeads.filter(lead =>
        lead.status_atendimento === 'Convertido' || lead.status_atendimento === 'convertido'
      )

      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        leads: dayLeads.length,
        conversoes: dayConversions.length
      }
    })
  }, [leads])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[4, 4, 0, 0]} />
        <Bar dataKey="conversoes" fill="#10b981" name="Conversões" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
