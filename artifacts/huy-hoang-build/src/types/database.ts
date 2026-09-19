// ============================================================
// HUY HOÀNG BUILD — Database Types
// ============================================================

export type AccountType = 'STAFF' | 'CUSTOMER';
export type PermissionLevel = 'DIRECTOR' | 'STAFF' | 'CUSTOMER';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED';
export type ItemStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type JournalCategory = 'XAY_DUNG' | 'DIEN' | 'NUOC' | 'SON' | 'NOI_THAT' | 'KHAC';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  account_type: AccountType;
  permission_level: PermissionLevel;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  profile_id: string;
  company_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  profile?: Profile;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  customer_id: string;
  address: string;
  project_type: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  progress: number;
  status: ProjectStatus;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  customer?: Customer;
  items?: ProjectItem[];
  journals?: Journal[];
  images?: ProjectImage[];
}

export interface ProjectStaff {
  id: string;
  project_id: string;
  staff_id: string;
  role_in_project: string | null;
  assigned_at: string;
  staff?: Profile;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: ItemStatus;
  sort_order: number;
  internal_cost?: number | null; // only for Director/Staff
  unit: string | null;
  quantity: number | null;
  specs: Record<string, any> | null;
  is_visible_to_customer: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressLog {
  id: string;
  project_id: string;
  old_progress: number;
  new_progress: number;
  note: string | null;
  changed_by: string;
  created_at: string;
  changer?: Profile;
}

export interface Journal {
  id: string;
  project_id: string;
  author_id: string;
  category: JournalCategory;
  content: string;
  is_visible_to_customer: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  images?: JournalImage[];
}

export interface JournalImage {
  id: string;
  journal_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  caption: string | null;
  taken_at: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  sort_order: number;
  is_visible_to_customer: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, any> | null;
  after_data: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// UI helpers
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: '🟡 ĐANG THI CÔNG',
  COMPLETED: '🟢 ĐÃ HOÀN THIỆN',
};

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  NOT_STARTED: 'Chưa thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
};

export const JOURNAL_CATEGORY_LABEL: Record<JournalCategory, string> = {
  XAY_DUNG: 'Xây dựng',
  DIEN: 'Điện',
  NUOC: 'Nước',
  SON: 'Sơn',
  NOI_THAT: 'Nội thất',
  KHAC: 'Khác',
};

export const PERMISSION_LABEL: Record<PermissionLevel, string> = {
  DIRECTOR: 'Giám đốc',
  STAFF: 'Nhân sự',
  CUSTOMER: 'Khách hàng',
};
