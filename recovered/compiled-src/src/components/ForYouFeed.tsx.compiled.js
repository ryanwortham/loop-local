// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/ForYouFeed.tsx
// Recovered from chunk: src_0qg_194._.js

"[project]/src/components/ForYouFeed.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForYouFeed",
    ()=>ForYouFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/EngagementEventCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FollowSaveActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/FollowSaveActions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ForYouFeed({ items, signals }) {
    _s();
    const { coordinates: userLocation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const sortedItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortByTimeThenDistance"])(items, userLocation);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "for-you",
        className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[2rem] bg-slate-950 p-5 text-white sm:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-black uppercase tracking-[0.22em] text-violet-300",
                        children: "For You"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ForYouFeed.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-2 text-4xl font-black tracking-tight",
                        children: "Personalized from saves, follows, interests, home city, previous clicks, and nearby distance."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ForYouFeed.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-200",
                        children: [
                            (signals?.followedCategories ?? [
                                "Live Music",
                                "Festivals",
                                "Food & Drink"
                            ]).map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-full bg-white/10 px-3 py-2",
                                    children: [
                                        "Followed category · ",
                                        category
                                    ]
                                }, category, true, {
                                    fileName: "[project]/src/components/ForYouFeed.tsx",
                                    lineNumber: 18,
                                    columnNumber: 107
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-white/10 px-3 py-2",
                                children: [
                                    "Home city · ",
                                    signals?.homeCity ?? "Granite City"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ForYouFeed.tsx",
                                lineNumber: 19,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ForYouFeed.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ForYouFeed.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3",
                children: sortedItems.slice(0, 6).map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EngagementEventCard"], {
                        item: item,
                        index: index
                    }, item.id, false, {
                        fileName: "[project]/src/components/ForYouFeed.tsx",
                        lineNumber: 22,
                        columnNumber: 116
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ForYouFeed.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FollowSaveActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FollowSaveActions"], {
                    category: "Live Music",
                    city: "Granite City"
                }, void 0, false, {
                    fileName: "[project]/src/components/ForYouFeed.tsx",
                    lineNumber: 23,
                    columnNumber: 89
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ForYouFeed.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "sr-only",
                children: "userLocation loop-local-location-change"
            }, void 0, false, {
                fileName: "[project]/src/components/ForYouFeed.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ForYouFeed.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_s(ForYouFeed, "w1d9efj+OD/YhHmPEgUWLrCARk0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = ForYouFeed;
var _c;
__turbopack_context__.k.register(_c, "ForYouFeed");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
