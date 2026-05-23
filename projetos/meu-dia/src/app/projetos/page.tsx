'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ProjectCard } from '@/components/projetos/ProjectCard'
import { ProjectForm } from '@/components/projetos/ProjectForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Project, ProjectStatus } from '@/lib/types'
import { Plus, FolderKanban } from 'lucide-react'

const FILTERS: { label: string; value: ProjectStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Pausados', value: 'pausado' },
  { label: 'Concluídos', value: 'concluido' },
  { label: 'Arquivados', value: 'arquivado' },
]

export default function ProjetosPage() {
  const projects = useStore((s) => s.projects)
  const addProject = useStore((s) => s.addProject)
  const [filter, setFilter] = useState<ProjectStatus | 'todos'>('todos')
  const [creating, setCreating] = useState(false)

  const filtered =
    filter === 'todos' ? projects : projects.filter((p) => p.status === filter)

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  function handleCreate(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    addProject(data)
    setCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban size={22} className="text-violet-600" />
          <h1 className="text-xl font-bold text-gray-900">Projetos</h1>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="gap-1.5">
          <Plus size={16} />
          Novo projeto
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.value === 'todos'
              ? projects.length
              : projects.filter((p) => p.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
              {count > 0 && <span className="ml-1.5 text-xs opacity-70">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Projects grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <FolderKanban size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-400 text-sm">
            {filter === 'todos'
              ? 'Nenhum projeto ainda. Crie o primeiro!'
              : 'Nenhum projeto com esse status.'}
          </p>
          {filter === 'todos' && (
            <Button onClick={() => setCreating(true)} variant="outline" size="sm">
              Criar primeiro projeto
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
          </DialogHeader>
          <ProjectForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
