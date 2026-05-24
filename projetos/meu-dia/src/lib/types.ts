export type ProjectStatus = 'em_andamento' | 'pausado' | 'concluido' | 'arquivado'
export type TaskPriority = 'alta' | 'media' | 'baixa' | 'nenhuma'
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
  timeSpent?: number  // segundos acumulados
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
  emoji?: string
  color: string
  status: ProjectStatus
  parentId?: string   // sub-projeto quando preenchido
  order: number
  deadline?: string
  createdAt: string
  updatedAt: string
}

// Paleta de cores para novos projetos — tons terrosos, apagados, Minaue
export const PROJECT_COLORS = [
  '#B8886A', // terracota
  '#7A9E82', // sálvia
  '#9B8EC0', // lavanda
  '#7899B8', // azul aço
  '#C4848C', // rosa apagado
  '#8BB09A', // verde musgo suave
  '#B89C5A', // ocre dourado
  '#6B9BAA', // azul petróleo
  '#A07860', // cobre
  '#8A9E78', // verde folha
]

// ── Semana planejada ─────────────────────────────────────────────────────

// Bloco recorrente de horário (academia, buscar filha, foco PlanetaZen…)
export interface TimeBlock {
  id: string
  title: string
  color: string
  days: number[]          // 1=Seg … 7=Dom
  startMinutes: number    // minutos a partir da meia-noite (420 = 7:00)
  endMinutes: number
  type: 'fixed' | 'thematic'  // fixed = compromisso, thematic = foco em projeto
  projectId?: string
  createdAt: string
  updatedAt: string
}

// Tarefa marcada para uma semana específica
export interface WeekTask {
  id: string
  taskId: string
  dayOfWeek?: number      // 1=Seg … 7=Dom; undefined = na semana sem dia definido
  time?: string           // "HH:MM"
  weekOf: string          // ISO date da segunda-feira da semana
}

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
  nenhuma: 'Sem prioridade',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta: 'text-red-400 border-red-400/30 bg-red-400/10',
  media: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  baixa: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  nenhuma: 'text-zinc-500 border-zinc-700 bg-zinc-800/50',
}

export const CLASSIFICATION_LABELS: Record<TaskClassification, string> = {
  produtiva: 'Produtiva',
  neutra: 'Neutra',
  improdutiva: 'Improdutiva',
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  nenhuma: 'Não repete',
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
}
