import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { FileLocalSubmissionsRepository } from '../lib/local-submissions/file-repository.ts';
import {
  runLocalSubmissionsRepositoryContract,
} from './local-submissions-repository-contract.shared.ts';

async function withFileRepositories(
  run: (
    primary: FileLocalSubmissionsRepository,
    secondary: FileLocalSubmissionsRepository,
  ) => Promise<void>,
) {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-contract-${randomUUID()}.json`);
  try {
    await run(
      new FileLocalSubmissionsRepository({ runtimePath }),
      new FileLocalSubmissionsRepository({ runtimePath }),
    );
  } finally {
    await rm(runtimePath, { force: true });
  }
}

test('shared repository contract passes against the file adapter', async () => {
  await withFileRepositories(async (primary, secondary) => {
    await runLocalSubmissionsRepositoryContract({
      primary,
      secondary,
      operatorActorUserId: randomUUID(),
    });
  });
});

test('file repository preserves omitted optional maps for legacy domain defaults', async () => {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-legacy-${randomUUID()}.json`);
  await writeFile(runtimePath, JSON.stringify({ version: 1, pendingSubmissions: [], publishedLocalEvents: [] }), 'utf8');
  try {
    const repository = new FileLocalSubmissionsRepository({ runtimePath });
    const store = await repository.read();
    assert.equal(Object.prototype.hasOwnProperty.call(store, 'eventCategoryOverrides'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(store, 'operatorAuditLog'), false);
  } finally {
    await rm(runtimePath, { force: true });
  }
});

test('file repository surfaces corrupt data instead of treating it as an empty store', async () => {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-corrupt-${randomUUID()}.json`);
  await writeFile(runtimePath, '{not-valid-json', 'utf8');
  try {
    const repository = new FileLocalSubmissionsRepository({ runtimePath });
    await assert.rejects(repository.read(), /JSON|Unexpected|position/i);
  } finally {
    await rm(runtimePath, { force: true });
  }
});
