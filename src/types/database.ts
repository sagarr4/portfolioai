export type Plan = 'free' | 'pro' | 'team'
export type UploadStatus = 'pending' | 'parsing' | 'done' | 'error'

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: Plan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  portfolio_count: number
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  title: string
  slug: string
  field: string
  field_confidence?: number
  theme: string
  resume_url?: string
  resume_data?: Record<string, unknown>
  portfolio_data?: Record<string, unknown>
  is_published: boolean
  custom_domain?: string
  views: number
  created_at: string
  updated_at: string
}

export interface ResumeUpload {
  id: string
  user_id: string
  portfolio_id?: string
  file_name: string
  file_url: string
  parsed_data?: Record<string, unknown>
  status: UploadStatus
  created_at: string
}
