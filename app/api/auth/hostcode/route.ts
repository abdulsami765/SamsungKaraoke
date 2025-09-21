import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { hostcode } = await request.json()

    console.log("[v0] Received hostcode:", hostcode)

    if (!hostcode || typeof hostcode !== "string") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Hostcode is required",
        },
        { status: 400 },
      )
    }

    const cleanHostcode = hostcode.trim()
    const business = SessionManager.verifyHostcode(cleanHostcode)

    if (!business) {
      console.log("[v0] Invalid hostcode provided:", cleanHostcode)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid hostcode",
        },
        { status: 401 },
      )
    }

    const session = SessionManager.createSession(business.id)
    console.log("[v0] Created session:", session.id, "for business:", business.name)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        sessionId: session.id,
        business: {
          id: business.id,
          name: business.name,
          slogan: business.slogan,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Hostcode validation error:", error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
