// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/lib/category-colors.ts
// Recovered from chunk: _0sajad9._.js

"[project]/src/lib/category-colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORY_COLORS",
    ()=>CATEGORY_COLORS,
    "CATEGORY_COLOR_ADMIN_SCHEMA",
    ()=>CATEGORY_COLOR_ADMIN_SCHEMA,
    "CATEGORY_NAMES",
    ()=>CATEGORY_NAMES,
    "DEFAULT_CATEGORY_THEME",
    ()=>DEFAULT_CATEGORY_THEME,
    "getCategoryNames",
    ()=>getCategoryNames,
    "getCategoryParam",
    ()=>getCategoryParam,
    "getCategoryTheme",
    ()=>getCategoryTheme,
    "toggleCategorySelection",
    ()=>toggleCategorySelection
]);
const CATEGORY_NAMES = [
    "Food & Drink",
    "Live Music",
    "Family",
    "Kids",
    "School Activities",
    "Sports",
    "Community",
    "Festivals",
    "Fundraisers",
    "Shopping",
    "Nightlife",
    "Jobs",
    "City Notices",
    "City & Civic",
    "Deals",
    "Happy Hour"
];
const CATEGORY_COLORS = {
    "Food & Drink": {
        label: "Food & Drink",
        colorName: "Orange",
        icon: "🍽️",
        mapPinHex: "#ea580c",
        light: "bg-orange-50",
        soft: "bg-orange-100",
        selected: "bg-orange-600 text-white border-orange-700 shadow-orange-500/20",
        border: "border-orange-200",
        borderStrong: "border-orange-500",
        text: "text-orange-800",
        ring: "focus-visible:ring-orange-300",
        dot: "bg-orange-500",
        accentBg: "bg-orange-500",
        leftBorder: "border-l-orange-500",
        hover: "hover:bg-orange-100 hover:border-orange-300",
        active: "active:bg-orange-200"
    },
    "Live Music": {
        label: "Live Music",
        colorName: "Purple",
        icon: "♪",
        mapPinHex: "#9333ea",
        light: "bg-purple-50",
        soft: "bg-purple-100",
        selected: "bg-purple-600 text-white border-purple-700 shadow-purple-500/20",
        border: "border-purple-200",
        borderStrong: "border-purple-500",
        text: "text-purple-800",
        ring: "focus-visible:ring-purple-300",
        dot: "bg-purple-500",
        accentBg: "bg-purple-500",
        leftBorder: "border-l-purple-500",
        hover: "hover:bg-purple-100 hover:border-purple-300",
        active: "active:bg-purple-200"
    },
    Family: {
        label: "Family",
        colorName: "Green",
        icon: "👨‍👩‍👧",
        mapPinHex: "#16a34a",
        light: "bg-green-50",
        soft: "bg-green-100",
        selected: "bg-green-600 text-white border-green-700 shadow-green-500/20",
        border: "border-green-200",
        borderStrong: "border-green-500",
        text: "text-green-800",
        ring: "focus-visible:ring-green-300",
        dot: "bg-green-500",
        accentBg: "bg-green-500",
        leftBorder: "border-l-green-500",
        hover: "hover:bg-green-100 hover:border-green-300",
        active: "active:bg-green-200"
    },
    Kids: {
        label: "Kids",
        colorName: "Teal",
        icon: "🧸",
        mapPinHex: "#0d9488",
        light: "bg-teal-50",
        soft: "bg-teal-100",
        selected: "bg-teal-600 text-white border-teal-700 shadow-teal-500/20",
        border: "border-teal-200",
        borderStrong: "border-teal-500",
        text: "text-teal-800",
        ring: "focus-visible:ring-teal-300",
        dot: "bg-teal-500",
        accentBg: "bg-teal-500",
        leftBorder: "border-l-teal-500",
        hover: "hover:bg-teal-100 hover:border-teal-300",
        active: "active:bg-teal-200"
    },
    "School Activities": {
        label: "School Activities",
        colorName: "Sky",
        icon: "🏫",
        mapPinHex: "#0284c7",
        light: "bg-sky-50",
        soft: "bg-sky-100",
        selected: "bg-sky-600 text-white border-sky-700 shadow-sky-500/20",
        border: "border-sky-200",
        borderStrong: "border-sky-500",
        text: "text-sky-800",
        ring: "focus-visible:ring-sky-300",
        dot: "bg-sky-500",
        accentBg: "bg-sky-500",
        leftBorder: "border-l-sky-500",
        hover: "hover:bg-sky-100 hover:border-sky-300",
        active: "active:bg-sky-200"
    },
    Sports: {
        label: "Sports",
        colorName: "Blue",
        icon: "🏀",
        mapPinHex: "#2563eb",
        light: "bg-blue-50",
        soft: "bg-blue-100",
        selected: "bg-blue-600 text-white border-blue-700 shadow-blue-500/20",
        border: "border-blue-200",
        borderStrong: "border-blue-500",
        text: "text-blue-800",
        ring: "focus-visible:ring-blue-300",
        dot: "bg-blue-500",
        accentBg: "bg-blue-500",
        leftBorder: "border-l-blue-500",
        hover: "hover:bg-blue-100 hover:border-blue-300",
        active: "active:bg-blue-200"
    },
    Community: {
        label: "Community",
        colorName: "Yellow",
        icon: "☀️",
        mapPinHex: "#ca8a04",
        light: "bg-yellow-50",
        soft: "bg-yellow-100",
        selected: "bg-yellow-500 text-slate-950 border-yellow-600 shadow-yellow-500/20",
        border: "border-yellow-200",
        borderStrong: "border-yellow-500",
        text: "text-yellow-900",
        ring: "focus-visible:ring-yellow-300",
        dot: "bg-yellow-500",
        accentBg: "bg-yellow-500",
        leftBorder: "border-l-yellow-500",
        hover: "hover:bg-yellow-100 hover:border-yellow-300",
        active: "active:bg-yellow-200"
    },
    Festivals: {
        label: "Festivals",
        colorName: "Pink",
        icon: "🎪",
        mapPinHex: "#db2777",
        light: "bg-pink-50",
        soft: "bg-pink-100",
        selected: "bg-pink-600 text-white border-pink-700 shadow-pink-500/20",
        border: "border-pink-200",
        borderStrong: "border-pink-500",
        text: "text-pink-800",
        ring: "focus-visible:ring-pink-300",
        dot: "bg-pink-500",
        accentBg: "bg-pink-500",
        leftBorder: "border-l-pink-500",
        hover: "hover:bg-pink-100 hover:border-pink-300",
        active: "active:bg-pink-200"
    },
    Fundraisers: {
        label: "Fundraisers",
        colorName: "Red",
        icon: "❤️",
        mapPinHex: "#dc2626",
        light: "bg-red-50",
        soft: "bg-red-100",
        selected: "bg-red-600 text-white border-red-700 shadow-red-500/20",
        border: "border-red-200",
        borderStrong: "border-red-500",
        text: "text-red-800",
        ring: "focus-visible:ring-red-300",
        dot: "bg-red-500",
        accentBg: "bg-red-500",
        leftBorder: "border-l-red-500",
        hover: "hover:bg-red-100 hover:border-red-300",
        active: "active:bg-red-200"
    },
    Shopping: {
        label: "Shopping",
        colorName: "Indigo",
        icon: "🛍️",
        mapPinHex: "#4f46e5",
        light: "bg-indigo-50",
        soft: "bg-indigo-100",
        selected: "bg-indigo-600 text-white border-indigo-700 shadow-indigo-500/20",
        border: "border-indigo-200",
        borderStrong: "border-indigo-500",
        text: "text-indigo-800",
        ring: "focus-visible:ring-indigo-300",
        dot: "bg-indigo-500",
        accentBg: "bg-indigo-500",
        leftBorder: "border-l-indigo-500",
        hover: "hover:bg-indigo-100 hover:border-indigo-300",
        active: "active:bg-indigo-200"
    },
    Nightlife: {
        label: "Nightlife",
        colorName: "Violet",
        icon: "🌙",
        mapPinHex: "#7c3aed",
        light: "bg-violet-50",
        soft: "bg-violet-100",
        selected: "bg-violet-600 text-white border-violet-700 shadow-violet-500/20",
        border: "border-violet-200",
        borderStrong: "border-violet-500",
        text: "text-violet-800",
        ring: "focus-visible:ring-violet-300",
        dot: "bg-violet-500",
        accentBg: "bg-violet-500",
        leftBorder: "border-l-violet-500",
        hover: "hover:bg-violet-100 hover:border-violet-300",
        active: "active:bg-violet-200"
    },
    Jobs: {
        label: "Jobs",
        colorName: "Gray",
        icon: "💼",
        mapPinHex: "#475569",
        light: "bg-slate-50",
        soft: "bg-slate-100",
        selected: "bg-slate-700 text-white border-slate-800 shadow-slate-500/20",
        border: "border-slate-200",
        borderStrong: "border-slate-500",
        text: "text-slate-800",
        ring: "focus-visible:ring-slate-300",
        dot: "bg-slate-500",
        accentBg: "bg-slate-500",
        leftBorder: "border-l-slate-500",
        hover: "hover:bg-slate-100 hover:border-slate-300",
        active: "active:bg-slate-200"
    },
    "City Notices": {
        label: "City Notices",
        colorName: "Amber",
        icon: "⚠️",
        mapPinHex: "#d97706",
        light: "bg-amber-50",
        soft: "bg-amber-100",
        selected: "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/20",
        border: "border-amber-200",
        borderStrong: "border-amber-500",
        text: "text-amber-900",
        ring: "focus-visible:ring-amber-300",
        dot: "bg-amber-500",
        accentBg: "bg-amber-500",
        leftBorder: "border-l-amber-500",
        hover: "hover:bg-amber-100 hover:border-amber-300",
        active: "active:bg-amber-200"
    },
    "City & Civic": {
        label: "City & Civic",
        colorName: "Stone",
        icon: "🏛️",
        mapPinHex: "#57534e",
        light: "bg-stone-50",
        soft: "bg-stone-100",
        selected: "bg-stone-700 text-white border-stone-800 shadow-stone-500/20",
        border: "border-stone-200",
        borderStrong: "border-stone-500",
        text: "text-stone-800",
        ring: "focus-visible:ring-stone-300",
        dot: "bg-stone-500",
        accentBg: "bg-stone-500",
        leftBorder: "border-l-stone-500",
        hover: "hover:bg-stone-100 hover:border-stone-300",
        active: "active:bg-stone-200"
    },
    Deals: {
        label: "Deals",
        colorName: "Emerald",
        icon: "%",
        mapPinHex: "#059669",
        light: "bg-emerald-50",
        soft: "bg-emerald-100",
        selected: "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20",
        border: "border-emerald-200",
        borderStrong: "border-emerald-500",
        text: "text-emerald-800",
        ring: "focus-visible:ring-emerald-300",
        dot: "bg-emerald-500",
        accentBg: "bg-emerald-500",
        leftBorder: "border-l-emerald-500",
        hover: "hover:bg-emerald-100 hover:border-emerald-300",
        active: "active:bg-emerald-200"
    },
    "Happy Hour": {
        label: "Happy Hour",
        colorName: "Deep Orange",
        icon: "🍹",
        mapPinHex: "#c2410c",
        light: "bg-orange-50",
        soft: "bg-orange-100",
        selected: "bg-orange-700 text-white border-orange-800 shadow-orange-500/20",
        border: "border-orange-300",
        borderStrong: "border-orange-700",
        text: "text-orange-900",
        ring: "focus-visible:ring-orange-300",
        dot: "bg-orange-700",
        accentBg: "bg-orange-700",
        leftBorder: "border-l-orange-700",
        hover: "hover:bg-orange-100 hover:border-orange-400",
        active: "active:bg-orange-200"
    }
};
const DEFAULT_CATEGORY_THEME = CATEGORY_COLORS.Community;
function getCategoryTheme(category) {
    if (!category) return DEFAULT_CATEGORY_THEME;
    return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_THEME;
}
function getCategoryNames(input) {
    if (!input) return [];
    const values = Array.isArray(input) ? input : input.split(",");
    return values.map((value)=>value.trim()).filter(Boolean);
}
function getCategoryParam(categories) {
    return categories.filter(Boolean).join(",");
}
function toggleCategorySelection(current, category) {
    return current.includes(category) ? current.filter((item)=>item !== category) : [
        ...current,
        category
    ];
}
const CATEGORY_COLOR_ADMIN_SCHEMA = {
    storageTable: "categories",
    editableFields: [
        "color_name",
        "map_pin_hex",
        "icon",
        "sort_order",
        "is_active"
    ],
    currentSource: "src/lib/category-colors.ts",
    notes: "Future admin dashboard can persist these values in categories metadata without changing card/chip components."
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
