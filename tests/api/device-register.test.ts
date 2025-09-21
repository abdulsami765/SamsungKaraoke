import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/device/register/route';
import { SessionManager } from '@/lib/session-manager';

describe('/api/device/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if sessionId is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { deviceName: 'Test Device' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Session ID required',
    });
  });

  it('should return 400 if deviceName is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { sessionId: 'test-session' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Device name is required and must be a non-empty string',
    });
  });

  it('should return 400 if device limit is reached', async () => {
    jest.spyOn(SessionManager, 'registerDevice').mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sessionId: 'test-session', deviceName: 'Test Device' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      error: 'Failed to register device (max 3 devices allowed)',
    });
  });

  it('should return 200 and register the device successfully', async () => {
    const mockDevice = { id: 'device-1', name: 'Test Device', registeredAt: new Date(), lastActive: new Date() };
    jest.spyOn(SessionManager, 'registerDevice').mockReturnValue(mockDevice);

    const { req, res } = createMocks({
      method: 'POST',
      body: { sessionId: 'test-session', deviceName: 'Test Device' },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      data: mockDevice,
    });
  });
});