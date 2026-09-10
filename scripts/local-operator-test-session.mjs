import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function commandPath(command, fallbacks = []) {
  try {
    return execFileSync('/usr/bin/env', ['which', command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || command;
  } catch {
    return fallbacks.find((candidate) => existsSync(candidate)) || command;
  }
}

const supabaseCommand = commandPath('supabase', ['/opt/homebrew/bin/supabase', '/usr/local/bin/supabase']);

function readDotEnv(pathname) {
  if (!existsSync(pathname)) return {};
  const values = {};
  for (const line of readFileSync(pathname, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^"|"$/g, '');
  }
  return values;
}

function projectEnv() {
  return { ...readDotEnv('.env.local'), ...process.env };
}

function localSupabaseEnvironment() {
  try {
    const output = execFileSync(supabaseCommand, ['status', '-o', 'env'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const values = {};
    for (const line of output.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      values[match[1]] = match[2].replace(/^"|"$/g, '');
    }
    for (const key of ['API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY']) {
      if (!values[key]) throw new Error(`local Supabase status is missing ${key}`);
    }
    return { ...values, local: true };
  } catch {
    const env = projectEnv();
    const values = {
      API_URL: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL,
      ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    };
    for (const key of ['API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY']) {
      if (!values[key]) throw new Error(`Supabase smoke environment is missing ${key}`);
    }
    return { ...values, local: false };
  }
}

export async function provisionLocalOperatorSession() {
  const environment = localSupabaseEnvironment();
  const admin = createClient(environment.API_URL, environment.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const client = createClient(environment.API_URL, environment.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const nonce = randomUUID();
  const email = `loop-local-operator-${nonce}@example.test`;
  const password = `Ll-${randomUUID()}-9!`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) throw new Error(`could not create local operator: ${createError?.message || 'missing user'}`);
  const userId = created.user.id;

  try {
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      email,
      name: 'Loop Local smoke operator',
      display_name: 'Loop Local smoke operator',
      app_role: 'operator',
      is_admin: true,
    }, { onConflict: 'id' });
    if (profileError) throw new Error(`could not create local operator profile: ${profileError.message}`);

    if (environment.local) {
      const dockerCommand = commandPath('docker', ['/opt/homebrew/bin/docker', '/usr/local/bin/docker']);
      execFileSync(dockerCommand, ['exec', 'supabase_db_loop-local', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', [
        'begin;',
        'alter table public.profiles disable trigger profiles_prevent_admin_self_elevation;',
        `update public.profiles set app_role = 'operator', is_admin = true where id = '${userId}'::uuid;`,
        'alter table public.profiles enable trigger profiles_prevent_admin_self_elevation;',
        'commit;',
      ].join(' ')], { stdio: 'ignore' });
    }

    const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError || !signedIn.session?.access_token) throw new Error(`could not sign in local operator: ${signInError?.message || 'missing session'}`);

    return {
      accessToken: signedIn.session.access_token,
      anonKey: environment.ANON_KEY,
      email,
      supabaseUrl: environment.API_URL,
      userId,
      async cleanup() {
        let signOutError;
        try {
          const result = await client.auth.signOut();
          signOutError = result.error;
        } catch (error) {
          signOutError = error;
        }
        const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
        if (deleteError) throw new Error(`could not delete local operator: ${deleteError.message}`);
        if (signOutError) throw new Error(`local operator signed out with an error after deletion: ${signOutError instanceof Error ? signOutError.message : String(signOutError)}`);
      },
    };
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);
    throw error;
  }
}
