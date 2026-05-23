'use client'

import { useState } from 'react'
import { Task, TaskPriority, TaskStatus, Recurrence, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  projectId: string
  initial?: Partial<Task>
  onSave: (data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function TaskForm({ projectId, initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'media')
  const [status] = useState<TaskStatus>(initial?.status ?? 'pendente')
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initial?.estimatedMinutes?.toString() ?? ''
  )
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'nenhuma')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      deadline: deadline || undefined,
      recurrence,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título da tarefa</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Gravar aula 3 do curso"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc">Descrição (opcional)</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes, links, referências..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="est">Estimativa (min)</Label>
          <Input
            id="est"
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="Ex: 45"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="deadline">Prazo</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Recorrência</Label>
          <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RECURRENCE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Salvar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
