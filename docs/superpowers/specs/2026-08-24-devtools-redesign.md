# DevTools Redesign Specification

> **Project:** DevTools — JWT · Hash · Storage · JSON Diff
> **Date:** 2026-08-24
> **Audience:** Students learning JWTs, developers debugging tokens
> **Use Case:** One-action tool page — decode → understand → copy
> **Tone:** Playful (warm, encouraging, approachable)

---

## 1. Architecture

**Macrostructure:** Workbench — tabbed tool interface with floating pill nav
**Theme:** Hum (playful cluster)
- Paper: light (L≈95%), warm neutral
- Accent: warm amber (oklch(62% 0.18 75))
- Success: leaf green (oklch(58% 0.16 142))
- Display: Plus Jakarta Sans (rounded humanist sans)
- Mono: JetBrains Mono

**Nav Archetype:** N5 Floating pill — playful, distinct from SaaS defaults
**Footer Archetype:** Ft5 Statement — one-sentence mission + copy link

**Motion:** CSS-only microinteractions
- Tab slide (200ms, ease-out)
- Button press (scale 0.97, 120ms)
- Toast pop (slide-in 250ms, auto-dismiss 3s)
- Modal fade (200ms)

**Enrichment:** None — typography-only tool page

---

## 2. Token System (Locked)

All colours, spacing, radii, shadows, fonts, durations reference named CSS custom properties. No inline OKLCH/hex/rgb values in component files.

```css
/* tokens.css — single source of truth */
:root {
  --color-paper-0: #ffffff;
  --color-paper-1: #fafafa;
  --color-paper-2: #f5f5f4;
  --color-paper-3: #e7e5e4;
  --color-ink-0: #1c1917;
  --color-ink-1: #292524;
  --color-ink-2: #44403c;
  --color-ink-3: #78716c;
  --color-accent: oklch(62% 0.18 75);
  --color-accent-hover: oklch(58% 0.2 75);
  --color-accent-dim: oklch(92% 0.08 75 / 0.15);
  --color-success: oklch(58% 0.16 142);
  --color-success-dim: oklch(90% 0.06 142 / 0.15);
  --color-danger: oklch(58% 0.22 25);
  --color-danger-dim: oklch(92% 0.08 25 / 0.15);
  --color-warning: oklch(68% 0.18 85);
  --color-border: oklch(85% 0.01 75);
  --color-border-hover: oklch(75% 0.02 75);
  --color-border-focus: var(--color-accent);
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-ui: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 999px;
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-md: 0 4px 12px oklch(0% 0 0 / 0.08);
  --shadow-lg: 0 12px 28px oklch(0% 0 0 / 0.12);
  --duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1); --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. File Structure

```
/home/yugal/code/devtools/
├── index.html
├── tokens.css
├── components/
│   ├── tab-bar.css
│   ├── card.css
│   ├── button.css
│   ├── input.css
│   ├── badge.css
│   ├── toast.css
│   └── modal.css
├── tools/
│   ├── jwt/
│   │   ├── jwt.js
│   │   └── jwt.css
│   ├── hash/
│   │   ├── hash.js
│   │   └── hash.css
│   ├── storage/
│   │   ├── storage.js
│   │   └── storage.css
│   └── diff/
│       ├── diff.js
│       └── diff.css
├── utils/
│   ├── dom.js
│   ├── crypto.js
│   └── format.js
└── app.js
```

---

## 4. Component Specifications

### 4.1 Tab Bar (N5 Floating Pill)
- **States:** default, hover, active, focus-visible, disabled
- **Animation:** slide underline + background fill (200ms)
- **Keyboard:** Arrow keys navigate, Enter/Space activates, Home/End jumps
- **ARIA:** role="tablist", role="tab", aria-selected, aria-controls

### 4.2 Card
- Elevated surface: `var(--color-paper-1)` + `var(--shadow-sm)`
- Border: `1px solid var(--color-border)`
- Radius: `var(--radius-lg)`
- Padding: `var(--space-5)`

### 4.3 Button (8 states)
| State | Selector | Visual |
|-------|----------|--------|
| Default | `.btn` | paper-1, border, ink-1 text |
| Hover | `.btn:hover` | paper-2, border-hover |
| Focus | `.btn:focus-visible` | 2px outline accent |
| Active | `.btn:active` | scale(0.97) |
| Disabled | `.btn:disabled` | 40% opacity, not-allowed cursor |
| Loading | `.btn[data-state="loading"]` | spinner, disabled |
| Error | `.btn[data-state="error"]` | danger border, shake |
| Success | `.btn[data-state="success"]` | success border, check icon |

### 4.4 Input (textarea, text, select)
- Base: paper-0, border, ink-0 text, mono font for code
- Focus: border-focus + 3px accent-dim ring
- Error: danger border + danger-dim ring
- Placeholder: ink-3

### 4.5 Badge
- Pill radius: `var(--radius-full)`
- Variants: success, danger, warning, info, neutral
- Size: 11px, 600 weight, uppercase, letter-spacing 0.3px

### 4.6 Toast
- Container: fixed top-right, z-index 1000, column gap space-2
- Animation: slide-in from right (250ms ease-out), slide-out (200ms ease-in)
- Variants: success (left accent border), error (danger), info (accent)

### 4.7 Modal
- Overlay: fixed inset-0, backdrop oklch(0% 0 0 / 0.6)
- Panel: paper-1, shadow-lg, radius-lg, max-width 500px, 90% width
- Focus trap: Tab cycles within modal, Escape closes
- Animation: fade-in 200ms

---

## 5. Tool Specifications

### 5.1 JWT Inspector (`tools/jwt/`)
**Input:** Single textarea, min-height 180px
**Actions:** Decode (primary), Load Sample, Clear
**Output Sections:**
1. Raw token (coloured segments: header·payload·signature)
2. Three-panel decoded view (header / payload / signature)
3. Time claims table (iat, exp, nbf, auth_time) with human-readable dates + relative badges
4. All claims table (known fields highlighted accent, custom fields purple)

**Validation:**
- Must have 3 dot-separated parts
- Header & payload must be valid base64url JSON
- Clear error messages for malformed tokens

**Sample JWT:** Realistic HS256 token with student-friendly claims (name, email, role: "student", permissions array)

### 5.2 Hash Generator (`tools/hash/`)
**Input:** Single textarea, min-height 100px
**Actions:** Generate (primary), Clear
**Algorithms:** SHA-1, SHA-256, SHA-384, SHA-512 (Web Crypto API)
**Output:** 4 rows — algo label + hex value + copy button
**Compare:** Input field + Compare button → match badge (success/danger)

### 5.3 Storage Manager (`tools/storage/`)
**Tabs:** localStorage / sessionStorage (radio-tab pattern)
**Toolbar:** Entry count, Export JSON (download), Clear All (danger)
**Add Row:** Key input + Value input + Add button
**Entries:** Grid — key (mono, accent) | value (mono, truncated 200 chars) | actions (edit, delete)
**Edit Modal:** Key readonly, value textarea, Save/Cancel
**Export:** Downloads `{storageType}-export.json`

### 5.4 JSON Diff (`tools/diff/`)
**Inputs:** Two textareas side-by-side (Original / Modified), min-height 200px
**Actions:** Compare (primary), Load Sample, Clear, Swap
**Output:** Unified diff view in monospace
- Added lines: success-dim bg, success text, + prefix, left border
- Removed lines: danger-dim bg, danger text, - prefix, left border
- Modified lines: warning-dim bg, warning text, ~ prefix, left border
- Unchanged: ink-3 text, space prefix
**Stats Chips:** Added (success), Removed (danger), Modified (warning)
**Error Handling:** Inline error above diff for invalid JSON (panel-specific)

---

## 6. Utility Modules

### `utils/dom.js`
- `qs(selector, root=document)` — querySelector
- `qsa(selector, root=document)` — querySelectorAll → Array
- `on(el, event, handler, options)` — addEventListener wrapper
- `emit(el, event, detail)` — CustomEvent dispatch
- `delegate(parent, selector, event, handler)` — event delegation

### `utils/crypto.js`
- `base64UrlDecode(str)` — URL-safe base64 decode with padding
- `base64UrlEncode(bytes)` — ArrayBuffer → URL-safe base64
- `hash(text, algo)` — crypto.subtle.digest wrapper → hex string
- `algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']`

### `utils/format.js`
- `prettyJson(obj)` — JSON.stringify(obj, null, 2)
- `formatTimestamp(ts)` — Date(ts*1000).toLocaleString()
- `relativeTime(ts)` — "2h ago", "in 30m", "just now"
- `truncate(str, len=200)` — str.slice(0, len) + '…'

---

## 7. Responsive Breakpoints

| Breakpoint | Tab Bar | Tool Layout | Cards |
|------------|---------|-------------|-------|
| ≥1024px | Horizontal pill | 3-col JWT, 2-col diff | Full padding |
| 768–1023px | Horizontal pill (scroll if needed) | 2-col JWT, 1-col diff | Full padding |
| <768px | Horizontal scroll | All 1-col | Padding space-4 |

---

## 8. Accessibility

- All interactive elements: focus-visible outline (2px accent)
- Colour contrast: WCAG AA (4.5:1) on all text
- ARIA labels on icon-only buttons
- Live region for toast announcements
- Keyboard navigation for all tools
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables animations

---

## 9. Browser Support

- ES2022+ (optional chaining, nullish coalescing, crypto.subtle)
- No polyfills required for modern browsers
- Fallback: `navigator.clipboard` → textarea execCommand

---

## 10. Slop-Test Gates (Must Pass)

All 58 gates from `slop-test.md` — specifically:
- 1–12: Philosophy & Hierarchy
- 13–22: Execution (tokens, states, contrast)
- 23–33: Specificity (real copy, no invented metrics)
- 34–41: Restraint (no re-drawn chrome, no italic headers)
- 42–50: Variety (diversification from previous builds)
- 51–58: Layout safety (mobile non-negotiables)

---

*Spec self-review: no placeholders, all tokens locked, all 8 states specified, mobile breakpoints defined, accessibility explicit.*