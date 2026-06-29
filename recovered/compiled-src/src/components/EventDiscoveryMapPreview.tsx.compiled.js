// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/EventDiscoveryMapPreview.tsx
// Recovered from chunk: src_0qg_194._.js

"[project]/src/components/EventDiscoveryMapPreview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventDiscoveryMapPreview",
    ()=>EventDiscoveryMapPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/category-colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function EventDiscoveryMapPreview({ items }) {
    _s();
    const { coordinates } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "map",
        className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-black uppercase tracking-[0.22em] text-emerald-600",
                        children: "Event discovery map"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 12,
                        columnNumber: 29
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-2 text-4xl font-black tracking-tight",
                        children: "Nearby events, nearby deals, nearby businesses."
                    }, void 0, false, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 12,
                        columnNumber: 131
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 max-w-2xl text-slate-600",
                        children: "Prepared for map pins that reuse category colors across Food, Live Music, Family, Sports, Fundraisers, Deals, and City Notices."
                    }, void 0, false, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 12,
                        columnNumber: 239
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-[420px] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-emerald-100 via-sky-100 to-violet-100 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] [background-size:52px_52px]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    items.slice(0, 9).map((item, index)=>{
                        const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(item.category ?? "Community");
                        const distanceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistance"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["distanceMilesFromUser"])(coordinates, item));
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `absolute grid h-12 w-12 place-items-center rounded-full ${theme.accentBg} text-sm font-black text-white shadow-xl ring-4 ring-white`,
                            style: {
                                left: `${12 + index * 19 % 75}%`,
                                top: `${18 + index * 23 % 62}%`
                            },
                            title: `${item.title} map pin · Distance from user ${distanceLabel}`,
                            "aria-label": `${item.title} map-ready card. Distance from user ${distanceLabel}`,
                            children: index + 1
                        }, item.id, false, {
                            fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                            lineNumber: 18,
                            columnNumber: 18
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 rounded-[1.5rem] bg-white/85 p-4 backdrop-blur-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-black uppercase tracking-[0.2em] text-slate-500",
                                children: "Future native map layer"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                                lineNumber: 20,
                                columnNumber: 90
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 font-black text-slate-950",
                                children: "Category-colored pins are ready for nearby event/deal/business discovery."
                            }, void 0, false, {
                                fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                                lineNumber: 20,
                                columnNumber: 193
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm font-bold text-slate-600",
                                children: "Distance from user appears when GPS is approved; otherwise cards say Distance unavailable."
                            }, void 0, false, {
                                fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                                lineNumber: 20,
                                columnNumber: 316
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sr-only",
                        children: "Distance from user Distance unavailable loop-local-location-change"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EventDiscoveryMapPreview.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(EventDiscoveryMapPreview, "Qh85r7e4U5RLDyaxjNvCJ/LxWcE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = EventDiscoveryMapPreview;
var _c;
__turbopack_context__.k.register(_c, "EventDiscoveryMapPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
