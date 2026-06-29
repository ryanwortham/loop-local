// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/lib/geo-filters.ts
// Recovered from chunk: src_0qg_194._.js

"[project]/src/lib/geo-filters.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCleanCountyCitySearchParams",
    ()=>buildCleanCountyCitySearchParams,
    "cityMatchesCounty",
    ()=>cityMatchesCounty,
    "filterCitiesByCounty",
    ()=>filterCitiesByCounty,
    "findCity",
    ()=>findCity,
    "normalizeCountyCityFilters",
    ()=>normalizeCountyCityFilters,
    "normalizeSlug",
    ()=>normalizeSlug,
    "optionLabel",
    ()=>optionLabel,
    "optionValue",
    ()=>optionValue
]);
function normalizeSlug(value) {
    return value?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || undefined;
}
function optionValue(option) {
    return option.slug ?? normalizeSlug(option.name) ?? option.name;
}
function optionLabel(option) {
    if (option.label) return option.label;
    if (option.county) return `${option.name} · ${option.county}`;
    return `${option.name}${option.state ? `, ${option.state}` : ""}`;
}
function cityMatchesCounty(city, county) {
    const countySlug = normalizeSlug(county);
    if (!countySlug) return true;
    return normalizeSlug(city.countySlug) === countySlug || normalizeSlug(city.county) === countySlug;
}
function filterCitiesByCounty(cities, county) {
    return cities.filter((city)=>cityMatchesCounty(city, county));
}
function findCity(cities, city) {
    const citySlug = normalizeSlug(city);
    if (!citySlug) return undefined;
    return cities.find((option)=>normalizeSlug(optionValue(option)) === citySlug || normalizeSlug(option.name) === citySlug);
}
function normalizeCountyCityFilters(cities, filters) {
    const county = normalizeSlug(filters.county);
    const city = normalizeSlug(filters.city);
    const selectedCity = findCity(cities, city);
    if (!selectedCity) return {
        county,
        city: undefined
    };
    const selectedCityCounty = normalizeSlug(selectedCity.countySlug ?? selectedCity.county);
    if (!county) return {
        county: undefined,
        city: optionValue(selectedCity)
    };
    if (cityMatchesCounty(selectedCity, county)) return {
        county,
        city: optionValue(selectedCity)
    };
    if (filters.preferCityCounty && selectedCityCounty) {
        return {
            county: selectedCityCounty,
            city: optionValue(selectedCity)
        };
    }
    return {
        county,
        city: undefined
    };
}
function buildCleanCountyCitySearchParams(params, cities) {
    const normalized = normalizeCountyCityFilters(cities, {
        county: params.get("county") ?? undefined,
        city: params.get("city") ?? undefined
    });
    const next = new URLSearchParams(params.toString());
    if (normalized.county) next.set("county", normalized.county);
    else next.delete("county");
    if (normalized.city) next.set("city", normalized.city);
    else next.delete("city");
    return next;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
