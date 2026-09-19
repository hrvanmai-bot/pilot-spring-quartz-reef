-- ============================================================
-- HUY HOÀNG BUILD — Full Database Schema + RLS
-- Phần 1 + Phần 2
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE account_type_enum AS ENUM ('STAFF', 'CUSTOMER');
CREATE TYPE permission_level_enum AS ENUM ('DIRECTOR', 'STAFF', 'CUSTOMER');
CREATE TYPE project_status_enum AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TYPE item_status_enum AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE journal_category_enum AS ENUM ('XAY_DUNG', 'DIEN', 'NUOC', 'SON', 'NOI_THAT', 'KHAC');

-- ============================================================
-- 2. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  account_type account_type_enum NOT NULL,
  permission_level permission_level_enum NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_permission CHECK (
    (account_type = 'STAFF' AND permission_level IN ('DIRECTOR', 'STAFF')) OR
    (account_type = 'CUSTOMER' AND permission_level = 'CUSTOMER')
  )
);

CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX idx_profiles_permission ON public.profiles(permission_level);

-- ============================================================
-- 3. CUSTOMERS (additional info for customer accounts)
-- ============================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  notes TEXT, -- internal notes, only Director/Staff with permission
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. PROJECTS
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- HHB-2026-001
  name TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  address TEXT NOT NULL,
  project_type TEXT, -- Nhà phố, Căn hộ, Văn phòng, Nội thất...
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status project_status_enum NOT NULL DEFAULT 'ACTIVE',
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_code ON public.projects(code);
CREATE INDEX idx_projects_customer ON public.projects(customer_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_updated ON public.projects(updated_at DESC);

-- ============================================================
-- 5. PROJECT STAFF (many-to-many)
-- ============================================================
CREATE TABLE public.project_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_project TEXT, -- optional: site manager, supervisor...
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, staff_id)
);

CREATE INDEX idx_project_staff_project ON public.project_staff(project_id);
CREATE INDEX idx_project_staff_staff ON public.project_staff(staff_id);

-- ============================================================
-- 6. PROJECT ITEMS (Hạng mục)
-- ============================================================
CREATE TABLE public.project_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Móng, Kết cấu, Tủ bếp...
  description TEXT,
  category TEXT, -- XAY_DUNG / NOI_THAT
  status item_status_enum NOT NULL DEFAULT 'NOT_STARTED',
  sort_order INTEGER DEFAULT 0,
  -- Internal cost fields (protected by RLS)
  internal_cost NUMERIC(15,2),
  unit TEXT, -- bộ, m2, cái...
  quantity NUMERIC(12,2),
  specs JSONB, -- for interior: dimensions, materials...
  is_visible_to_customer BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_items_project ON public.project_items(project_id);

-- ============================================================
-- 7. PROGRESS LOGS (only Director changes official progress)
-- ============================================================
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  old_progress INTEGER NOT NULL,
  new_progress INTEGER NOT NULL,
  note TEXT,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_logs_project ON public.progress_logs(project_id);

-- ============================================================
-- 8. JOURNALS (Nhật ký)
-- ============================================================
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  category journal_category_enum NOT NULL DEFAULT 'KHAC',
  content TEXT NOT NULL,
  is_visible_to_customer BOOLEAN NOT NULL DEFAULT true, -- for future split
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journals_project ON public.journals(project_id);
CREATE INDEX idx_journals_author ON public.journals(author_id);
CREATE INDEX idx_journals_created ON public.journals(created_at DESC);

-- ============================================================
-- 9. JOURNAL IMAGES
-- ============================================================
CREATE TABLE public.journal_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- path in Supabase Storage
  thumbnail_path TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_images_journal ON public.journal_images(journal_id);

-- ============================================================
-- 10. PROJECT IMAGES (Gallery riêng)
-- ============================================================
CREATE TABLE public.project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  caption TEXT,
  taken_at DATE,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible_to_customer BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_images_project ON public.project_images(project_id);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT, -- progress_update, new_journal, project_completed...
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- ============================================================
-- 12. AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- CREATE_PROJECT, UPDATE_PROGRESS, CREATE_JOURNAL, COMPLETE_PROJECT, REOPEN_PROJECT...
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- 13. HELPER FUNCTIONS
-- ============================================================

-- Get current user's profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

-- Check if current user is Director
CREATE OR REPLACE FUNCTION public.is_director()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND account_type = 'STAFF'
      AND permission_level = 'DIRECTOR'
      AND is_active = true
  );
$$;

-- Check if current user is Staff (including Director)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND account_type = 'STAFF'
      AND is_active = true
  );
$$;

-- Check if current user is Customer
CREATE OR REPLACE FUNCTION public.is_customer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND account_type = 'CUSTOMER'
      AND is_active = true
  );
$$;

-- Check if user can access a project
CREATE OR REPLACE FUNCTION public.can_access_project(p_project_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_director() OR public.is_staff() THEN true
    WHEN public.is_customer() THEN EXISTS (
      SELECT 1 FROM public.projects pr
      JOIN public.customers c ON c.id = pr.customer_id
      WHERE pr.id = p_project_id AND c.profile_id = auth.uid()
    )
    ELSE false
  END;
$$;

-- Auto update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER project_items_updated_at
  BEFORE UPDATE ON public.project_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 14. ROW LEVEL SECURITY (RLS) — CỰC KỲ QUAN TRỌNG
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------- PROFILES ----------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_director() OR public.is_staff());

CREATE POLICY "Director can manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- CUSTOMERS ----------
CREATE POLICY "Staff can view all customers"
  ON public.customers FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Customer can view own customer record"
  ON public.customers FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Director can manage customers"
  ON public.customers FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- PROJECTS ----------
CREATE POLICY "Staff can view all projects"
  ON public.projects FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Customer can view own projects only"
  ON public.projects FOR SELECT
  USING (
    public.is_customer() AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = projects.customer_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Only Director can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_director());

CREATE POLICY "Only Director can update projects"
  ON public.projects FOR UPDATE
  USING (public.is_director())
  WITH CHECK (public.is_director());

CREATE POLICY "Only Director can delete projects"
  ON public.projects FOR DELETE
  USING (public.is_director());

-- ---------- PROJECT STAFF ----------
CREATE POLICY "Staff can view project staff"
  ON public.project_staff FOR SELECT
  USING (public.is_staff() OR public.can_access_project(project_id));

CREATE POLICY "Director can manage project staff"
  ON public.project_staff FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- PROJECT ITEMS ----------
CREATE POLICY "Staff can view all items"
  ON public.project_items FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Customer can view visible items of own projects"
  ON public.project_items FOR SELECT
  USING (
    public.is_customer()
    AND is_visible_to_customer = true
    AND public.can_access_project(project_id)
  );

CREATE POLICY "Only Director can manage items"
  ON public.project_items FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- PROGRESS LOGS ----------
CREATE POLICY "Staff can view progress logs"
  ON public.progress_logs FOR SELECT
  USING (public.is_staff() OR public.can_access_project(project_id));

CREATE POLICY "Only Director can insert progress logs"
  ON public.progress_logs FOR INSERT
  WITH CHECK (public.is_director());

-- ---------- JOURNALS ----------
CREATE POLICY "Staff can view all journals"
  ON public.journals FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Customer can view visible journals of own projects"
  ON public.journals FOR SELECT
  USING (
    public.is_customer()
    AND is_visible_to_customer = true
    AND public.can_access_project(project_id)
  );

CREATE POLICY "Staff can create journal on ACTIVE projects"
  ON public.journals FOR INSERT
  WITH CHECK (
    public.is_staff()
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Author can update own journal (limited)"
  ON public.journals FOR UPDATE
  USING (author_id = auth.uid() AND public.is_staff())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Director can manage all journals"
  ON public.journals FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- JOURNAL IMAGES ----------
CREATE POLICY "Access journal images via journal permission"
  ON public.journal_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journals j
      WHERE j.id = journal_id
      AND (
        public.is_staff()
        OR (public.is_customer() AND j.is_visible_to_customer AND public.can_access_project(j.project_id))
      )
    )
  );

CREATE POLICY "Staff can insert journal images"
  ON public.journal_images FOR INSERT
  WITH CHECK (
    public.is_staff()
    AND EXISTS (
      SELECT 1 FROM public.journals j
      WHERE j.id = journal_id AND j.author_id = auth.uid()
    )
  );

CREATE POLICY "Director full access journal images"
  ON public.journal_images FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- PROJECT IMAGES ----------
CREATE POLICY "Staff can view all project images"
  ON public.project_images FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Customer can view visible project images"
  ON public.project_images FOR SELECT
  USING (
    public.is_customer()
    AND is_visible_to_customer = true
    AND public.can_access_project(project_id)
  );

CREATE POLICY "Director can manage project images"
  ON public.project_images FOR ALL
  USING (public.is_director())
  WITH CHECK (public.is_director());

-- ---------- NOTIFICATIONS ----------
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System/Director can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_director() OR user_id = auth.uid());

-- ---------- AUDIT LOGS ----------
CREATE POLICY "Only Director can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_director());

CREATE POLICY "Authenticated users can insert audit logs (via function)"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 15. STORAGE BUCKETS (run after creating buckets in dashboard)
-- ============================================================
-- Create buckets in Supabase Dashboard:
-- 1. journal-images (private)
-- 2. project-images (private)
-- 3. avatars (private)

-- Storage policies will be added after buckets exist.

-- ============================================================
-- 16. TRIGGER: Auto create profile on signup (if using edge function)
-- For now Director creates accounts manually via admin.
-- ============================================================

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users. Director creates accounts.';
COMMENT ON TABLE public.projects IS 'Construction projects. Only Director can create/update status/progress.';
COMMENT ON TABLE public.journals IS 'Daily site journals. Staff can create only on ACTIVE projects.';
COMMENT ON COLUMN public.project_items.internal_cost IS 'Internal cost - NEVER exposed to Customer via RLS';
