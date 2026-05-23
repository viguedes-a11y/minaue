export type ProjectStatus = 'em_andamento' | 'pausado' | 'concluido' | 'arquivado'
export type TaskPriority = 'alta' | 'media' | 'baixa'
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida'
export type TaskClassification = 'produtiva' | 'neutra' | 'improdutiva'
export type Recurrence = 'nenhuma' | 'diaria' | 'semanal' | 'mensal'

export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  estimatedMinutes?: number
  priority: TaskPriority
  status: TaskStatus
  deadline?: string
  classification?: TaskClassification
  recurrence: Recurrence
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  color: string
  status: ProjectStatus
  deadline?: string
  createdAt: string
  updatedAt: string
}

export const PROJECT_COLORS = [
  '#7C3AED', // roxo
  '#2563EB', // azul
  '#059669', // verde
  '#D97706', // âmbar
  '#DC2626', // vermelho
  '#DB2777', // rosa
  '#0891B2', // ciano
  '#65A30D', // limão
]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  em_andamento: 'Em andamento',
  pausado: 'Pausado',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta: 'bg-red-100 text-red-700 border-red-200',
  media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  baixa: 'bg-green-100 text-green-700 border-green-200',
}

export const CLASSIFICATION_LABELS: Record<TaskClassification, string> = {
  produtiva: 'Produtiva',
  neutra: 'Neutra',
  improdutiva: 'Improdutiva',
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  nenhuma: 'Nenhuma',
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
}
