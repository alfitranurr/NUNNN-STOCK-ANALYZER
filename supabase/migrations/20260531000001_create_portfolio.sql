-- Create portfolio tables and security policies for Nunnn Stock Analyzer

-- 1. Create portfolio_holdings table
create table if not exists public.portfolio_holdings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker varchar(10) not null,
  company_name varchar(100),
  lot integer not null check (lot >= 0),
  avg_price numeric not null check (avg_price >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, ticker)
);

-- 2. Create portfolio_cash table for RDN Buying Power simulation
create table if not exists public.portfolio_cash (
  user_id uuid references auth.users(id) on delete cascade primary key,
  cash_balance numeric default 0 not null check (cash_balance >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.portfolio_holdings enable row level security;
alter table public.portfolio_cash enable row level security;

-- 3. RLS Policies for portfolio_holdings
create policy "Users can view their own holdings." on public.portfolio_holdings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own holdings." on public.portfolio_holdings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own holdings." on public.portfolio_holdings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own holdings." on public.portfolio_holdings
  for delete using (auth.uid() = user_id);

-- 4. RLS Policies for portfolio_cash
create policy "Users can view their own cash." on public.portfolio_cash
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cash." on public.portfolio_cash
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cash." on public.portfolio_cash
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes for performance optimization
create index if not exists portfolio_holdings_user_id_idx on public.portfolio_holdings(user_id);
create index if not exists portfolio_holdings_ticker_idx on public.portfolio_holdings(ticker);
