-- Rodar no Supabase Dashboard > SQL Editor
-- Projeto: minaue-central (luksckgvgzbcnlwncdtt.supabase.co)

-- ── Tabela de projetos ────────────────────────────────────────────
create table if not exists meudia_projects (
  id          text primary key,
  name        text not null,
  color       text not null default '#7A9E82',
  status      text not null default 'em_andamento',
  parent_id   text,
  order_index integer not null default 0,
  deadline    text,
  emoji       text,
  created_at  text,
  updated_at  text
);

-- ── Tabela de tarefas ─────────────────────────────────────────────
create table if not exists meudia_tasks (
  id                 text primary key,
  project_id         text not null,
  title              text not null,
  description        text,
  estimated_minutes  integer,
  time_spent         integer default 0,
  priority           text not null default 'media',
  status             text not null default 'pendente',
  deadline           text,
  recurrence         text not null default 'nenhuma',
  subtasks           jsonb default '[]',
  created_at         text,
  updated_at         text
);

-- ── Segurança: permitir acesso público (igual ao projeto minaue-central) ──
alter table meudia_projects enable row level security;
alter table meudia_tasks    enable row level security;

create policy "allow_all" on meudia_projects
  for all to anon using (true) with check (true);

create policy "allow_all" on meudia_tasks
  for all to anon using (true) with check (true);
