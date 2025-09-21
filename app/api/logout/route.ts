import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function POST(request: NextRequest) {
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

    const success = SessionManager.endSession(sessionId)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: success ? "Logged out successfully" : "Session already ended" },
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
