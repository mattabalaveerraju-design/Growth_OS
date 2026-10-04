create table if not exists public.focus_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  start_time text not null,
  end_time text not null,
  status text not null,
  priority text not null,
  description text not null default '',
  "order" integer not null default 0,
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists focus_items_user_id_order_idx
  on public.focus_items (user_id, "order");

alter table public.focus_items enable row level security;

drop policy if exists "Users can read their own Focus items" on public.focus_items;
create policy "Users can read their own Focus items"
  on public.focus_items for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Focus items" on public.focus_items;
create policy "Users can insert their own Focus items"
  on public.focus_items for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Focus items" on public.focus_items;
create policy "Users can update their own Focus items"
  on public.focus_items for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Focus items" on public.focus_items;
create policy "Users can delete their own Focus items"
  on public.focus_items for delete to authenticated
  using (auth.uid() = user_id);