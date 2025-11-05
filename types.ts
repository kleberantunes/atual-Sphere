
import { AUTO_TRANSLATE_LANGUAGES } from './constants';

export enum UserRole {
  VIEWER,
  CREATOR,
  INTERPRETER,
}

export interface InterpreterSlot {
  id: string;
  name: string;
  link: string; // Simulated unique URL for the interpreter to join
  isLive: boolean;
}

export interface LanguageTrack {
  code: string;
  name: string;
  interpreters: [InterpreterSlot, InterpreterSlot];
}

export interface CaptionTrack {
  code: string; // e.g., 'en'
  name: string; // e.g., 'English'
  url: string; // URL to the .vtt file
}

export interface Resolution {
  label: string; // e.g., '1080p'
  url: string; // URL to the video file for this resolution
}

export interface RtmpIngest {
  url: string;
  streamKey: string;
}

export interface IngestInfo {
  primaryRtmp: RtmpIngest;
  backupRtmp: RtmpIngest;
  srtUrl: string;
}

export interface Stream {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  creator: User;
  isLive: boolean;
  viewers: number;
  videoUrl: string;
  audioTracks: LanguageTrack[];
  tags: string[];
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  resolutions?: Resolution[];
  captionTracks?: CaptionTrack[];
  ingest?: IngestInfo;
  scheduledStartTime?: string; // ISO 8601 date string
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
}

export enum AppView {
  HOME = 'HOME',
  WATCH = 'WATCH',
  CREATOR_STUDIO = 'CREATOR_STUDIO',
  INTERPRETER_CONSOLE = 'INTERPRETER_CONSOLE',
}

export type AutoTranslateLanguageCode = typeof AUTO_TRANSLATE_LANGUAGES[number]['code'];