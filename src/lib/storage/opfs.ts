/**
 * OPFS (Origin Private File System) helpers for scratch space.
 * OPFS may be unavailable in some browsers or in worker contexts that don't support it.
 */

export function isOpfsAvailable(): boolean {
  try {
    return typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
  } catch {
    return false;
  }
}

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  return navigator.storage.getDirectory();
}

export async function writeScratch(name: string, blob: Blob): Promise<void> {
  try {
    const root = await getRoot();
    const fileHandle = await root.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (err) {
    console.warn(`[OPFS] Failed to write scratch file "${name}":`, err);
    throw err;
  }
}

export async function readScratch(name: string): Promise<Blob> {
  try {
    const root = await getRoot();
    const fileHandle = await root.getFileHandle(name);
    const file = await fileHandle.getFile();
    return file;
  } catch (err) {
    console.warn(`[OPFS] Failed to read scratch file "${name}":`, err);
    throw err;
  }
}

export async function deleteScratch(name: string): Promise<void> {
  try {
    const root = await getRoot();
    await root.removeEntry(name);
  } catch (err) {
    console.warn(`[OPFS] Failed to delete scratch file "${name}":`, err);
    throw err;
  }
}
