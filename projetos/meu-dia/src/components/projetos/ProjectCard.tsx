'use client'

import Link from 'next/link'
import { Project, STATUS_LABELS } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, ListTodo } from 'lucide-react'

interface Props {
  project: Project
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  em_andamento: 'default',
  pausado: 'secondary',
  concluido: 'outline',
  arquivado: 'secondary',
}

export function ProjectCard({ project }: Props) {
  const totalTasks = useStore((s) => s.tasks.filter((t) => t.projectId === project.id).length)
  const doneTasks = useStore((s) => s.tasks.filter((t) => t.projectId === project.id && t.status === 'concluida').length)
  const pending = totalTasks - doneTasks
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  const deadlinePast = project.deadline && isPast(parseISO(project.deadline))

  return (
    <Link href={`/projetos/${project.id}`}>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="font-semibold text-gray-900 leading-tight">{project.name}</h3>
          </div>
          <Badge variant={STATUS_VARIANT[project.status]} className="text-xs shrink-0">
            {STATUS_LABELS[project.status]}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progress}% concluído</span>
            <span>{totalTasks} tarefas</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ListTodo size={13} />
            {pending} pendente{pending !== 1 ? 's' : ''}
          </span>
          {project.deadline && (
            <span
              className={`flex items-center gap-1 ${deadlinePast ? 'text-red-500 font-medium' : ''}`}
            >
              <CalendarDays size={13} />
              {format(parseISO(project.deadline), 'dd MMM', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
