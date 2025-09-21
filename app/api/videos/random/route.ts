import { NextResponse } from "next/server"
import { mockRandomVideos } from "@/lib/mock-data"
import type { ApiResponse } from "@/types"

export async function GET() {
  try {
    // Shuffle and return 20 random videos
    const shuffled = [...mockRandomVideos].sort(() => Math.random() - 0.5)
    const randomVideos = shuffled.slice(0, 20)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: randomVideos,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch random videos",
      },
      { status: 500 },
    )
  }
}
