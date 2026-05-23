import { Project } from './types'

const now = new Date().toISOString()

function p(
  id: string,
  name: string,
  emoji: string,
  color: string,
  order: number,
  parentId?: string
): Project {
  return { id, name, emoji, color, order, parentId, status: 'em_andamento', createdAt: now, updatedAt: now }
}

export const SEED_PROJECTS: Project[] = [
  // ── Raiz ──────────────────────────────────────────────────────
  p('glow-up',      'Glow Up',       '✨', '#F472B6', 0),
  p('minaue',       'Minaue',        '🌸', '#4ADE80', 1),
  p('planetazen',   'PlanetaZen',    '🌿', '#A78BFA', 2),
  p('agentes-ia',   'Agentes de IA', '🤖', '#38BDF8', 3),
  p('pessoal',      'Pessoal',       '🧡', '#FB923C', 4),
  p('casa',         'Casa',          '🏠', '#86EFAC', 5),
  p('financas',     'Finanças',      '💰', '#FBBF24', 6),

  // ── Minaue ────────────────────────────────────────────────────
  p('minaue-pintar',    'Pintar Mandalas',            '🎨', '#4ADE80', 0, 'minaue'),
  p('minaue-conteudo',  'Conteúdo Redes Sociais',     '📱', '#4ADE80', 1, 'minaue'),
  p('minaue-curso-pt',  'Curso Português',            '🇧🇷', '#4ADE80', 2, 'minaue'),
  p('minaue-curso-es',  'Curso — Espanhol',           '🇪🇸', '#4ADE80', 3, 'minaue'),
  p('minaue-curso-en',  'Curso — Inglês',             '🇬🇧', '#4ADE80', 4, 'minaue'),
  p('minaue-encomen',   'Encomendas',                 '📦', '#4ADE80', 5, 'minaue'),
  p('minaue-estrat',    'Estratégia',                 '🎯', '#4ADE80', 6, 'minaue'),
  p('minaue-sites',     'Sites',                      '🌐', '#4ADE80', 7, 'minaue'),
  p('minaue-ebook',     'Ebook — Sua Mandala no Mundo','📖', '#4ADE80', 8, 'minaue'),
  p('minaue-avancado',  'Curso Avançado',             '🚀', '#4ADE80', 9, 'minaue'),

  // ── PlanetaZen ────────────────────────────────────────────────
  p('zen-producao',  'Produção',        '🏭', '#A78BFA', 0, 'planetazen'),
  p('zen-novos',     'Novos Produtos',  '🆕', '#A78BFA', 1, 'planetazen'),
  p('zen-plan',      'Planejamento',    '📋', '#A78BFA', 2, 'planetazen'),
  p('zen-redes',     'Redes Sociais',   '📱', '#A78BFA', 3, 'planetazen'),

  // ── Pessoal ───────────────────────────────────────────────────
  p('pessoal-europa', 'Projeto Europa', '✈️', '#FB923C', 0, 'pessoal'),

  // ── Casa ──────────────────────────────────────────────────────
  p('casa-refeicoes', 'Refeições da Semana', '🍽️', '#86EFAC', 0, 'casa'),
  p('casa-limpeza',   'Rotinas de Limpeza',  '🧹', '#86EFAC', 1, 'casa'),
  p('casa-compras',   'Compras',             '🛒', '#86EFAC', 2, 'casa'),
]
