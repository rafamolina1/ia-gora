alter table receitas
  add column if not exists published_at timestamptz;

update receitas
set published_at = created_at
where publica = true
  and published_at is null;

create index if not exists idx_receitas_published_at
  on receitas(published_at desc)
  where publica = true;
