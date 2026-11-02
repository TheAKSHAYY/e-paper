# PDF Preflight & Quality Assurance Specification

## Executive Summary

In commercial printing and professional e-paper distribution, discovering a missing headline, an overflowing paragraph, a blurry photo, or an outdated dateline _after_ sending 10,000 copies to a web-offset press or distributing a PDF to thousands of subscribers represents a critical failure.

Traditional desktop publishing software solves this via a **Preflight Engine** (an automated quality audit conducted prior to document output). This document specifies the comprehensive **12-Point PDF Preflight & Validation Engine** for E-Paper Studio, defining the diagnostic checks, severity levels, automated fixes, and user interface.

---

## 1. Preflight Architecture & Execution Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ USER ACTION: "Export PDF" or "Preflight Check"                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PREFLIGHT AUDITOR (12 Automated Diagnostic Rules)                      │
│ 1. Page Boundary & Text Overflow Check (DOM geometric calculation)     │
│ 2. Devanagari Glyph & Font Embedding Validation                        │
│ 3. Image Resolution & Broken Asset Verification                        │
│ 4. Masthead Metadata Consistency (Date, Issue No., Edition)            │
│ 5. Empty Story & Unassigned Slot Detection                             │
│ 6. Column Grid Alignment & Overlap Protection                          │
│ 7. Advertisement Spot Verification                                     │
│ 8. Story Continuation Jump Integrity Check                             │
│ 9. Color Space & E-Ink Grayscale Contrast Audit                        │
│ 10. Margin & Printable Safe-Zone Violation Check                       │
│ 11. Multi-Page Numbering Sequence Check                                │
│ 12. File Size & Asset Budget Estimation                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PREFLIGHT REPORT DIALOG                                                │
│ • 🔴 BLOCKERS (Must fix to export)                                     │
│ • 🟡 WARNINGS (Can ignore with explicit confirmation)                  │
│ • 🟢 PASSED CHECKS                                                     │
│ [1-Click Auto-Fix]      [Ignore & Export Anyway]      [Cancel / Fix]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 12 Preflight Diagnostic Rules

| Rule ID   | Diagnostic Check                           |  Severity  | Validation Mechanism                                                                                           | 1-Click Auto-Fix Action                                                |
| :-------- | :----------------------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **PF-01** | **Text Overset / Content Overflow**        | 🔴 Blocker | `scrollHeight > clientHeight + 4px` on any article container.                                                  | Trigger Level-2 Micro-Copyfit or insert Page Continuation Jump.        |
| **PF-02** | **Devanagari Font Integrity**              | 🔴 Blocker | Verify `document.fonts.check()` for `Noto Sans Devanagari`, `Noto Serif Devanagari`, and `Yatra One`.          | Trigger silent font re-fetch and wait for `document.fonts.ready`.      |
| **PF-03** | **Broken or Missing Images**               | 🔴 Blocker | Test image naturalWidth $> 0$ and HTTP status $200$. Flag missing placeholder slots.                           | Replace with default editorial category graphic or delete image frame. |
| **PF-04** | **Low-Resolution Image Alert**             | 🟡 Warning | Calculate effective DPI: $(\text{Pixel Width} / \text{Physical Width In Inches})$. Warn if $< 150\text{ DPI}$. | Apply subtle sharpening filter or downscale frame display dimensions.  |
| **PF-05** | **Date & Edition Consistency**             | 🟡 Warning | Compare Masthead `date` against system wall-clock date. Warn if date is in the past.                           | "Update to Today's Date" button updates string and issue number.       |
| **PF-06** | **Empty Story Slots**                      | 🟡 Warning | Identify any `Article` on canvas where `content.trim().length === 0` or headline is default placeholder.       | Delete empty card or pull next available story from News Library.      |
| **PF-07** | **Physical Margin Violation**              | 🔴 Blocker | Bounding box check: any element positioned $< 8\text{ mm}$ from paper edge without explicit bleed flag.        | Snap element back inside standard page margins.                        |
| **PF-08** | **Story Continuation Jump Integrity**      | 🔴 Blocker | For stories marked with `continuationTargetPageId`, verify target page exists and continuation node is placed. | Create linked continuation node on target page automatically.          |
| **PF-09** | **Commercial Ad Spot Check**               | 🟡 Warning | Check whether locked advertiser slots (e.g. Ear Ad, Footer Banner) contain creative images.                    | Fill with in-house subscription promo or blank out frame.              |
| **PF-10** | **Page Numbering Sequence**                | 🟡 Warning | Verify pages are indexed sequentially ($1, 2, 3, \dots, N$) without missing or duplicate numbers.              | Re-index page sequence monotonically.                                  |
| **PF-11** | **Extreme Leading / Typography Collision** | 🟡 Warning | Check line-height on Devanagari text; warn if $< 1.25$ (risk of top matra colliding with bottom conjunct).     | Reset line-height to safe default ($1.35$).                            |
| **PF-12** | **Total Payload Size Estimation**          |  🟢 Info   | Estimate final PDF byte size based on embedded high-res assets. Warn if $> 25\text{ MB}$ for web e-paper.      | Enable image downsampling to $150\text{ DPI}$ web mode.                |

---

## 3. Data Schema: `PreflightReport`

```typescript
export type PreflightSeverity = 'blocker' | 'warning' | 'info' | 'pass';

export interface PreflightIssue {
  id: string;
  ruleId: string;
  severity: PreflightSeverity;
  pageNumber?: number;
  articleId?: string;
  title: string;
  message: string;
  autoFixAvailable: boolean;
  autoFixActionName?: string;
}

export interface PreflightReport {
  timestamp: string;
  totalChecksRun: number;
  blockerCount: number;
  warningCount: number;
  infoCount: number;
  isReadyForExport: boolean; // true if blockerCount === 0
  issues: PreflightIssue[];
}
```

---

## 4. UI/UX Specification: The Preflight Dialog

### 4.1 Visual Presentation

The Preflight Modal appears automatically when the user clicks **"PDF / Export"** or manually selects **"Preflight Audit"** from the top bar:

```
┌────────────────────────────────────────────────────────────────────────┐
│ PREFLIGHT QUALITY REPORT / प्रीफ़्लाइट गुणवत्ता जांच                   │
├────────────────────────────────────────────────────────────────────────┤
│ STATUS: ⚠️ 1 Blocker, 2 Warnings Detected                              │
│                                                                        │
│ 🔴 BLOCKER: Page 1 - Lead Article Overflow                             │
│    Headline: "राजधानी में मूसलाधार बारिश से जनजीवन प्रभावित..."       │
│    Issue: 48 words overset at base of Column 3.                        │
│    [ ⚡ Auto-Fit Copy ]   [ 📄 Split to Page 2 ]   [ ✏️ Edit Text ]   │
│                                                                        │
│ 🟡 WARNING: Page 2 - Low Resolution Image                              │
│    Issue: Event photo is 112 DPI (Recommended ≥ 200 DPI).             │
│    [ Ignore & Proceed ]   [ Replace Photo ]                            │
│                                                                        │
│ 🟡 WARNING: Masthead Date is Yesterday                                 │
│    Issue: Masthead date set to 1 Nov 2026 (Today is 2 Nov 2026).       │
│    [ ⚡ Update to Today ]                                              │
│                                                                        │
│ 🟢 PASSED CHECKS:                                                      │
│    ✓ All Devanagari fonts embedded as sharp vector outlines            │
│    ✓ Page margins within printable bounds                              │
│    ✓ All commercial ad spots verified                                  │
├────────────────────────────────────────────────────────────────────────┤
│ [ Cancel ]             [ Export Anyway (Bypass Warnings) ]             │
│                        [ RESOLVE ALL BLOCKERS (1) ]                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Publisher Safeguards

1. **Blocker Prevention:** The primary **"Download PDF"** button is disabled whenever `blockerCount > 0`. A publisher cannot accidentally print clipped headlines or blank pages.
2. **One-Click "Resolve All":** Clicking "Resolve All" executes all automated Level-1 and Level-2 fixes (auto-copyfit, font re-fetch, date synchronization) in a single transaction, turning all items green without requiring manual intervention.
3. **Emergency Bypass Option:** If a publisher is under an extreme printing deadline and knowingly accepts a warning, they can click "Bypass & Export", which logs the override and proceeds to render.
