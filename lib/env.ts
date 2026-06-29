const requiredPublicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function getPublicEnv() {
  const missing = Object.entries(requiredPublicEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing public environment variables: ${missing.join(', ')}`);
  }

  return {
    supabaseUrl: requiredPublicEnv.supabaseUrl!,
    supabaseAnonKey: requiredPublicEnv.supabaseAnonKey!,
  };
}

export const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'itraeknotcdtdzaeukan';
