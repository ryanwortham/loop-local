// Recovered from public Next.js/Turbopack dev chunk.
// This is compiled browser/server bundle output, not pristine original source.
// Source module id: [project]/src/components/category-ui.tsx
// Recovered from chunk: _0sajad9._.js

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
