import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LocalSubmissionsRepository, RepositoryStoreShape } from './repository';

export class FileLocalSubmissionsRepository implements LocalSubmissionsRepository {
  // local-submissions-repository-boundary-pass: file adapter is isolated and replaceable by Supabase.
  private readonly runtimePath = process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH || path.join(process.cwd(), 'runtime-data', 'local-submissions.json');

  async read(): Promise<unknown> {
    try {
      return JSON.parse(await readFile(this.runtimePath, 'utf8'));
    } catch {
      return { version: 1, pendingSubmissions: [], publishedLocalEvents: [] };
    }
  }

  async write(store: RepositoryStoreShape): Promise<unknown> {
    await mkdir(path.dirname(this.runtimePath), { recursive: true });
    const tempPath = `${this.runtimePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
    await rename(tempPath, this.runtimePath);
    return store;
  }
}
