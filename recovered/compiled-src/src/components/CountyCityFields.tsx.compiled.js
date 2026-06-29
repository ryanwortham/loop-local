// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/CountyCityFields.tsx
// Recovered from chunk: src_0qg_194._.js

"[project]/src/components/CountyCityFields.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CountyCityFields",
    ()=>CountyCityFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo-filters.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CountyCityFields({ counties, cities, county, city, compact = false }) {
    _s();
    const [selectedCounty, setSelectedCounty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(county ?? "");
    const [selectedCity, setSelectedCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(city ?? "");
    const visibleCities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CountyCityFields.useMemo[visibleCities]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterCitiesByCounty"])(cities, selectedCounty)
    }["CountyCityFields.useMemo[visibleCities]"], [
        cities,
        selectedCounty
    ]);
    function resetInvalidCity(nextCounty) {
        const currentCity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCity"])(cities, selectedCity);
        if (!currentCity || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterCitiesByCounty"])([
            currentCity
        ], nextCounty).length === 0) setSelectedCity("");
    }
    function handleCountyChange(nextCounty) {
        setSelectedCounty(nextCounty);
        resetInvalidCity(nextCounty);
    }
    const selectClass = compact ? "min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: compact ? "grid gap-1 text-sm font-black text-slate-700" : "contents",
                children: [
                    compact ? "County" : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        name: "county",
                        value: selectedCounty,
                        onChange: (event)=>handleCountyChange(event.target.value),
                        className: selectClass,
                        "aria-label": "County",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Any county"
                            }, void 0, false, {
                                fileName: "[project]/src/components/CountyCityFields.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            counties.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optionValue"])(option),
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optionLabel"])(option)
                                }, option.id ?? option.slug ?? option.name, false, {
                                    fileName: "[project]/src/components/CountyCityFields.tsx",
                                    lineNumber: 37,
                                    columnNumber: 73
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/CountyCityFields.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/CountyCityFields.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: compact ? "grid gap-1 text-sm font-black text-slate-700" : "contents",
                children: [
                    compact ? "City" : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        name: "city",
                        value: selectedCity,
                        onChange: (event)=>setSelectedCity(event.target.value),
                        className: selectClass,
                        "aria-label": "City",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Any city"
                            }, void 0, false, {
                                fileName: "[project]/src/components/CountyCityFields.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            visibleCities.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optionValue"])(option),
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$filters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optionLabel"])(option)
                                }, option.id ?? option.slug ?? option.name, false, {
                                    fileName: "[project]/src/components/CountyCityFields.tsx",
                                    lineNumber: 42,
                                    columnNumber: 76
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/CountyCityFields.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/CountyCityFields.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "filterCitiesByCounty resetInvalidCity CountyCityFields city dropdown options are filtered by selected county"
            }, void 0, false, {
                fileName: "[project]/src/components/CountyCityFields.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CountyCityFields, "HM4phj0xIbcHfse319MFEjs5r34=");
_c = CountyCityFields;
var _c;
__turbopack_context__.k.register(_c, "CountyCityFields");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
