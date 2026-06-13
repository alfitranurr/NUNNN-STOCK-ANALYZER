-- Create tables and configure security policies for Nunnn Stock E-IPO Calculator

-- Create ipo_plans table in public schema
create table if not exists public.ipo_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker varchar(10) not null,
  company_name varchar(100) not null,
  price numeric not null check (price > 0),
  total_lots numeric not null check (total_lots > 0),
  oversubscription numeric not null check (oversubscription >= 1),
  total_subscribers numeric not null check (total_subscribers > 0),
  retail_ratio numeric not null check (retail_ratio >= 0 and retail_ratio <= 100),
  personal_order_lots numeric default 0 check (personal_order_lots >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.ipo_plans enable row level security;

-- Policies
create policy "Users can view their own ipo calculations." on public.ipo_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own ipo calculations." on public.ipo_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ipo calculations." on public.ipo_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own ipo calculations." on public.ipo_plans
  for delete using (auth.uid() = user_id);

-- Index user_id for faster queries
create index if not exists ipo_plans_user_id_idx on public.ipo_plans(user_id);
