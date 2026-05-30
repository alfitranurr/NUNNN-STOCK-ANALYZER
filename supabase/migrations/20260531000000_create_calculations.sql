-- Create tables and configure security policies for Nunnn Stock Avg Down Calculator

-- Create avg_down_plans table in public schema
create table if not exists public.avg_down_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker varchar(10) not null,
  company_name varchar(100),
  lot_awal integer not null check (lot_awal > 0),
  avg_price_awal numeric not null check (avg_price_awal > 0),
  current_price numeric not null check (current_price > 0),
  lot_baru integer not null check (lot_baru > 0),
  harga_beli_baru numeric not null check (harga_beli_baru > 0),
  fee_beli numeric default 0.15 check (fee_beli >= 0 and fee_beli <= 100),
  fee_jual numeric default 0.25 check (fee_jual >= 0 and fee_jual <= 100),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.avg_down_plans enable row level security;

-- Policies
create policy "Users can view their own calculations." on public.avg_down_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own calculations." on public.avg_down_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own calculations." on public.avg_down_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own calculations." on public.avg_down_plans
  for delete using (auth.uid() = user_id);

-- Index user_id for faster queries
create index if not exists avg_down_plans_user_id_idx on public.avg_down_plans(user_id);
