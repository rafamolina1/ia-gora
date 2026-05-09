create extension if not exists "pg_trgm";

create table perfis (
  id                uuid references auth.users(id) on delete cascade primary key,
  username          text unique not null
                      check (username ~ '^[a-z0-9_]{3,30}$'),
  nome_exibicao     text not null default '',
  bio               text check (char_length(bio) <= 200),
  avatar_url        text,
  receitas_count    int not null default 0,
  seguidores_count  int not null default 0,
  seguindo_count    int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table receitas (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  titulo              text not null check (char_length(titulo) between 3 and 100),
  descricao           text check (char_length(descricao) <= 500),
  foto_url            text,
  tempo_minutos       int check (tempo_minutos > 0),
  porcoes             int check (porcoes > 0),
  dificuldade         text check (dificuldade in ('fácil', 'médio', 'difícil')),
  ingredientes        jsonb not null default '[]',
  passos              jsonb not null default '[]',
  tags                text[] default '{}',
  dica                text check (char_length(dica) <= 300),
  gerada_por_ia       boolean not null default false,
  publica             boolean not null default false,
  curtidas_count      int not null default 0,
  comentarios_count   int not null default 0,
  salvamentos_count   int not null default 0,
  views_count         int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_receitas_user_id on receitas(user_id);
create index idx_receitas_feed on receitas(created_at desc) where publica = true;
create index idx_receitas_curtidas on receitas(curtidas_count desc) where publica = true;
create index idx_receitas_tags on receitas using gin(tags);
create index idx_receitas_busca on receitas using gin(titulo gin_trgm_ops);

create table curtidas (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  receita_id  uuid references receitas(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique (user_id, receita_id)
);

create index idx_curtidas_receita on curtidas(receita_id);
create index idx_curtidas_user on curtidas(user_id);

create table salvamentos (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  receita_id  uuid references receitas(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique (user_id, receita_id)
);

create table comentarios (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  receita_id  uuid references receitas(id) on delete cascade not null,
  conteudo    text not null check (char_length(conteudo) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index idx_comentarios_receita on comentarios(receita_id);

create table seguidores (
  seguidor_id  uuid references auth.users(id) on delete cascade not null,
  seguido_id   uuid references auth.users(id) on delete cascade not null,
  created_at   timestamptz not null default now(),
  primary key (seguidor_id, seguido_id),
  check (seguidor_id != seguido_id)
);
