import { Project } from './types'

const now = new Date().toISOString()

function p(
  id: string,
  name: string,
  color: string,
  order: number,
  parentId?: string
): Project {
  return { id, name, color, order, parentId, status: 'em_andamento', createdAt: now, updatedAt: now }
}

export const SEED_PROJECTS: Project[] = [
  // ── Raiz ──────────────────────────────────────────────────────
  p('glow-up',      'Glow Up',       '#C4848C', 0),  // rosa apagado
  p('minaue',       'Minaue',        '#7A9E82', 1),  // sálvia
  p('planetazen',   'PlanetaZen',    '#9B8EC0', 2),  // lavanda
  p('agentes-ia',   'Agentes de IA', '#7899B8', 3),  // azul aço
  p('pessoal',      'Pessoal',       '#B8886A', 4),  // terracota
  p('casa',         'Casa',          '#8BB09A', 5),  // verde musgo suave
  p('financas',     'Finanças',      '#B89C5A', 6),  // ocre dourado

  // ── Minaue ────────────────────────────────────────────────────
  p('minaue-pintar',    'Pintar Mandalas',             '#7A9E82', 0, 'minaue'),
  p('minaue-conteudo',  'Conteúdo Redes Sociais',      '#7A9E82', 1, 'minaue'),
  p('minaue-curso-pt',  'Curso Português',             '#7A9E82', 2, 'minaue'),
  p('minaue-curso-es',  'Curso — Espanhol',            '#7A9E82', 3, 'minaue'),
  p('minaue-curso-en',  'Curso — Inglês',              '#7A9E82', 4, 'minaue'),
  p('minaue-encomen',   'Encomendas',                  '#7A9E82', 5, 'minaue'),
  p('minaue-estrat',    'Estratégia',                  '#7A9E82', 6, 'minaue'),
  p('minaue-sites',     'Sites',                       '#7A9E82', 7, 'minaue'),
  p('minaue-ebook',     'Ebook — Sua Mandala no Mundo','#7A9E82', 8, 'minaue'),
  p('minaue-avancado',  'Curso Avançado',              '#7A9E82', 9, 'minaue'),

  // ── PlanetaZen ────────────────────────────────────────────────
  p('zen-producao',  'Produção',        '#9B8EC0', 0, 'planetazen'),
  p('zen-novos',     'Novos Produtos',  '#9B8EC0', 1, 'planetazen'),
  p('zen-plan',      'Planejamento',    '#9B8EC0', 2, 'planetazen'),
  p('zen-redes',     'Redes Sociais',   '#9B8EC0', 3, 'planetazen'),

  // ── Pessoal ───────────────────────────────────────────────────
  p('pessoal-europa', 'Projeto Europa', '#B8886A', 0, 'pessoal'),

  // ── Casa ──────────────────────────────────────────────────────
  p('casa-refeicoes', 'Refeições da Semana', '#8BB09A', 0, 'casa'),
  p('casa-limpeza',   'Rotinas de Limpeza',  '#8BB09A', 1, 'casa'),
  p('casa-compras',   'Compras',             '#8BB09A', 2, 'casa'),
]
