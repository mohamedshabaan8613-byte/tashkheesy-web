# Engineering Audit Report
## Branch: `patch/hero-rebalancing-brand-clarity`
**Prepared by:** Senior Engineering Review  
**Date:** 2026-05-29  
**Scope:** All 7 unmerged commits against `main` — full diff analysis, TypeScript integrity, React patterns, booking flow, and session lifecycle  
**Status:** ✅ APPROVED WITH NOTES — 1 blocking issue, 3 medium-priority items, 4 low-priority observations

---

## 1. Executive Summary

This branch carries seven commits across eight files, delivering a focused UI/UX editorial pass on the public-facing landing page. The surface area of change is intentionally narrow: no routing changes, no schema migrations, no new dependencies, and no modifications to any auth, screening, or booking business logic. The TypeScript compiler reports zero errors (`tsc --noEmit` exits 0), and `pnpm build` completes cleanly in under eight seconds.

The audit identified **one blocking issue** — a ghost `xs:` Tailwind breakpoint class with no registered screen size — alongside three medium-priority items and four low-priority observations. None of the medium or low items affect correctness or data integrity; they are maintainability and accessibility debts that should be addressed before the next major sprint.

The pre-existing `ChildrenPage` / `accountData` ID-contract bug (described in Section 6) is **out of scope** for this branch but is documented here because it was discovered during the review and represents a data-integrity risk that must be resolved before production.

---

## 2. Commit Log

| # | Hash | Message | Files Touched |
|---|---|---|---|
| 1 | `5d9e6dd` | `patch(hero): rebalancing — brand clarity, specialization, human guidance` | `HeroSection.tsx` |
| 2 | `9ca3bef` | `patch(hero): message compression — micro trust row, remove repetition, refine outcome card` | `HeroSection.tsx` |
| 3 | `84683c4` | `patch(cta): rebalancing & funnel rhythm optimization` | `HeroSection.tsx`, `Navbar.tsx`, `HowItWorks.tsx` |
| 4 | `cfda18f` | `fix(hero): update secondary CTA text and link` | `HeroSection.tsx` |
| 5 | `8414b9f` | `feat(why-tashkheesy): Editorial and UX Overhaul` | `WhyTashkheesy.tsx`, `WhyTashkhisi.tsx` (deleted), `Home.tsx`, `TrustRibbon.tsx` (deleted) |
| 6 | `e0979fa` | `refine(why-tashkheesy): calming pass — dual-audience + humanized copy` | `WhyTashkheesy.tsx` |
| 7 | `93f1ee5` | `fix(ts): resolve 5 TS2322 Variants errors in WhyTashkheesy.tsx` | `WhyTashkheesy.tsx` |

**Files deleted:** `TrustRibbon.tsx`, `WhyTashkhisi.tsx`  
**Files modified:** `HeroSection.tsx`, `Navbar.tsx`, `HowItWorks.tsx`, `ServicesPreview.tsx`, `WhyTashkheesy.tsx`, `Home.tsx`

---

## 3. TypeScript Integrity

**Result: PASS — 0 errors**

The branch opened with five `TS2322` errors in `WhyTashkheesy.tsx`, all originating from a single root cause: a `custom` variant function returning an object literal where TypeScript inferred `ease: string` instead of the narrower `"easeOut"` literal required by framer-motion's `EasingDefinition` union type. Commit `93f1ee5` resolved this by adding an explicit `Variants` type annotation and an `as const` assertion on the `ease` value.

No other TypeScript violations exist on the branch. All imports are resolved, all prop types are satisfied, and no `@ts-ignore` or `@ts-expect-error` suppressions were introduced.

---

## 4. Findings

### 4.1 BLOCKING — Ghost `xs:` Tailwind Breakpoint

**File:** `client/src/components/HeroSection.tsx`, line 176  
**Severity:** Blocking (silent layout regression on 375–479px viewports)

```tsx
// Current — xs is not a registered Tailwind screen
<div className="flex flex-col xs:flex-row sm:flex-row gap-3">
```

Tailwind 4 does not include an `xs` screen by default, and no custom `xs` breakpoint is registered in `index.css` or any config file. On devices in the 375–479px range (iPhone SE, older Android handsets), the `xs:flex-row` class is silently ignored, leaving the two CTAs stacked vertically when the design intent is a horizontal row. The `sm:flex-row` class at 640px takes over correctly, but the 375–479px gap is unhandled.

**Required fix:**
```tsx
// Option A — remove xs entirely (simplest, safe)
<div className="flex flex-col sm:flex-row gap-3">

// Option B — register xs in index.css and keep the class
// @custom-variant xs (@media (min-width: 480px));
```

---

### 4.2 MEDIUM — Inline Style Mutations Bypass React's Rendering Model

**Files:** `HeroSection.tsx` (4 handlers), `Navbar.tsx` (2 handlers), `HowItWorks.tsx` (2 handlers)  
**Severity:** Medium (maintainability + potential conflict with Tailwind `transition-all`)

All three files use `onMouseEnter`/`onMouseLeave` handlers that mutate `e.currentTarget.style.*` directly rather than toggling state or CSS classes. This pattern predates the branch — it was present in `main` — but the branch amplifies it by adding new handlers in `Navbar.tsx` and `HowItWorks.tsx`.

The specific risk is that `HeroSection.tsx` line 180 applies `className="... transition-all duration-200"` on the same element where `onMouseEnter` sets `style.transform`. When both a Tailwind `transition-all` and a direct `style.transform` mutation are active simultaneously, browser behavior is consistent but the code becomes fragile: any future refactor that removes the inline style handler will silently break the hover animation because the Tailwind class alone does not define a hover target value.

**Recommended fix:** Replace with CSS class toggling via `useState`, or use Tailwind's `hover:` variants with `group` where the values are statically known.

---

### 4.3 MEDIUM — `aria-label` on `<section>` Duplicates Visible Heading

**File:** `HeroSection.tsx`, line 80  
**Severity:** Medium (WCAG 2.1 redundancy — not a violation, but degrades screen reader experience)

```tsx
<section aria-label="تشخيصي — منصة الفحص الأولي">
```

The `<h1>` inside this section already provides the accessible name for the landmark. Adding an `aria-label` on the `<section>` causes screen readers to announce the label twice — once when entering the landmark and once when reading the heading. Per WCAG 2.1 technique ARIA11, `aria-label` on a sectioning element should only be used when the section has no visible heading, or when the heading text alone is insufficient to distinguish the landmark from others on the page.

**Recommended fix:** Remove the `aria-label` attribute from the `<section>` and rely on the `<h1>` as the landmark's accessible name.

---

### 4.4 MEDIUM — `ServicesPreview.tsx`: Three of Four Service Cards Link to `#`

**File:** `client/src/components/ServicesPreview.tsx`, lines 38, 53, 68  
**Severity:** Medium (UX dead-end — affects conversion funnel)

The diff correctly changed the first service card's `href` from `"#screening"` to `"/start"`. However, the remaining three cards still use `href: "#"`, which navigates to the top of the page on click. These are not placeholder-only cards — they are presented as real services with titles and descriptions. A user clicking "ابدأ الفحص" on any of the three non-primary cards will be silently redirected to the page top with no feedback.

**Recommended fix:** Either route all service cards to `/start` (with a query param for service type), or add a `toast("قريباً")` click handler and visually mark them as "coming soon."

---

### 4.5 LOW — `animClass` Ignores Its `_delay` Parameter

**File:** `HeroSection.tsx`, lines 72–77  
**Severity:** Low (dead parameter — no functional impact)

```tsx
const animClass = (_delay: number) =>
  `transition-all duration-700 ease-out ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
  }`;
const animStyle = (delay: number) => ({ transitionDelay: `${delay}ms` });
```

The `_delay` parameter in `animClass` is prefixed with `_` (indicating intentional non-use) while `animStyle` handles the actual delay. This is a valid pattern but creates a misleading API: callers pass a numeric delay to `animClass` that is silently discarded. The underscore prefix is a weak signal — future engineers may not notice it.

**Recommended fix:** Remove the parameter from `animClass` entirely, or merge both helpers into a single function that returns `{ className, style }`.

---

### 4.6 LOW — `WhyTashkheesy.tsx`: `motion.section` Lacks `aria-labelledby`

**File:** `client/src/components/WhyTashkheesy.tsx`  
**Severity:** Low (landmark accessibility)

The new `WhyTashkheesy` component wraps its content in a `<motion.section>` with `id="why-tashkheesy"` but does not associate the section with its visible heading via `aria-labelledby`. Screen readers will announce this as an unnamed landmark region.

**Recommended fix:** Add `aria-labelledby` pointing to the heading's `id`:
```tsx
<motion.section id="why-tashkheesy" aria-labelledby="why-heading">
  <h2 id="why-heading">البداية تصبح أوضح…</h2>
```

---

### 4.7 LOW — `TrustRibbon.tsx` Deletion: No Redirect or Replacement for Anchor Links

**Severity:** Low (if any external link or internal anchor pointed to the ribbon)

`TrustRibbon.tsx` was deleted and its `<TrustRibbon />` usage removed from `Home.tsx`. The component had no `id` attribute, so no anchor navigation is broken. The deletion is clean. This item is noted only for completeness.

---

### 4.8 LOW — `HowItWorks.tsx` CTA: Hover State Not Keyboard-Accessible

**File:** `client/src/components/HowItWorks.tsx`  
**Severity:** Low (keyboard users cannot trigger hover state)

The new ghost CTA in `HowItWorks.tsx` uses `onMouseEnter`/`onMouseLeave` for its hover style but does not include `onFocus`/`onBlur` equivalents. The `focus-visible:ring-2` class provides a focus indicator, but the background color change on hover is not replicated on keyboard focus. This is a minor WCAG 2.1 SC 1.4.11 (Non-text Contrast) gap.

---

## 5. Pre-existing Architecture Notes (Out of Scope for This Branch)

These items were discovered during the audit but are not introduced by this branch. They are documented here to ensure they are tracked.

### 5.1 `ChildrenPage` / `accountData` ID Contract Mismatch

**Files:** `client/src/components/children/ChildrenPage.tsx`, `client/src/lib/accountData.ts`  
**Risk:** High — silent data loss on child update

`handleUpdateChild` (line 249) calls `updateRemoteChild(childData.id, ...)` where `childData.id` is the **local** ID (format: `child_${timestamp}_${random}`). However, `updateRemoteChild` in `accountData.ts` (line 155) executes `.eq("id", remoteId)` — filtering by the Supabase **UUID** column, not by `local_child_id`. Since a local ID will never match a Supabase UUID, every `updateRemoteChild` call silently returns 0 rows affected and logs `PGRST116` (no rows). The local state and localStorage are updated correctly, but Supabase is never updated.

`deleteRemoteChild` (line 185) correctly uses `.eq("local_child_id", localChildId)`, so deletions work. The asymmetry between update and delete is the source of the bug.

**Required fix:** Change `updateRemoteChild` to filter by `local_child_id` instead of `id`, or pass the remote UUID through `remoteToLocal` and store it separately in the `Child` interface.

### 5.2 `Step4Confirmation.tsx` — Mock-Only Booking Flow

`Step4Confirmation` explicitly documents itself as MVP with no backend call. `handleSubmitRequest` uses `setTimeout(..., 1200)` to simulate a server round-trip and generates a random booking reference client-side. No slot is locked, no record is persisted, and no duplicate-submission prevention exists beyond the `isSubmitting` boolean (which resets to `false` after the timeout, allowing re-submission). This is acceptable for MVP but must be replaced before any real booking volume is expected.

### 5.3 `loadChildren` `useEffect` Suppressed Dependency

`ChildrenPage.tsx` line 191 suppresses the `react-hooks/exhaustive-deps` rule with a comment. The effect depends only on `isLoggedIn`, which is correct for the current logic. However, the suppression comment hides the fact that `isSupabaseConfigured` — a module-level constant — is also read inside the effect. Since it is a constant, this is safe today, but the suppression should be replaced with a proper `// eslint-disable-next-line react-hooks/exhaustive-deps -- isSupabaseConfigured is a module constant` comment to make the reasoning explicit.

---

## 6. Summary Table

| # | Severity | File | Issue | Action Required |
|---|---|---|---|---|
| 4.1 | **BLOCKING** | `HeroSection.tsx:176` | Ghost `xs:` breakpoint — layout broken on 375–479px | Remove `xs:flex-row` or register breakpoint |
| 4.2 | Medium | `HeroSection.tsx`, `Navbar.tsx`, `HowItWorks.tsx` | Inline style mutations bypass React model | Refactor to `useState` or Tailwind `hover:` variants |
| 4.3 | Medium | `HeroSection.tsx:80` | `aria-label` on `<section>` duplicates `<h1>` | Remove `aria-label` from section |
| 4.4 | Medium | `ServicesPreview.tsx:38,53,68` | Three service cards link to `#` | Route to `/start?service=X` or add "coming soon" toast |
| 4.5 | Low | `HeroSection.tsx:72` | `animClass` ignores its `_delay` parameter | Remove parameter or merge helpers |
| 4.6 | Low | `WhyTashkheesy.tsx` | `motion.section` lacks `aria-labelledby` | Add `aria-labelledby` pointing to heading |
| 4.7 | Low | `TrustRibbon.tsx` (deleted) | No anchor breakage — clean deletion | No action required |
| 4.8 | Low | `HowItWorks.tsx` | Hover state not keyboard-accessible | Add `onFocus`/`onBlur` handlers |
| 5.1 | **High (pre-existing)** | `ChildrenPage.tsx`, `accountData.ts` | `updateRemoteChild` uses wrong ID column | Fix before production — silent data loss |
| 5.2 | Medium (pre-existing) | `Step4Confirmation.tsx` | Mock-only booking — no persistence | Replace before real booking volume |
| 5.3 | Low (pre-existing) | `ChildrenPage.tsx:191` | Suppressed `exhaustive-deps` without explanation | Add explanatory comment |

---

## 7. Merge Readiness

The branch is **conditionally approved**. The single blocking item (4.1 — ghost `xs:` breakpoint) must be resolved before merge. All other findings are either medium-priority maintainability items or pre-existing issues outside this branch's scope.

**Checklist before merge:**

- [ ] Fix `xs:flex-row` → `sm:flex-row` in `HeroSection.tsx:176`
- [ ] (Recommended) Remove `aria-label` from `<section>` in `HeroSection.tsx:80`
- [ ] (Recommended) Fix `ServicesPreview.tsx` dead `#` hrefs
- [ ] Ensure `pnpm build` passes after fix
- [ ] Open a separate ticket for the `ChildrenPage` / `accountData` ID mismatch (pre-existing, high risk)

---

*This report covers commit range `5d9e6dd..93f1ee5` on branch `patch/hero-rebalancing-brand-clarity`. No merge, deploy, or production action was taken as part of this audit.*
