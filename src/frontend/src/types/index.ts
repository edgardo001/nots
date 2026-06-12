export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  emoji: string;
  folder: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  position: number;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  title: string;
  savedAt: string;
  versionNumber: number;
}

export interface Attachment {
  id: string;
  noteId: string;
  fileName: string;
  mimeType: string;
  data: ArrayBuffer;
  size: number;
  createdAt: string;
}

export interface AppSettings {
  key: string;
  value: any;
}

export type ViewMode = 'postit' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'position';
export type SortOrder = 'asc' | 'desc';
