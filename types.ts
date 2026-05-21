export interface SelfCheck {
  pronunciation: boolean;
  rhythm: boolean;
  speed: boolean;
  confidence: boolean;
}

export interface Sentence {
  id: number;
  lessonId: number;
  text: string;
  ipa: string;
}

export interface Lesson {
  id: number;
  title: string;
  category: string;
  sentences: Sentence[];
  youtubeVideoId?: string;
  youtubeTimestamp?: number; // Starting timestamp in seconds
}

export interface Phrase {
  id: number;
  group: 'small-talk' | 'business' | 'travel';
  text: string;
  learned: boolean;
}

export type TabType = 'shadowing' | 'record' | 'phrases';
export type ThemeMode = 'dark' | 'light';
