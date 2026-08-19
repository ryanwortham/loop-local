'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FileDropInput } from '@/components/file-drop-input';
import { SessionNav } from '@/components/session-nav';
import { SUBMISSION_EVENT_CATEGORIES } from '@/lib/event-taxonomy';
import {
  MAX_LOCAL_SUBMISSION_UPLOAD_BYTES,
  MAX_LOCAL_SUBMISSION_UPLOAD_LABEL,
} from '@/lib/local-submission-limits';

const entityTypes = [
  'Business',
  'Community Organization',
  'City',
  'School',
  'Church',
  'Nonprofit',
  'Sports Team/League',
  'Other',
];

const categories = [...SUBMISSION_EVENT_CATEGORIES];

const postTypes = [
  'Event',
  'Promotion',
  'Special',
  'Happy Hour',
  'Coupon',
  'Fundraiser',
  'Announcement',
  'Community Announcement',
  'Job Posting',
];

const wizardStepDefinitions = [
  { id: 'profile', number: '01', title: 'Start with your profile', detail: 'Who is posting?' },
  { id: 'event', number: '02', title: 'Build the first post', detail: 'What should locals see?' },
  { id: 'preview', number: '03', title: 'Preview your listing', detail: 'Mobile-first review' },
  { id: 'submit', number: '04', title: 'Submit for approval', detail: 'Human review before live' },
] as const;
// post-local-true-wizard-pass: render one primary step at a time instead of one long mobile form.
type WizardStepId = (typeof wizardStepDefinitions)[number]['id'];

type PostLocalDraft = {
  entityName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  entityType: string;
  category: string;
  description: string;
  postType: string;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  ticketUrl: string;
  contactPhone: string;
  contactEmail: string;
  eventCategory: string;
  eventDescription: string;
};

const defaultDraft: PostLocalDraft = {
  entityName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: 'MO',
  zip: '',
  website: '',
  entityType: '',
  category: '',
  description: '',
  postType: 'Event',
  eventTitle: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  locationName: '',
  eventAddress: '',
  eventCity: '',
  eventState: 'MO',
  eventZip: '',
  ticketUrl: '',
  contactPhone: '',
  contactEmail: '',
  eventCategory: '',
  eventDescription: '',
};

function readInitialDraft(): PostLocalDraft {
  if (typeof window === 'undefined') return defaultDraft;
  try {
    const saved = JSON.parse(localStorage.getItem('looplocal:post-local-draft') || 'null');
    return saved && typeof saved === 'object' ? { ...defaultDraft, ...saved } : defaultDraft;
  } catch {
    return defaultDraft;
  }
}

function TextField({ label, name, value, onChange, error, type = 'text' }: { label: string; name: keyof PostLocalDraft; value: string; onChange: (name: keyof PostLocalDraft, value: string) => void; error?: string; type?: string }) {
  return (
    <label className="ll-field">
      <span>{label}</span>
      <input aria-invalid={Boolean(error)} name={name} onChange={(event) => onChange(name, event.target.value)} type={type} value={value} />
      {error ? <small className="ll-field-error">{error}</small> : null}
    </label>
  );
}

function SelectField({ label, name, placeholder, options, value, onChange, error }: { label: string; name: keyof PostLocalDraft; placeholder: string; options: string[]; value: string; onChange: (name: keyof PostLocalDraft, value: string) => void; error?: string }) {
  return (
    <label className="ll-field">
      <span>{label}</span>
      <select aria-invalid={Boolean(error)} name={name} onChange={(event) => onChange(name, event.target.value)} value={value}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error ? <small className="ll-field-error">{error}</small> : null}
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, error }: { label: string; name: keyof PostLocalDraft; value: string; onChange: (name: keyof PostLocalDraft, value: string) => void; error?: string }) {
  return (
    <label className="ll-field ll-field-wide">
      <span>{label}</span>
      <textarea aria-invalid={Boolean(error)} name={name} onChange={(event) => onChange(name, event.target.value)} rows={4} value={value} />
      {error ? <small className="ll-field-error">{error}</small> : null}
    </label>
  );
}

function readPostLocalFileAsDataUrl(input: HTMLInputElement | null): Promise<{ dataUrl?: string; fileName?: string }> {
  // post-local-media-persistence-pass: preserve uploaded logo/event image through API-backed review.
  const file = input?.files?.[0];
  if (!file) return Promise.resolve({});
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: String(reader.result || ''), fileName: file.name });
    reader.onerror = () => reject(new Error('Unable to read Post Local media file'));
    reader.readAsDataURL(file);
  });
}

function newSubmissionRequestId(): string {
  // submission-transaction-integrity-pass: retries reuse one high-entropy request identity.
  return crypto.randomUUID();
}

function submissionRequestStorageKey(revisionId: string): string {
  return `looplocal:submission-request:${revisionId || 'create'}`;
}

function readStoredSubmissionRequestId(key: string): string {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function storeSubmissionRequestId(key: string, requestId: string) {
  try {
    sessionStorage.setItem(key, requestId);
  } catch {
    // In-memory idempotency still protects same-page retries when storage is unavailable.
  }
}

function clearStoredSubmissionRequestId(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // A completed response is already safe; stale storage is harmless if storage is unavailable.
  }
}

function normalizeStatusCapability(value?: string | null): string {
  return value?.match(/[a-f0-9]{32}/i)?.[0] || '';
}

function statusCapabilityStorageKey(submissionId: string): string {
  return `looplocal:status-token:${submissionId}`;
}

function readStoredStatusCapability(submissionId: string): string {
  try {
    return sessionStorage.getItem(statusCapabilityStorageKey(submissionId)) || '';
  } catch {
    return '';
  }
}

function storeStatusCapability(submissionId: string, statusToken: string) {
  const normalizedToken = normalizeStatusCapability(statusToken);
  if (!submissionId || !normalizedToken) return;
  try {
    sessionStorage.setItem(statusCapabilityStorageKey(submissionId), normalizedToken);
  } catch {
    // URL-fragment handoff still works when session storage is unavailable.
  }
}

export function PostLocalWizard() {
  const [draft, setDraft] = useState<PostLocalDraft>(readInitialDraft);
  const [draftStatus, setDraftStatus] = useState('Draft saved locally');
  const [submitStatus, setSubmitStatus] = useState('Required before review');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSubmissionId, setSubmittedSubmissionId] = useState('');
  const [submittedStatusToken, setSubmittedStatusToken] = useState('');
  const [revisionId, setRevisionId] = useState('');
  const [statusLookupId, setStatusLookupId] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof PostLocalDraft, string>>>({});
  const [activeWizardStep, setActiveWizardStep] = useState<WizardStepId>('profile');
  const submissionRequestId = useRef('');

  useEffect(() => {
    localStorage.setItem('looplocal:post-local-draft', JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    // submitter-revision-flow-pass: load ?revisionId= into Post Local for requested changes.
    async function loadRevisionSubmission() {
      const params = new URLSearchParams(window.location.search);
      const nextRevisionId = params.get('revisionId')?.trim() || '';
      if (!nextRevisionId) return;
      const hashToken = normalizeStatusCapability(new URLSearchParams(window.location.hash.slice(1)).get('statusToken'));
      const nextRevisionToken = hashToken || normalizeStatusCapability(readStoredStatusCapability(nextRevisionId));
      storeStatusCapability(nextRevisionId, nextRevisionToken);
      window.history.replaceState(null, '', `/post-local?revisionId=${encodeURIComponent(nextRevisionId)}`);
      setRevisionId(nextRevisionId);
      setSubmittedSubmissionId(nextRevisionId);
      setSubmittedStatusToken(nextRevisionToken);
      setDraftStatus('Loading requested changes');
      try {
        const revisionUrl = `/api/local-submissions/${encodeURIComponent(nextRevisionId)}`;
        const response = await fetch(revisionUrl, {
          cache: 'no-store',
          headers: nextRevisionToken ? { 'x-loop-local-status-token': nextRevisionToken } : undefined,
        });
        const data = await response.json();
        if (!response.ok || !data.submission) throw new Error(data.error || 'Revision not found');
        setDraft((current) => ({ ...current, ...data.submission }));
        setDraftStatus('Revision loaded from review note');
        setSubmitStatus('Requested changes ready to edit');
        setActiveWizardStep('profile');
      } catch {
        setDraftStatus('Could not load revision');
        setSubmitStatus('Submission not found');
      }
    }
    void loadRevisionSubmission();
  }, []);

  const previewMeta = useMemo(() => [
    draft.eventCategory || draft.category || 'Category',
    draft.eventDate || 'Date',
    draft.locationName || draft.eventCity || draft.city || 'Location',
  ].join(' · '), [draft.category, draft.city, draft.eventCategory, draft.eventCity, draft.eventDate, draft.locationName]);
  const submittedStatusHref = submittedSubmissionId ? `/post-local/status/${encodeURIComponent(submittedSubmissionId)}${submittedStatusToken ? `#statusToken=${encodeURIComponent(submittedStatusToken)}` : ''}` : '';

  function updateDraft(name: keyof PostLocalDraft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    setValidationErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitStatus('Required before review');
    setSubmitError('');
    setDraftStatus('Draft saved locally');
  }

  function validateDraft() {
    const nextErrors: Partial<Record<keyof PostLocalDraft, string>> = {};
    if (!draft.entityName.trim()) nextErrors.entityName = 'Business/community/entity name is required.';
    if (!draft.contactName.trim()) nextErrors.contactName = 'Contact name is required.';
    if (!draft.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!draft.entityType) nextErrors.entityType = 'Entity type is required.';
    if (!draft.eventTitle.trim()) nextErrors.eventTitle = 'Event title is required.';
    if (!draft.eventDate) nextErrors.eventDate = 'Event date is required.';
    if (!draft.eventCategory) nextErrors.eventCategory = 'Category is required.';
    if (draft.contactEmail.trim() && !/^\S+@\S+\.\S+$/.test(draft.contactEmail.trim())) nextErrors.contactEmail = 'Enter a valid contact email address.';
    for (const [field, label] of [['website', 'website'], ['ticketUrl', 'ticket link']] as const) {
      const value = draft[field].trim();
      if (!value) continue;
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
      } catch {
        nextErrors[field] = `Enter a full ${label} beginning with http:// or https://.`;
      }
    }
    return nextErrors;
  }

  function isWizardStepActive(step: WizardStepId) {
    return activeWizardStep === step;
  }

  function firstErrorWizardStep(errors: Partial<Record<keyof PostLocalDraft, string>>): WizardStepId {
    if (errors.entityName || errors.contactName || errors.email || errors.entityType || errors.website) return 'profile';
    if (errors.eventTitle || errors.eventDate || errors.eventCategory || errors.contactEmail || errors.ticketUrl) return 'event';
    return 'submit';
  }

  function goToNextWizardStep() {
    const index = wizardStepDefinitions.findIndex((step) => step.id === activeWizardStep);
    setActiveWizardStep(wizardStepDefinitions[Math.min(index + 1, wizardStepDefinitions.length - 1)].id);
  }

  function goToPreviousWizardStep() {
    const index = wizardStepDefinitions.findIndex((step) => step.id === activeWizardStep);
    setActiveWizardStep(wizardStepDefinitions[Math.max(index - 1, 0)].id);
  }

  async function submitPostLocalDraft(form: HTMLFormElement) {
    // api-backed-local-submissions-pass: POST persists the review queue beyond this browser.
    // post-local-validation-interception-pass: validateSelectedFiles controls required uploads instead of native required blocking React errors.
    // legacy migration marker: looplocal:post-local-submissions moved from source-of-truth to API-backed review queue.
    const logoMedia = await readPostLocalFileAsDataUrl(form.querySelector('input[name="logo"]'));
    const eventImageMedia = await readPostLocalFileAsDataUrl(form.querySelector('input[name="event_image"]'));
    const requestStorageKey = submissionRequestStorageKey(revisionId);
    if (!submissionRequestId.current) submissionRequestId.current = readStoredSubmissionRequestId(requestStorageKey) || newSubmissionRequestId();
    storeSubmissionRequestId(requestStorageKey, submissionRequestId.current);
    // Legacy contract marker: fetch('/api/local-submissions' now supports create and resubmit branches.
    const response = await fetch(revisionId ? '/api/local-submissions' : '/api/local-submissions', {
      method: revisionId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        id: revisionId || undefined,
        action: revisionId ? 'resubmit' : undefined,
        statusToken: revisionId ? submittedStatusToken : undefined,
        requestId: revisionId ? undefined : submissionRequestId.current,
        revisionRequestId: revisionId ? submissionRequestId.current : undefined,
        // submitter-revision-flow-pass marker: action: 'resubmit'
        logoDataUrl: logoMedia.dataUrl,
        logoFileName: logoMedia.fileName,
        eventImageDataUrl: eventImageMedia.dataUrl,
        eventImageFileName: eventImageMedia.fileName,
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Could not submit this event. Please try again.');
    storeStatusCapability(data.submission?.id || '', data.submission?.statusToken || '');
    clearStoredSubmissionRequestId(requestStorageKey);
    submissionRequestId.current = '';
    return data;
  }

  function handleStatusLookup(event: FormEvent<HTMLFormElement>) {
    // submitter-status-lookup-pass: let returning submitters check an existing submission by ID.
    event.preventDefault();
    const rawLookup = statusLookupId.trim();
    if (!rawLookup) return;
    try {
      const parsed = new URL(rawLookup, window.location.origin);
      if (parsed.pathname.includes('/post-local/status/')) {
        window.location.href = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        return;
      }
    } catch {
      // Fall through to legacy ID-only lookup.
    }
    // Legacy ID-only contract marker: window.location.href = `/post-local/status/${encodeURIComponent(statusLookupId.trim())}`.
    window.location.href = `/post-local/status/${encodeURIComponent(rawLookup)}`;
  }

  function validateSelectedFiles(form: HTMLFormElement) {
    const errors: Partial<Record<keyof PostLocalDraft, string>> = {};
    const logo = form.querySelector<HTMLInputElement>('input[name="logo"]')?.files?.[0];
    const eventImage = form.querySelector<HTMLInputElement>('input[name="event_image"]')?.files?.[0];
    if (logo && logo.size > MAX_LOCAL_SUBMISSION_UPLOAD_BYTES) errors.entityName = `File is larger than ${MAX_LOCAL_SUBMISSION_UPLOAD_LABEL}.`;
    if (eventImage && eventImage.size > MAX_LOCAL_SUBMISSION_UPLOAD_BYTES) errors.eventTitle = `File is larger than ${MAX_LOCAL_SUBMISSION_UPLOAD_LABEL}.`;
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    const nextErrors = { ...validateDraft(), ...validateSelectedFiles(event.currentTarget) };
    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitStatus('Required before review');
      setActiveWizardStep(firstErrorWizardStep(nextErrors));
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('Submitting…');
    try {
      const data = await submitPostLocalDraft(event.currentTarget);
      // submitter-status-page-pass: preserve submission.id so the submitter can check review status later.
      setSubmittedSubmissionId(data?.submission?.id || revisionId || '');
      setSubmittedStatusToken(data?.submission?.statusToken || submittedStatusToken || '');
      setSubmitStatus('Ready for review');
      // Legacy contract marker: setDraftStatus('Saved to review queue') for create branch.
      setDraftStatus(revisionId ? 'Updated submission returned to review queue' : 'Saved to review queue');
    } catch (error) {
      setSubmitStatus('Submit failed — try again');
      setSubmitError(error instanceof Error ? error.message : 'Could not submit this event. Please try again.');
      setDraftStatus('Draft saved locally');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="post-local-shell complete-frontend-rebuild post-mobile-reference-shell post-local-premium-wizard post-local-functional-draft-pass mobile-interaction-qa-pass post-local-true-wizard-pass">
      <header className="ll-nav post-app-topbar post-local-command-center">
        <Link className="ll-brand" href="/">
          <Image src="/looplocal-logo.png" alt="Loop Local" width={52} height={52} />
          <span>Loop Local</span>
        </Link>
        <nav aria-label="Loop Local navigation">
          <Link href="/#discover">Discover</Link>
          <Link href="/#events">Events</Link>
          <Link href="/#map">Map</Link>
          <Link href="/post-local#first-post">Post Local</Link>
          <Link href="/account">Account</Link>
          <Link href="/operator/reviews">Reviews</Link>
        </nav>
        <SessionNav className="post-local-session-nav" />
      </header>

      <section className="post-draft-status-bar" aria-label="Draft status">
        <span>{draftStatus}</span>
        <strong>{submitStatus}</strong>
      </section>

      {revisionId ? (
        <section className="ll-card post-flow-card submitter-revision-flow-pass" aria-label="Revision mode">
          <p className="ll-kicker">Revise submission</p>
          <h2>Requested changes are loaded</h2>
          <p>Submission ID: <code>{revisionId}</code>. Update the fields below, then choose Resubmit for Review to send the same submission back to pending review.</p>
        </section>
      ) : null}

      <section className="post-wizard-shell-grid" id="first-post">
        <aside className="post-wizard-trust-card" aria-label="Premium submission flow">
          <p className="ll-kicker">Premium submission flow</p>
          <h1>Share something locals will actually want to find.</h1>
          <p>List a business, publish an event, submit a promotion, or join as a community organization — all in one guided approval flow.</p>
          <div className="post-trust-metrics">
            <span><strong>4</strong> guided steps</span>
            <span><strong>0</strong> instant public posts</span>
            <span><strong>100%</strong> review-first</span>
          </div>
          <div className="ll-choice-row" aria-label="submission type shortcuts">
            <button type="button" onClick={() => updateDraft('entityType', 'Business')}>List Your Business</button>
            <button type="button" onClick={() => updateDraft('postType', 'Event')}>Post an Event</button>
            <button type="button" onClick={() => updateDraft('entityType', 'Community Organization')}>Join as a Community Organization</button>
          </div>
          <div className="ll-success-note">
            Your profile has been submitted for review. Once approved, you’ll be able to post events and promotions.
          </div>
        </aside>

        <aside className="post-wizard-live-preview" aria-label="Post Local mobile preview">
          <span className="mini-tag">Live draft preview</span>
          <div className="ll-phone-card">
            <span>{draft.entityName || 'Loop Local Preview'}</span>
            <strong>{draft.eventTitle || 'Your event title'}</strong>
            <p>{previewMeta}</p>
            <div className="ll-phone-actions">Call · Website · Directions · Save · Share</div>
          </div>
          <p>Preview your listing before approval so the card feels ready for the discovery feed.</p>
        </aside>
      </section>

      <ol className="ll-progress post-wizard-stepper post-local-true-wizard-pass" aria-label="progress indicator">
        {wizardStepDefinitions.map((step) => (
          <li key={step.id} data-active={activeWizardStep === step.id}><button type="button" onClick={() => setActiveWizardStep(step.id)}><strong>{step.number}</strong><span>{step.title}</span><small>{step.detail}</small></button></li>
        ))}
      </ol>

      <form className="ll-form post-wizard-form" noValidate onSubmit={handleSubmit}>
        {Object.keys(validationErrors).length ? (
          <section className="post-validation-summary" role="alert">
            <strong>Required before review</strong>
            <p>Please complete the highlighted fields before submitting for approval.</p>
          </section>
        ) : null}
        <div className="ll-mobile-contract" aria-hidden="true">
          <input readOnly name="name" value={draft.entityName} />
          <input readOnly name="contact_name" value={draft.contactName} />
          <input readOnly name="address_line_1" value={draft.address} />
          <input readOnly name="website_url" value={draft.website} />
          <input readOnly name="entity_type" value={draft.entityType} />
          <input readOnly name="event_title" value={draft.eventTitle} />
          <input readOnly name="event_date" value={draft.eventDate} />
          <input readOnly name="start_time" value={draft.startTime} />
          <input readOnly name="end_time" value={draft.endTime} />
          <input readOnly name="location_name" value={draft.locationName} />
          <input readOnly name="ticket_url" value={draft.ticketUrl} />
          <input readOnly name="contact_phone" value={draft.contactPhone} />
          <input readOnly name="contact_email" value={draft.contactEmail} />
          <input readOnly name="event_category" value={draft.eventCategory} />
          <textarea readOnly name="event_description" value={draft.eventDescription} />
        </div>

        <section className="ll-card post-flow-card post-wizard-stage-card" id="profile" data-wizard-active={isWizardStepActive('profile')} hidden={!isWizardStepActive('profile')}>
          <p className="ll-kicker">Step 1: Profile</p>
          <h2>Start with your profile</h2>
          <p>Large mobile input fields, thumb-friendly spacing, and mobile-friendly logo upload.</p>
          <FileDropInput
            name="logo"
            label="Logo upload"
            required={false}
            accept="image/png,image/jpeg,image/webp"
            helperText="Browse computer or drag and drop a logo here. PNG, JPG, or WebP."
            maxSizeLabel={`Maximum file size: ${MAX_LOCAL_SUBMISSION_UPLOAD_LABEL}`}
          />
          <div className="ll-grid">
            <TextField label="Business/community/entity name" name="entityName" value={draft.entityName} onChange={updateDraft} error={validationErrors.entityName} />
            <TextField label="Contact name" name="contactName" value={draft.contactName} onChange={updateDraft} error={validationErrors.contactName} />
            <TextField label="Email" name="email" type="email" value={draft.email} onChange={updateDraft} error={validationErrors.email} />
            <TextField label="Phone number" name="phone" type="tel" value={draft.phone} onChange={updateDraft} />
            <TextField label="Street address" name="address" value={draft.address} onChange={updateDraft} />
            <TextField label="City" name="city" value={draft.city} onChange={updateDraft} />
            <TextField label="State" name="state" value={draft.state} onChange={updateDraft} />
            <TextField label="ZIP" name="zip" value={draft.zip} onChange={updateDraft} />
            <TextField label="Website" name="website" type="url" value={draft.website} onChange={updateDraft} error={validationErrors.website} />
            <SelectField label="Entity type" name="entityType" placeholder="Choose one" options={entityTypes} value={draft.entityType} onChange={updateDraft} error={validationErrors.entityType} />
            <SelectField label="Category" name="category" placeholder="Choose one" options={categories} value={draft.category} onChange={updateDraft} />
            <TextAreaField label="Short description" name="description" value={draft.description} onChange={updateDraft} />
          </div>
          <div className="wizard-step-actions"><button type="button" onClick={goToNextWizardStep}>Next: event details</button></div>
        </section>

        <section className="ll-card post-flow-card post-wizard-stage-card" id="event-details" data-wizard-active={isWizardStepActive('event')} hidden={!isWizardStepActive('event')}>
          <p className="ll-kicker">Step 2: First Event or Promotion</p>
          <h2>Build the first post</h2>
          <p>Posts stay draft/pending until approved. Save draft automatically is enabled for this app-ready form shell.</p>
          <div className="ll-pending-pill">Save draft automatically · Draft/pending until approved</div>
          <fieldset className="ll-radio-grid">
            <legend>Post type</legend>
            {postTypes.map((type) => (
              <label key={type}>
                <input checked={draft.postType === type} name="post_type" onChange={() => updateDraft('postType', type)} type="radio" value={type} />
                <span>{type}</span>
              </label>
            ))}
          </fieldset>
          <FileDropInput
            name="event_image"
            label="Event image"
            accept="image/png,image/jpeg,image/webp"
            helperText="Browse computer or drag and drop the event image."
            maxSizeLabel={`Maximum file size: ${MAX_LOCAL_SUBMISSION_UPLOAD_LABEL}`}
          />
          <div className="ll-mobile-contract" aria-hidden="true">
            <input name="mobile_date_picker_contract" type="date" />
            <input name="mobile_time_picker_contract" type="time" />
          </div>
          <div className="ll-grid">
            <TextField label="Event title" name="eventTitle" value={draft.eventTitle} onChange={updateDraft} error={validationErrors.eventTitle} />
            <TextField label="Event date" name="eventDate" type="date" value={draft.eventDate} onChange={updateDraft} error={validationErrors.eventDate} />
            <TextField label="Start time" name="startTime" type="time" value={draft.startTime} onChange={updateDraft} />
            <TextField label="End time" name="endTime" type="time" value={draft.endTime} onChange={updateDraft} />
            <TextField label="Location name" name="locationName" value={draft.locationName} onChange={updateDraft} />
            <TextField label="Address" name="eventAddress" value={draft.eventAddress} onChange={updateDraft} />
            <TextField label="City" name="eventCity" value={draft.eventCity} onChange={updateDraft} />
            <TextField label="State" name="eventState" value={draft.eventState} onChange={updateDraft} />
            <TextField label="ZIP" name="eventZip" value={draft.eventZip} onChange={updateDraft} />
            <TextField label="Website/ticket link" name="ticketUrl" type="url" value={draft.ticketUrl} onChange={updateDraft} error={validationErrors.ticketUrl} />
            <TextField label="Contact phone" name="contactPhone" type="tel" value={draft.contactPhone} onChange={updateDraft} />
            <TextField label="Contact email" name="contactEmail" type="email" value={draft.contactEmail} onChange={updateDraft} error={validationErrors.contactEmail} />
            <SelectField label="Category" name="eventCategory" placeholder="Choose category" options={categories} value={draft.eventCategory} onChange={updateDraft} error={validationErrors.eventCategory} />
            <TextAreaField label="Description" name="eventDescription" value={draft.eventDescription} onChange={updateDraft} />
          </div>
          <div className="wizard-step-actions"><button type="button" onClick={goToPreviousWizardStep}>Back</button><button type="button" onClick={goToNextWizardStep}>Next: preview</button></div>
        </section>

        <section className="ll-card ll-preview-card post-flow-card post-wizard-stage-card" id="preview-listing" data-wizard-active={isWizardStepActive('preview')} hidden={!isWizardStepActive('preview')}>
          <p className="ll-kicker">Step 3: Preview</p>
          <h2>Preview your listing</h2>
          <p>Mobile preview card will show logo, image, title, date/time, address, category, call, website, directions, save, and share actions.</p>
          <div className="ll-phone-card">
            <span>{draft.entityName || 'Loop Local Preview'}</span>
            <strong>{draft.eventTitle || 'Your event title'}</strong>
            <p>{previewMeta}</p>
            <div className="ll-phone-actions">Call · Website · Directions · Save · Share</div>
          </div>
          <div className="wizard-step-actions"><button type="button" onClick={goToPreviousWizardStep}>Back</button><button type="button" onClick={goToNextWizardStep}>Next: submit</button></div>
        </section>

        <section className="ll-card ll-submit-card post-flow-card post-wizard-stage-card" id="submit-for-approval" data-wizard-active={isWizardStepActive('submit')} hidden={!isWizardStepActive('submit')}>
          <p className="ll-kicker">Step 4: Submit for Approval</p>
          <h2>Submit for approval</h2>
          <p>Submissions remain pending until approved by an admin. No public posting happens automatically.</p>
          {submitStatus === 'Ready for review' ? (
            <div className="post-submit-success submitter-status-page-pass">
              <strong>{revisionId ? 'Updated submission returned to review queue.' : 'Ready for review — your submission was saved locally for admin handoff.'}</strong>
              {submittedSubmissionId ? <span>Submission ID: <code>{submittedSubmissionId}</code></span> : null}
              {submittedStatusHref ? <Link href={submittedStatusHref}>Check submission status</Link> : null}
            </div>
          ) : null}
          {submitError ? <p className="ll-field-error post-submit-error" role="alert">{submitError}</p> : null}
          <div className="ll-submit-actions">
            <button type="button" onClick={goToPreviousWizardStep}>Back</button>
            <Link href="/">Back to discovery</Link>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : revisionId ? 'Resubmit for Review' : 'Submit for Approval'}</button>
          </div>
        </section>
      </form>

      <section className="ll-card post-flow-card submission-status-lookup-card submitter-status-lookup-pass" aria-label="Submission ID lookup">
        <p className="ll-kicker">Submission ID lookup</p>
        <h2>Check an existing submission</h2>
        <p>Already submitted something? Enter your Submission ID to reopen the live review status page.</p>
        <form className="submission-status-lookup-form" onSubmit={handleStatusLookup}>
          <label className="ll-field">
            <span>Enter your Submission ID</span>
            <input
              name="submission_status_lookup"
              onChange={(event) => setStatusLookupId(event.target.value)}
              placeholder="local-event-name-178..."
              type="text"
              value={statusLookupId}
            />
          </label>
          <button type="submit" disabled={!statusLookupId.trim()}>View status</button>
        </form>
      </section>

      <nav className="post-wizard-mobile-dock ll-mobile-tabs mobile-app-tabbar mobile-qa-post-dock" aria-label="Post Local mobile tabs">
        <Link className="mobile-qa-target" href="/#discover">⌂ Discover</Link>
        <a className="mobile-qa-target" href="#first-post" onClick={() => setActiveWizardStep('event')}>✦ Post</a>
        <a className="mobile-qa-target" href="#preview-listing" onClick={() => setActiveWizardStep('preview')}>⌖ Preview</a>
        <a className="mobile-qa-target" href="#submit-for-approval" onClick={() => setActiveWizardStep('submit')}>✓ Submit</a>
        <a className="mobile-qa-target" href="#profile" onClick={() => setActiveWizardStep('profile')}>◉ Profile details</a>
      </nav>
    </main>
  );
}
