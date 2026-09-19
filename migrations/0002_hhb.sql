-- HUY HOÀNG BUILD application schema

create table if not exists profiles (
  user_id text primary key,
  full_name text not null,
  phone text not null unique,
  account_type text not null check (account_type in ('STAFF', 'CUSTOMER')),
  permission_level text not null check (permission_level in ('DIRECTOR', 'STAFF', 'CUSTOMER')),
  job_title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_account_type_idx on profiles (account_type);
create index if not exists profiles_phone_idx on profiles (phone);

create table if not exists customers (
  id serial primary key,
  user_id text not null unique references profiles(user_id) on delete cascade,
  company_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id serial primary key,
  code text not null unique,
  name text not null,
  customer_id integer not null references customers(id) on delete restrict,
  address text not null,
  project_type text,
  start_date date,
  expected_end_date date,
  actual_end_date date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED')),
  description text,
  created_by text references profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_customer_idx on projects (customer_id);
create index if not exists projects_status_idx on projects (status);
create index if not exists projects_updated_idx on projects (updated_at desc);

create table if not exists project_staff (
  id serial primary key,
  project_id integer not null references projects(id) on delete cascade,
  staff_user_id text not null references profiles(user_id) on delete cascade,
  role_in_project text,
  assigned_at timestamptz not null default now(),
  unique (project_id, staff_user_id)
);

create table if not exists project_items (
  id serial primary key,
  project_id integer not null references projects(id) on delete cascade,
  name text not null,
  description text,
  category text,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  sort_order integer not null default 0,
  internal_cost numeric(15,2),
  unit text,
  quantity numeric(12,2),
  specs text,
  is_visible_to_customer boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_items_project_idx on project_items (project_id);

create table if not exists progress_logs (
  id serial primary key,
  project_id integer not null references projects(id) on delete cascade,
  old_progress integer not null,
  new_progress integer not null,
  note text,
  changed_by text not null references profiles(user_id),
  created_at timestamptz not null default now()
);

create table if not exists journals (
  id serial primary key,
  project_id integer not null references projects(id) on delete cascade,
  author_id text not null references profiles(user_id),
  category text not null default 'KHAC',
  content text not null,
  is_visible_to_customer boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journals_project_idx on journals (project_id);
create index if not exists journals_created_idx on journals (created_at desc);

create table if not exists journal_images (
  id serial primary key,
  journal_id integer not null references journals(id) on delete cascade,
  data_url text not null,
  mime_type text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists journal_images_journal_idx on journal_images (journal_id);

create table if not exists project_images (
  id serial primary key,
  project_id integer not null references projects(id) on delete cascade,
  data_url text not null,
  caption text,
  is_visible_to_customer boolean not null default true,
  uploaded_by text references profiles(user_id),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id serial primary key,
  user_id text not null references profiles(user_id) on delete cascade,
  title text not null,
  body text,
  type text,
  entity_type text,
  entity_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id, is_read);

create table if not exists audit_logs (
  id serial primary key,
  user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data text,
  after_data text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
