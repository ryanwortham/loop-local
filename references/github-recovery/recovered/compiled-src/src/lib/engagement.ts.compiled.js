// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/lib/engagement.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/lib/engagement.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* Phase 5 engagement helpers: rank local content by time-sensitive urgency and personalization.
   Ranking inputs intentionally mirror future backend signals: saved events, followed businesses,
   followed categories, home city, and previous clicks. */ __turbopack_context__.s([
    "engagementBadgeFor",
    ()=>engagementBadgeFor,
    "getDefaultAreaEvents",
    ()=>getDefaultAreaEvents,
    "getEngagementFeed",
    ()=>getEngagementFeed,
    "sortByUpcomingDate",
    ()=>sortByUpcomingDate
]);
const DEFAULT_SIGNALS = {
    homeCity: "Granite City",
    followedBusinesses: [
        "Pizza World",
        "Brick Oven Social",
        "Riverbend Coffee"
    ],
    followedCategories: [
        "Live Music",
        "Festivals",
        "Food & Drink",
        "Happy Hour"
    ],
    followedCities: [
        "Granite City"
    ],
    savedEvents: [
        "event-2",
        "event-6"
    ],
    previousClicks: [
        "Live Music",
        "Deals",
        "Food & Drink"
    ],
    interests: [
        "Food",
        "Music",
        "Sports",
        "Family",
        "Festivals",
        "Community",
        "Deals",
        "Nightlife",
        "Shopping"
    ]
};
function parseHour(time) {
    if (!time) return 12;
    const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return 12;
    let hour = Number(match[1]);
    const suffix = match[3]?.toUpperCase();
    if (suffix === "PM" && hour !== 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    return hour + Number(match[2] ?? 0) / 60;
}
function engagementBadgeFor(item, index = 0) {
    const category = item.category ?? "Community";
    const hour = parseHour(item.time);
    if (index === 0 || /festival|fundraiser/i.test(item.title)) return {
        label: "LIVE NOW",
        tone: "live",
        countdown: "Happening now"
    };
    if (/coupon|special|happy/i.test(item.type ?? item.title)) return {
        label: "ENDS SOON",
        tone: "ending",
        countdown: "Ends in 45 minutes"
    };
    if (hour >= 17 || /music|night|game/i.test(item.title + category)) return {
        label: "TONIGHT",
        tone: "tonight",
        countdown: `Starts tonight${item.time ? ` at ${item.time}` : ""}`
    };
    if (index < 4) return {
        label: "STARTING IN 2 HOURS",
        tone: "soon",
        countdown: "Starting soon"
    };
    return {
        label: "THIS WEEKEND",
        tone: "weekend",
        countdown: "This weekend"
    };
}
function personalizationScore(item, signals) {
    let score = 0;
    const category = item.category ?? "";
    const business = item.business ?? item.organization ?? "";
    if (signals.homeCity && item.city?.toLowerCase().includes(signals.homeCity.toLowerCase())) score += 18;
    if (signals.followedCities?.some((city)=>item.city?.toLowerCase().includes(city.toLowerCase()))) score += 12;
    if (signals.followedBusinesses?.some((name)=>business.toLowerCase().includes(name.toLowerCase()))) score += 25;
    if (signals.followedCategories?.some((name)=>category.toLowerCase().includes(name.toLowerCase()))) score += 20;
    if (signals.interests?.some((name)=>category.toLowerCase().includes(name.toLowerCase()) || item.title.toLowerCase().includes(name.toLowerCase()))) score += 10;
    if (signals.savedEvents?.includes(item.id)) score += 28;
    if (signals.previousClicks?.some((value)=>`${item.title} ${category} ${business}`.toLowerCase().includes(value.toLowerCase()))) score += 14;
    return score;
}
function urgencyScore(item, index) {
    const badge = engagementBadgeFor(item, index).label;
    const order = {
        "LIVE NOW": 90,
        "ENDS SOON": 82,
        "STARTING IN 2 HOURS": 75,
        TONIGHT: 66,
        "THIS WEEKEND": 42,
        "LAST DAY": 60
    };
    return (order[badge] ?? 30) - index;
}
function dateTimeValue(item) {
    const date = item.date ?? "2999-12-31";
    const time = item.time ?? "12:00 PM";
    const hour = parseHour(time);
    const dayValue = new Date(`${date}T00:00:00`).getTime();
    return Number.isFinite(dayValue) ? dayValue + hour * 60 * 60 * 1000 : Number.MAX_SAFE_INTEGER;
}
function sortByUpcomingDate(items) {
    return items.slice().sort((a, b)=>dateTimeValue(a) - dateTimeValue(b));
}
function getDefaultAreaEvents(items, limit = 8) {
    // Most recent and upcoming events for the no-search home state: events first, then nearby deals/announcements.
    return sortByUpcomingDate(items).filter((item)=>item.type === "event" || /event|music|festival|fundraiser|sports|family|community/i.test(`${item.type ?? ""} ${item.category ?? ""} ${item.title}`)).slice(0, limit);
}
function getEngagementFeed(items, signals = DEFAULT_SIGNALS) {
    const ranked = items.map((item, index)=>({
            ...item,
            engagementBadge: engagementBadgeFor(item, index),
            timeSensitiveScore: urgencyScore(item, index),
            forYouScore: personalizationScore(item, signals)
        }));
    const happeningNow = ranked.slice().sort((a, b)=>b.timeSensitiveScore - a.timeSensitiveScore).slice(0, 8);
    const tonight = ranked.filter((item)=>/TONIGHT|LIVE NOW|ENDS SOON|STARTING/.test(item.engagementBadge.label)).sort((a, b)=>parseHour(a.time) - parseHour(b.time)).slice(0, 8);
    const thisWeekend = ranked.filter((item, index)=>index % 3 === 0 || item.engagementBadge.label === "THIS WEEKEND").slice(0, 6);
    const rankedForYou = ranked.slice().sort((a, b)=>b.forYouScore + b.timeSensitiveScore - (a.forYouScore + a.timeSensitiveScore)).slice(0, 10);
    return {
        happeningNow,
        tonight,
        thisWeekend,
        rankedForYou,
        signals
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
