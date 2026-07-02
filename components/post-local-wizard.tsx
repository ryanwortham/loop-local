'use client';

import Image from 'next/image';
import Link from 'next/link';
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

function TextField({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return (
    <label className="ll-field">
      <span>{label}</span>
      <input name={name} type={type} />
    </label>
  );
}

function SelectField({ label, name, placeholder, options }: { label: string; name: string; placeholder: string; options: string[] }) {
  return (
    <label className="ll-field">
      <span>{label}</span>
      <select name={name} defaultValue="">
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function TextAreaField({ label, name }: { label: string; name: string }) {
  return (
    <label className="ll-field ll-field-wide">
      <span>{label}</span>
      <textarea name={name} rows={4} />
    </label>
  );
}

export function PostLocalWizard() {
  return (
    <main className="post-local-shell complete-frontend-rebuild post-mobile-reference-shell post-local-premium-wizard">
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
            <button type="button">List Your Business</button>
            <button type="button">Post an Event</button>
            <button type="button">Join as a Community Organization</button>
          </div>
          <div className="ll-success-note">
            Your profile has been submitted for review. Once approved, you’ll be able to post events and promotions.
          </div>
        </aside>

        <aside className="post-wizard-live-preview" aria-label="Post Local mobile preview">
          <span className="mini-tag">Live Preview</span>
          <div className="ll-phone-card">
            <span>Loop Local Preview</span>
            <strong>Your event title</strong>
            <p>Category · Date · Location</p>
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

      <form className="ll-form post-wizard-form">
        <section className="ll-card post-flow-card post-wizard-stage-card">
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
            <TextField label="Business/community/entity name" name="name" />
            <TextField label="Contact name" name="contact_name" />
            <TextField label="Email" name="email" type="email" />
            <TextField label="Phone number" name="phone" type="tel" />
            <TextField label="Street address" name="address_line_1" />
            <TextField label="City" name="city" />
            <TextField label="State" name="state" />
            <TextField label="ZIP" name="zip" />
            <TextField label="Website" name="website_url" type="url" />
            <SelectField label="Entity type" name="entity_type" placeholder="Choose one" options={entityTypes} />
            <SelectField label="Category" name="category" placeholder="Choose one" options={categories} />
            <TextAreaField label="Short description" name="description" />
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
                <input name="post_type" type="radio" value={type} />
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
            <TextField label="Event title" name="event_title" />
            <TextField label="Event date" name="event_date" type="date" />
            <TextField label="Start time" name="start_time" type="time" />
            <TextField label="End time" name="end_time" type="time" />
            <TextField label="Location name" name="location_name" />
            <TextField label="Address" name="address_line_1" />
            <TextField label="City" name="event_city" />
            <TextField label="State" name="event_state" />
            <TextField label="ZIP" name="event_zip" />
            <TextField label="Website/ticket link" name="ticket_url" type="url" />
            <TextField label="Contact phone" name="contact_phone" type="tel" />
            <TextField label="Contact email" name="contact_email" type="email" />
            <SelectField label="Category" name="event_category" placeholder="Choose category" options={categories} />
            <TextAreaField label="Description" name="event_description" />
          </div>
        </section>

        <section className="ll-card ll-preview-card post-flow-card post-wizard-stage-card">
          <p className="ll-kicker">Step 3: Preview</p>
          <h2>Preview your listing</h2>
          <p>Mobile preview card will show logo, image, title, date/time, address, category, call, website, directions, save, and share actions.</p>
          <div className="ll-phone-card">
            <span>Loop Local Preview</span>
            <strong>Your event title</strong>
            <p>Category · Date · Location</p>
            <div className="ll-phone-actions">Call · Website · Directions · Save · Share</div>
          </div>
        </section>

        <section className="ll-card ll-submit-card post-flow-card post-wizard-stage-card">
          <p className="ll-kicker">Step 4: Submit for Approval</p>
          <h2>Submit for approval</h2>
          <p>Submissions remain pending until approved by an admin. No public posting happens automatically.</p>
          <div className="ll-submit-actions">
            <Link href="/">Back to discovery</Link>
            <button type="submit">Submit for Approval</button>
          </div>
        </section>
      </form>

      <nav className="post-wizard-mobile-dock ll-mobile-tabs mobile-app-tabbar" aria-label="Mobile tabs: Discover Events Map Saved Profile">
        <Link href="/#discover">⌂ Discover</Link>
        <Link href="/#events">✦ Events</Link>
        <Link href="/#map">⌖ Map</Link>
        <a href="#first-post">⊕ Post</a>
        <a href="#profile">◉ Profile</a>
      </nav>
    </main>
  );
}
