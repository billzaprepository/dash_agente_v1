'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Lead } from '@/types'
import { deleteLeads } from '@/lib/api'
import LeadsTable from '@/components/LeadsTable'
import EditLeadModal from '@/components/modals/EditLeadModal'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal'

interface LeadsTabProps {
  leads: Lead[]
  setLeads: (leads: Lead[]) => void
}

export default function LeadsTab({ leads, setLeads }: LeadsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [originFilter, setOriginFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set())
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    leads: Lead[]
    type: 'single' | 'bulk' | 'all'
  }>({ isOpen: false, leads: [], type: 'single' })

  const { toast } = useToast()

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      const matchesSearch = !searchTerm ||
        lead.nomewpp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || lead.status_atendimento === statusFilter

      // Origin filter
      const matchesOrigin = originFilter === 'all' || lead.origem_lead === originFilter

      // Date filter (simplified for now)
      const matchesDate = dateFilter === 'all' || true // TODO: Implement date filtering

      return matchesSearch && matchesStatus && matchesOrigin && matchesDate
    })
  }, [leads, searchTerm, statusFilter, originFilter, dateFilter])

  const handleDeleteLeads = async (leadsToDelete: Lead[], type: 'single' | 'bulk' | 'all') => {
    try {
      await deleteLeads(leadsToDelete, type)
      
      // Remove deleted leads from state
      const deletedIds = leadsToDelete.map(lead => lead.id)
      setLeads(leads.filter(lead => !deletedIds.includes(lead.id)))
      setSelectedLeads(new Set())
      
      const message = type === 'all' ? 'Todos os leads foram excluídos!' :
                     type === 'bulk' ? `${leadsToDelete.length} leads excluídos!` :
                     'Lead excluído com sucesso!'
      
      toast({
        title: "Sucesso",
        description: message,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao excluir leads',
        variant: "destructive"
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setOriginFilter('all')
    setDateFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                placeholder="Nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
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
            <div>
              <label className="block text-sm font-medium mb-2">Origem</label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="last7Days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30Days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
            <span className="text-sm text-gray-600">
              Mostrando {filteredLeads.length} de {leads.length} leads
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedLeads.size} leads selecionados</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLeads(new Set())}
                >
                  Desmarcar Todos
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const leadsToDelete = leads.filter(lead => selectedLeads.has(lead.id))
                    setDeleteModal({ isOpen: true, leads: leadsToDelete, type: 'bulk' })
                  }}
                >
                  Excluir Selecionados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsTable
            leads={filteredLeads}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            onEdit={setEditingLead}
            onDelete={(lead) => setDeleteModal({ isOpen: true, leads: [lead], type: 'single' })}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            <strong>Atenção:</strong> As ações abaixo são irreversíveis e irão excluir permanentemente todos os dados.
            Use com extrema cautela!
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100"
            onClick={() => setDeleteModal({ isOpen: true, leads, type: 'all' })}
          >
            🗑️ Excluir TODOS os Leads
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(updatedLead) => {
            setLeads(leads.map(lead => lead.id === updatedLead.id ? updatedLead : lead))
            setEditingLead(null)
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        leads={deleteModal.leads}
        type={deleteModal.type}
        onClose={() => setDeleteModal({ isOpen: false, leads: [], type: 'single' })}
        onConfirm={handleDeleteLeads}
      />
    </div>
  )
}
