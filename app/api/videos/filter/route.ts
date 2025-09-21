import { type NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/session-manager";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    const genre = request.nextUrl.searchParams.get("genre");

    if (!sessionId || sessionId.trim() === "") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    if (!genre || genre.trim() === "") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Genre is required",
        },
        { status: 400 }
      );
    }

    const videos = SessionManager.getVideosByGenre(sessionId, genre);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Error filtering videos by genre:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}