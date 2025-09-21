import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse, UserVideo } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, video } = await request.json()

    console.log("Request Body:", { sessionId, video })

    if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
      console.error("Invalid session ID provided:", sessionId)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Session ID required",
        },
        { status: 400 },
      )
    }

    if (!video || typeof video !== "object" || !video.title || !video.url || typeof video.title !== "string" || typeof video.url !== "string") {
      console.error("Invalid video data provided:", video)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid video data",
        },
        { status: 400 },
      )
    }

    if (video.genre && (typeof video.genre !== "string" || video.genre.trim() === "")) {
      console.error("Invalid genre provided:", video.genre)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Genre must be a non-empty string if provided",
        },
        { status: 400 },
      )
    }

    const userVideo: UserVideo = {
      id: `video-${Date.now()}`,
      title: video.title,
      url: video.url,
      duration: video.duration && typeof video.duration === "number" ? video.duration : 180,
      isAd: false,
      username: video.username || "Anonymous",
      submittedAt: new Date(),
      thumbnail: video.thumbnail || "default-thumbnail.png",
      genre: video.genre ? video.genre.trim() : undefined,
    }

    console.log("User Video Object:", userVideo)

    const added = SessionManager.addVideoToQueue(sessionId, userVideo)
    if (!added) {
      console.error(`Failed to add video to queue for sessionId: ${sessionId}`)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to add video to the queue. Please try again later.",
        },
        { status: 500 },
      )
    }

    console.log("Video added successfully to queue:", userVideo)
    return NextResponse.json<ApiResponse>({
      success: true,
      data: userVideo,
    }, { status: 200 })
  } catch (error) {
    console.error("Internal server error:", error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
