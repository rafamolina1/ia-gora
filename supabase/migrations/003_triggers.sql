create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  final_username := base_username;

  while exists (select 1 from public.perfis where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.perfis (id, username, nome_exibicao)
  values (new.id, final_username, split_part(new.email, '@', 1));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger receitas_updated_at before update on receitas for each row execute procedure set_updated_at();
create trigger perfis_updated_at before update on perfis for each row execute procedure set_updated_at();

create or replace function sync_curtidas_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set curtidas_count = curtidas_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set curtidas_count = greatest(0, curtidas_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create trigger trg_curtidas after insert or delete on curtidas
  for each row execute procedure sync_curtidas_count();

create or replace function sync_comentarios_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set comentarios_count = comentarios_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set comentarios_count = greatest(0, comentarios_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create trigger trg_comentarios after insert or delete on comentarios
  for each row execute procedure sync_comentarios_count();

create or replace function sync_salvamentos_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update receitas set salvamentos_count = salvamentos_count + 1 where id = new.receita_id;
  elsif TG_OP = 'DELETE' then
    update receitas set salvamentos_count = greatest(0, salvamentos_count - 1) where id = old.receita_id;
  end if;
  return null;
end;
$$;

create trigger trg_salvamentos after insert or delete on salvamentos
  for each row execute procedure sync_salvamentos_count();

create or replace function sync_receitas_count()
returns trigger language plpgsql as $$
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

create trigger trg_receitas_count after insert or update or delete on receitas
  for each row execute procedure sync_receitas_count();

create or replace function sync_seguidores_count()
returns trigger language plpgsql as $$
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

create trigger trg_seguidores after insert or delete on seguidores
  for each row execute procedure sync_seguidores_count();
