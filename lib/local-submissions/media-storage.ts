import { createHash } from 'node:crypto';
import { MAX_LOCAL_SUBMISSION_UPLOAD_BYTES } from '../local-submission-limits.ts';

export const MAX_GOVERNED_MEDIA_BYTES = MAX_LOCAL_SUBMISSION_UPLOAD_BYTES;
export type GovernedMediaKind = 'logo' | 'eventImage';
export type GovernedMediaMimeType = 'image/jpeg' | 'image/png' | 'image/webp';
export type GovernedMediaBucket = 'submission-media' | 'event-media';

export type ParsedGovernedDataImage = {
  bytes: Buffer;
  mimeType: GovernedMediaMimeType;
  extension: 'jpg' | 'png' | 'webp';
  byteSize: number;
  sha256: string;
};

export type StoredMediaReference = {
  bucket: GovernedMediaBucket;
  objectPath: string;
  mimeType: GovernedMediaMimeType;
  byteSize: number;
  sha256: string;
  kind: GovernedMediaKind;
  publicUrl?: string;
};

type MediaStorageConfig = { supabaseUrl: string; serviceRoleKey: string };
type MediaStorageOptions = { fetchImpl?: typeof fetch };

const MIME_EXTENSIONS: Record<GovernedMediaMimeType, ParsedGovernedDataImage['extension']> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasExpectedImageSignature(bytes: Buffer, mimeType: GovernedMediaMimeType) {
  if (mimeType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  if (mimeType === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
}

export function parseGovernedDataImage(dataUrl: string): ParsedGovernedDataImage {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || match[2].length % 4 !== 0) throw new Error('governed media must contain valid base64 data');
  const mimeType = match[1] as GovernedMediaMimeType;
  const extension = MIME_EXTENSIONS[mimeType];
  if (!extension) throw new Error('governed media must be JPEG, PNG, or WebP');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.toString('base64') !== match[2]) throw new Error('governed media must contain valid base64 data');
  if (bytes.byteLength > MAX_GOVERNED_MEDIA_BYTES) {
    throw new Error(`governed media exceeds ${MAX_GOVERNED_MEDIA_BYTES} bytes`);
  }
  if (!hasExpectedImageSignature(bytes, mimeType)) throw new Error(`governed media content does not match declared ${mimeType}`);
  return {
    bytes,
    mimeType,
    extension,
    byteSize: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

function mediaBaseName(kind: GovernedMediaKind) {
  return kind === 'eventImage' ? 'event-image' : 'logo';
}

export function governedPendingObjectPath(
  submissionId: string,
  kind: GovernedMediaKind,
  mimeType: GovernedMediaMimeType,
) {
  if (!UUID_PATTERN.test(submissionId)) throw new Error('governed media requires a canonical submission UUID');
  return `${submissionId}/${mediaBaseName(kind)}.${MIME_EXTENSIONS[mimeType]}`;
}

function governedPublishedObjectPath(eventId: string, reference: StoredMediaReference) {
  if (!eventId.startsWith('local-approved-') || !UUID_PATTERN.test(eventId.slice('local-approved-'.length))) {
    throw new Error('governed media requires a canonical published event id');
  }
  return `${eventId}/${mediaBaseName(reference.kind)}.${MIME_EXTENSIONS[reference.mimeType]}`;
}

function encodeObjectPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export class SupabaseSubmissionMediaStorage {
  private readonly config: MediaStorageConfig;
  private readonly fetchImpl: typeof fetch;

  constructor(config: MediaStorageConfig, options: MediaStorageOptions = {}) {
    this.config = { ...config, supabaseUrl: config.supabaseUrl.replace(/\/$/, '') };
    this.fetchImpl = options.fetchImpl || fetch;
  }

  private headers(contentType: string, extra: Record<string, string> = {}) {
    return {
      apikey: this.config.serviceRoleKey,
      Authorization: `Bearer ${this.config.serviceRoleKey}`,
      'Content-Type': contentType,
      ...extra,
    };
  }

  private async expect(response: Response, operation: string) {
    if (response.ok) return response;
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Supabase governed media ${operation} failed (${response.status}): ${detail}`);
  }

  private async upload(bucket: GovernedMediaBucket, path: string, parsed: ParsedGovernedDataImage) {
    const response = await this.fetchImpl(
      `${this.config.supabaseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: this.headers(parsed.mimeType, { 'x-upsert': 'true' }),
        body: new Uint8Array(parsed.bytes),
      },
    );
    await this.expect(response, 'upload');
  }

  async uploadPending(submissionId: string, kind: GovernedMediaKind, dataUrl: string): Promise<StoredMediaReference> {
    const parsed = parseGovernedDataImage(dataUrl);
    const objectPath = governedPendingObjectPath(submissionId, kind, parsed.mimeType);
    await this.upload('submission-media', objectPath, parsed);
    return {
      bucket: 'submission-media',
      objectPath,
      mimeType: parsed.mimeType,
      byteSize: parsed.byteSize,
      sha256: parsed.sha256,
      kind,
    };
  }

  async promotePending(reference: StoredMediaReference, eventId: string): Promise<StoredMediaReference> {
    if (reference.bucket !== 'submission-media') throw new Error('only pending submission media can be promoted');
    const download = await this.fetchImpl(
      `${this.config.supabaseUrl}/storage/v1/object/authenticated/submission-media/${encodeObjectPath(reference.objectPath)}`,
      { method: 'GET', cache: 'no-store', headers: this.headers('application/json') },
    );
    await this.expect(download, 'download');
    const bytes = Buffer.from(await download.arrayBuffer());
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (sha256 !== reference.sha256 || bytes.byteLength !== reference.byteSize) {
      throw new Error('pending media checksum mismatch during promotion');
    }
    const parsed: ParsedGovernedDataImage = {
      bytes,
      mimeType: reference.mimeType,
      extension: MIME_EXTENSIONS[reference.mimeType],
      byteSize: bytes.byteLength,
      sha256,
    };
    const objectPath = governedPublishedObjectPath(eventId, reference);
    await this.upload('event-media', objectPath, parsed);
    return {
      ...reference,
      bucket: 'event-media',
      objectPath,
      publicUrl: `${this.config.supabaseUrl}/storage/v1/object/public/event-media/${encodeObjectPath(objectPath)}`,
    };
  }

  async signPending(reference: StoredMediaReference, expiresIn = 900) {
    if (reference.bucket !== 'submission-media') throw new Error('only pending submission media can be signed');
    const response = await this.fetchImpl(
      `${this.config.supabaseUrl}/storage/v1/object/sign/submission-media/${encodeObjectPath(reference.objectPath)}`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: this.headers('application/json'),
        body: JSON.stringify({ expiresIn }),
      },
    );
    await this.expect(response, 'sign');
    const result = await response.json() as { signedURL?: string; signedUrl?: string };
    const signedPath = result.signedURL || result.signedUrl;
    if (!signedPath) throw new Error('Supabase governed media sign returned no URL');
    return signedPath.startsWith('http') ? signedPath : `${this.config.supabaseUrl}/storage/v1${signedPath.startsWith('/') ? '' : '/'}${signedPath}`;
  }

  async removePending(references: StoredMediaReference[]) {
    const paths = references.filter((item) => item.bucket === 'submission-media').map((item) => item.objectPath);
    if (!paths.length) return;
    const response = await this.fetchImpl(`${this.config.supabaseUrl}/storage/v1/object/submission-media`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: this.headers('application/json'),
      body: JSON.stringify({ prefixes: paths }),
    });
    await this.expect(response, 'delete');
  }
}
