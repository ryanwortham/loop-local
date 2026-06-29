// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/HappeningNowRail.tsx
// Recovered from chunk: src_0qg_194._.js

"[project]/src/components/HappeningNowRail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HappeningNowRail",
    ()=>HappeningNowRail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/EngagementEventCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const labels = [
    "Live now",
    "Starting soon",
    "Today",
    "Tonight",
    "This weekend"
];
function HappeningNowRail({ items }) {
    _s();
    const { coordinates: userLocation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const sortedItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortByTimeThenDistance"])(items, userLocation);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "happening-now",
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5 flex items-end justify-between gap-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-black uppercase tracking-[0.22em] text-rose-600",
                            children: "Happening Now"
                        }, void 0, false, {
                            fileName: "[project]/src/components/HappeningNowRail.tsx",
                            lineNumber: 16,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mt-2 text-4xl font-black tracking-tight",
                            children: "Open the app and know what to do in 5 seconds."
                        }, void 0, false, {
                            fileName: "[project]/src/components/HappeningNowRail.tsx",
                            lineNumber: 16,
                            columnNumber: 107
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/HappeningNowRail.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/HappeningNowRail.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]",
                "aria-label": "Happening Now time filters",
                children: labels.map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200",
                        children: label
                    }, label, false, {
                        fileName: "[project]/src/components/HappeningNowRail.tsx",
                        lineNumber: 18,
                        columnNumber: 147
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/HappeningNowRail.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
                children: sortedItems.slice(0, 4).map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EngagementEventCard"], {
                        item: item,
                        index: index,
                        compact: true
                    }, item.id, false, {
                        fileName: "[project]/src/components/HappeningNowRail.tsx",
                        lineNumber: 19,
                        columnNumber: 111
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/HappeningNowRail.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "sr-only",
                children: "Live music starts in 1 hour. Happy hour ends in 45 minutes. Festival happening now. Game starts at 7:00 PM. Fundraiser tonight. userLocation loop-local-location-change"
            }, void 0, false, {
                fileName: "[project]/src/components/HappeningNowRail.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/HappeningNowRail.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(HappeningNowRail, "w1d9efj+OD/YhHmPEgUWLrCARk0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = HappeningNowRail;
var _c;
__turbopack_context__.k.register(_c, "HappeningNowRail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
