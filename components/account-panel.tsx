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
  const [newPassword, setNewPassword] = useState('');
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

  async function handlePasswordResetEmail() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setMessage('Enter your email first, then request a password reset.');
      return;
    }
    setBusy(true);
    setMessage('Sending password reset email…');
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/account`,
    });
    setMessage(error ? error.message : 'Password reset email sent. Check your inbox, then return here to set a new password.');
    setBusy(false);
  }

  async function handleUpdatePassword() {
    const cleanPassword = newPassword.trim();
    if (cleanPassword.length < 8) {
      setMessage('New password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setMessage('Updating password…');
    const { error } = await supabase.auth.updateUser({ password: cleanPassword });
    setMessage(error ? error.message : 'Password updated. You can use it for future sign-ins.');
    if (!error) setNewPassword('');
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
        <div className="account-card-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1 id="account-heading">{user ? 'Account settings' : 'Sign in to Loop Local'}</h1>
            <p className="account-status" role="status">{message}</p>
          </div>
          {user ? (
            <span className="account-role-pill">{operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? 'Operator' : 'Member'}</span>
          ) : null}
        </div>
        {!user ? (
          <form className="account-form" onSubmit={handleSignIn}>
            <div className="account-form-grid">
              <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
              <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
              <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={8} required /></label>
            </div>
            <div className="account-actions">
              <button className="primary-action" type="submit" disabled={busy}>Sign in</button>
              <button className="secondary-action" type="button" disabled={busy} onClick={handleSignUp}>Create account</button>
              <button className="secondary-action" type="button" disabled={busy} onClick={handlePasswordResetEmail}>Forgot password</button>
            </div>
          </form>
        ) : (
          <form className="account-form" onSubmit={handleSaveProfile}>
            <div className="account-identity-band">
              <span>Signed in as</span>
              <strong>{user.email}</strong>
            </div>
            <div className="account-settings-grid">
              <section className="account-settings-section" aria-label="Profile">
                <div className="account-section-heading">
                  <span>Profile</span>
                  <small>Public operator display name</small>
                </div>
                <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
                <button className="primary-action" type="submit" disabled={busy || !profile}>Save profile</button>
              </section>
              <section className="account-settings-section" aria-label="Security">
                <div className="account-section-heading">
                  <span>Security</span>
                  <small>Set a new password when needed</small>
                </div>
                <label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} /></label>
                <button className="secondary-action" type="button" disabled={busy || !newPassword.trim()} onClick={handleUpdatePassword}>Update password</button>
              </section>
            </div>
            <div className="account-operator-band">
              <div>
                <span>{operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? 'Operator access enabled' : 'Standard member access'}</span>
                <small>{operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? 'Review and publish local submissions from the operator desk.' : 'Operator tools appear here when access is assigned.'}</small>
              </div>
              {operatorAccess || profile?.app_role === 'operator' || profile?.is_admin ? <Link className="primary-action" href="/operator/reviews">Open operator reviews</Link> : null}
            </div>
            <div className="account-footer-actions">
              <button className="secondary-action" type="button" disabled={busy} onClick={handleSignOut}>Sign out</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
