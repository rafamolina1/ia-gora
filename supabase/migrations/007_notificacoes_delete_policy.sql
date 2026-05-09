create policy "notificacoes: exclusão própria"
  on notificacoes for delete
  using (auth.uid() = user_id);
