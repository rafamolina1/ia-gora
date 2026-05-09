alter table perfis enable row level security;
create policy "perfis: leitura pública" on perfis for select using (true);
create policy "perfis: edição pelo dono" on perfis for update using (auth.uid() = id);

alter table receitas enable row level security;
create policy "receitas: leitura pública ou própria"
  on receitas for select using (publica = true or auth.uid() = user_id);
create policy "receitas: inserção pelo dono" on receitas for insert with check (auth.uid() = user_id);
create policy "receitas: edição pelo dono" on receitas for update using (auth.uid() = user_id);
create policy "receitas: exclusão pelo dono" on receitas for delete using (auth.uid() = user_id);

alter table curtidas enable row level security;
create policy "curtidas: leitura pública" on curtidas for select using (true);
create policy "curtidas: inserção" on curtidas for insert with check (auth.uid() = user_id);
create policy "curtidas: exclusão" on curtidas for delete using (auth.uid() = user_id);

alter table salvamentos enable row level security;
create policy "salvamentos: leitura própria" on salvamentos for select using (auth.uid() = user_id);
create policy "salvamentos: inserção" on salvamentos for insert with check (auth.uid() = user_id);
create policy "salvamentos: exclusão" on salvamentos for delete using (auth.uid() = user_id);

alter table comentarios enable row level security;
create policy "comentários: leitura pública" on comentarios for select using (true);
create policy "comentários: inserção" on comentarios for insert with check (auth.uid() = user_id);
create policy "comentários: exclusão" on comentarios for delete using (auth.uid() = user_id);

alter table seguidores enable row level security;
create policy "seguidores: leitura pública" on seguidores for select using (true);
create policy "seguidores: seguir" on seguidores for insert with check (auth.uid() = seguidor_id);
create policy "seguidores: deixar de seguir" on seguidores for delete using (auth.uid() = seguidor_id);
