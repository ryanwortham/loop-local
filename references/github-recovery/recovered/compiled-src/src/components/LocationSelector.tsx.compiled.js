// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/LocationSelector.tsx
// Recovered from chunk: src_0qg_194._.js

"[project]/src/components/LocationSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocationSelector",
    ()=>LocationSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function statusCopy(status, nearestCity) {
    if (status === "locating") return "Locating…";
    if (status === "approved") return `Using your location · Nearest city: ${nearestCity?.name ?? "Loop Local city"}`;
    if (status === "denied") return "Permission denied · No problem — choose your city manually.";
    if (status === "unavailable") return "Location unavailable · No problem — choose your city manually.";
    if (status === "manual") return `📍 Near ${nearestCity?.name ?? "your city"}`;
    return "Use my location or choose a city manually.";
}
function getInitialLocationState(initialCity) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const saved = sessionStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationStorageKey"]);
        if (!saved) return {
            activeCity: initialCity,
            status: "idle",
            userLocation: undefined
        };
        const parsed = JSON.parse(saved);
        return {
            activeCity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCityBySlugOrName"])(parsed.citySlug) ?? initialCity,
            status: parsed.status ?? "manual",
            userLocation: parsed.coordinates
        };
    } catch  {
        sessionStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationStorageKey"]);
        return {
            activeCity: initialCity,
            status: "idle",
            userLocation: undefined
        };
    }
}
function LocationSelector({ selectedCity = "Granite City", onLocationChange }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const initialCity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LocationSelector.useMemo[initialCity]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCityBySlugOrName"])(selectedCity) ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localCities"][0]
    }["LocationSelector.useMemo[initialCity]"], [
        selectedCity
    ]);
    const [locationState, setLocationState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "LocationSelector.useState": ()=>getInitialLocationState(initialCity)
    }["LocationSelector.useState"]);
    const { status, activeCity, userLocation } = locationState;
    function publishLocation(nextStatus, city, coordinates) {
        setLocationState({
            status: nextStatus,
            activeCity: city,
            userLocation: coordinates
        });
        const payload = {
            coordinates,
            city,
            status: nextStatus
        };
        sessionStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationStorageKey"], JSON.stringify({
            coordinates,
            citySlug: city.slug,
            status: nextStatus
        }));
        window.dispatchEvent(new CustomEvent(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationChangeEventName"], {
            detail: payload
        }));
        onLocationChange?.(payload);
        const params = new URLSearchParams(searchParams.toString());
        params.set("city", city.slug);
        router.replace(`${pathname}?${params.toString()}#happening-now`, {
            scroll: false
        });
    }
    function handleManualCity(citySlug) {
        const city = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCityBySlugOrName"])(citySlug) ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localCities"][0];
        publishLocation("manual", city, userLocation);
    }
    function requestLocation() {
        if (!navigator.geolocation) {
            setLocationState((current)=>({
                    ...current,
                    status: "unavailable"
                }));
            return;
        }
        setLocationState((current)=>({
                ...current,
                status: "locating"
            }));
        navigator.geolocation.getCurrentPosition((position)=>{
            const coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            const nearestCity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectCityFromCoordinates"])(coordinates);
            publishLocation("approved", nearestCity, coordinates);
        }, (error)=>{
            if (error.code === error.PERMISSION_DENIED) {
                setLocationState((current)=>({
                        ...current,
                        status: "denied"
                    }));
                return;
            }
            setLocationState((current)=>({
                    ...current,
                    status: "unavailable"
                }));
        }, {
            enableHighAccuracy: false,
            maximumAge: 1000 * 60 * 10,
            timeout: 8000
        });
    }
    const compactLabel = status === "approved" || status === "manual" ? `📍 Near ${activeCity.name}` : "Use my location";
    const copy = statusCopy(status, activeCity);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[2rem] sm:p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-black uppercase tracking-[0.2em] text-rose-500",
                                    children: "Location selector"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LocationSelector.tsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "truncate text-xl font-black text-slate-950 sm:text-2xl",
                                    children: compactLabel
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LocationSelector.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    "aria-live": "polite",
                                    className: "text-sm font-bold text-slate-500",
                                    children: copy
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LocationSelector.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/LocationSelector.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-2 sm:grid-cols-[1fr_auto]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    name: "city",
                                    "aria-label": "Choose city",
                                    value: activeCity.slug,
                                    onChange: (event)=>handleManualCity(event.target.value),
                                    className: "min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localCities"].map((city)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: city.slug,
                                            children: [
                                                city.name,
                                                ", ",
                                                city.state
                                            ]
                                        }, city.slug, true, {
                                            fileName: "[project]/src/components/LocationSelector.tsx",
                                            lineNumber: 117,
                                            columnNumber: 42
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LocationSelector.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: requestLocation,
                                    className: "min-h-12 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white active:scale-[0.99]",
                                    children: status === "locating" ? "Locating…" : "Use my location"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/LocationSelector.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/LocationSelector.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/LocationSelector.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                status === "denied" || status === "unavailable" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800",
                    children: "No problem — choose your city manually."
                }, void 0, false, {
                    fileName: "[project]/src/components/LocationSelector.tsx",
                    lineNumber: 124,
                    columnNumber: 62
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-3 text-xs font-bold text-slate-500",
                    children: "Your exact location is only used on this device to show nearby results."
                }, void 0, false, {
                    fileName: "[project]/src/components/LocationSelector.tsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "sr-only",
                    children: "loop-local-location-change"
                }, void 0, false, {
                    fileName: "[project]/src/components/LocationSelector.tsx",
                    lineNumber: 126,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/LocationSelector.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/LocationSelector.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_s(LocationSelector, "Om/bJeXYFA1XO7pCdHdPF+u6YMw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = LocationSelector;
var _c;
__turbopack_context__.k.register(_c, "LocationSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0qg_194._.js.map
