export type TargetAudience = 'all' | 'guest' | 'authenticated'

export interface Banner {
  id: number
  uuid: string
  title: string
  subtitle?: string | null
  cta_label?: string | null
  cta_url?: string | null
  image_uuid?: string | null
  image_url?: string | null
  mobile_image_uuid?: string | null
  mobile_image_url?: string | null
  target_audience: TargetAudience
  sort_order: number
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BannerPayload {
  title: string
  subtitle?: string | null
  cta_label?: string | null
  cta_url?: string | null
  image_uuid?: string | null
  mobile_image_uuid?: string | null
  target_audience: TargetAudience
  sort_order?: number
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
}
