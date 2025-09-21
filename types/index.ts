export interface Video {
  id: string
  title: string
  url: string
  thumbnail: string
  duration: number
  isAd?: boolean
}
export interface UserVideo extends Video {
  username: string
  userPhoto?: string
  message?: string
  submittedAt: Date
  genre: string
}

export interface Business {
  id: string
  name: string
  slogan: string
  hostcode: string
  adFlyers: Video[]
}

export interface Device {
  id: string
  name: string
  registeredAt: Date
  lastActive: Date
}

export interface Session {
  id: string
  businessId: string
  devices: Device[]
  isActive: boolean
  createdAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
