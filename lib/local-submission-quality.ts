import { eventCategoryFallbackImage, isEventCategory, normalizeEventCategory } from './event-taxonomy.ts';
import type { LocalSubmissionRecord } from './local-submissions-store.ts';

export type SubmissionMediaMode = 'event_image' | 'logo' | 'bundled';

export type SubmissionPublicationQuality = {
  canPublish: boolean;
  missingFields: string[];
  mediaMode: SubmissionMediaMode;
  mediaLabel: string;
  previewImageUrl: string;
};

function present(value?: string): boolean {
  return Boolean(value?.trim());
}

export function submissionPublicationQuality(submission: Pick<LocalSubmissionRecord,
  'id' | 'eventTitle' | 'eventDate' | 'eventCategory'
  | 'eventImageDataUrl' | 'logoDataUrl' | 'eventImageMedia' | 'logoMedia'
  | 'eventImageMediaUrl' | 'logoMediaUrl'
>): SubmissionPublicationQuality {
  const normalizedCategory = normalizeEventCategory({ category: submission.eventCategory });
  const validCategory = present(submission.eventCategory) && isEventCategory(normalizedCategory) && normalizedCategory !== 'Local';
  const missingFields = [
    ...(!present(submission.eventTitle) ? ['Event title'] : []),
    ...(!present(submission.eventDate) ? ['Event date'] : []),
    ...(!validCategory ? ['Event category'] : []),
  ];
  const stableKey = [submission.id, submission.eventTitle, submission.eventDate].filter(Boolean).join('|');
  const fallbackImageUrl = eventCategoryFallbackImage(validCategory ? normalizedCategory : 'Local', stableKey);

  if (present(submission.eventImageDataUrl) || submission.eventImageMedia) {
    return {
      canPublish: missingFields.length === 0,
      missingFields,
      mediaMode: 'event_image',
      mediaLabel: 'Custom event image',
      previewImageUrl: submission.eventImageMediaUrl || submission.eventImageDataUrl || fallbackImageUrl,
    };
  }
  if (present(submission.logoDataUrl) || submission.logoMedia) {
    return {
      canPublish: missingFields.length === 0,
      missingFields,
      mediaMode: 'logo',
      mediaLabel: 'Logo fallback',
      previewImageUrl: submission.logoMediaUrl || submission.logoDataUrl || fallbackImageUrl,
    };
  }
  return {
    canPublish: missingFields.length === 0,
    missingFields,
    mediaMode: 'bundled',
    mediaLabel: 'Bundled fallback art',
    previewImageUrl: eventCategoryFallbackImage(validCategory ? normalizedCategory : 'Local', stableKey),
  };
}
