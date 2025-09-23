export type BusinessConfig = {
  hostcode: string;
  businessName: string;
  slogan?: string;
  flyerUrl?: string; // ad for 5s between videos
};

export type DeviceInfo = {
  id: string;           // uuid
  name: string;
  userAgent?: string;
  createdAt: number;
  lastActive?: number;
};

export type UserMessage = {
  username: string;
  photoUrl?: string;
  message?: string;
};

export type VideoItem = {
  id: string;           // YouTube ID or URL
  title?: string;
  submittedBy?: UserMessage; // optional
};

export type Session = {
  sessionId: string;          // uuid
  hostcode: string;
  business: Omit<BusinessConfig, 'hostcode'>;
  devices: DeviceInfo[];      // max 3
  queue: VideoItem[];         // user-submitted videos
  lastPlayed?: string | null; // id
  createdAt: number;
  updatedAt: number;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

// Back-compat for legacy tests that expect { success, data, error }
export type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// Legacy domain types used by some components/tests. Keep separate from current file-backed shapes.
export type Video = {
  id: string;
  title: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
  isAd?: boolean;
};

export type UserVideo = Video & {
  username?: string;
  userPhoto?: string;
  message?: string;
  submittedAt?: Date;
  genre?: string;
};

export type Business = {
  id: string;
  name: string;
  slogan: string;
  hostcode: string;
  adFlyers: Video[];
};

export type Device = {
  id: string;
  name: string;
  registeredAt: Date;
  lastActive: Date;
};

export type SessionV0 = {
  id: string;
  businessId: string;
  devices: Device[];
  isActive: boolean;
  createdAt: Date;
};
