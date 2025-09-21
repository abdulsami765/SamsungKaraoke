import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/video/next/route';
import { SessionManager } from '@/lib/session-manager';

describe('/api/video/next', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if session ID is missing', async () => {
    const { req, res } = createMocks({ method: 'POST' });

    await POST(req);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Session ID required',
    });
  });

  it('should return 401 if session is invalid', async () => {
    jest.spyOn(SessionManager, 'getSession').mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-session-id': 'invalid-session' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Invalid session',
    });
  });

  it('should return 400 if queue is empty', async () => {
    const mockSession = {
      id: 'test-session',
      businessId: 'business-1',
      devices: [],
      isActive: true,
      createdAt: new Date(),
    };
    jest.spyOn(SessionManager, 'getSession').mockReturnValue(mockSession);
    jest.spyOn(SessionManager, 'advanceQueue').mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-session-id': 'test-session' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Failed to advance queue or queue empty',
    });
  });

  it('should return the next video on success', async () => {
    const mockNextVideo = { id: 'video-1', title: 'Next Video' };
    const mockSession = {
      id: 'test-session',
      businessId: 'business-1',
      devices: [],
      isActive: true,
      createdAt: new Date(),
    };
    jest.spyOn(SessionManager, 'getSession').mockReturnValue(mockSession);
    jest.spyOn(SessionManager, 'advanceQueue').mockReturnValue(mockNextVideo);

    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-session-id': 'test-session' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      data: { nextVideo: mockNextVideo },
    });
  });
});