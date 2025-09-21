import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import { mockUserVideos, mockBusiness } from "@/lib/mock-data"
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

    // Return user-submitted videos and business ads for the session's business
    const business = SessionManager.getBusiness(session.businessId)

    const businessAds = business?.adFlyers || []
    const businessInfo = {
      name: business?.name || "MiTV",
      slogan: business?.slogan || "Music Brings Us Together!",
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userVideos: mockUserVideos,
        businessAds,
        business: businessInfo,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch video queue",
      },
      { status: 500 },
    )
  }
}
