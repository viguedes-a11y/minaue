'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/lib/types'
import { TaskItem } from './TaskItem'
import { Button } from '@/components/ui/button'

interface Props {
  tasks: Task[]
}

const TABS: { label: string; value: TaskStatus | 'todas' }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Concluídas', value: 'concluida' },
]

export function TaskList({ tasks }: Props) {
  const [filter, setFilter] = useState<TaskStatus | 'todas'>('todas')

  const filtered =
    filter === 'todas' ? tasks : tasks.filter((t) => t.status === filter)

  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, baixa: 2 }
    const statusOrder = { em_andamento: 0, pendente: 1, concluida: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status])
      return statusOrder[a.status] - statusOrder[b.status]
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count =
            tab.value === 'todas'
              ? tasks.length
              : tasks.filter((t) => t.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tasks */}
      {sorted.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">
          Nenhuma tarefa {filter !== 'todas' ? 'nessa categoria' : 'ainda'}.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
