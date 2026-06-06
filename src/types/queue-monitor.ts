export interface QueueJob {
  uuid: string
  name: string
  original_name: string
  mime_type: string
  size: number
  extension: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  duration: number
  thumbnail_url: string
  stream_url: string
  created_at: string
  updated_at: string
}

export interface QueueSummary {
  engine: {
    connection: string
    inspect: string
    queue: string
  }
  pipeline: {
    completed: number
    failed: number
    pending: number
    processing: number
  }
  system: {
    dead_letter_count: number
  }
}

export interface QueueMonitorResponse {
  data: QueueJob[]
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
    summary: QueueSummary
  }
  status: string
  message: string
}
