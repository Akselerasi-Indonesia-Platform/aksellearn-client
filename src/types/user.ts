export interface User {
  id: string
  db_id?: number
  name: string
  email: string
  role: 'admin' | 'user' | 'editor'
  roles?: string[]
  permissions?: string[]
  status: 'active' | 'inactive'
  createdAt: string
  bio?: string
}
