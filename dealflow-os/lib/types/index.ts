export type DealStage =
  | "sourcing"
  | "initial_review"
  | "management_meeting"
  | "loi"
  | "due_diligence"
  | "ic_approved"
  | "closed"
  | "passed"

export type ContactType = "banker" | "founder" | "management" | "lender" | "advisor" | "lp" | "other"
export type WarmthScore = 1 | 2 | 3 | 4 | 5
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled"
export type InteractionType = "email" | "call" | "meeting" | "note" | "linkedin"
export type FileCategory = "financials" | "legal" | "management" | "market" | "other"
export type DiligenceStatus = "not_started" | "in_progress" | "complete" | "flagged"

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  title?: string
  firm?: string
  type: ContactType
  warmth: WarmthScore
  avatar_url?: string
  linkedin_url?: string
  last_contact?: string
  notes?: string
  tags: Tag[]
  interactions: Interaction[]
  deals: string[]
  created_at: string
}

export interface Company {
  id: string
  name: string
  sector: string
  sub_sector?: string
  hq_location?: string
  founded_year?: number
  employee_count?: number
  website?: string
  description?: string
  revenue?: number
  ebitda?: number
  ebitda_margin?: number
  revenue_growth?: number
  deal_stage?: DealStage
  deal_id?: string
  logo_url?: string
  tags: Tag[]
  created_at: string
}

export interface Deal {
  id: string
  name: string
  company_id: string
  company: Company
  stage: DealStage
  entry_ev?: number
  entry_equity?: number
  revenue?: number
  ebitda?: number
  ebitda_margin?: number
  revenue_growth?: number
  process_type?: string
  banker?: string
  banker_contact_id?: string
  lead_partner?: string
  deal_team: string[]
  status: "active" | "closed" | "passed"
  priority: "high" | "medium" | "low"
  source?: string
  ic_date?: string
  close_date?: string
  notes?: string
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface DealNote {
  id: string
  deal_id: string
  title: string
  content: string
  type: "note" | "meeting" | "ic_memo" | "loi" | "term_sheet"
  author: string
  created_at: string
  updated_at: string
}

export interface DealFile {
  id: string
  deal_id: string
  name: string
  category: FileCategory
  size_bytes?: number
  uploaded_by: string
  created_at: string
  url?: string
}

export interface DealTask {
  id: string
  deal_id: string
  title: string
  description?: string
  assignee?: string
  due_date?: string
  priority: TaskPriority
  status: TaskStatus
  workstream?: string
  created_at: string
}

export interface DiligenceWorkstream {
  id: string
  deal_id: string
  name: string
  owner?: string
  status: DiligenceStatus
  progress: number
  due_date?: string
  items: DiligenceItem[]
}

export interface DiligenceItem {
  id: string
  workstream_id: string
  title: string
  status: DiligenceStatus
  notes?: string
}

export interface Meeting {
  id: string
  title: string
  deal_id?: string
  contact_ids: string[]
  date: string
  duration_minutes?: number
  type: "intro" | "management_presentation" | "site_visit" | "ic" | "call" | "other"
  attendees: string[]
  summary?: string
  action_items: string[]
  recording_url?: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  deal_id?: string
  deal_name?: string
  contact_id?: string
  assignee: string
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  created_at: string
}

export interface Interaction {
  id: string
  contact_id: string
  type: InteractionType
  summary: string
  deal_id?: string
  date: string
  author: string
}
