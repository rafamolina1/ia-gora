create policy "comentários: exclusão pelo dono da receita"
  on comentarios for delete
  using (
    exists (
      select 1
      from receitas
      where receitas.id = comentarios.receita_id
        and receitas.user_id = auth.uid()
    )
  );
