'use client'

import { useState } from 'react'
import { Task, TaskPriority, TaskStatus, Recurrence, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface Props {
  projectId: string
  initial?: Partial<Task>
  onSave: (data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>, subtaskTitles?: string[]) => void
  onCancel: () => void
}

const fontSans = 'var(--font-jost), Jost, sans-serif'
const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'

const labelStyle = {
  fontFamily: fontSans,
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#7A8E7B',
  fontWeight: 300,
}

export function TaskForm({ projectId, initial, onSave, onCancel }: Props) {
  const [title, setTitle]                 = useState(initial?.title ?? '')
  const [description, setDescription]     = useState(initial?.description ?? '')
  const [priority, setPriority]           = useState<TaskPriority>(initial?.priority ?? 'media')
  const [status]                          = useState<TaskStatus>(initial?.status ?? 'pendente')
  const [estimatedMinutes, setEstMinutes] = useState(initial?.estimatedMinutes?.toString() ?? '')
  const [deadline, setDeadline]           = useState(initial?.deadline ?? '')
  const [recurrence, setRecurrence]       = useState<Recurrence>(initial?.recurrence ?? 'nenhuma')
  const [subtaskInput, setSubtaskInput]   = useState('')
  const [subtasks, setSubtasks]           = useState<string[]>([])

  const isEditing = !!initial?.title

  function addSubtask() {
    if (!subtaskInput.trim()) return
    setSubtasks((prev) => [...prev, subtaskInput.trim()])
    setSubtaskInput('')
  }

  function removeSubtask(i: number) {
    setSubtasks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave(
      {
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        deadline: deadline || undefined,
        recurrence,
      },
      isEditing ? undefined : subtasks,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title" style={labelStyle}>Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Gravar aula 3 do curso"
          autoFocus
          style={{ fontFamily: fontSans, color: '#282F29' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc" style={labelStyle}>Descrição (opcional)</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes, links, referências..."
          rows={2}
          style={{ fontFamily: fontSans, color: '#282F29' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label style={labelStyle}>Prioridade</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger style={{ fontFamily: fontSans, color: '#282F29' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v} style={{ fontFamily: fontSans }}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="est" style={labelStyle}>Estimativa (min)</Label>
          <Input
            id="est"
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstMinutes(e.target.value)}
            placeholder="Ex: 45"
            style={{ fontFamily: fontSans, color: '#282F29' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="deadline" style={labelStyle}>Prazo</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ fontFamily: fontSans, color: '#282F29' }}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={labelStyle}>Recorrência</Label>
          <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
            <SelectTrigger style={{ fontFamily: fontSans, color: '#282F29' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RECURRENCE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v} style={{ fontFamily: fontSans }}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subtarefas — só na criação */}
      {!isEditing && (
        <div className="space-y-2">
          <Label style={labelStyle}>Subtarefas</Label>

          {subtasks.length > 0 && (
            <div className="space-y-1">
              {subtasks.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                  style={{
                    padding: '6px 10px', borderRadius: '8px',
                    background: '#F5F1EA', border: '1px solid #E5E0D8',
                  }}
                >
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B8A070', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: fontDisplay, fontSize: '14px', color: '#282F29', fontWeight: 400 }}>
                    {s}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(i)}
                    style={{ color: '#C8C4BC', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
              placeholder="Adicionar subtarefa..."
              style={{ fontFamily: fontSans, color: '#282F29', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={addSubtask}
              style={{
                padding: '0 12px', borderRadius: '6px',
                border: '1px solid #D8D2C8', background: 'transparent',
                color: '#A09888', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8A070'; e.currentTarget.style.color = '#B8A070' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D8D2C8'; e.currentTarget.style.color = '#A09888' }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-minaue flex-1 justify-center">Salvar</button>
        <button
          type="button"
          className="btn-minaue"
          style={{ borderColor: '#D8D2C8', color: '#7A8E7B' }}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
