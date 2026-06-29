// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/lib/location.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/lib/location.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDistanceMiles",
    ()=>calculateDistanceMiles,
    "coordinatesForItem",
    ()=>coordinatesForItem,
    "defaultUserLocation",
    ()=>defaultUserLocation,
    "detectCityFromCoordinates",
    ()=>detectCityFromCoordinates,
    "distanceMilesFromUser",
    ()=>distanceMilesFromUser,
    "findCityBySlugOrName",
    ()=>findCityBySlugOrName,
    "formatDistance",
    ()=>formatDistance,
    "localCities",
    ()=>localCities,
    "locationChangeEventName",
    ()=>locationChangeEventName,
    "locationStorageKey",
    ()=>locationStorageKey,
    "parseLocalTime",
    ()=>parseLocalTime,
    "sortBusinessesByDistance",
    ()=>sortBusinessesByDistance,
    "sortByTimeThenDistance",
    ()=>sortByTimeThenDistance
]);
const localCities = [
    {
        name: "Granite City",
        slug: "granite-city",
        state: "IL",
        latitude: 38.7014,
        longitude: -90.1487
    },
    {
        name: "Collinsville",
        slug: "collinsville",
        state: "IL",
        latitude: 38.6703,
        longitude: -89.9845
    },
    {
        name: "Edwardsville",
        slug: "edwardsville",
        state: "IL",
        latitude: 38.8114,
        longitude: -89.9532
    }
];
const toRad = (degrees)=>degrees * Math.PI / 180;
function normalize(value) {
    return value?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function findCityBySlugOrName(value) {
    const normalized = normalize(value);
    return localCities.find((city)=>city.slug === normalized || normalize(city.name) === normalized);
}
function calculateDistanceMiles(from, to) {
    const radiusMiles = 3958.8;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function formatDistance(miles) {
    if (miles == null || Number.isNaN(miles)) return "Distance unavailable";
    if (miles < 0.2) return "Nearby";
    return `${miles.toFixed(miles < 10 ? 1 : 0)} miles away`;
}
function detectCityFromCoordinates(coords) {
    return localCities.map((city)=>({
            ...city,
            distanceMiles: calculateDistanceMiles(coords, city)
        })).sort((a, b)=>a.distanceMiles - b.distanceMiles)[0];
}
function coordinatesForItem(item) {
    if (typeof item.latitude === "number" && typeof item.longitude === "number") return {
        latitude: item.latitude,
        longitude: item.longitude
    };
    const matchedCity = findCityBySlugOrName(item.citySlug ?? item.city);
    if (matchedCity) return matchedCity;
    // Imported local fallback records may have an address/name before normalized coordinates exist.
    // Keep this client-only and approximate until a live geocoding/database step is approved.
    if (item.address || item.name) return localCities[0];
    return undefined;
}
function distanceMilesFromUser(userLocation, item) {
    const target = coordinatesForItem(item);
    if (!userLocation || !target) return undefined;
    return calculateDistanceMiles(userLocation, target);
}
function parseLocalTime(time) {
    if (!time) return 24;
    const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return 24;
    let hour = Number(match[1]);
    const suffix = match[3]?.toUpperCase();
    if (suffix === "PM" && hour !== 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    return hour + Number(match[2] ?? 0) / 60;
}
function sortByTimeThenDistance(items, userLocation) {
    return items.slice().sort((a, b)=>{
        const timeDelta = parseLocalTime(a.time ?? a.start_time) - parseLocalTime(b.time ?? b.start_time);
        if (timeDelta !== 0) return timeDelta;
        const aDistance = distanceMilesFromUser(userLocation, a) ?? Number.POSITIVE_INFINITY;
        const bDistance = distanceMilesFromUser(userLocation, b) ?? Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
    });
}
function sortBusinessesByDistance(items, userLocation) {
    return items.slice().sort((a, b)=>{
        const aDistance = distanceMilesFromUser(userLocation, a) ?? Number.POSITIVE_INFINITY;
        const bDistance = distanceMilesFromUser(userLocation, b) ?? Number.POSITIVE_INFINITY;
        return aDistance - bDistance || (a.name ?? "").localeCompare(b.name ?? "");
    });
}
const defaultUserLocation = localCities[0];
const locationStorageKey = "loop-local-device-location";
const locationChangeEventName = "loop-local-location-change";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
