
import { Stream, User, UserRole, Resolution, CaptionTrack, IngestInfo } from './types';

export const CREATOR_USER: User = {
  id: 'user-1',
  name: 'CodeCrafter',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  role: UserRole.CREATOR,
};

export const INTERPRETER_USER: User = {
  id: 'user-2',
  name: 'LinguaLink',
  avatarUrl: 'https://picsum.photos/seed/user2/100/100',
  role: UserRole.INTERPRETER,
};

export const VIEWER_USER: User = {
  id: 'user-public',
  name: 'Guest Viewer',
  avatarUrl: 'https://picsum.photos/seed/user-guest/100/100',
  role: UserRole.VIEWER,
};

const MOCK_RESOLUTIONS: Resolution[] = [
  { label: '1080p', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { label: '720p', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { label: '480p', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
];

const MOCK_CAPTIONS: CaptionTrack[] = [
  { code: 'en', name: 'English', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.vtt' },
  { code: 'es', name: 'Spanish', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.vtt' }, // Using same for demo
];

const MOCK_INGEST_INFO: IngestInfo = {
  primaryRtmp: {
    url: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'abcd-1234-efgh-5678-wxyz',
  },
  backupRtmp: {
    url: 'rtmp://b.rtmp.youtube.com/live2?backup=1',
    streamKey: 'abcd-1234-efgh-5678-wxyz',
  },
  srtUrl: 'srt://a.srt.youtube.com:12345?streamid=user/your-stream-key'
};


export const MOCK_LIVE_STREAM: Stream = {
  id: 'live-1',
  title: 'Live from the Dev Conference 2024',
  description: 'Join us live as we explore the future of web development, with expert panels and exciting announcements. This stream features live interpretation in multiple languages.',
  thumbnailUrl: 'https://picsum.photos/seed/live1/1280/720',
  creator: CREATOR_USER,
  isLive: true,
  viewers: 52300,
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  audioTracks: [
    { 
      code: 'es', 
      name: 'Spanish', 
      interpreters: [
        { id: 'es-1', name: 'Spanish Interpreter 1', link: '/interpreter/live-1/es/1', isLive: true },
        { id: 'es-2', name: 'Spanish Interpreter 2', link: '/interpreter/live-1/es/2', isLive: false },
      ]
    },
    { 
      code: 'pt-BR', 
      name: 'PT BR', 
      interpreters: [
        { id: 'pt-br-1', name: 'Portuguese Interpreter 1', link: '/interpreter/live-1/pt-br/1', isLive: false },
        { id: 'pt-br-2', name: 'Portuguese Interpreter 2', link: '/interpreter/live-1/pt-br/2', isLive: false },
      ]
    },
     { 
      code: 'fr', 
      name: 'French', 
      interpreters: [
        { id: 'fr-1', name: 'French Interpreter 1', link: '/interpreter/live-1/fr/1', isLive: false },
        { id: 'fr-2', name: 'French Interpreter 2', link: '/interpreter/live-1/fr/2', isLive: true },
      ]
    },
  ],
  tags: ['web development', 'live event', 'tech', 'conference', 'react'],
  category: 'Technology',
  visibility: 'public',
  resolutions: MOCK_RESOLUTIONS,
  captionTracks: MOCK_CAPTIONS,
  ingest: MOCK_INGEST_INFO,
};

export const MOCK_SCHEDULED_STREAMS: Stream[] = [
  {
    id: 'scheduled-1',
    title: 'Upcoming: The Future of AI in Web Dev',
    description: 'A panel of experts discusses the role of AI in the future of web development.',
    thumbnailUrl: 'https://picsum.photos/seed/scheduled1/1280/720',
    creator: CREATOR_USER,
    isLive: false,
    viewers: 0,
    videoUrl: '',
    audioTracks: [],
    tags: ['ai', 'webdev', 'future', 'scheduled'],
    category: 'Technology',
    visibility: 'public',
    scheduledStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  },
  {
    id: 'scheduled-2',
    title: 'Live Drone Flight Over Iceland',
    description: 'Join us for a stunning aerial view of Iceland\'s volcanic landscapes.',
    thumbnailUrl: 'https://picsum.photos/seed/scheduled2/1280/720',
    creator: { ...CREATOR_USER, id: 'user-3', name: 'NatureScapes', avatarUrl: 'https://picsum.photos/seed/user3/100/100' },
    isLive: false,
    viewers: 0,
    videoUrl: '',
    audioTracks: [],
    tags: ['travel', 'nature', 'drone', 'iceland'],
    category: 'Travel & Events',
    visibility: 'public',
    scheduledStartTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
  },
  {
    id: 'scheduled-3',
    title: 'Game Launch Event: CyberVerse',
    description: 'Be the first to see the new CyberVerse gameplay and hear from the developers.',
    thumbnailUrl: 'https://picsum.photos/seed/scheduled3/1280/720',
    creator: { ...CREATOR_USER, id: 'user-4', name: 'PixelPlay', avatarUrl: 'https://picsum.photos/seed/user4/100/100' },
    isLive: false,
    viewers: 0,
    videoUrl: '',
    audioTracks: [],
    tags: ['gaming', 'launch event', 'cyberpunk'],
    category: 'Gaming',
    visibility: 'public',
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
  },
  {
    id: 'scheduled-4',
    title: 'Advanced React Patterns Workshop',
    description: 'A live workshop covering advanced state management and performance patterns in React.',
    thumbnailUrl: 'https://picsum.photos/seed/scheduled4/1280/720',
    creator: CREATOR_USER,
    isLive: false,
    viewers: 0,
    videoUrl: '',
    audioTracks: [],
    tags: ['react', 'tutorial', 'programming', 'workshop'],
    category: 'Education',
    visibility: 'public',
    scheduledStartTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // in 2 days
  },
    {
    id: 'scheduled-5',
    title: 'Live Q&A with a NASA Astronaut',
    description: 'Ask your questions live to a real NASA astronaut about life in space.',
    thumbnailUrl: 'https://picsum.photos/seed/scheduled5/1280/720',
    creator: { ...CREATOR_USER, id: 'user-5', name: 'SpaceTalks', avatarUrl: 'https://picsum.photos/seed/user5/100/100' },
    isLive: false,
    viewers: 0,
    videoUrl: '',
    audioTracks: [],
    tags: ['space', 'nasa', 'q&a', 'science'],
    category: 'Education',
    visibility: 'public',
    scheduledStartTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // in 3 days
  }
];


export const AUTO_TRANSLATE_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
] as const;