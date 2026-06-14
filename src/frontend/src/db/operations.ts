import type { Note, NoteVersion, Attachment, AppSettings } from '../types';
import { getDB } from './schema';

function nowISO(): string {
  return new Date().toISOString();
}

const DEFAULT_EMOJIS = ['📝', '💡', '⭐', '🎯', '🔥', '✅', '📌', '💪', '🎨', '📚', '🌈', '✨', '🌱', '🚀', '💻', '🎵', '📅', '🔔', '📋', '❤️'];

function randomEmoji(): string {
  return DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
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
  partial?: Partial<Pick<Note, 'title' | 'content' | 'color' | 'emoji' | 'folder' | 'tags' | 'createdLat' | 'createdLng' | 'updatedLat' | 'updatedLng' | 'author'>>
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
    emoji: partial?.emoji ?? randomEmoji(),
    folder: partial?.folder ?? 'default',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
    position: maxPosition + 1,
    createdLat: partial?.createdLat,
    createdLng: partial?.createdLng,
    updatedLat: partial?.updatedLat,
    updatedLng: partial?.updatedLng,
    author: partial?.author ?? null,
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

export async function deleteVersion(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('versions', id);
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('attachments', id);
}

export async function deleteAllNotes(): Promise<void> {
  const db = await getDB();
  await db.clear('notes');
  await db.clear('versions');
  await db.clear('attachments');
}

export async function checkDBIntegrity(): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDB();
    const tx = db.transaction('notes', 'readonly');
    await tx.store.count();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function emergencyReset(): Promise<void> {
  const { closeDB } = await import('./schema');
  closeDB();
  const DB_NAME = 'notas-app';
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn('deleteDatabase blocked, retrying...');
      setTimeout(() => {
        const retry = indexedDB.deleteDatabase(DB_NAME);
        retry.onsuccess = () => resolve();
        retry.onerror = () => reject(retry.error);
      }, 500);
    };
  });
}

export async function seedSampleNotes(): Promise<void> {
  const samples = [
    { title: '👋 Bienvenido a nots', content: '# Bienvenido\n\nEsta es tu app de notas. **Características:**\n\n- ✏️ Edición Markdown\n- 🏷️ Etiquetas\n- 🎨 Colores personalizados\n- 📋 Listas de tareas\n- 📦 Exportación ZIP\n\n🔒 **Tus notas son seguras** — todo se almacena en tu navegador. Nada sale de tu dispositivo sin tu permiso.', color: '#fff8e8', tags: ['bienvenida'], emoji: '👋' },
    { title: '✅ Lista de tareas', content: '## Tareas pendientes\n\n- [x] Configurar la app\n- [ ] Escribir primera nota\n- [ ] Probar el markdown\n- [ ] Organizar por etiquetas\n\n> Hecho: ~~3~~ 1 de 4', color: '#fef0f5', tags: ['tareas'], emoji: '✅' },
    { title: '📝 Markdown básico', content: '# Markdown\n\n**Negrita** · *Cursiva* · ~~Tachado~~\n\n## Lista\n- Item 1\n- Item 2\n\n## Código\n```\nconsole.log(\'Hola\')\n```\n\n| Col1 | Col2 |\n|------|------|\n| A | B |', color: '#f0faf0', tags: ['markdown', 'guía'], emoji: '📝' },
    { title: '💡 Ideas', content: '## Ideas para explorar\n\n1. Aprender React Native\n2. Escribir un blog\n3. Contribuir a open source\n\n> Link: [github.com](https://github.com)', color: '#e8f4fd', tags: ['ideas'], emoji: '💡' },
    { title: '📌 Recordatorio', content: '## Recordatorios\n\n- Cobrar facturas 📄\n- Comprar regalo 🎁\n- Llamar al médico 📞\n- **Fecha límite:** próxima semana', color: '#fff5e8', tags: ['recordatorio'], emoji: '📌' },
  ]
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    await addNote({ title: s.title, content: s.content, color: s.color, tags: s.tags, emoji: s.emoji })
  }
}
