// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/useDeviceLocation.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readStoredDeviceLocation",
    ()=>readStoredDeviceLocation,
    "useDeviceLocation",
    ()=>useDeviceLocation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function readStoredDeviceLocation() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const saved = sessionStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationStorageKey"]);
        if (!saved) return {};
        const parsed = JSON.parse(saved);
        return {
            coordinates: parsed.coordinates,
            city: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCityBySlugOrName"])(parsed.citySlug),
            status: parsed.status
        };
    } catch  {
        sessionStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationStorageKey"]);
        return {};
    }
}
function useDeviceLocation() {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useDeviceLocation.useState": ()=>readStoredDeviceLocation()
    }["useDeviceLocation.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDeviceLocation.useEffect": ()=>{
            const handler = {
                "useDeviceLocation.useEffect.handler": (event)=>{
                    const detail = event.detail;
                    setState(detail ?? readStoredDeviceLocation());
                }
            }["useDeviceLocation.useEffect.handler"];
            window.addEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationChangeEventName"], handler);
            return ({
                "useDeviceLocation.useEffect": ()=>window.removeEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationChangeEventName"], handler)
            })["useDeviceLocation.useEffect"];
        }
    }["useDeviceLocation.useEffect"], []);
    return state;
}
_s(useDeviceLocation, "Yg+rgntdf2Yo7kPPNJ8hYos1sNs=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
