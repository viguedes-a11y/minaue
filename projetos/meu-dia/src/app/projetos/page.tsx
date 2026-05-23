'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRootProjects, useSubProjects, useProjectPendingCount, useStore } from '@/lib/store'
import { Project, PROJECT_COLORS } from '@/lib/types'
import { ChevronRight, Plus, MoreHorizontal, Pencil, Trash2, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// ── Sub-project row ────────────────────────────────────────────────────────
function SubRow({ project }: { project: Project }) {
  const router = useRouter()
  const pending = useProjectPendingCount(project.id)

  return (
    <button
      onClick={() => router.push(`/projetos/${project.id}`)}
      className="w-full flex items-center gap-3 pl-10 pr-4 py-2 text-left transition-colors hover:bg-white/[0.03] group"
    >
      <span className="text-base leading-none">{project.emoji ?? '•'}</span>
      <span className="flex-1 text-sm" style={{ color: '#C0BBB6' }}>
        {project.name}
      </span>
      {pending > 0 && (
        <span
          className="text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-full"
          style={{ background: '#1D1B19', color: '#7A7470' }}
        >
          {pending}
        </span>
      )}
    </button>
  )
}

// ── Project row ────────────────────────────────────────────────────────────
function ProjectRow({ project }: { project: Project }) {
  const router = useRouter()
  const subProjects = useSubProjects(project.id)
  const pending = useProjectPendingCount(project.id)
  const { deleteProject } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)

  const hasChildren = subProjects.length > 0

  return (
    <div className="group/row">
      {/* Main row */}
      <div
        className="flex items-center gap-0 transition-colors hover:bg-white/[0.03]"
        style={{ borderLeft: `3px solid ${project.color}` }}
      >
        {/* Expand toggle (só se tem sub-projetos) */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 w-8 h-10 flex items-center justify-center transition-transform"
            style={{ color: '#4A4744' }}
          >
            <ChevronRight
              size={14}
              className="transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </button>
        ) : (
          <div className="w-8 h-10" />
        )}

        {/* Emoji + nome */}
        <button
          onClick={() => hasChildren ? setExpanded(!expanded) : router.push(`/projetos/${project.id}`)}
          className="flex-1 flex items-center gap-2.5 py-2.5 text-left min-w-0"
        >
          <span className="text-lg leading-none flex-shrink-0">{project.emoji ?? '📁'}</span>
          <span className="text-[15px] font-medium tracking-tight truncate" style={{ color: '#EDE8E3' }}>
            {project.name}
          </span>
        </button>

        {/* Contador de pendentes */}
        {pending > 0 && (
          <span
            className="text-xs tabular-nums mr-2 px-2 py-0.5 rounded-full"
            style={{ background: '#1D1B19', color: '#7A7470' }}
          >
            {pending}
          </span>
        )}

        {/* Menu de ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-8 h-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
              style={{ color: '#4A4744' }}
            >
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => router.push(`/projetos/${project.id}`)}>
              <Pencil size={13} className="mr-2" /> Abrir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil size={13} className="mr-2" /> Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteProject(project.id)}
              className="text-red-400 focus:text-red-400"
            >
              <Trash2 size={13} className="mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sub-projects accordion */}
      {hasChildren && (
        <div className={cn('subprojects-grid', expanded && 'open')}>
          <div className="subprojects-inner">
            <div
              className="pb-1"
              style={{ borderLeft: `3px solid ${project.color}20` }}
            >
              {subProjects.map((sp) => (
                <SubRow key={sp.id} project={sp} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      {editing && (
        <RenameDialog
          project={project}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

// ── Rename dialog ──────────────────────────────────────────────────────────
function RenameDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [name, setName] = useState(project.name)
  const [emoji, setEmoji] = useState(project.emoji ?? '')
  const { updateProject } = useStore()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateProject(project.id, { name: name.trim(), emoji: emoji.trim() || undefined })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: '#7A7470' }}>Emoji</Label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🎯"
                className="text-center text-lg"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: '#7A7470' }}>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Nome do projeto"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">Salvar</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── New project dialog ─────────────────────────────────────────────────────
function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const { addProject, projects } = useStore()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const rootProjects = projects.filter((p) => !p.parentId)
    addProject({
      name: name.trim(),
      emoji: emoji.trim() || undefined,
      color,
      status: 'em_andamento',
      order: rootProjects.length,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: '#7A7470' }}>Emoji</Label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="📁"
                className="text-center text-lg"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: '#7A7470' }}>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Nome do projeto"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs" style={{ color: '#7A7470' }}>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full ring-2 ring-offset-2 transition-all"
                  style={{
                    backgroundColor: c,
                    ringOffsetColor: '#0F0E0D',
                    outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">Criar projeto</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProjetosPage() {
  const rootProjects = useRootProjects()
  const [creating, setCreating] = useState(false)

  return (
    <div className="max-w-xl mx-auto px-0 py-0 min-h-screen flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
        style={{ background: '#0F0E0D', borderColor: '#1D1B19' }}
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#EDE8E3' }}>
            Projetos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#4A4744' }}>
            {rootProjects.length} áreas
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/[0.06]"
          style={{ color: '#7A7470', border: '1px solid #262320' }}
        >
          <Plus size={14} />
          Novo
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 py-2">
        {rootProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FolderPlus size={36} style={{ color: '#2A2826' }} />
            <p className="text-sm" style={{ color: '#4A4744' }}>
              Nenhum projeto. Crie o primeiro!
            </p>
            <button
              onClick={() => setCreating(true)}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#1D1B19', color: '#7A7470' }}
            >
              + Criar projeto
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1A1816' }}>
            {rootProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {creating && <NewProjectDialog onClose={() => setCreating(false)} />}
    </div>
  )
}
