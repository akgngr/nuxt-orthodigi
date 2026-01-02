export interface User {
  id: string
  email: string
  name?: string | null
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuthResponse {
  user: User
  session: Session
}
