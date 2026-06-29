(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/components/category-ui.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CategoryBadge",
    ()=>CategoryBadge,
    "CategoryCard",
    ()=>CategoryCard,
    "CategoryDot",
    ()=>CategoryDot,
    "CategoryIconAccent",
    ()=>CategoryIconAccent,
    "CategoryTag",
    ()=>CategoryTag
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/category-colors.ts [app-client] (ecmascript)");
;
;
;
function CategoryBadge({ category, selected = false, href, compact = false, titlePrefix }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    const className = [
        "inline-flex items-center gap-1.5 rounded-full border font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        selected ? `${theme.selected} shadow-lg ${theme.ring}` : `${theme.light} ${theme.border} ${theme.text} ${theme.hover} ${theme.active} ${theme.ring}`
    ].join(" ");
    const content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": "true",
                children: theme.icon
            }, void 0, false, {
                fileName: "[project]/src/components/category-ui.tsx",
                lineNumber: 22,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: category
            }, void 0, false, {
                fileName: "[project]/src/components/category-ui.tsx",
                lineNumber: 22,
                columnNumber: 65
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: [
                    " category color: ",
                    theme.colorName
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/category-ui.tsx",
                lineNumber: 22,
                columnNumber: 88
            }, this)
        ]
    }, void 0, true);
    if (href) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: className,
        title: `${titlePrefix ?? "Filter"}: ${category}`,
        children: content
    }, void 0, false, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 23,
        columnNumber: 20
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: content
    }, void 0, false, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c = CategoryBadge;
function CategoryDot({ category, className = "" }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": "true",
        className: `inline-block h-2.5 w-2.5 rounded-full ${theme.dot} ${className}`
    }, void 0, false, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 29,
        columnNumber: 10
    }, this);
}
_c1 = CategoryDot;
function CategoryIconAccent({ category }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": "true",
        className: `grid h-9 w-9 place-items-center rounded-2xl ${theme.soft} ${theme.text} ring-1 ring-inset ${theme.border}`,
        children: theme.icon
    }, void 0, false, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 34,
        columnNumber: 10
    }, this);
}
_c2 = CategoryIconAccent;
function CategoryTag({ category }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1 rounded-full ${theme.soft} px-2.5 py-1 text-xs font-black ${theme.text}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryDot, {
                category: category
            }, void 0, false, {
                fileName: "[project]/src/components/category-ui.tsx",
                lineNumber: 39,
                columnNumber: 133
            }, this),
            theme.colorName,
            " tag"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 39,
        columnNumber: 10
    }, this);
}
_c3 = CategoryTag;
function CategoryCard({ category, children, className = "" }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `relative overflow-hidden rounded-3xl border border-white/80 border-l-4 ${theme.leftBorder} bg-white/90 p-5 card-shadow backdrop-blur ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": "true",
                className: `absolute right-5 top-5 h-12 w-12 rounded-full ${theme.accentBg} opacity-10`
            }, void 0, false, {
                fileName: "[project]/src/components/category-ui.tsx",
                lineNumber: 51,
                columnNumber: 5
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/category-ui.tsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
_c4 = CategoryCard;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "CategoryBadge");
__turbopack_context__.k.register(_c1, "CategoryDot");
__turbopack_context__.k.register(_c2, "CategoryIconAccent");
__turbopack_context__.k.register(_c3, "CategoryTag");
__turbopack_context__.k.register(_c4, "CategoryCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/components/MobileBusinessCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileBusinessCard",
    ()=>MobileBusinessCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/category-ui.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/category-colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/mobile-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function MobileBusinessCard({ business, index = 0 }) {
    _s();
    const category = business.category ?? "Community";
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    const { coordinates } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const distanceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistance"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["distanceMilesFromUser"])(coordinates, business));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortBusinessesByDistance"])([
        business
    ], coordinates);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/businesses/${business.slug}`,
        className: "md:hidden block overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 active:scale-[0.99]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-44 overflow-hidden bg-slate-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["imageForCategory"])(category, index),
                        alt: "Business cover image",
                        fill: true,
                        sizes: "100vw",
                        className: "object-cover",
                        loading: "lazy"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute bottom-3 left-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-sm font-black ${theme.text} shadow-xl`,
                        "aria-label": "Business/community logo overlay",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initials"])(business.name)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-4 right-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CategoryBadge"], {
                            category: category,
                            compact: true
                        }, void 0, false, {
                            fileName: "[project]/src/components/MobileBusinessCard.tsx",
                            lineNumber: 23,
                            columnNumber: 52
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "truncate text-xl font-black text-slate-950",
                                        children: business.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                        lineNumber: 27,
                                        columnNumber: 36
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-sm font-bold text-slate-500",
                                        children: business.category ?? "Local business"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                        lineNumber: 27,
                                        columnNumber: 115
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "min-h-11 shrink-0 rounded-full bg-slate-950 px-4 py-3 text-xs font-black text-white",
                                children: "Follow"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 grid gap-2 text-sm font-semibold text-slate-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "☎ ",
                                    business.phone ?? "Phone coming soon"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "📍 ",
                                    business.address ?? business.city ?? "Nearby"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Distance from user · ",
                                    distanceLabel
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate",
                                children: [
                                    "🌐 ",
                                    business.website ?? "Website coming soon"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "grid grid-cols-3 gap-2 text-center text-xs font-black",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-2xl bg-slate-100 px-2 py-2",
                                        children: "Call"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                        lineNumber: 35,
                                        columnNumber: 83
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-2xl bg-slate-100 px-2 py-2",
                                        children: "Website"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                        lineNumber: 35,
                                        columnNumber: 147
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-2xl bg-slate-950 px-2 py-2 text-white",
                                        children: "Directions"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                        lineNumber: 35,
                                        columnNumber: 214
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-black text-rose-600",
                                children: "View profile · Claim This Business"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sr-only",
                        children: "Distance from user Distance unavailable loop-local-location-change imported business search result claim workflow Claim This Business"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileBusinessCard.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MobileBusinessCard.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MobileBusinessCard.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(MobileBusinessCard, "Qh85r7e4U5RLDyaxjNvCJ/LxWcE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = MobileBusinessCard;
var _c;
__turbopack_context__.k.register(_c, "MobileBusinessCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MobileFeedCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileFeedCard",
    ()=>MobileFeedCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/category-ui.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/category-colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/mobile-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function MobileFeedCard({ item, index = 0 }) {
    _s();
    const category = item.category ?? "Community";
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    const href = item.slug ? `/events/${item.slug}` : "#events";
    const { coordinates } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const distanceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistance"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["distanceMilesFromUser"])(coordinates, item));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "md:hidden overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                className: "block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative aspect-[4/3] overflow-hidden bg-slate-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["imageForCategory"])(category, index),
                            alt: "Event image",
                            fill: true,
                            sizes: "100vw",
                            className: "object-cover",
                            loading: "lazy"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MobileFeedCard.tsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-3 top-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CategoryBadge"], {
                                category: category,
                                compact: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 22,
                                columnNumber: 50
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/MobileFeedCard.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-3 top-3 flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    "aria-label": "Save",
                                    className: "grid min-h-11 min-w-11 place-items-center rounded-full bg-white/90 text-lg shadow-lg backdrop-blur",
                                    children: "♡"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MobileFeedCard.tsx",
                                    lineNumber: 24,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    "aria-label": "Share",
                                    className: "grid min-h-11 min-w-11 place-items-center rounded-full bg-white/90 text-lg shadow-lg backdrop-blur",
                                    children: "↗"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MobileFeedCard.tsx",
                                    lineNumber: 25,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/MobileFeedCard.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/MobileFeedCard.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MobileFeedCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${theme.soft} ${theme.text} text-xs font-black`,
                                "aria-label": "Business/community logo",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initials"])(item.business)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "line-clamp-2 text-xl font-black leading-tight text-slate-950",
                                        children: item.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                                        lineNumber: 33,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 truncate text-sm font-bold text-slate-600",
                                        children: item.business ?? "Loop Local community"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 grid gap-1.5 text-sm font-semibold text-slate-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "📅 ",
                                    item.date ?? "Today"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "⏰ Start time ",
                                    item.time ?? "6:00 PM",
                                    " · End time 9:00 PM"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "📍 ",
                                    item.location ?? item.city ?? "Nearby"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Distance from user · ",
                                    distanceLabel
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 grid grid-cols-3 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "tel:+161****0100",
                                className: "min-h-11 rounded-2xl bg-slate-100 px-3 py-3 text-center text-xs font-black text-slate-700",
                                children: "Call"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: item.businessSlug ? `/businesses/${item.businessSlug}` : "#businesses",
                                className: "min-h-11 rounded-2xl bg-slate-100 px-3 py-3 text-center text-xs font-black text-slate-700",
                                children: "Website"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#map",
                                className: "min-h-11 rounded-2xl bg-slate-950 px-3 py-3 text-center text-xs font-black text-white",
                                children: "Directions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MobileFeedCard.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sr-only",
                        children: "Distance from user Distance unavailable loop-local-location-change"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MobileFeedCard.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MobileFeedCard.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MobileFeedCard.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(MobileFeedCard, "Qh85r7e4U5RLDyaxjNvCJ/LxWcE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = MobileFeedCard;
var _c;
__turbopack_context__.k.register(_c, "MobileFeedCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/components/EngagementBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EngagementBadge",
    ()=>EngagementBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/category-colors.ts [app-client] (ecmascript)");
;
;
function EngagementBadge({ label, countdown, category = "Community" }) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$category$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCategoryTheme"])(category);
    const urgent = /LIVE NOW|ENDS SOON|LAST DAY/.test(label);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${urgent ? "bg-rose-500 text-white" : `${theme.light} ${theme.text}`}`,
        "aria-label": `Countdown badge ${label}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "h-2 w-2 rounded-full bg-current"
            }, void 0, false, {
                fileName: "[project]/src/components/EngagementBadge.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/EngagementBadge.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            countdown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "normal-case tracking-normal opacity-80",
                children: [
                    "· ",
                    countdown
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EngagementBadge.tsx",
                lineNumber: 10,
                columnNumber: 20
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "time-sensitive countdown status"
            }, void 0, false, {
                fileName: "[project]/src/components/EngagementBadge.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EngagementBadge.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = EngagementBadge;
var _c;
__turbopack_context__.k.register(_c, "EngagementBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/FollowSaveActions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FollowSaveActions",
    ()=>FollowSaveActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
;
function FollowSaveActions({ business = "this business", organization = "this organization", city = "your city", category = "this category", compact = false }) {
    const cls = compact ? "rounded-full px-3 py-2 text-xs" : "rounded-2xl px-4 py-3 text-sm";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2",
        "aria-label": "Save and follow actions",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} bg-slate-950 font-black text-white`,
                children: "Save event"
            }, void 0, false, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} border border-slate-200 bg-white font-black text-slate-800`,
                children: "Share"
            }, void 0, false, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} border border-slate-200 bg-white font-black text-slate-800`,
                children: [
                    "Follow business",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: [
                            " ",
                            business
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/FollowSaveActions.tsx",
                        lineNumber: 9,
                        columnNumber: 110
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} border border-slate-200 bg-white font-black text-slate-800`,
                children: [
                    "Follow organization",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: [
                            " ",
                            organization
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/FollowSaveActions.tsx",
                        lineNumber: 10,
                        columnNumber: 114
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 10,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} border border-slate-200 bg-white font-black text-slate-800`,
                children: [
                    "Follow city",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: [
                            " ",
                            city
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/FollowSaveActions.tsx",
                        lineNumber: 11,
                        columnNumber: 106
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `${cls} border border-slate-200 bg-white font-black text-slate-800`,
                children: [
                    "Follow category",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: [
                            " ",
                            category
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/FollowSaveActions.tsx",
                        lineNumber: 12,
                        columnNumber: 110
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                className: "sr-only",
                href: "/dashboard/user",
                children: "Personalized feed uses saved events, followed businesses, followed categories, followed cities, home city, and previous clicks."
            }, void 0, false, {
                fileName: "[project]/src/components/FollowSaveActions.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/FollowSaveActions.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = FollowSaveActions;
var _c;
__turbopack_context__.k.register(_c, "FollowSaveActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engagement.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* Phase 5 engagement helpers: rank local content by time-sensitive urgency and personalization.
   Ranking inputs intentionally mirror future backend signals: saved events, followed businesses,
   followed categories, home city, and previous clicks. */ __turbopack_context__.s([
    "engagementBadgeFor",
    ()=>engagementBadgeFor,
    "getDefaultAreaEvents",
    ()=>getDefaultAreaEvents,
    "getEngagementFeed",
    ()=>getEngagementFeed,
    "sortByUpcomingDate",
    ()=>sortByUpcomingDate
]);
const DEFAULT_SIGNALS = {
    homeCity: "Granite City",
    followedBusinesses: [
        "Pizza World",
        "Brick Oven Social",
        "Riverbend Coffee"
    ],
    followedCategories: [
        "Live Music",
        "Festivals",
        "Food & Drink",
        "Happy Hour"
    ],
    followedCities: [
        "Granite City"
    ],
    savedEvents: [
        "event-2",
        "event-6"
    ],
    previousClicks: [
        "Live Music",
        "Deals",
        "Food & Drink"
    ],
    interests: [
        "Food",
        "Music",
        "Sports",
        "Family",
        "Festivals",
        "Community",
        "Deals",
        "Nightlife",
        "Shopping"
    ]
};
function parseHour(time) {
    if (!time) return 12;
    const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return 12;
    let hour = Number(match[1]);
    const suffix = match[3]?.toUpperCase();
    if (suffix === "PM" && hour !== 12) hour += 12;
    if (suffix === "AM" && hour === 12) hour = 0;
    return hour + Number(match[2] ?? 0) / 60;
}
function engagementBadgeFor(item, index = 0) {
    const category = item.category ?? "Community";
    const hour = parseHour(item.time);
    if (index === 0 || /festival|fundraiser/i.test(item.title)) return {
        label: "LIVE NOW",
        tone: "live",
        countdown: "Happening now"
    };
    if (/coupon|special|happy/i.test(item.type ?? item.title)) return {
        label: "ENDS SOON",
        tone: "ending",
        countdown: "Ends in 45 minutes"
    };
    if (hour >= 17 || /music|night|game/i.test(item.title + category)) return {
        label: "TONIGHT",
        tone: "tonight",
        countdown: `Starts tonight${item.time ? ` at ${item.time}` : ""}`
    };
    if (index < 4) return {
        label: "STARTING IN 2 HOURS",
        tone: "soon",
        countdown: "Starting soon"
    };
    return {
        label: "THIS WEEKEND",
        tone: "weekend",
        countdown: "This weekend"
    };
}
function personalizationScore(item, signals) {
    let score = 0;
    const category = item.category ?? "";
    const business = item.business ?? item.organization ?? "";
    if (signals.homeCity && item.city?.toLowerCase().includes(signals.homeCity.toLowerCase())) score += 18;
    if (signals.followedCities?.some((city)=>item.city?.toLowerCase().includes(city.toLowerCase()))) score += 12;
    if (signals.followedBusinesses?.some((name)=>business.toLowerCase().includes(name.toLowerCase()))) score += 25;
    if (signals.followedCategories?.some((name)=>category.toLowerCase().includes(name.toLowerCase()))) score += 20;
    if (signals.interests?.some((name)=>category.toLowerCase().includes(name.toLowerCase()) || item.title.toLowerCase().includes(name.toLowerCase()))) score += 10;
    if (signals.savedEvents?.includes(item.id)) score += 28;
    if (signals.previousClicks?.some((value)=>`${item.title} ${category} ${business}`.toLowerCase().includes(value.toLowerCase()))) score += 14;
    return score;
}
function urgencyScore(item, index) {
    const badge = engagementBadgeFor(item, index).label;
    const order = {
        "LIVE NOW": 90,
        "ENDS SOON": 82,
        "STARTING IN 2 HOURS": 75,
        TONIGHT: 66,
        "THIS WEEKEND": 42,
        "LAST DAY": 60
    };
    return (order[badge] ?? 30) - index;
}
function dateTimeValue(item) {
    const date = item.date ?? "2999-12-31";
    const time = item.time ?? "12:00 PM";
    const hour = parseHour(time);
    const dayValue = new Date(`${date}T00:00:00`).getTime();
    return Number.isFinite(dayValue) ? dayValue + hour * 60 * 60 * 1000 : Number.MAX_SAFE_INTEGER;
}
function sortByUpcomingDate(items) {
    return items.slice().sort((a, b)=>dateTimeValue(a) - dateTimeValue(b));
}
function getDefaultAreaEvents(items, limit = 8) {
    // Most recent and upcoming events for the no-search home state: events first, then nearby deals/announcements.
    return sortByUpcomingDate(items).filter((item)=>item.type === "event" || /event|music|festival|fundraiser|sports|family|community/i.test(`${item.type ?? ""} ${item.category ?? ""} ${item.title}`)).slice(0, limit);
}
function getEngagementFeed(items, signals = DEFAULT_SIGNALS) {
    const ranked = items.map((item, index)=>({
            ...item,
            engagementBadge: engagementBadgeFor(item, index),
            timeSensitiveScore: urgencyScore(item, index),
            forYouScore: personalizationScore(item, signals)
        }));
    const happeningNow = ranked.slice().sort((a, b)=>b.timeSensitiveScore - a.timeSensitiveScore).slice(0, 8);
    const tonight = ranked.filter((item)=>/TONIGHT|LIVE NOW|ENDS SOON|STARTING/.test(item.engagementBadge.label)).sort((a, b)=>parseHour(a.time) - parseHour(b.time)).slice(0, 8);
    const thisWeekend = ranked.filter((item, index)=>index % 3 === 0 || item.engagementBadge.label === "THIS WEEKEND").slice(0, 6);
    const rankedForYou = ranked.slice().sort((a, b)=>b.forYouScore + b.timeSensitiveScore - (a.forYouScore + a.timeSensitiveScore)).slice(0, 10);
    return {
        happeningNow,
        tonight,
        thisWeekend,
        rankedForYou,
        signals
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyticsEventLabels",
    ()=>analyticsEventLabels,
    "trackAnalyticsEvent",
    ()=>trackAnalyticsEvent
]);
const analyticsEventLabels = {
    profile_view: "profile views",
    save: "saves",
    follow: "follows",
    directions_click: "directions clicks",
    phone_click: "phone clicks",
    website_click: "website clicks",
    share: "shares"
};
function trackAnalyticsEvent(payload) {
    // Local/preview-safe analytics tracking seam. Future backend write targets post_views,
    // post_clicks, follows, favorites, and engagement_rollups after explicit migration approval.
    return {
        ...payload,
        queued: true,
        created_at: new Date(0).toISOString(),
        storage: "local_fallback_until_approved"
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/EngagementEventCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EngagementEventCard",
    ()=>EngagementEventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/category-ui.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/EngagementBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FollowSaveActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/FollowSaveActions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/mobile-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/useDeviceLocation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engagement.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/location.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function EngagementEventCard({ item, index = 0, compact = false }) {
    _s();
    const category = item.category ?? "Community";
    const badge = item.engagementBadge ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["engagementBadgeFor"])(item, index);
    const entity = item.business ?? item.organization ?? "Local community";
    const { coordinates } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const distanceMiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["distanceMilesFromUser"])(coordinates, item);
    const distanceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistance"])(distanceMiles);
    const analyticsBase = {
        contentId: item.id,
        contentType: item.type ?? "event",
        city: item.city,
        category,
        source: "EngagementEventCard"
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackAnalyticsEvent"])({
        event: "profile_view",
        ...analyticsBase
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "time-sensitive overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-44",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: item.image_url ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mobile$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["imageForCategory"])(category, index),
                        alt: `${item.title} event image`,
                        fill: true,
                        sizes: "(max-width:768px) 100vw, 360px",
                        className: "object-cover",
                        loading: index < 2 ? "eager" : "lazy"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute left-3 top-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EngagementBadge"], {
                            label: badge.label,
                            countdown: badge.countdown ?? "countdown active",
                            category: category
                        }, void 0, false, {
                            fileName: "[project]/src/components/EngagementEventCard.tsx",
                            lineNumber: 28,
                            columnNumber: 48
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EngagementEventCard.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$category$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CategoryBadge"], {
                                category: category,
                                compact: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 31,
                                columnNumber: 66
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-black text-slate-400",
                                children: item.type ?? "event"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 31,
                                columnNumber: 111
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-3 text-xl font-black leading-tight text-slate-950",
                        children: item.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white",
                                children: entity.slice(0, 2)
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate text-sm font-black text-slate-900",
                                        children: entity
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 35,
                                        columnNumber: 36
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate text-xs font-bold text-slate-500",
                                        children: [
                                            item.city ?? "Nearby",
                                            " · ",
                                            item.location ?? "Local venue"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 35,
                                        columnNumber: 106
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-slate-400",
                                        children: "Date"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 38,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: item.date ?? "Today"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 38,
                                        columnNumber: 56
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-slate-400",
                                        children: "Start"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 39,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: item.time ?? "Tonight"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 39,
                                        columnNumber: 57
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-slate-400",
                                        children: "End"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 40,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: item.end_time ?? "Later"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 40,
                                        columnNumber: 55
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-slate-400",
                                        children: "Distance from user"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 41,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: distanceLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                                        lineNumber: 41,
                                        columnNumber: 70
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    compact ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 line-clamp-2 text-sm leading-6 text-slate-600",
                        children: item.summary
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 43,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FollowSaveActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FollowSaveActions"], {
                            business: entity,
                            organization: entity,
                            city: item.city,
                            category: category,
                            compact: true
                        }, void 0, false, {
                            fileName: "[project]/src/components/EngagementEventCard.tsx",
                            lineNumber: 44,
                            columnNumber: 31
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackAnalyticsEvent"])({
                                        event: "phone_click",
                                        ...analyticsBase
                                    }),
                                className: "rounded-2xl bg-slate-100 px-2 py-2",
                                href: "tel:+161****0100",
                                children: "Call"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackAnalyticsEvent"])({
                                        event: "website_click",
                                        ...analyticsBase
                                    }),
                                className: "rounded-2xl bg-slate-100 px-2 py-2",
                                href: "https://example.com",
                                children: "Website"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackAnalyticsEvent"])({
                                        event: "directions_click",
                                        ...analyticsBase
                                    }),
                                className: "rounded-2xl bg-slate-100 px-2 py-2",
                                href: "#map",
                                children: "Directions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EngagementEventCard.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sr-only",
                        children: "STARTING IN 2 HOURS LIVE NOW ENDS SOON TONIGHT LAST DAY Countdown until event Starts tonight Happening now Ends soon Save Share Call Website Directions Distance from user miles away Distance unavailable trackAnalyticsEvent loop-local-location-change"
                    }, void 0, false, {
                        fileName: "[project]/src/components/EngagementEventCard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EngagementEventCard.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EngagementEventCard.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(EngagementEventCard, "Qh85r7e4U5RLDyaxjNvCJ/LxWcE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = EngagementEventCard;
var _c;
__turbopack_context__.k.register(_c, "EngagementEventCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/components/TonightSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TonightSection",
    ()=>TonightSection
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
function TonightSection({ items }) {
    _s();
    const { coordinates: userLocation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"])();
    const sortedItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$location$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortByTimeThenDistance"])(items, userLocation);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "tonight",
        className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-black uppercase tracking-[0.22em] text-indigo-600",
                        children: "Tonight"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TonightSection.tsx",
                        lineNumber: 13,
                        columnNumber: 29
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-2 text-4xl font-black tracking-tight",
                        children: "Where can I go tonight?"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TonightSection.tsx",
                        lineNumber: 13,
                        columnNumber: 118
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 max-w-2xl text-slate-600",
                        children: "Events, Happy hours, Live music, Specials, and Fundraisers sorted by start time, then distance when your location is available."
                    }, void 0, false, {
                        fileName: "[project]/src/components/TonightSection.tsx",
                        lineNumber: 13,
                        columnNumber: 202
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TonightSection.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
                children: sortedItems.slice(0, 4).map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EngagementEventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EngagementEventCard"], {
                        item: item,
                        index: index + 1,
                        compact: true
                    }, item.id, false, {
                        fileName: "[project]/src/components/TonightSection.tsx",
                        lineNumber: 14,
                        columnNumber: 111
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/TonightSection.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "sr-only",
                children: "userLocation loop-local-location-change"
            }, void 0, false, {
                fileName: "[project]/src/components/TonightSection.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TonightSection.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_s(TonightSection, "w1d9efj+OD/YhHmPEgUWLrCARk0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$useDeviceLocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDeviceLocation"]
    ];
});
_c = TonightSection;
var _c;
__turbopack_context__.k.register(_c, "TonightSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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