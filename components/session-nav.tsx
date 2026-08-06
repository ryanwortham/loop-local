'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type SessionNavProps = {
  className?: string;
};

export function SessionNav({ className = '' }: SessionNavProps) {
  const [user, setUser] = useState<User | null>(null);
  const [operator, setOperator] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshOperator(token = '') {
    if (!token) {
      setOperator(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/operator-session', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOperator(Boolean(data.operator));
    } catch {
      setOperator(false);
    }
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      void refreshOperator(data.session?.access_token || '');
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      void refreshOperator(session?.access_token || '');
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const accountLabel = loading ? 'Account' : user?.email || 'Sign in';

  return (
    <div className={`session-nav ${className}`.trim()} aria-label="Account navigation">
      <Link className="session-account-pill" href="/account" title={accountLabel}>
        <span>{user ? 'Signed in' : 'Account'}</span>
        <strong>{accountLabel}</strong>
      </Link>
      {operator ? <Link className="session-admin-link" href="/operator/reviews">Reviews</Link> : null}
    </div>
  );
}
