-- DealFlow OS — Supabase Schema

create extension if not exists "uuid-ossp";

-- Users
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  avatar_url text,
  role text default 'analyst',
  created_at timestamptz default now()
);

-- Tags
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null default '#6b7280'
);

-- Companies
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sector text,
  sub_sector text,
  hq_location text,
  founded_year int,
  employee_count int,
  website text,
  description text,
  revenue numeric,
  ebitda numeric,
  ebitda_margin numeric,
  revenue_growth numeric,
  logo_url text,
  created_at timestamptz default now()
);

-- Contacts
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  title text,
  firm text,
  type text check (type in ('banker','founder','management','lender','advisor','lp','other')) default 'other',
  warmth int check (warmth between 1 and 5) default 3,
  avatar_url text,
  linkedin_url text,
  last_contact timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Contact tags (join)
create table contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- Deals
create table deals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_id uuid references companies(id),
  stage text check (stage in ('sourcing','initial_review','management_meeting','loi','due_diligence','ic_approved','closed','passed')) default 'sourcing',
  entry_ev numeric,
  entry_equity numeric,
  revenue numeric,
  ebitda numeric,
  ebitda_margin numeric,
  revenue_growth numeric,
  process_type text,
  banker text,
  banker_contact_id uuid references contacts(id),
  lead_partner text,
  deal_team text[],
  status text check (status in ('active','closed','passed')) default 'active',
  priority text check (priority in ('high','medium','low')) default 'medium',
  source text,
  ic_date date,
  close_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deal tags (join)
create table deal_tags (
  deal_id uuid references deals(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (deal_id, tag_id)
);

-- Deal notes
create table deal_notes (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  title text not null,
  content text,
  type text check (type in ('note','meeting','ic_memo','loi','term_sheet')) default 'note',
  author text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deal files
create table deal_files (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  name text not null,
  category text check (category in ('financials','legal','management','market','other')) default 'other',
  size_bytes bigint,
  url text,
  uploaded_by text,
  created_at timestamptz default now()
);

-- Deal tasks
create table deal_tasks (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  title text not null,
  description text,
  assignee text,
  due_date date,
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  status text check (status in ('todo','in_progress','done','cancelled')) default 'todo',
  workstream text,
  created_at timestamptz default now()
);

-- Deal workstreams (diligence tracker)
create table deal_workstreams (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  name text not null,
  owner text,
  status text check (status in ('not_started','in_progress','complete','flagged')) default 'not_started',
  progress int default 0,
  due_date date,
  created_at timestamptz default now()
);

-- Diligence items
create table diligence_items (
  id uuid primary key default uuid_generate_v4(),
  workstream_id uuid references deal_workstreams(id) on delete cascade,
  title text not null,
  status text check (status in ('not_started','in_progress','complete','flagged')) default 'not_started',
  notes text
);

-- Meetings
create table meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  deal_id uuid references deals(id),
  contact_ids uuid[],
  date timestamptz,
  duration_minutes int,
  type text check (type in ('intro','management_presentation','site_visit','ic','call','other')) default 'other',
  attendees text[],
  summary text,
  action_items text[],
  recording_url text,
  created_at timestamptz default now()
);

-- Tasks (standalone, cross-deal)
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  deal_id uuid references deals(id),
  contact_id uuid references contacts(id),
  assignee text,
  due_date date,
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  status text check (status in ('todo','in_progress','done','cancelled')) default 'todo',
  created_at timestamptz default now()
);

-- Interactions (contact timeline)
create table interactions (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  type text check (type in ('email','call','meeting','note','linkedin')) default 'email',
  summary text,
  deal_id uuid references deals(id),
  date timestamptz default now(),
  author text
);
