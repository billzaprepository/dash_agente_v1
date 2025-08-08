'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Lead } from '@/types'
import { isValidEmail } from '@/lib/api'

interface ContactChartProps {
  leads: Lead[]
}

export default function ContactChart({ leads }: ContactChartProps) {
  const chartData = useMemo(() => {
    const withPhone = leads.filter(lead => lead.telefone && lead.telefone_limpo && lead.telefone_limpo.length >= 10).length
    const withEmail = leads.filter(lead => lead.email && isValidEmail(lead.email)).length
    const withBoth = leads.filter(lead =>
      lead.telefone && lead.telefone_limpo && lead.telefone_limpo.length >= 10 &&
      lead.email && isValidEmail(lead.email)
    ).length
    const withNeither = leads.filter(lead =>
      (!lead.telefone || !lead.telefone_limpo || lead.telefone_limpo.length < 10) &&
      (!lead.email || !isValidEmail(lead.email))
    ).length

    return [
      { name: 'Só Telefone', value: withPhone - withBoth, color: '#3b82f6' },
      { name: 'Só Email', value: withEmail - withBoth, color: '#10b981' },
      { name: 'Ambos', value: withBoth, color: '#8b5cf6' },
      { name: 'Nenhum', value: withNeither, color: '#ef4444' }
    ]
  }, [leads])

  return (
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
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
