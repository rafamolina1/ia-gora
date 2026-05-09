create or replace function sync_curtidas_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set curtidas_count = curtidas_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set curtidas_count = greatest(0, curtidas_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create or replace function sync_comentarios_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set comentarios_count = comentarios_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set comentarios_count = greatest(0, comentarios_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create or replace function sync_salvamentos_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set salvamentos_count = salvamentos_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set salvamentos_count = greatest(0, salvamentos_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create or replace function sync_receitas_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' and new.publica then
    update perfis set receitas_count = receitas_count + 1 where id = new.user_id;
  elsif TG_OP = 'DELETE' and old.publica then
    update perfis set receitas_count = greatest(0, receitas_count - 1) where id = old.user_id;
  elsif TG_OP = 'UPDATE' then
    if new.publica and not old.publica then
      update perfis set receitas_count = receitas_count + 1 where id = new.user_id;
    elsif not new.publica and old.publica then
      update perfis set receitas_count = greatest(0, receitas_count - 1) where id = new.user_id;
    end if;
  end if;
  return null;
end;
$$;

create or replace function sync_seguidores_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update perfis set seguidores_count = seguidores_count + 1 where id = new.seguido_id;
    update perfis set seguindo_count = seguindo_count + 1 where id = new.seguidor_id;
  elsif TG_OP = 'DELETE' then
    update perfis set seguidores_count = greatest(0, seguidores_count - 1) where id = old.seguido_id;
    update perfis set seguindo_count = greatest(0, seguindo_count - 1) where id = old.seguidor_id;
  end if;
  return null;
end;
$$;
