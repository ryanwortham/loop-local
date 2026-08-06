'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type Profile = {
  id: string;
  email: string;
  name: string;
  display_name: string;
  app_role: 'user' | 'operator';
  is_admin: boolean;
};

function defaultName(user: User): string {
  const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
  return metadataName || user.email?.split('@')[0] || 'Loop Local member';
}

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('Loading your account…');
  const [busy, setBusy] = useState(false);
  const [operatorAccess, setOperatorAccess] = useState(false);

  async function refreshOperatorAccess(token = '') {
    if (!token) {
      setOperatorAccess(false);
      return;
    }
    const response = await fetch('/api/auth/operator-session', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setOperatorAccess(Boolean(data.operator));
  }

  async function loadProfile(nextUser: User | null) {
    setUser(nextUser);
    if (!nextUser) {
      setProfile(null);
      setMessage('Sign in to save your profile and access operator tools assigned to your account.');
      return;
    }
    const { data: existing } = await supabase
      .from('profiles')
      .select('id,email,name,display_name,app_role,is_admin')
      .eq('id', nextUser.id)
      .maybeSingle();
    if (existing) {
      setProfile(existing as Profile);
      setName(existing.display_name || existing.name);
      setMessage('Signed in.');
      return;
    }
    const fallbackName = defaultName(nextUser);
    const { data: created, error } = await supabase
      .from('profiles')
      .insert({ id: nextUser.id, email: nextUser.email || '', name: fallbackName, display_name: fallbackName })
      .select('id,email,name,display_name,app_role,is_admin')
      .single();
    if (error) {
      setMessage(`Signed in, but the profile could not be loaded: ${error.message}`);
      return;
    }
    setProfile(created as Profile);
    setName(created.display_name || created.name);
    setMessage('Account created.');
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      void loadProfile(data.session?.user || null);
      void refreshOperatorAccess(data.session?.access_token || '');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void loadProfile(session?.user || null);
        void refreshOperatorAccess(session?.access_token || '');
      }, 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('Signing in…');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setMessage(error ? error.message : 'Signed in.');
    setBusy(false);
  }

  async function handleSignUp() {
    setBusy(true);
    setMessage('Creating account…');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() || undefined } },
    });
    if (error) setMessage(error.message);
    else if (!data.session) setMessage('Check your email to confirm your account, then sign in.');
    else setMessage('Account created and signed in.');
    setBusy(false);
  }

  async function handleSignOut() {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : 'Signed out.');
    setBusy(false);
  }

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    if (!user || !profile) return;
    const displayName = name.trim();
    if (!displayName) {
      setMessage('Display name is required.');
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ name: displayName, display_name: displayName })
      .eq('id', user.id)
      .select('id,email,name,display_name,app_role,is_admin')
      .single();
    if (error) setMessage(error.message);
    else {
      setProfile(data as Profile);
      setMessage('Profile saved.');
    }
    setBusy(false);
  }

  return (
    <main className="account-page-shell">
      <header className="account-page-header">
        <Link className="phone-logo" href="/"><span className="brand-mark mini"><span className="brand-logo-image" aria-label="Loop Local" /></span> loop local</Link>
        <Link href="/">Back to discovery</Link>
      </header>
      <section className="account-card" aria-labelledby="account-heading">
        <p className="eyebrow">Account</p>
        <h1 id="account-heading">Your Loop Local account</h1>
        <p className="account-status" role="status">{message}</p>
        {!user ? (
          <form className="account-form" onSubmit={handleSignIn}>
            <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={8} required /></label>
            <div className="account-actions">
              <button className="primary-action" type="submit" disabled={busy}>Sign in</button>
              <button className="secondary-action" type="button" disabled={busy} onClick={handleSignUp}>Create account</button>
            </div>
          </form>
        ) : (
          <form className="account-form" onSubmit={handleSaveProfile}>
            <p><strong>{user.email}</strong></p>
            <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
            <p className="account-role">Role: <strong>{operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? 'Operator' : 'Member'}</strong></p>
            <div className="account-actions">
              <button className="primary-action" type="submit" disabled={busy || !profile}>Save profile</button>
              <button className="secondary-action" type="button" disabled={busy} onClick={handleSignOut}>Sign out</button>
              {operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? <Link className="secondary-action" href="/operator/reviews">Open operator reviews</Link> : null}
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
