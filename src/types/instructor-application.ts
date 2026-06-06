import { User } from './user'

export type ApplicationStatusState = 'pending' | 'under_review' | 'accepted' | 'rejected'

export interface ApplicationStatus {
  uuid: string
  status: ApplicationStatusState
  created_at: string
  reviewed_at?: string | null
  rejection_note?: string | null
  reapply_after?: string | null
}

export interface InstructorApplication {
  uuid: string
  status: ApplicationStatusState
  full_name: string
  headline: string
  bio: string
  expertise: string[]
  teaching_exp: string
  sample_topic: string
  linkedin_url?: string | null
  portfolio_url?: string | null
  rejection_note?: string | null
  reviewed_at?: string | null
  created_at: string
  user: User
  reviewed_by?: User | null
}

export interface ApplyPayload {
  full_name: string
  headline: string
  bio: string
  expertise: string[]
  teaching_exp: string
  sample_topic: string
  linkedin_url?: string
  portfolio_url?: string
}
