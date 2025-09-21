import { test, expect } from "@jest/globals";
import { POST } from "@/app/api/videos/submit/route";
import { SessionManager } from "@/lib/session-manager";

jest.mock("@/lib/session-manager", () => ({
  SessionManager: {
    addVideoToQueue: jest.fn(),
  },
}));

describe("POST /api/videos/submit", () => {
  test("returns 400 if sessionId is missing", async () => {
    const request = {
      json: async () => ({ video: { title: "Test Video", url: "http://example.com/video.mp4" } }),
    };

    const response = await POST(request as any);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe("Session ID required");
  });

  test("returns 400 if video data is invalid", async () => {
    const request = {
      json: async () => ({ sessionId: "test-session", video: { url: "http://example.com/video.mp4" } }),
    };

    const response = await POST(request as any);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe("Invalid video data");
  });

  test("returns 500 if adding video to queue fails", async () => {
    (SessionManager.addVideoToQueue as jest.Mock).mockReturnValueOnce(false);

    const request = {
      json: async () => ({
        sessionId: "test-session",
        video: { title: "Test Video", url: "http://example.com/video.mp4" },
      }),
    };

    const response = await POST(request as any);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe("Failed to add video to the queue");
  });

  test("returns 200 and the added video on success", async () => {
    (SessionManager.addVideoToQueue as jest.Mock).mockReturnValueOnce(true);

    const request = {
      json: async () => ({
        sessionId: "test-session",
        video: { title: "Test Video", url: "http://example.com/video.mp4" },
      }),
    };

    const response = await POST(request as any);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe("Test Video");
  });
});