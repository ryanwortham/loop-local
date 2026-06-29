// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/lib/analytics.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyticsEventLabels",
    ()=>analyticsEventLabels,
    "trackAnalyticsEvent",
    ()=>trackAnalyticsEvent
]);
const analyticsEventLabels = {
    profile_view: "profile views",
    save: "saves",
    follow: "follows",
    directions_click: "directions clicks",
    phone_click: "phone clicks",
    website_click: "website clicks",
    share: "shares"
};
function trackAnalyticsEvent(payload) {
    // Local/preview-safe analytics tracking seam. Future backend write targets post_views,
    // post_clicks, follows, favorites, and engagement_rollups after explicit migration approval.
    return {
        ...payload,
        queued: true,
        created_at: new Date(0).toISOString(),
        storage: "local_fallback_until_approved"
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
