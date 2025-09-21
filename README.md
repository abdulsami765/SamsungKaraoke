# Samsung Smart TV Jukebox Karaoke

A complete karaoke application designed for Samsung Smart TVs with Tizen OS support.

## Features

- **Landing Page**: Rotating video previews with hostcode authentication
- **Main Interface**: Business branding with video queue management
- **Video Player**: Fullscreen support with autoplay and ad integration
- **Device Management**: Support for up to 3 connected devices per account
- **TV Remote Navigation**: Optimized for Samsung Smart TV remote controls
- **Tizen Configuration**: Ready for Samsung Smart TV deployment

## Getting Started

### Development

\`\`\`bash
npm install
npm run dev
\`\`\`

### Building for Tizen

\`\`\`bash
npm run build
chmod +x scripts/build-tizen.sh
./scripts/build-tizen.sh
\`\`\`

### Environment Variables

Set `BUILD_TARGET=tizen` for Tizen-specific builds.

## API Endpoints

- `POST /api/auth/hostcode` - Authenticate with hostcode
- `GET /api/videos/random` - Get random videos
- `GET /api/videos/queue` - Manage video queue
- `POST /api/device/register` - Register new device
- `GET /api/video/next` - Get next video in queue

## Testing / Handover

1. Start the dev server:

```bash
npm install
npm run dev
```

2. Open http://localhost:3000 in your browser.

3. Test hostcode (example): `919190` is configured and maps to "Scret Lounge". On the landing page enter `919190` and press Connect. The main page should show Scret Lounge branding.

4. API smoke tests (example flows):

- Authenticate and get a session:

  POST /api/auth/hostcode { hostcode: '919190' }

- Register a device (use returned sessionId):

  POST /api/device/register { sessionId: '<sessionId>', deviceName: 'My TV' }

- List devices:

  GET /api/device (header: x-session-id: <sessionId>)

- Get current queue:

  GET /api/videos/queue (header: x-session-id: <sessionId>)

- Advance to next video (skip):

  POST /api/video/next (header: x-session-id: <sessionId>)

5. User video submission (MiTV Connect app integration): POST /api/videos/submit with body { sessionId, video } to add a user-submitted video to the queue.

6. Persistence: sessions and queues are persisted to `data/sessions.json` so sessions survive a server restart. For production-grade persistence, migrate to Redis or a proper database.

7. Deployment: build the Next app and package for Tizen using the included scripts. If you want, I can prepare a deploy guide for your hosting (FTP or CI) and help upload the built assets.

If any behavior on the real jukeboxkaraoke.net site requires a paid API or a specific MiTV Connect app key, let me know and I will outline what credentials or purchase is required.

## TV Remote Controls

- **Arrow Keys**: Navigate interface
- **Enter**: Select/Confirm
- **Return**: Go back or exit fullscreen
- **Exit**: Close application
- **Red/Green/Yellow/Blue**: Quick actions

## Device Limits

Each account supports up to 3 connected devices. Additional devices will require removing existing ones.

## Tizen Deployment

The app includes complete Tizen configuration files:

- `config.xml` - Main app configuration
- `tizen-manifest.xml` - Tizen-specific manifest
- `index.html` - Entry point for Tizen
- Build scripts for packaging

Built with Next.js, TypeScript, and Tailwind CSS for optimal Samsung Smart TV performance.
