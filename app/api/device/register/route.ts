import { type NextRequest, NextResponse } from "next/server"
import { SessionManager } from "@/lib/session-manager"
import type { ApiResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, deviceName } = await request.json()

    console.log("Request Body:", { sessionId, deviceName });

    if (!sessionId || sessionId.trim() === "") {
      console.error("Invalid session ID provided:", sessionId);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 },
      );
    }

    if (!deviceName || typeof deviceName !== "string" || deviceName.trim() === "") {
      console.error("Invalid device name provided:", deviceName);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Device name is required",
        },
        { status: 400 },
      );
    }

    const device = SessionManager.registerDevice(sessionId, deviceName);
    if (!device) {
      console.error(`Failed to register device for sessionId: ${sessionId}`);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Failed to register device (max 3 devices allowed)",
        },
        { status: 400 },
      );
    }

    console.log("Device registered successfully:", device);
    return NextResponse.json<ApiResponse>({
      success: true,
      data: device,
    }, { status: 200 });
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
