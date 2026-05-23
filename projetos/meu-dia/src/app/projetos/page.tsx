'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRootProjects, useSubProjects, useProjectPendingCount, useStore } from '@/lib/store'
import { Project, PROJECT_COLORS } from '@/lib/types'
import { ChevronRight, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

const labelStyle = {
  fontFamily: fontSans,
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#7A8E7B',
  fontWeight: 300,
}

// ── Sub-project row ────────────────────────────────────────────────────────
function SubRow({ project }: { project: Project }) {
  const router  = useRouter()
  const pending = useProjectPendingCount(project.id)

  return (
    <button
      onClick={() => router.push(`/projetos/${project.id}`)}
      className="w-full flex items-center justify-between gap-3 pl-12 pr-4 py-2.5 text-left transition-all group"
      style={{ borderBottom: '1px solid #EDE8DF' }}
    >
      <span
        className="flex-1 text-[13px] tracking-wide transition-colors group-hover:text-[#282F29]"
        style={{ color: '#6B7A6C', fontFamily: fontSans, fontWeight: 300 }}
      >
        {project.name}
      </span>
      {pending > 0 && (
        <span
          className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-sm"
          style={{ background: 'rgba(184,160,112,0.12)', color: '#B8A070', fontFamily: fontSans }}
        >
          {pending}
        </span>
      )}
      <ChevronRight size={12} style={{ color: '#C8C4BC' }} />
    </button>
  )
}

// ── Project row ────────────────────────────────────────────────────────────
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const router      = useRouter()
  const subProjects = useSubProjects(project.id)
  const pending     = useProjectPendingCount(project.id)
  const { deleteProject } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing]   = useState(false)

  const hasChildren = subProjects.length > 0

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, opacity: 0 }}
    >
      {/* Button row */}
      <div
        className="group/row flex items-center transition-all"
        style={{ borderBottom: '1px solid #E5E0D8' }}
      >
        {/* Chevron */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 w-10 h-12 flex items-center justify-center"
          style={{ color: hasChildren ? '#5E6E5F' : 'transparent', cursor: hasChildren ? 'pointer' : 'default' }}
          tabIndex={hasChildren ? 0 : -1}
        >
          <ChevronRight
            size={13}
            className="transition-transform duration-200"
            style={{ transform: expanded && hasChildren ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Color bar + name button */}
        <button
          onClick={() => hasChildren ? setExpanded(!expanded) : router.push(`/projetos/${project.id}`)}
          className="flex-1 flex items-center gap-3 py-3 text-left min-w-0 transition-opacity active:opacity-70"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: project.color }}
          />
          <span
            className="text-[16px] truncate"
            style={{ color: '#282F29', fontFamily: fontDisplay, fontWeight: 300, letterSpacing: '0.02em' }}
          >
            {project.name}
          </span>
        </button>

        {/* Pending badge */}
        {pending > 0 && (
          <span
            className="text-[10px] tabular-nums mr-2 px-2 py-0.5 rounded-sm"
            style={{ background: 'rgba(184,160,112,0.1)', color: '#B8A070', fontFamily: fontSans, fontWeight: 300 }}
          >
            {pending}
          </span>
        )}

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
              style={{ color: '#5E6E5F' }}
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => router.push(`/projetos/${project.id}`)}
              style={{ fontFamily: fontSans, fontSize: '13px' }}
            >
              Abrir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEditing(true)}
              style={{ fontFamily: fontSans, fontSize: '13px' }}
            >
              <Pencil size={12} className="mr-2 opacity-60" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteProject(project.id)}
              className="text-red-400 focus:text-red-400"
              style={{ fontFamily: fontSans, fontSize: '13px' }}
            >
              <Trash2 size={12} className="mr-2 opacity-60" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sub-projects accordion */}
      {hasChildren && (
        <div className={cn('subprojects-grid', expanded && 'open')} style={{ background: '#F5F1EA' }}>
          <div className="subprojects-inner">
            {subProjects.map((sp) => (
              <SubRow key={sp.id} project={sp} />
            ))}
          </div>
        </div>
      )}

      {editing && (
        <EditProjectDialog project={project} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}

// ── Edit dialog ────────────────────────────────────────────────────────────
function EditProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [name, setName] = useState(project.name)
  const { updateProject } = useStore()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateProject(project.id, { name: name.trim() })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ background: '#FAF8F4' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
            Editar projeto
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Nome do projeto"
              style={{ fontFamily: fontSans, color: '#282F29' }}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-minaue flex-1 justify-center">Salvar</button>
            <button
              type="button"
              className="btn-minaue"
              style={{ borderColor: '#D8D2C8', color: '#7A8E7B' }}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── New project dialog ─────────────────────────────────────────────────────
function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const { addProject, projects } = useStore()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addProject({
      name: name.trim(),
      color,
      status: 'em_andamento',
      order: projects.filter((p) => !p.parentId).length,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ background: '#FAF8F4' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
            Novo projeto
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Nome do projeto"
              style={{ fontFamily: fontSans, color: '#282F29' }}
            />
          </div>

          <div className="space-y-2">
            <Label style={labelStyle}>Cor</Label>
            <div className="flex gap-2.5 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-minaue flex-1 justify-center">Criar projeto</button>
            <button
              type="button"
              className="btn-minaue"
              style={{ borderColor: '#D8D2C8', color: '#7A8E7B' }}
              onClick={onClose}
            >
              Cancelar
            </button>
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
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">

      {/* Header */}
      <div
        className="flex items-end justify-between px-6 pt-8 pb-5 border-b sticky top-0 z-10"
        style={{ background: '#EDEAE4', borderColor: '#D8D2C8' }}
      >
        <div>
          <h1
            className="text-[32px] leading-none"
            style={{ fontFamily: fontDisplay, fontWeight: 300, color: '#282F29', letterSpacing: '0.01em' }}
          >
            Projetos
          </h1>
          <p
            className="mt-1.5 text-[11px] tracking-[0.2em] uppercase"
            style={{ color: '#5E6E5F', fontFamily: fontSans, fontWeight: 300 }}
          >
            {rootProjects.length} áreas · {new Date().getFullYear()}
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="btn-minaue"
          style={{ padding: '8px 20px', fontSize: '10px' }}
        >
          <Plus size={12} />
          Novo
        </button>
      </div>

      {/* Divisor dourado */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, #B8A070, transparent)', flexShrink: 0 }} />

      {/* Lista de projetos */}
      <div className="flex-1 py-3">
        {rootProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <p
              className="text-[28px]"
              style={{ fontFamily: fontDisplay, fontStyle: 'italic', color: '#5E6E5F', fontWeight: 300 }}
            >
              Nenhum projeto ainda.
            </p>
            <button onClick={() => setCreating(true)} className="btn-minaue" style={{ fontSize: '10px' }}>
              + Criar primeiro projeto
            </button>
          </div>
        ) : (
          <div>
            {rootProjects.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Rodapé decorativo */}
      <div className="px-6 py-5">
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #B8A07040, transparent)' }} />
      </div>

      {creating && <NewProjectDialog onClose={() => setCreating(false)} />}
    </div>
  )
}
