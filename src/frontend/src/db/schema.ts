import { openDB, IDBPDatabase } from 'idb';
import type { Note, NoteVersion, Attachment, AppSettings } from '../types';

const DB_NAME = 'notas-app';
const DB_VERSION = 1;

interface NoteStore {
  key: string;
  value: Note;
  indexes: {
    'deletedAt': string | null;
    'updatedAt': string;
  };
}

interface VersionStore {
  key: string;
  value: NoteVersion;
  indexes: {
    'noteId': string;
  };
}

interface AttachmentStore {
  key: string;
  value: Attachment;
  indexes: {
    'noteId': string;
  };
}

interface SettingsStore {
  key: string;
  value: AppSettings;
}

export interface NotasDB {
  notes: NoteStore;
  versions: VersionStore;
  attachments: AttachmentStore;
  settings: SettingsStore;
}

let dbInstance: IDBPDatabase<NotasDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<NotasDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NotasDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('deletedAt', 'deletedAt');
        notesStore.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('versions')) {
        const versionsStore = db.createObjectStore('versions', { keyPath: 'id' });
        versionsStore.createIndex('noteId', 'noteId');
      }
      if (!db.objectStoreNames.contains('attachments')) {
        const attStore = db.createObjectStore('attachments', { keyPath: 'id' });
        attStore.createIndex('noteId', 'noteId');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
