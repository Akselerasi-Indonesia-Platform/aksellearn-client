export interface CourseCategory {
  id: string
  db_id: number
  name: string
  slug: string
  description: string
  createdAt: string
}

export interface LessonVideoProgress {
  last_position_seconds: number
  is_watched: boolean
  watched_at: string | null
}

export interface LessonVideo {
  uuid: string
  title: string
  order_weight: number
  stream_url?: string
  duration?: number
  watch_progress?: LessonVideoProgress | null
  media_uuid?: string
  status?: 'pending' | 'processing' | 'available' | 'completed' | 'finished' | 'failed'
  qualities?: string[]
}

export interface CourseModule {
  id: string
  title: string
  type: 'lesson' | 'quiz' | 'assignment'
  module_type?: 'lesson' | 'quiz' | 'assignment' // Supporting both naming conventions
  description?: string
  content?: string
  video?: string
  video_uuid?: string
  video_data?: VideoResource
  videos?: LessonVideo[]
  order_weight: number
  order?: number
  is_active: boolean
  published_at?: string
  quiz_uuid?: string // The UUID of the linked quiz
  quiz?: Quiz // Nested quiz data for student view
  assignment_uuid?: string // The UUID of the linked assignment
  assignment?: any // Nested assignment data
  is_completed?: boolean // Student progress status
  is_passed?: boolean // Assessment pass status
  my_progress?: {
    score?: number
    is_completed?: boolean
  }
  meta?: {
    position?: number // For video resume
    [key: string]: any
  }
  uuid?: string
}

export interface Quiz {
  id: string
  uuid: string
  title: string
  description?: string
  passing_percentage: number
  time_limit_minutes?: number | null
  questions?: QuizQuestion[]
  completed?: boolean
  result?: {
    score: number
    is_passed: boolean
    attempt_uuid: string
    completed_at?: string
  }
}

export interface QuizQuestion {
  id: string
  uuid: string
  question: string
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'range' | 'multiple_response'
  points: number
  explanation?: string | null
  options: QuizOption[]
}

export interface QuizOption {
  id: string
  uuid: string
  option_text: string
  is_correct?: boolean
}

export interface VideoResource {
  id: number
  uuid: string
  status:
    | 'pending'
    | 'processing'
    | 'available'
    | 'completed'
    | 'failed'
    | 'finished'
    | 'transcoding'
  stream_url?: string
  thumbnail_url?: string
  progress?: number
  hd_status?: 'encoding' | 'completed' | 'failed' | null
  hd_progress?: number | null
  qualities?: string[]
  hd_eta?: string | null
  duration?: number
  is_public?: boolean
  meta?: Record<string, any>
}

export interface CourseAttachment {
  uuid: string
  title: string
  description: string
  order_weight: number
  media: {
    url: string
    mime_type: string
    size: number
  } | null
}

export interface CourseResource {
  id: string
  title: string
  url: string
  type: string
  size?: string
}

export interface Course {
  id: string
  db_id?: number
  uuid: string
  slug?: string
  title: string
  description: string
  content: string
  course_category_id: number
  course_category_uuid?: string
  category?: CourseCategory | Record<string, any>
  thumbnail: string
  thumbnail_uuid?: string
  video: string
  video_thumbnail?: string
  video_id?: number
  video_uuid?: string
  video_data?: VideoResource
  is_public?: boolean
  is_active: boolean
  is_corporate?: boolean
  price?: number
  price_discount?: number | null
  base_price?: number
  access_duration_days?: number
  access_type?: 'lifetime' | 'duration'
  published_at?: string
  modules?: CourseModule[]
  resources?: CourseResource[]
  attachments?: CourseAttachment[]
  announcements?: CourseAnnouncement[]
  comments?: CourseComment[]
  reviews?: CourseReview[]
  certificate_config?: CourseCertificateConfig
  instructor?: {
    uuid: string
    name: string
    email?: string
    profile?: {
      avatar_url?: string
      bio?: string
      headline?: string
      linkedin_url?: string
    }
    average_rating?: number
    total_reviews?: number
    total_students?: number
    total_courses?: number
  }
  meta_title?: string
  meta_description?: string
  og_image_uuid?: string
  og_image_url?: string
  images?: string[]
  progress_percentage?: number
  enrollment_uuid?: string
  enrollment_status?: 'active' | 'completed' | 'expired' | 'revoked' | string
  user_review?: {
    rating: number
    comment: string
    created_at?: string
  } | null
  what_you_will_get?: string[]
  who_is_this_for?: string[]
  what_you_will_learn?: string[]
  requirements?: string[]
  summary?: {
    difficulty?: string
    language?: string
    stats?: {
      total_lessons?: number
      total_quizzes?: number
      total_videos?: number
      total_modules?: number
      total_duration?: string
      total_duration_human_full?: string
      average_video_duration_human?: string
      total_students?: number
      average_rating?: number
      total_reviews?: number
    }
  }
  remaining_days?: number
  expired_at?: string
  createdAt: string
  is_enrolled?: boolean
  enrollment_expiry?: string | null
  modules_count?: number
  badge_text?: string
}
export interface CourseAnnouncement {
  id: string
  course_id: string
  title: string
  excerpt?: string
  content: string
  is_broadcasted: boolean
  pending_broadcast_count?: number
  createdAt: string
  updatedAt: string
}
export interface CourseComment {
  uuid: string
  user_id: number
  user: {
    uuid: string
    name: string
    email?: string
    phone?: string
    roles?: { uuid: string; name: string }[]
  }
  content: string
  course_id: number
  module_id: number | null
  module_name?: string
  parent_id?: number | null
  video_timestamp?: number | null
  is_active: boolean
  created_at: string
  likes_count: number
  is_liked: boolean
  replies?: CourseComment[]
}
export interface CourseCertificateConfig {
  variant: 'modern' | 'traditional' | 'technical'
  title: string
  subtitle: string
  issuing_authority: string
  signature_name: string
  signature_title: string
  logo_url?: string
  seal_url?: string
  show_qr: boolean
  accent_color?: string
  certificate_background_id?: number
  certificate_background_uuid?: string
  certificate_background_url?: string
  certificate_number_pattern?: string
}

export interface CourseReview {
  uuid: string
  course_id: number
  user_id: number
  user: {
    uuid: string
    name: string
    email: string
    phone: string
    roles: { uuid: string; name: string }[]
  }
  rating: number
  comment: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CourseNote {
  uuid: string
  content: string
  course_uuid: string
  module_uuid?: string | null
  course?: { uuid: string; title: string }
  module?: { uuid: string; title: string } | null
  video_timestamp?: number | null
  created_at: string
  updated_at: string
}
