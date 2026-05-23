'use client'

import { useState } from 'react'
import { Subtask } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  taskId: string
  subtasks: Subtask[]
}

const fontSans = 'var(--font-jost), Jost, sans-serif'

export function SubtaskList({ taskId, subtasks }: Props) {
  const [newTitle, setNewTitle] = useState('')
  const { addSubtask, toggleSubtask, deleteSubtask } = useStore()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    addSubtask(taskId, newTitle.trim())
    setNewTitle('')
  }

  const done = subtasks.filter((s) => s.completed).length

  return (
    <div className="space-y-2">
      {subtasks.length > 0 && (
        <p
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
        >
          {done}/{subtasks.length} subtarefas
        </p>
      )}

      <ul className="space-y-1.5">
        {subtasks.map((st) => (
          <li key={st.id} className="flex items-center gap-2 group">
            <Checkbox
              id={st.id}
              checked={st.completed}
              onCheckedChange={() => toggleSubtask(taskId, st.id)}
            />
            <label
              htmlFor={st.id}
              className={cn('flex-1 text-[13px] cursor-pointer')}
              style={{
                fontFamily: fontSans,
                fontWeight: 300,
                color: st.completed ? '#A09888' : '#282F29',
                textDecoration: st.completed ? 'line-through' : 'none',
              }}
            >
              {st.title}
            </label>
            <button
              onClick={() => deleteSubtask(taskId, st.id)}
              className="opacity-0 group-hover:opacity-100 transition-all p-1"
              style={{ color: '#C8C4BC' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova subtarefa..."
          className="h-8 text-[13px]"
          style={{ fontFamily: fontSans, color: '#282F29' }}
        />
        <button
          type="submit"
          className="h-8 w-8 flex items-center justify-center border rounded transition-colors flex-shrink-0"
          style={{ borderColor: '#D8D2C8', color: '#A09888', background: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#B8A070'
            e.currentTarget.style.color = '#FAF8F4'
            e.currentTarget.style.borderColor = '#B8A070'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#A09888'
            e.currentTarget.style.borderColor = '#D8D2C8'
          }}
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  )
}
