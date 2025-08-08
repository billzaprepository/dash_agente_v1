'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Prompt } from '@/types'
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/api'
import PromptsGrid from '@/components/PromptsGrid'
import PromptModal from '@/components/modals/PromptModal'

interface PromptsTabProps {
  prompts: Prompt[]
  setPrompts: (prompts: Prompt[]) => void
}

export default function PromptsTab({ prompts, setPrompts }: PromptsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { toast } = useToast()

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchTerm ||
        prompt.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.descricao?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || prompt.categoria === categoryFilter
      const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [prompts, searchTerm, categoryFilter, statusFilter])

  const metrics = useMemo(() => {
    const total = prompts.length
    const active = prompts.filter(p => p.status === 'ativo').length
    const inactive = prompts.filter(p => p.status === 'inativo').length
    const highPriority = prompts.filter(p => p.prioridade === 'alta').length

    return { total, active, inactive, highPriority }
  }, [prompts])

  const handleSavePrompt = async (promptData: Omit<Prompt, 'id' | 'created_at'>) => {
    try {
      if (editingPrompt) {
        // Update existing prompt
        await updatePrompt(editingPrompt.id, promptData)
        setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptData } : p))
        toast({ title: "Sucesso", description: "Prompt atualizado com sucesso!" })
      } else {
        // Create new prompt
        const newPrompt = await createPrompt(promptData)
        setPrompts([newPrompt, ...prompts])
        toast({ title: "Sucesso", description: "Prompt criado com sucesso!" })
      }
      setIsModalOpen(false)
      setEditingPrompt(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao salvar prompt',
        variant: "destructive"
      })
    }
  }

  const handleDeletePrompt = async (promptId: number) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return

    try {
      await deletePrompt(promptId)
      setPrompts(prompts.filter(p => p.id !== promptId))
      toast({ title: "Sucesso", description: "Prompt excluído com sucesso!" })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao excluir prompt',
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (promptId: number) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (!prompt) return

    const newStatus = prompt.status === 'ativo' ? 'inativo' : 'ativo'
    
    try {
      await updatePrompt(promptId, { status: newStatus })
      setPrompts(prompts.map(p => p.id === promptId ? { ...p, status: newStatus } : p))
      toast({ 
        title: "Sucesso", 
        description: `Prompt ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!` 
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao alterar status',
        variant: "destructive"
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Prompts IA</h2>
          <p className="text-gray-600">Configure e gerencie os prompts dos agentes de IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            🔧 Testar Endpoint
          </Button>
          <Button variant="outline">
            📤 Exportar
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            ➕ Novo Prompt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                placeholder="Título ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                  <SelectItem value="Qualificação">Qualificação</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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
              Mostrando {filteredPrompts.length} de {prompts.length} prompts
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">🤖</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-xl font-bold text-gray-900">{metrics.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold">⏸️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-xl font-bold text-gray-900">{metrics.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">🔥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-xl font-bold text-gray-900">{metrics.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Grid */}
      <PromptsGrid
        prompts={filteredPrompts}
        onEdit={(prompt) => {
          setEditingPrompt(prompt)
          setIsModalOpen(true)
        }}
        onDelete={handleDeletePrompt}
        onToggleStatus={handleToggleStatus}
        onDuplicate={(prompt) => {
          setEditingPrompt({ ...prompt, titulo: `${prompt.titulo} (Cópia)`, status: 'inativo' })
          setIsModalOpen(true)
        }}
      />

      {/* Modal */}
      <PromptModal
        isOpen={isModalOpen}
        prompt={editingPrompt}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPrompt(null)
        }}
        onSave={handleSavePrompt}
      />
    </div>
  )
}
