'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead } from '@/types'
import { isValidEmail } from '@/lib/api'
import ChannelChart from '@/components/charts/ChannelChart'
import ContactChart from '@/components/charts/ContactChart'

interface AnalyticsTabProps {
  leads: Lead[]
}

export default function AnalyticsTab({ leads }: AnalyticsTabProps) {
  const contactStats = useMemo(() => {
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

    return { withPhone, withEmail, withBoth, withNeither }
  }, [leads])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Performance por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChannelChart leads={leads} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{contactStats.withPhone}</div>
              <div className="text-sm text-blue-600">Com Telefone</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{contactStats.withEmail}</div>
              <div className="text-sm text-green-600">Com Email</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{contactStats.withBoth}</div>
              <div className="text-sm text-purple-600">Com Ambos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{contactStats.withNeither}</div>
              <div className="text-sm text-red-600">Sem Contato</div>
            </div>
          </div>
          <ContactChart leads={leads} />
        </CardContent>
      </Card>
    </div>
  )
}
