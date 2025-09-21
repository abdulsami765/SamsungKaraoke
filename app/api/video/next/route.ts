import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id")

    if (!sessionId || sessionId.trim() === "") {
      console.error("Invalid session ID provided:", sessionId)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Session ID required",
        },
        { status: 401 },
      )
    }

    const session = SessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid session",
        },
        { status: 401 },
      )
    }

    const nextVideo = SessionManager.advanceQueue(sessionId)
    if (!nextVideo) {
      console.error(`Failed to advance queue for sessionId: ${sessionId}`)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to advance queue or queue empty",
        },
        { status: 400 },
      )
    }

    console.log("Request Headers:", request.headers)
    console.log("Session ID:", sessionId)
    console.log("Session:", session)
    console.log("Next Video:", nextVideo)
    console.log("Session Queues:", SessionManager.getQueue(sessionId))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { nextVideo },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
