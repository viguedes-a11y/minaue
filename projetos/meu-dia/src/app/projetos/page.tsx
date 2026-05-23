'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRootProjects, useSubProjects, useProjectPendingCount, useStore } from '@/lib/store'
import { Project, PROJECT_COLORS } from '@/lib/types'
import { ChevronRight, Plus, ArrowRight, Pencil, Trash2, MoreHorizontal, FolderPlus } from 'lucide-react'
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
function SubRow({ project, parentColor }: { project: Project; parentColor: string }) {
  const router  = useRouter()
  const pending = useProjectPendingCount(project.id)
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={() => router.push(`/projetos/${project.id}`)}
      className="sub-project-btn w-full flex items-center gap-3 text-left"
      style={{
        padding: '11px 16px 11px 22px',
        borderBottom: '1px solid rgba(216,210,200,0.45)',
        background: hov ? `${parentColor}10` : 'transparent',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: parentColor, opacity: 0.55, flexShrink: 0,
        }}
      />
      <span
        className="flex-1 truncate"
        style={{
          fontFamily: fontSans, fontSize: '13px', fontWeight: 300,
          color: hov ? '#282F29' : '#4A5A4B', letterSpacing: '0.025em',
        }}
      >
        {project.name}
      </span>
      {pending > 0 && (
        <span
          style={{
            fontFamily: fontSans, fontSize: '11px', fontWeight: 300,
            color: '#A09888', flexShrink: 0,
          }}
        >
          {pending}
        </span>
      )}
      <ChevronRight size={12} style={{ color: '#C8C4BC', flexShrink: 0 }} />
    </button>
  )
}

// ── Project card button ────────────────────────────────────────────────────
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const router      = useRouter()
  const subProjects = useSubProjects(project.id)
  const pending     = useProjectPendingCount(project.id)
  const { deleteProject } = useStore()
  const [expanded, setExpanded]       = useState(true)
  const [editing, setEditing]         = useState(false)
  const [addingSub, setAddingSub]     = useState(false)
  const [hov, setHov]                 = useState(false)

  const hasChildren = subProjects.length > 0

  return (
    <div
      className="project-card animate-fade-up"
      style={{
        animationDelay: `${index * 55}ms`,
        opacity: 0,
        background: '#FAF8F4',
        border: `1px solid ${hov ? project.color + '55' : '#D8D2C8'}`,
        borderLeft: `6px solid ${project.color}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: hov
          ? `0 6px 24px ${project.color}20`
          : '0 1px 5px rgba(40,47,41,0.05)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Main clickable row */}
      <div className="flex items-center">
        <button
          onClick={() => hasChildren ? setExpanded(!expanded) : router.push(`/projetos/${project.id}`)}
          className="flex-1 flex items-center gap-4 text-left min-w-0"
          style={{ padding: '15px 12px 15px 18px' }}
        >
          <span
            className="flex-1 truncate"
            style={{
              fontFamily: fontDisplay, fontSize: '19px', fontWeight: 400,
              color: '#282F29', letterSpacing: '0.01em',
            }}
          >
            {project.name}
          </span>

          {pending > 0 && (
            <span
              style={{
                background: 'rgba(184,160,112,0.13)',
                color: '#8B7550',
                border: '1px solid rgba(184,160,112,0.3)',
                borderRadius: '20px',
                padding: '2px 10px',
                fontFamily: fontSans, fontSize: '11px', fontWeight: 400,
                flexShrink: 0,
              }}
            >
              {pending}
            </span>
          )}

          {hasChildren ? (
            <ChevronRight
              size={16}
              style={{
                color: '#A09888', flexShrink: 0,
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.22s ease',
              }}
            />
          ) : (
            <ArrowRight
              size={15}
              style={{
                color: project.color, flexShrink: 0,
                opacity: hov ? 1 : 0.45,
                transition: 'opacity 0.2s ease',
              }}
            />
          )}
        </button>

        {/* Context menu */}
        <div style={{ paddingRight: '10px' }}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-8 h-8 flex items-center justify-center rounded transition-opacity"
              style={{ color: '#A09888', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={15} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => router.push(`/projetos/${project.id}`)}
                style={{ fontFamily: fontSans, fontSize: '13px' }}
              >
                Abrir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAddingSub(true)}
                style={{ fontFamily: fontSans, fontSize: '13px' }}
              >
                <FolderPlus size={12} className="mr-2 opacity-60" /> Nova subpasta
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
      </div>

      {/* Sub-projects accordion */}
      {hasChildren && (
        <div className={cn('subprojects-grid', expanded && 'open')}>
          <div className="subprojects-inner">
            <div style={{ borderTop: `1px solid ${project.color}22`, background: '#F5F1EA' }}>
              {subProjects.map((sp) => (
                <SubRow key={sp.id} project={sp} parentColor={project.color} />
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditProjectDialog project={project} onClose={() => setEditing(false)} />
      )}
      {addingSub && (
        <NewSubProjectDialog parentProject={project} onClose={() => setAddingSub(false)} />
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

// ── New sub-project dialog ─────────────────────────────────────────────────
function NewSubProjectDialog({ parentProject, onClose }: { parentProject: Project; onClose: () => void }) {
  const [name, setName]   = useState('')
  const [color, setColor] = useState(parentProject.color)
  const { addProject, projects } = useStore()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addProject({
      name: name.trim(),
      color,
      status: 'em_andamento',
      parentId: parentProject.id,
      order: projects.filter((p) => p.parentId === parentProject.id).length,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ background: '#FAF8F4' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
            Nova subpasta
          </DialogTitle>
        </DialogHeader>
        <p style={{ fontFamily: fontSans, fontSize: '12px', color: '#A09888', fontWeight: 300, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: parentProject.color, display: 'inline-block' }} />
          dentro de <strong style={{ color: '#282F29', fontWeight: 400 }}>{parentProject.name}</strong>
        </p>
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Nome da subpasta"
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
            <button type="submit" className="btn-minaue flex-1 justify-center">Criar subpasta</button>
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

      {/* ── Dark editorial header ── */}
      <div
        className="sticky top-0 z-10 px-6 pt-8 pb-6"
        style={{
          background: 'linear-gradient(135deg, #1e2a1e 0%, #282F29 60%, #1a241a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold orb ornament */}
        <div
          style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,160,112,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Bottom gold line */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(to right, #B8A070, rgba(184,160,112,0.3), transparent)',
          }}
        />

        <div className="relative flex items-end justify-between">
          <div>
            <h1
              style={{
                fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300,
                fontSize: '42px', color: '#D4BC8C', letterSpacing: '0.01em', lineHeight: 1,
              }}
            >
              Projetos
            </h1>
            <p
              style={{
                marginTop: '6px', fontFamily: fontSans, fontSize: '10px',
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: '#5E6E5F', fontWeight: 300,
              }}
            >
              {rootProjects.length} áreas · {new Date().getFullYear()}
            </p>
          </div>

          <button
            onClick={() => setCreating(true)}
            className="btn-minaue"
            style={{ padding: '8px 18px', fontSize: '10px', borderColor: 'rgba(184,160,112,0.6)', color: '#D4BC8C' }}
          >
            <Plus size={11} />
            Novo
          </button>
        </div>
      </div>

      {/* ── Project cards list ── */}
      <div className="flex-1 px-4 py-5 space-y-3">
        {rootProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <p
              style={{
                fontFamily: fontDisplay, fontStyle: 'italic', color: '#5E6E5F',
                fontWeight: 300, fontSize: '28px',
              }}
            >
              Nenhum projeto ainda.
            </p>
            <button onClick={() => setCreating(true)} className="btn-minaue" style={{ fontSize: '10px' }}>
              + Criar primeiro projeto
            </button>
          </div>
        ) : (
          rootProjects.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))
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
