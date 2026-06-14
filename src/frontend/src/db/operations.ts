import type { Note, NoteVersion, Attachment, AppSettings } from '../types';
import { getDB } from './schema';

function nowISO(): string {
  return new Date().toISOString();
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  return notes
    .filter(n => n.deletedAt === null)
    .sort((a, b) => a.position - b.position);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function addNote(
  partial?: Partial<Pick<Note, 'title' | 'content' | 'color' | 'emoji' | 'folder' | 'tags' | 'createdLat' | 'createdLng' | 'updatedLat' | 'updatedLng'>>
): Promise<Note> {
  const db = await getDB();
  const allNotes = await db.getAll('notes');
  const maxPosition = allNotes.reduce((max, n) => Math.max(max, n.position), -1);

  const note: Note = {
    id: crypto.randomUUID(),
    title: partial?.title ?? '',
    content: partial?.content ?? '',
    tags: partial?.tags ?? [],
    color: partial?.color ?? '#FFE4B5',
    emoji: partial?.emoji ?? '📝',
    folder: partial?.folder ?? 'default',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
    position: maxPosition + 1,
    createdLat: partial?.createdLat,
    createdLng: partial?.createdLng,
    updatedLat: partial?.updatedLat,
    updatedLng: partial?.updatedLng,
  };

  await db.add('notes', note);
  return note;
}

export async function updateNote(id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | undefined> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) return undefined;

  const updated: Note = {
    ...existing,
    ...data,
    updatedAt: nowISO(),
  };

  await db.put('notes', updated);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) return;

  existing.deletedAt = nowISO();
  existing.updatedAt = nowISO();
  await db.put('notes', existing);
}

export async function getTrashedNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  return notes
    .filter(n => n.deletedAt !== null)
    .sort((a, b) => {
      const da = a.deletedAt ?? '';
      const db_ = b.deletedAt ?? '';
      return db_.localeCompare(da);
    });
}

export async function restoreNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) return undefined;

  existing.deletedAt = null;
  existing.updatedAt = nowISO();
  await db.put('notes', existing);
  return existing;
}

export async function permanentlyDeleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);

  const tx = db.transaction('versions', 'readwrite');
  let cursor = await tx.store.index('noteId').openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function deleteOldTrash(days: number): Promise<number> {
  const db = await getDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString();

  const notes = await db.getAll('notes');
  const toDelete = notes.filter(n => n.deletedAt !== null && n.deletedAt < cutoffISO);

  const tx = db.transaction(['notes', 'versions'], 'readwrite');
  for (const note of toDelete) {
    await tx.objectStore('notes').delete(note.id);

    let cursor = await tx.objectStore('versions').index('noteId').openCursor(note.id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
  await tx.done;

  return toDelete.length;
}

export async function getSetting(key: string): Promise<AppSettings | undefined> {
  const db = await getDB();
  return db.get('settings', key);
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function addVersion(version: Omit<NoteVersion, 'id'>): Promise<NoteVersion> {
  const db = await getDB();
  const full: NoteVersion = {
    ...version,
    id: crypto.randomUUID(),
  };
  await db.add('versions', full);
  return full;
}

export async function getVersions(noteId: string): Promise<NoteVersion[]> {
  const db = await getDB();
  const versions = await db.getAllFromIndex('versions', 'noteId', noteId);
  return versions.sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function getLatestVersion(noteId: string): Promise<NoteVersion | undefined> {
  const versions = await getVersions(noteId);
  return versions[0];
}

export async function addAttachment(noteId: string, fileName: string, mimeType: string, data: ArrayBuffer): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.add('attachments', {
    id,
    noteId,
    fileName,
    mimeType,
    data,
    size: data.byteLength,
    createdAt: nowISO(),
  });
  return id;
}

export async function getAttachment(id: string): Promise<Attachment | undefined> {
  const db = await getDB();
  return db.get('attachments', id);
}

export async function getAttachmentsForNote(noteId: string): Promise<Attachment[]> {
  const db = await getDB();
  return db.getAllFromIndex('attachments', 'noteId', noteId);
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('attachments', id);
}
