import Dexie, { type EntityTable } from 'dexie';

export interface FileRecord {
  id?: number;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  createdAt: Date;
}

export interface JobRecord {
  id?: number;
  tool: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultName: string;
  resultBlob: Blob;
  createdAt: Date;
}

const db = new Dexie('LocalboxDB') as Dexie & {
  files: EntityTable<FileRecord, 'id'>;
  jobs: EntityTable<JobRecord, 'id'>;
};

db.version(1).stores({
  files: '++id, name, type, size, createdAt',
  jobs: '++id, tool, status, createdAt',
});

export { db };

export async function saveFile(file: Omit<FileRecord, 'id'>): Promise<number> {
  return (await db.files.add(file)) as number;
}

export async function getFile(id: number): Promise<FileRecord | undefined> {
  return db.files.get(id);
}

export async function deleteFile(id: number): Promise<void> {
  await db.files.delete(id);
}

export async function saveJobResult(job: Omit<JobRecord, 'id'>): Promise<number> {
  return (await db.jobs.add(job)) as number;
}

export async function getJobResults(tool?: string): Promise<JobRecord[]> {
  if (tool) {
    return db.jobs.where('tool').equals(tool).reverse().sortBy('createdAt');
  }
  return db.jobs.orderBy('createdAt').reverse().toArray();
}

export async function clearJobResults(): Promise<void> {
  await db.jobs.clear();
}
