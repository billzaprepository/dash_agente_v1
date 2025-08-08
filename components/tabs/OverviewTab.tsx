'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead } from '@/types'
import { isValidEmail } from '@/lib/api'
import LeadsChart from '@/components/charts/LeadsChart'
import FunnelChart from '@/components/charts/FunnelChart'

interface OverviewTabProps {
  leads: Lead[]
}

export default function OverviewTab({ leads }: OverviewTabProps) {
  const metrics = useMemo(() => {
    const totalLeads = leads.length
    const convertedLeads = leads.filter(lead =>
      lead.status_atendimento === 'Convertido' || lead.status_atendimento === 'convertido'
    ).length
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'

    const withPhone = leads.filter(lead => lead.telefone && lead.telefone_limpo && lead.telefone_limpo.length >= 10).length
    const withEmail = leads.filter(lead => lead.email && isValidEmail(lead.email)).length
    const scheduled = leads.filter(lead => lead.data_agendamento && lead.data_agendamento.trim() !== '').length

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      withPhone,
      withEmail,
      scheduled,
      phonePercentage: totalLeads > 0 ? ((withPhone / totalLeads) * 100).toFixed(1) : '0',
      emailPercentage: totalLeads > 0 ? ((withEmail / totalLeads) * 100).toFixed(1) : '0'
    }
  }, [leads])

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</p>
                <p className="text-xs text-gray-500">+12% em relação ao mês anterior</p>
              </div>
              <div className="text-gray-400 text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
                <p className="text-xs text-gray-500">{metrics.convertedLeads} de {metrics.totalLeads} leads convertidos</p>
              </div>
              <div className="text-gray-400 text-2xl">🎯</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Telefone</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.withPhone}</p>
                <p className="text-xs text-gray-500">{metrics.phonePercentage}% do total</p>
              </div>
              <div className="text-gray-400 text-2xl">📱</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Email</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.withEmail}</p>
                <p className="text-xs text-gray-500">{metrics.emailPercentage}% do total</p>
              </div>
              <div className="text-gray-400 text-2xl">📧</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.scheduled}</p>
                <p className="text-xs text-gray-500">Reuniões agendadas</p>
              </div>
              <div className="text-gray-400 text-2xl">📅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Leads por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsChart leads={leads} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart leads={leads} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
