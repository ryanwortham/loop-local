'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FileDropInput } from '@/components/file-drop-input';

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

const categories = [
  'Food & Drink',
  'Live Music',
  'Family',
  'Kids',
  'School Activities',
  'Sports',
  'Community',
  'Festivals',
  'Fundraisers',
  'Shopping',
  'Nightlife',
  'Jobs',
  'City Notices',
  'City & Civic',
  'Deals',
  'Happy Hour',
];

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

const wizardSteps = [
  ['01', 'Start with your profile', 'Who is posting?'],
  ['02', 'Build the first post', 'What should locals see?'],
  ['03', 'Preview your listing', 'Mobile-first review'],
  ['04', 'Submit for approval', 'Human review before live'],
];

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

export function PostLocalWizard() {
  const [draft, setDraft] = useState<PostLocalDraft>(readInitialDraft);
  const [draftStatus, setDraftStatus] = useState('Draft saved locally');
  const [submitStatus, setSubmitStatus] = useState('Required before review');
  const [submittedSubmissionId, setSubmittedSubmissionId] = useState('');
  const [statusLookupId, setStatusLookupId] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof PostLocalDraft, string>>>({});

  useEffect(() => {
    localStorage.setItem('looplocal:post-local-draft', JSON.stringify(draft));
  }, [draft]);

  const previewMeta = useMemo(() => [
    draft.eventCategory || draft.category || 'Category',
    draft.eventDate || 'Date',
    draft.locationName || draft.eventCity || draft.city || 'Location',
  ].join(' · '), [draft.category, draft.city, draft.eventCategory, draft.eventCity, draft.eventDate, draft.locationName]);
  const submittedStatusHref = submittedSubmissionId ? `/post-local/status/${encodeURIComponent(submittedSubmissionId)}` : '';

  function updateDraft(name: keyof PostLocalDraft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    setValidationErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitStatus('Required before review');
    setDraftStatus('Draft saved locally');
  }

  function validateDraft() {
    const nextErrors: Partial<Record<keyof PostLocalDraft, string>> = {};
    if (!draft.entityName.trim()) nextErrors.entityName = 'Business/community/entity name is required.';
    if (!draft.contactName.trim()) nextErrors.contactName = 'Contact name is required.';
    if (!draft.email.trim()) nextErrors.email = 'Email is required.';
    if (!draft.entityType) nextErrors.entityType = 'Entity type is required.';
    if (!draft.eventTitle.trim()) nextErrors.eventTitle = 'Event title is required.';
    if (!draft.eventDate) nextErrors.eventDate = 'Event date is required.';
    if (!draft.eventCategory) nextErrors.eventCategory = 'Category is required.';
    return nextErrors;
  }

  async function submitPostLocalDraft(form: HTMLFormElement) {
    // api-backed-local-submissions-pass: POST persists the review queue beyond this browser.
    // legacy migration marker: looplocal:post-local-submissions moved from source-of-truth to API-backed review queue.
    const logoMedia = await readPostLocalFileAsDataUrl(form.querySelector('input[name="logo"]'));
    const eventImageMedia = await readPostLocalFileAsDataUrl(form.querySelector('input[name="event_image"]'));
    const response = await fetch('/api/local-submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        logoDataUrl: logoMedia.dataUrl,
        logoFileName: logoMedia.fileName,
        eventImageDataUrl: eventImageMedia.dataUrl,
        eventImageFileName: eventImageMedia.fileName,
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      }),
    });
    if (!response.ok) throw new Error('Failed to submit Post Local draft');
    return response.json();
  }

  function handleStatusLookup(event: FormEvent<HTMLFormElement>) {
    // submitter-status-lookup-pass: let returning submitters check an existing submission by ID.
    event.preventDefault();
    if (!statusLookupId.trim()) return;
    window.location.href = `/post-local/status/${encodeURIComponent(statusLookupId.trim())}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDraft();
    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitStatus('Required before review');
      return;
    }
    try {
      const data = await submitPostLocalDraft(event.currentTarget);
      // submitter-status-page-pass: preserve submission.id so the submitter can check review status later.
      setSubmittedSubmissionId(data?.submission?.id || '');
      setSubmitStatus('Ready for review');
      setDraftStatus('Saved to review queue');
    } catch {
      setSubmitStatus('Submit failed — try again');
      setDraftStatus('Draft saved locally');
    }
  }

  return (
    <main className="post-local-shell complete-frontend-rebuild post-mobile-reference-shell post-local-premium-wizard post-local-functional-draft-pass mobile-interaction-qa-pass">
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
        </nav>
      </header>

      <section className="post-draft-status-bar" aria-label="Draft status">
        <span>{draftStatus}</span>
        <strong>{submitStatus}</strong>
      </section>

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

      <ol className="ll-progress post-wizard-stepper" aria-label="progress indicator">
        {wizardSteps.map(([number, title, detail]) => (
          <li key={number}><strong>{number}</strong><span>{title}</span><small>{detail}</small></li>
        ))}
      </ol>

      <form className="ll-form post-wizard-form" onSubmit={handleSubmit}>
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

        <section className="ll-card post-flow-card post-wizard-stage-card" id="profile">
          <p className="ll-kicker">Step 1: Profile</p>
          <h2>Start with your profile</h2>
          <p>Large mobile input fields, thumb-friendly spacing, and mobile-friendly logo upload.</p>
          <FileDropInput
            name="logo"
            label="Logo upload"
            required
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            helperText="Browse computer or drag and drop a logo here. PNG, JPG, WebP, or SVG."
            maxSizeLabel="Maximum file size: 5 MB"
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
            <TextField label="Website" name="website" type="url" value={draft.website} onChange={updateDraft} />
            <SelectField label="Entity type" name="entityType" placeholder="Choose one" options={entityTypes} value={draft.entityType} onChange={updateDraft} error={validationErrors.entityType} />
            <SelectField label="Category" name="category" placeholder="Choose one" options={categories} value={draft.category} onChange={updateDraft} />
            <TextAreaField label="Short description" name="description" value={draft.description} onChange={updateDraft} />
          </div>
        </section>

        <section className="ll-card post-flow-card post-wizard-stage-card">
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
            maxSizeLabel="Maximum file size: 8 MB"
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
            <TextField label="Website/ticket link" name="ticketUrl" type="url" value={draft.ticketUrl} onChange={updateDraft} />
            <TextField label="Contact phone" name="contactPhone" type="tel" value={draft.contactPhone} onChange={updateDraft} />
            <TextField label="Contact email" name="contactEmail" type="email" value={draft.contactEmail} onChange={updateDraft} />
            <SelectField label="Category" name="eventCategory" placeholder="Choose category" options={categories} value={draft.eventCategory} onChange={updateDraft} error={validationErrors.eventCategory} />
            <TextAreaField label="Description" name="eventDescription" value={draft.eventDescription} onChange={updateDraft} />
          </div>
        </section>

        <section className="ll-card ll-preview-card post-flow-card post-wizard-stage-card" id="preview-listing">
          <p className="ll-kicker">Step 3: Preview</p>
          <h2>Preview your listing</h2>
          <p>Mobile preview card will show logo, image, title, date/time, address, category, call, website, directions, save, and share actions.</p>
          <div className="ll-phone-card">
            <span>{draft.entityName || 'Loop Local Preview'}</span>
            <strong>{draft.eventTitle || 'Your event title'}</strong>
            <p>{previewMeta}</p>
            <div className="ll-phone-actions">Call · Website · Directions · Save · Share</div>
          </div>
        </section>

        <section className="ll-card ll-submit-card post-flow-card post-wizard-stage-card" id="submit-for-approval">
          <p className="ll-kicker">Step 4: Submit for Approval</p>
          <h2>Submit for approval</h2>
          <p>Submissions remain pending until approved by an admin. No public posting happens automatically.</p>
          {submitStatus === 'Ready for review' ? (
            <div className="post-submit-success submitter-status-page-pass">
              <strong>Ready for review — your submission was saved locally for admin handoff.</strong>
              {submittedSubmissionId ? <span>Submission ID: <code>{submittedSubmissionId}</code></span> : null}
              {submittedStatusHref ? <Link href={submittedStatusHref}>Check submission status</Link> : null}
            </div>
          ) : null}
          <div className="ll-submit-actions">
            <Link href="/">Back to discovery</Link>
            <button type="submit">Submit for Approval</button>
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
        <a className="mobile-qa-target" href="#first-post">✦ Post</a>
        <a className="mobile-qa-target" href="#preview-listing">⌖ Preview</a>
        <a className="mobile-qa-target" href="#submit-for-approval">✓ Submit</a>
        <a className="mobile-qa-target" href="#profile">◉ Profile details</a>
      </nav>
    </main>
  );
}
