import type { Video, UserVideo, Business } from "@/types"

export const mockRandomVideos: Video[] = [
  {
    id: "1",
    title: "Classic Rock Anthem",
    // image fallback
    url: "/karaoke-stage.jpg",
    thumbnail: "/karaoke-stage.jpg",
    duration: 240,
  },
  {
    id: "2",
    title: "Pop Hit 2024",
    url: "/karaoke-performance.jpg",
    thumbnail: "/karaoke-performance.jpg",
    duration: 180,
  },
  {
    id: "3",
    title: "Dance Party Mix",
    url: "/vibrant-music-concert.png",
    thumbnail: "/vibrant-music-concert.png",
    duration: 200,
  },
  {
    id: "4",
    title: "Singing Sensation",
    url: "/singing-performance.jpg",
    thumbnail: "/singing-performance.jpg",
    duration: 195,
  },
  {
    id: "5",
    title: "Karaoke Night Special",
    url: "/karaoke-night.png",
    thumbnail: "/karaoke-night.png",
    duration: 210,
  },
  {
    id: "6",
    title: "Live Music Experience",
    url: "/live-music-stage.png",
    thumbnail: "/live-music-stage.png",
    duration: 225,
  },
  {
    id: "7",
    title: "Vibrant Dance Party",
    url: "/vibrant-dance-party.png",
    thumbnail: "/vibrant-dance-party.png",
    duration: 190,
  },
  {
    id: "8",
    title: "Party Scene Vibes",
    url: "/vibrant-party-scene.png",
    thumbnail: "/vibrant-party-scene.png",
    duration: 205,
  },
  // Add a couple of short mp4 test videos (public sample URLs) to validate <video> playback
  {
    id: "mp4-1",
    title: "Sample Clip 1",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail: "/placeholder.jpg",
    duration: 10,
  },
  {
    id: "mp4-2",
    title: "Sample Clip 2",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/bee.mp4",
    thumbnail: "/placeholder.jpg",
    duration: 8,
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 9}`,
    title: `Karaoke Hit ${i + 9}`,
    url: `/placeholder.svg?height=720&width=1280&query=karaoke+stage+performance+${i + 9}`,
    thumbnail: `/placeholder.svg?height=180&width=320&query=karaoke+thumbnail+${i + 9}`,
    duration: 180 + Math.floor(Math.random() * 120),
  })),
]

export const mockBusiness: Business = {
  id: "business-1",
  name: "Rockin' Karaoke Lounge",
  slogan: "Where Every Voice Shines!",
  hostcode: "DEMO123",
  adFlyers: [
    {
      id: "ad-1",
      title: "Happy Hour Special",
      url: "/karaoke-night.png",
      thumbnail: "/karaoke-night.png",
      duration: 5,
      isAd: true,
    },
    {
      id: "ad-2",
      title: "Weekend Party Night",
      url: "/vibrant-party-scene.png",
      thumbnail: "/vibrant-party-scene.png",
      duration: 5,
      isAd: true,
    },
  ],
}

export const mockUserVideos: UserVideo[] = [
  {
    id: "user-1",
    title: "My Way - Frank Sinatra",
    url: "/singing-performance.jpg",
    thumbnail: "/singing-performance.jpg",
    duration: 270,
    username: "SingingMike",
    userPhoto: "/user-avatar-mike.jpg",
    message: "Dedicated to my beautiful wife Sarah! 💕",
    submittedAt: new Date(),
    genre: "Classic",
  },
  {
    id: "user-2",
    title: "Bohemian Rhapsody - Queen",
    url: "/karaoke-performance.jpg",
    thumbnail: "/karaoke-performance.jpg",
    duration: 355,
    username: "RockQueen87",
    message: "This one goes out to all the Queen fans in the house!",
    submittedAt: new Date(),
    genre: "Rock",
  },
  {
    id: "user-3",
    title: "Dancing Queen - ABBA",
    url: "/vibrant-dance-party.png",
    thumbnail: "/vibrant-dance-party.png",
    duration: 230,
    username: "DancingDiva",
    userPhoto: "/user-avatar-dancing.jpg",
    message: "Let's get this party started! 🕺💃",
    submittedAt: new Date(),
    genre: "Pop",
  },
]
