'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lead } from '@/types'
import AgendaListView from '@/components/AgendaListView'
import AgendaCalendarView from '@/components/AgendaCalendarView'

interface AgendamentosTabProps {
  leads: Lead[]
}

export default function AgendamentosTab({ leads }: AgendamentosTabProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const scheduledLeads = useMemo(() => {
    return leads.filter(lead => lead.data_agendamento && lead.data_agendamento.trim() !== '')
  }, [leads])

  const filteredScheduledLeads = useMemo(() => {
    return scheduledLeads.filter(lead => {
      const matchesSearch = !searchTerm ||
        lead.nomewpp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || lead.status_atendimento === statusFilter

      // TODO: Implement date filtering
      const matchesDate = dateFilter === 'all' || true

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [scheduledLeads, searchTerm, statusFilter, dateFilter])

  const metrics = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const agendaToday = scheduledLeads.filter(lead => {
      if (!lead.data_agendamento) return false
      try {
        const agendaDate = new Date(lead.data_agendamento)
        const agendaDateOnly = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), agendaDate.getDate())
        return agendaDateOnly.getTime() === todayOnly.getTime()
      } catch {
        return false
      }
    }).length

    const agendaTomorrow = scheduledLeads.filter(lead => {
      if (!lead.data_agendamento) return false
      try {
        const agendaDate = new Date(lead.data_agendamento)
        const agendaDateOnly = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), agendaDate.getDate())
        return agendaDateOnly.getTime() === tomorrowOnly.getTime()
      } catch {
        return false
      }
    }).length

    const agendaThisWeek = scheduledLeads.filter(lead => {
      if (!lead.data_agendamento) return false
      try {
        const agendaDate = new Date(lead.data_agendamento)
        const agendaDateOnly = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), agendaDate.getDate())
        return agendaDateOnly >= startOfWeek && agendaDateOnly <= endOfWeek
      } catch {
        return false
      }
    }).length

    return {
      today: agendaToday,
      tomorrow: agendaTomorrow,
      thisWeek: agendaThisWeek,
      total: scheduledLeads.length
    }
  }, [scheduledLeads])

  const clearFilters = () => {
    setSearchTerm('')
    setDateFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reuniões Agendadas</h2>
          <p className="text-gray-600">Gerencie todos os agendamentos de leads</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            📋 Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
          >
            📅 Calendário
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                placeholder="Nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="tomorrow">Amanhã</SelectItem>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="nextWeek">Próxima semana</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="past">Passados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status do Lead</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Convertido">Convertido</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                  <SelectItem value="Qualificado">Qualificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar filtros
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Mostrando {filteredScheduledLeads.length} de {scheduledLeads.length} agendamentos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-xl font-bold text-gray-900">{metrics.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⏰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amanhã</p>
                <p className="text-xl font-bold text-gray-900">{metrics.tomorrow}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-xl font-bold text-gray-900">{metrics.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <AgendaListView leads={filteredScheduledLeads} />
      ) : (
        <AgendaCalendarView leads={filteredScheduledLeads} />
      )}
    </div>
  )
}
