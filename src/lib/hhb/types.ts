export type AccountType = "STAFF" | "CUSTOMER";
export type PermissionLevel = "DIRECTOR" | "STAFF" | "CUSTOMER";
export type ProjectStatus = "ACTIVE" | "COMPLETED";
export type ItemStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type JournalCategory = "XAY_DUNG" | "DIEN" | "NUOC" | "SON" | "NOI_THAT" | "KHAC";

export type Profile = {
  user_id: string;
  full_name: string;
  phone: string;
  account_type: AccountType;
  permission_level: PermissionLevel;
  job_title: string | null;
  is_active: boolean;
  created_at: string;
};

export type Project = {
  id: number;
  code: string;
  name: string;
  customer_id: number;
  customer_name: string | null;
  address: string;
  project_type: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  progress: number;
  status: ProjectStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectItem = {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  category: string | null;
  status: ItemStatus;
  sort_order: number;
  internal_cost: string | null;
  unit: string | null;
  quantity: string | null;
  is_visible_to_customer: boolean;
};

export type Journal = {
  id: number;
  project_id: number;
  project_name?: string;
  author_id: string;
  author_name: string | null;
  category: JournalCategory;
  content: string;
  created_at: string;
  images: { id: number; data_url: string }[];
};

export type ProgressLog = {
  id: number;
  old_progress: number;
  new_progress: number;
  note: string | null;
  changed_by_name: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: number;
  title: string;
  body: string | null;
  type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type AuditRow = {
  id: number;
  user_id: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: string | null;
  after_data: string | null;
  created_at: string;
};

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  NOT_STARTED: "Chưa thực hiện",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
};

export const JOURNAL_CATEGORY_LABEL: Record<JournalCategory, string> = {
  XAY_DUNG: "Xây dựng",
  DIEN: "Điện",
  NUOC: "Nước",
  SON: "Sơn",
  NOI_THAT: "Nội thất",
  KHAC: "Khác",
};
