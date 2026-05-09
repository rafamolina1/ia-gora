create policy "perfis: criação pelo dono"
  on perfis for insert
  with check (auth.uid() = id);
