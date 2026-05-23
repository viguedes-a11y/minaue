'use client'

import { useState } from 'react'
import { Subtask } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  taskId: string
  subtasks: Subtask[]
}

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
        <p className="text-xs text-gray-500">
          {done}/{subtasks.length} subtarefas
        </p>
      )}

      <ul className="space-y-1">
        {subtasks.map((st) => (
          <li key={st.id} className="flex items-center gap-2 group">
            <Checkbox
              id={st.id}
              checked={st.completed}
              onCheckedChange={() => toggleSubtask(taskId, st.id)}
            />
            <label
              htmlFor={st.id}
              className={cn(
                'flex-1 text-sm cursor-pointer',
                st.completed && 'line-through text-gray-400'
              )}
            >
              {st.title}
            </label>
            <button
              onClick={() => deleteSubtask(taskId, st.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova subtarefa..."
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" variant="outline" className="h-8 px-2">
          <Plus size={15} />
        </Button>
      </form>
    </div>
  )
}
