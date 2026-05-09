insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receitas-fotos', 'receitas-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "fotos: upload pelo dono"
  on storage.objects for insert
  with check (bucket_id = 'receitas-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "fotos: leitura pública"
  on storage.objects for select using (bucket_id = 'receitas-fotos');

create policy "fotos: deletar pelo dono"
  on storage.objects for delete
  using (bucket_id = 'receitas-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatares: upload pelo dono"
  on storage.objects for insert
  with check (bucket_id = 'avatares' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatares: leitura pública"
  on storage.objects for select using (bucket_id = 'avatares');

create policy "avatares: deletar pelo dono"
  on storage.objects for delete
  using (bucket_id = 'avatares' and auth.uid()::text = (storage.foldername(name))[1]);
