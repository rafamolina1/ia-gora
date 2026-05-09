create table notificacoes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  actor_id   uuid references auth.users(id) on delete cascade not null,
  receita_id uuid references receitas(id) on delete cascade,
  tipo       text not null check (tipo in ('like', 'comentario', 'nova_receita_seguindo')),
  lida       boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notificacoes_user_created_at on notificacoes(user_id, created_at desc);
create index idx_notificacoes_user_lida on notificacoes(user_id, lida);

alter table notificacoes enable row level security;

create policy "notificacoes: leitura própria"
  on notificacoes for select
  using (auth.uid() = user_id);

create policy "notificacoes: atualização própria"
  on notificacoes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notificacoes: criação por ator autenticado"
  on notificacoes for insert
  with check (auth.uid() = actor_id);
