'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

// Components
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import OverviewTab from '@/components/tabs/OverviewTab'
import LeadsTab from '@/components/tabs/LeadsTab'
import PromptsTab from '@/components/tabs/PromptsTab'
import AgendamentosTab from '@/components/tabs/AgendamentosTab'
import AnalyticsTab from '@/components/tabs/AnalyticsTab'

// Types and API
import { Lead, Prompt } from '@/types'
import { fetchLeadsData, fetchPromptsData } from '@/lib/api'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Data states
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  
  const { toast } = useToast()

  const fetchAllData = async () => {
    console.log('=== INICIANDO BUSCA DE TODOS OS DADOS ===')
    setIsLoading(true)
    setError(null)

    try {
      const [leadsResult, promptsResult] = await Promise.allSettled([
        fetchLeadsData(),
        fetchPromptsData()
      ])

      let hasData = false

      // Process leads
      if (leadsResult.status === 'fulfilled') {
        console.log('✅ Leads carregados com sucesso')
        setAllLeads(leadsResult.value)
        hasData = true
      } else {
        console.error('❌ Erro ao carregar leads:', leadsResult.reason)
        toast({
          title: "Erro ao carregar leads",
          description: leadsResult.reason.message,
          variant: "destructive"
        })
      }

      // Process prompts
      if (promptsResult.status === 'fulfilled') {
        console.log('✅ Prompts carregados com sucesso')
        setAllPrompts(promptsResult.value)
        hasData = true
      } else {
        console.error('❌ Erro ao carregar prompts:', promptsResult.reason)
        toast({
          title: "Erro ao carregar prompts",
          description: promptsResult.reason.message,
          variant: "destructive"
        })
      }

      if (hasData) {
        setLastUpdate(new Date())
      } else {
        throw new Error('Falha ao carregar dados de ambos os endpoints')
      }

    } catch (error) {
      console.error('Erro geral ao buscar dados:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <LoadingState />
  }

  if (error && allLeads.length === 0 && allPrompts.length === 0) {
    return <ErrorState error={error} onRetry={fetchAllData} />
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Leads</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">Gerenciar Leads</TabsTrigger>
          <TabsTrigger value="prompts">🤖 Prompts IA</TabsTrigger>
          <TabsTrigger value="agendamentos">📅 Agendamentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab leads={allLeads} />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsTab leads={allLeads} setLeads={setAllLeads} />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsTab prompts={allPrompts} setPrompts={setAllPrompts} />
        </TabsContent>

        <TabsContent value="agendamentos">
          <AgendamentosTab leads={allLeads} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab leads={allLeads} />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}
