import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id")

    if (!sessionId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Session ID required",
        },
        { status: 401 },
      )
    }

    const devices = SessionManager.getDevices(sessionId)
    if (devices === null) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid session",
        },
        { status: 401 },
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: devices,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch devices",
      },
      { status: 500 },
    )
  }
}
