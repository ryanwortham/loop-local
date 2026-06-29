// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/mobile-data.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/components/mobile-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "imageForCategory",
    ()=>imageForCategory,
    "initials",
    ()=>initials,
    "mobileCategoryImages",
    ()=>mobileCategoryImages
]);
const mobileCategoryImages = {
    "Live Music": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    "Food & Drink": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "Happy Hour": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    Festivals: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
    Sports: "https://images.unsplash.com/photo-1505842465776-3eae2c3e95d0?auto=format&fit=crop&w=1200&q=80",
    Fundraisers: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    Deals: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    Community: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
};
function initials(name = "Loop Local") {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part)=>part[0]).join("").toUpperCase();
}
function imageForCategory(category, index = 0) {
    const fallback = [
        mobileCategoryImages.Community,
        mobileCategoryImages["Food & Drink"],
        mobileCategoryImages["Live Music"],
        mobileCategoryImages.Deals
    ];
    return mobileCategoryImages[category ?? ""] ?? fallback[index % fallback.length];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
