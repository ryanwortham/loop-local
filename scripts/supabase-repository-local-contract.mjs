#!/usr/bin/env node
import {
  resolveSupabaseRepositoryConfig,
  SupabaseLocalSubmissionsRepository,
} from '../lib/local-submissions/supabase-repository.ts';
import {
  runLocalSubmissionsRepositoryContract,
} from './local-submissions-repository-contract.shared.ts';

const actorUserId = process.env.LOOP_LOCAL_REPOSITORY_CONTRACT_ACTOR_ID;
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/i.test(actorUserId || '')) {
  throw new Error('LOOP_LOCAL_REPOSITORY_CONTRACT_ACTOR_ID must be a canonical test UUID');
}

const config = resolveSupabaseRepositoryConfig();
const primary = new SupabaseLocalSubmissionsRepository(config);
const secondary = new SupabaseLocalSubmissionsRepository(config);
const baseline = await primary.read();

try {
  await runLocalSubmissionsRepositoryContract({
    primary,
    secondary,
    operatorActorUserId: actorUserId,
  });
  console.log('loop_local_supabase_repository_local_contract_ok');
} finally {
  await primary.write(baseline);
}
