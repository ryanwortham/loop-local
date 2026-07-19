#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { chmod, mkdir, open, readFile } from 'node:fs/promises';
import path from 'node:path';
import { canonicalRepositoryState, reconcileRepositoryStates, repositoryStateHash } from '../lib/local-submissions/import-reconciliation.ts';
import type { RepositoryStoreShape } from '../lib/local-submissions/repository.ts';
import { SupabaseLocalSubmissionsRepository } from '../lib/local-submissions/supabase-repository.ts';

type Arguments = {
  apply: boolean;
  source: string;
  backup?: string;
};

function parseArguments(argv: string[]): Arguments {
  const args: Arguments = {
    apply: false,
    source: process.env.LOCAL_SUBMISSIONS_FILE || path.join(process.cwd(), 'runtime-data', 'local-submissions.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run' || arg === '--reconcile-only') args.apply = false;
    else if (arg === '--source') args.source = argv[++index] || '';
    else if (arg === '--backup') args.backup = argv[++index] || '';
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.source) throw new Error('--source requires a path');
  if (args.apply && !args.backup) throw new Error('--apply requires an immutable --backup path');
  return args;
}

function assertStore(value: unknown): asserts value is RepositoryStoreShape {
  if (!value || typeof value !== 'object') throw new Error('Source is not a repository store object');
  const store = value as Partial<RepositoryStoreShape>;
  if (store.version !== 1 || !Array.isArray(store.pendingSubmissions) || !Array.isArray(store.publishedLocalEvents)) {
    throw new Error('Source must contain version 1 pendingSubmissions and publishedLocalEvents arrays');
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateDatabaseIdentifiers(store: RepositoryStoreShape): void {
  const invalid = new Set<string>();
  for (const raw of store.pendingSubmissions) {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    if (typeof item.id !== 'string' || !UUID.test(item.id)) invalid.add(String(item.id || '<missing-pending-id>'));
  }
  for (const raw of store.publishedLocalEvents) {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const id = typeof item.localSubmissionId === 'string'
      ? item.localSubmissionId
      : typeof item.id === 'string' && item.id.startsWith('local-approved-')
        ? item.id.slice('local-approved-'.length)
        : item.id;
    if (typeof id !== 'string' || !UUID.test(id)) invalid.add(String(id || '<missing-published-id>'));
  }
  if (invalid.size) throw new Error(`Database-incompatible submission IDs: ${[...invalid].sort().join(', ')}`);
}

async function createImmutableBackup(sourcePath: string, backupPath: string, raw: Buffer): Promise<string> {
  const sourceHash = createHash('sha256').update(raw).digest('hex');
  await mkdir(path.dirname(backupPath), { recursive: true });
  try {
    const handle = await open(backupPath, 'wx', 0o400);
    try {
      await handle.writeFile(raw);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await chmod(backupPath, 0o400);
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST')) throw error;
    const existing = await readFile(backupPath);
    const existingHash = createHash('sha256').update(existing).digest('hex');
    if (existingHash !== sourceHash) throw new Error(`Backup path already exists with different content: ${backupPath}`);
  }
  const verified = await readFile(backupPath);
  if (createHash('sha256').update(verified).digest('hex') !== sourceHash) throw new Error('Immutable backup verification failed');
  return sourceHash;
}

function counts(store: RepositoryStoreShape) {
  return {
    pending: store.pendingSubmissions.length,
    published: store.publishedLocalEvents.length,
    overrides: Object.keys(store.eventCategoryOverrides || {}).length,
    auditEntries: store.operatorAuditLog?.length || 0,
  };
}

const args = parseArguments(process.argv.slice(2));
const raw = await readFile(args.source);
const parsed: unknown = JSON.parse(raw.toString('utf8'));
assertStore(parsed);
const source = canonicalRepositoryState(parsed);
validateDatabaseIdentifiers(source);
const destinationRepository = new SupabaseLocalSubmissionsRepository();
const before = await destinationRepository.read();
const beforeReport = reconcileRepositoryStates(source, before);
let backupHash: string | undefined;
let applied = false;
let report = beforeReport;
let capabilityMismatches: string[] = [];

if (args.apply) {
  backupHash = await createImmutableBackup(args.source, args.backup!, raw);
  if (!beforeReport.matches) {
    await destinationRepository.write(parsed);
    applied = true;
  }
  const after = await destinationRepository.read();
  report = reconcileRepositoryStates(source, after);
  capabilityMismatches = [];
  for (const rawSubmission of parsed.pendingSubmissions) {
    const submission = rawSubmission && typeof rawSubmission === 'object' ? rawSubmission as Record<string, unknown> : {};
    if (typeof submission.id === 'string' && typeof submission.statusToken === 'string') {
      if (!await destinationRepository.authorizeStatusCapability(submission.id, submission.statusToken)) capabilityMismatches.push(submission.id);
    }
  }
  if (!report.matches || capabilityMismatches.length) throw new Error(`Post-import reconciliation failed for ${report.missingPendingIds.length + report.missingPublishedIds.length + report.statusMismatches.length + report.historyMismatches.length + capabilityMismatches.length} item(s)`);
}

console.log(JSON.stringify({
  mode: args.apply ? 'apply' : 'dry-run',
  applied,
  alreadyReconciled: beforeReport.matches,
  source: counts(source),
  destinationBefore: counts(before),
  sourceHash: repositoryStateHash(source),
  destinationBeforeHash: repositoryStateHash(before),
  reconciliation: report,
  capabilityMismatches,
  backup: args.backup ? { path: args.backup, sha256: backupHash } : null,
}, null, 2));
