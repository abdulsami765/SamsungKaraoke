import type { Session, Device, Business } from "@/types"
import { mockBusiness, mockUserVideos } from "./mock-data"
import store from "./store"

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, Session>()
// Per-session playback queues: simple array of (Video | UserVideo)
const sessionQueues = new Map<string, any[]>()

// Load persisted sessions if available
try {
  const persisted = store.loadSessionsFromDisk()
  if (persisted && typeof persisted === "object") {
    Object.entries(persisted).forEach(([id, session]) => {
      sessions.set(id, session as Session)
      // Initialize empty queue if not present
      sessionQueues.set(id, (session && (session as any).queue) || [])
    })
  }
} catch (error) {
  console.warn("No persisted sessions found or failed to load:", error)
}
const hostcodeToBusiness = new Map<string, Business>()

const businesses: Business[] = [
  {
    id: "business-1",
    name: "Karaoke Palace",
    slogan: "Where Every Voice Shines!",
    hostcode: "DEMO123",
    adFlyers: mockBusiness.adFlyers,
  },
  {
    id: "business-2",
    name: "Melody Lounge",
    slogan: "Sing Your Heart Out!",
    hostcode: "SING456",
    adFlyers: mockBusiness.adFlyers,
  },
  {
    id: "business-3",
    name: "Harmony Hub",
    slogan: "Music Brings Us Together!",
    hostcode: "MUSIC789",
    adFlyers: mockBusiness.adFlyers,
  },
  {
    id: "business-4",
    name: "Client Karaoke Venue",
    slogan: "Premium Entertainment Experience!",
    hostcode: "266279",
    adFlyers: mockBusiness.adFlyers,
  },
  {
    id: "business-5",
    name: "Elite Karaoke Lounge",
    slogan: "Where Stars Are Born!",
    hostcode: "319720",
    adFlyers: mockBusiness.adFlyers,
  },
  {
    id: "business-6",
    name: "Scret Lounge",
    slogan: "Exclusive Nights, Unforgettable Voices",
    hostcode: "919190",
    adFlyers: mockBusiness.adFlyers,
  },
]

// Initialize with multiple hostcodes (store keys normalized to uppercase for case-insensitive lookup)
// Build both hostcode->business and id->business maps for quick lookup
const idToBusiness = new Map<string, Business>()
businesses.forEach((business) => {
  hostcodeToBusiness.set(business.hostcode.toUpperCase(), business)
  idToBusiness.set(business.id, business)
})

export class SessionManager {
  static verifyHostcode(hostcode: string): Business | null {
    const raw = (hostcode || "").toString()
    console.log("[v0] Verifying hostcode:", raw)
    console.log("[v0] Available hostcodes:", Array.from(hostcodeToBusiness.keys()))

    const cleaned = raw.trim()
    // If the hostcode is numeric-only, use as-is. Otherwise use uppercase for lookup.
    const lookupKey = /^\d+$/.test(cleaned) ? cleaned : cleaned.toUpperCase()

    const business = hostcodeToBusiness.get(lookupKey) || null
    console.log("[v0] Lookup key:", lookupKey, "Found business:", business ? business.name : "None")
    return business
  }

  static createSession(businessId: string): Session {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const session: Session = {
      id: sessionId,
      businessId,
      devices: [],
      isActive: true,
      createdAt: new Date(),
    }

    sessions.set(sessionId, session)
    // initialize queue for this session using mock user videos and business ads
    const business = SessionManager.getBusiness(businessId) || mockBusiness
    const userVideos = JSON.parse(JSON.stringify(mockUserVideos || []))
    const ads = JSON.parse(JSON.stringify(business.adFlyers || []))

    // Interleave user videos with ads: after each user video, insert an ad if available
    const queue: any[] = []
    if (userVideos.length === 0) {
      // if no user videos, preload with some random ads to keep playlists non-empty
      queue.push(...ads.slice(0, 3))
    } else {
      userVideos.forEach((v: any, idx: number) => {
        queue.push(v)
        if (ads.length > 0) {
          queue.push(ads[idx % ads.length])
        }
      })
    }

    sessionQueues.set(sessionId, queue)
    SessionManager.persistSessions()
    return session
  }

  static getBusiness(businessId: string): Business | null {
    return idToBusiness.get(businessId) || null
  }

  static getSession(sessionId: string): Session | null {
    return sessions.get(sessionId) || null
  }

  static registerDevice(sessionId: string, deviceName: string): Device | null {
    const session = sessions.get(sessionId)
    if (!session) {
      console.error(`Session not found for sessionId: ${sessionId}`)
      return null
    }

    if (session.devices.length >= 3) {
      console.error(`Device limit reached for sessionId: ${sessionId}`)
      return null
    }

    const device: Device = {
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: deviceName || `TV Device ${session.devices.length + 1}`,
      registeredAt: new Date(),
      lastActive: new Date(),
    }

    session.devices.push(device)
    SessionManager.persistSessions()
    console.log(`Device registered successfully: ${device.name} for sessionId: ${sessionId}`)
    return device
  }

  static removeDevice(sessionId: string, deviceId: string): boolean {
    const session = sessions.get(sessionId)
    if (!session) return false

    const deviceIndex = session.devices.findIndex((d) => d.id === deviceId)
    if (deviceIndex === -1) return false

    session.devices.splice(deviceIndex, 1)
    SessionManager.persistSessions()
    return true
  }

  static endSession(sessionId: string): boolean {
    const session = sessions.get(sessionId)
    if (!session) return false

    session.isActive = false
    sessions.delete(sessionId)
    sessionQueues.delete(sessionId)
    SessionManager.persistSessions()
    return true
  }

  static persistSessions() {
    try {
      const obj: any = {}
      sessions.forEach((s, id) => {
        obj[id] = { ...s, queue: sessionQueues.get(id) || [] }
      })
      store.saveSessionsToDisk(obj)
    } catch (error) {
      console.error("Failed to persist sessions:", error)
    }
  }

  static getDevices(sessionId: string): Device[] | null {
    const session = sessions.get(sessionId)
    return session ? session.devices : null
  }

  static getQueue(sessionId: string): any[] {
    return sessionQueues.get(sessionId) || []
  }

  static advanceQueue(sessionId: string): any | null {
    const queue = sessionQueues.get(sessionId);
    console.log(`AdvanceQueue called for sessionId: ${sessionId}, Current Queue:`, queue);

    if (!queue || queue.length === 0) {
      console.warn(`Queue is empty or does not exist for sessionId: ${sessionId}`);
      return null;
    }

    // Remove the first item and get the next video
    queue.shift();
    const nextVideo = queue[0] || null;

    sessionQueues.set(sessionId, queue);
    SessionManager.persistSessions();

    console.log(`Queue updated for sessionId: ${sessionId}, Next Video:`, nextVideo);
    return nextVideo;
  }

  static addVideoToQueue(sessionId: string, video: any): boolean {
    const queue = sessionQueues.get(sessionId);
    if (!queue) {
      console.error(`No queue found for sessionId: ${sessionId}`);
      return false;
    }

    queue.push(video);
    sessionQueues.set(sessionId, queue);
    console.log(`Video added to queue for sessionId: ${sessionId}`, video);
    SessionManager.persistSessions();
    return true;
  }

  static getVideosByGenre(sessionId: string, genre: string): any[] {
    const queue = sessionQueues.get(sessionId);
    if (!queue) {
      console.error(`No queue found for sessionId: ${sessionId}`);
      return [];
    }

    return queue.filter((video) => video.genre === genre);
  }
}
