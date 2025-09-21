import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const success = SessionManager.removeDevice(sessionId, params.id)
    if (!success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Device not found or cannot be removed",
        },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Device removed successfully" },
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
