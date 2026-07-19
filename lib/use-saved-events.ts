'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  mergeSavedEventIds,
  parseGuestSavedEventIds,
  persistedEventId,
  SAVED_EVENTS_CHANGED_EVENT,
  SAVED_EVENTS_STORAGE_KEY,
  savedEventsSyncIsCurrent,
} from '@/lib/saved-events';

function readGuestSaves() {
  return typeof window === 'undefined' ? [] : parseGuestSavedEventIds(window.localStorage.getItem(SAVED_EVENTS_STORAGE_KEY));
}

function writeGuestSaves(ids: string[]) {
  window.localStorage.setItem(SAVED_EVENTS_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(SAVED_EVENTS_CHANGED_EVENT));
}

export function useSavedEvents() {
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState('');
  const userIdRef = useRef<string | null>(null);

  const loadAccountSaves = useCallback(async (userId: string) => {
    userIdRef.current = userId;
    const guestIds = readGuestSaves();
    const { data, error } = await supabase.from('saved_events').select('event_id').eq('user_id', userId);
    if (!savedEventsSyncIsCurrent(userId, userIdRef.current)) return;
    if (error) {
      setSavedEventIds(guestIds);
      setSaveStatus('Account saves are temporarily unavailable. Guest saves are preserved.');
      return;
    }
    const accountIds = (data || []).flatMap((row) => typeof row.event_id === 'string' ? [row.event_id] : []);
    const merged = mergeSavedEventIds(guestIds, accountIds);
    const missing = guestIds.filter((id) => !accountIds.includes(id));
    if (missing.length) {
      const { error: mergeError } = await supabase.from('saved_events').upsert(
        missing.map((eventId) => ({ user_id: userId, event_id: eventId })),
        { onConflict: 'user_id,event_id', ignoreDuplicates: true },
      );
      if (!savedEventsSyncIsCurrent(userId, userIdRef.current)) return;
      if (mergeError) {
        setSavedEventIds(merged);
        setSaveStatus('Signed in, but guest saves could not be merged yet. They remain on this device.');
        return;
      }
    }
    window.localStorage.removeItem(SAVED_EVENTS_STORAGE_KEY);
    setSavedEventIds(merged);
    setSaveStatus(missing.length ? `Merged ${missing.length} guest save${missing.length === 1 ? '' : 's'} into your account.` : 'Account saves are synced.');
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const userId = data.session?.user.id;
      if (userId) void loadAccountSaves(userId);
      else {
        userIdRef.current = null;
        setSavedEventIds(readGuestSaves());
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        if (!active) return;
        if (session?.user.id) void loadAccountSaves(session.user.id);
        else {
          userIdRef.current = null;
          setSavedEventIds(readGuestSaves());
          setSaveStatus('Guest saves stay on this device until you sign in.');
        }
      }, 0);
    });
    const handleGuestChange = () => {
      if (!userIdRef.current) setSavedEventIds(readGuestSaves());
    };
    window.addEventListener(SAVED_EVENTS_CHANGED_EVENT, handleGuestChange);
    return () => {
      active = false;
      listener.subscription.unsubscribe();
      window.removeEventListener(SAVED_EVENTS_CHANGED_EVENT, handleGuestChange);
    };
  }, [loadAccountSaves]);

  const toggleSavedEvent = useCallback(async (rawEventId: string) => {
    const eventId = persistedEventId(rawEventId);
    if (!eventId) {
      setSaveStatus('This event cannot be saved yet.');
      return;
    }
    const wasSaved = savedEventIds.includes(eventId);
    const next = wasSaved ? savedEventIds.filter((id) => id !== eventId) : [eventId, ...savedEventIds];
    setSavedEventIds(next);
    const userId = userIdRef.current;
    if (!userId) {
      writeGuestSaves(next);
      setSaveStatus(wasSaved ? 'Removed from this device.' : 'Saved on this device. Sign in to sync it.');
      return;
    }
    const operation = wasSaved
      ? supabase.from('saved_events').delete().eq('user_id', userId).eq('event_id', eventId)
      : supabase.from('saved_events').insert({ user_id: userId, event_id: eventId });
    const { error } = await operation;
    if (!savedEventsSyncIsCurrent(userId, userIdRef.current)) return;
    if (error) {
      setSavedEventIds(savedEventIds);
      setSaveStatus('Save could not be synced. Please try again.');
      return;
    }
    setSaveStatus(wasSaved ? 'Removed from your account.' : 'Saved to your account.');
  }, [savedEventIds]);

  const isSavedEvent = useCallback((rawEventId: string) => {
    const eventId = persistedEventId(rawEventId);
    return Boolean(eventId && savedEventIds.includes(eventId));
  }, [savedEventIds]);

  return { savedEventIds, isSavedEvent, toggleSavedEvent, saveStatus };
}
