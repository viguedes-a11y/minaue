'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/lib/types'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  projectColor?: string
}

const fontSans = 'var(--font-jost), Jost, sans-serif'

const TABS: { label: string; value: TaskStatus | 'todas' }[] = [
  { label: 'Todas',       value: 'todas' },
  { label: 'Pendentes',   value: 'pendente' },
  { label: 'Em andamento',value: 'em_andamento' },
  { label: 'Concluídas',  value: 'concluida' },
]

export function TaskList({ tasks, projectColor }: Props) {
  const [filter, setFilter] = useState<TaskStatus | 'todas'>('todas')
  const accent = projectColor ?? '#B8A070'

  const filtered = filter === 'todas' ? tasks : tasks.filter((t) => t.status === filter)
  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, baixa: 2, nenhuma: 3 }
    const statusOrder  = { em_andamento: 0, pendente: 1, concluida: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status])
      return statusOrder[a.status] - statusOrder[b.status]
    return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  })

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab.value === 'todas'
            ? tasks.length
            : tasks.filter((t) => t.status === tab.value).length
          const active = filter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className="shrink-0 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase border rounded-sm transition-all"
              style={{
                fontFamily: fontSans,
                fontWeight: 300,
                background: active ? accent : 'transparent',
                color:      active ? '#FAF8F4' : '#A09888',
                borderColor: active ? accent : '#D8D2C8',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 opacity-80">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tasks */}
      {sorted.length === 0 ? (
        <p
          className="text-center py-12 text-[13px]"
          style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
        >
          Nenhuma tarefa{filter !== 'todas' ? ' nessa categoria' : ' ainda'}.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <TaskItem key={task.id} task={task} projectColor={accent} />
          ))}
        </div>
      )}
    </div>
  )
}
