-- Create tables and configure security policies for Nunnn Stock Compounding Calculator

-- Create compounding_plans table in public schema
create table if not exists public.compounding_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title varchar(100) not null,
  initial_amount numeric not null check (initial_amount >= 0),
  contribution_amount numeric default 0 check (contribution_amount >= 0),
  contribution_frequency varchar(20) default 'monthly',
  annual_return_rate numeric not null check (annual_return_rate >= 0),
  compounding_frequency varchar(20) default 'monthly',
  duration_years numeric default 0 check (duration_years >= 0),
  duration_months numeric default 0 check (duration_months >= 0),
  inflation_rate numeric default 0 check (inflation_rate >= 0),
  tax_rate numeric default 0 check (tax_rate >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.compounding_plans enable row level security;

-- Policies
create policy "Users can view their own compounding calculations." on public.compounding_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own compounding calculations." on public.compounding_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own compounding calculations." on public.compounding_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own compounding calculations." on public.compounding_plans
  for delete using (auth.uid() = user_id);

-- Index user_id for faster queries
create index if not exists compounding_plans_user_id_idx on public.compounding_plans(user_id);
