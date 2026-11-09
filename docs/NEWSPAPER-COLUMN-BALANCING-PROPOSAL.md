# Phase 2A — Intelligent Newspaper Composition & Column Balancing Architecture (Revised)

**Status:** Architecture & Technical Specification (Phase 2A Revision)  
**Date:** November 2, 2026  
**Target:** Professional Newspaper Composition for Multilingual & Devanagari Publishers  
**Constraints:** Analysis & Specification Only — Zero Application Code Modified

---

## 1. Executive Summary & Problem Diagnosis

Existing page layouts in E-Paper Studio exhibit noticeable visual defects when publishers add or modify content:

1. **Narrow Vertical Strips:** Long articles forced into 1-column spans create 800px tall, unreadable vertical ribbons.
2. **Accidental White-Space Voids:** Rows containing mixed-length articles leave large empty boxes underneath shorter stories because CSS grid row tracks expand to match the tallest article in that row.
3. **Horizontal Span Wrap Gaps:** Adding an article that exceeds remaining column tracks in a row forces an early wrap, leaving right-hand columns completely hollow.
4. **Suffocating vs. Hollow Extremes:** The layout engine lacks distinction between intentional editorial white space and accidental gaps.

This revised specification defines the **Modular Newspaper Composition Engine (MNCE)**. It replaces 1D horizontal row-wrapping with a **True 2D Modular Rectangle Decomposition model**, selects algorithms based on rigorous algorithmic comparison, establishes Devanagari readability rules, respects locked editorial obstacles, and isolates pagination boundaries.

---

## 2. True 2D Layout Model

### A. Why Horizontal Bands Are Insufficient

A layout model that merely groups stories into horizontal bands whose spans sum to $C$ (the page column count) fails in vertical space balancing:

- Suppose a band spanning 4 columns contains Article A ($S=2$, 400 words $\to 350\text{px}$ tall) and Article B ($S=2$, 80 words $\to 130\text{px}$ tall).
- If treated as a single horizontal band, the band height is locked to $350\text{px}$.
- The space underneath Article B ($2\text{ cols} \times 220\text{px}$) remains an unfillable void unless the 2D space beneath Article B is modeled as an independent rectangular slot where secondary articles can stack vertically.

### B. The 2D Modular Grid Coordinate Space

The page content area is formalized as a continuous 2D Cartesian region subdivided into discrete horizontal column tracks and vertical grid units:

- **Horizontal Tracks:** $C \in \{4, 6, 8, 12\}$ column tracks.
  - Column track $c \in [0, C-1]$ starts at:
    $$x_c = X_{\text{origin}} + c \cdot (W_{\text{col}} + G_{\text{col}})$$
  - Width for span $S$:
    $$W(S) = S \cdot W_{\text{col}} + (S - 1) \cdot G_{\text{col}}$$
- **Vertical Metric Space:** Continuous vertical coordinate $y \in [Y_{\min}, Y_{\max}]$ measured in PostScript points ($72\text{ pt/inch}$) and physical millimeters ($25.4\text{ mm/inch}$).
- **Modular Article Rectangle:** Every article package $k$ occupies an Axis-Aligned Bounding Box (AABB):
  $$R_k = \{ x_k, y_k, w_k, h_k, S_k, c_{\text{start}} \}$$
  Where:
  - $c_{\text{start}} \in [0, C - S_k]$ is the starting column index.
  - $w_k = W(S_k)$ is the physical width.
  - $h_k = H_{\text{req}}(A_k, S_k, c_{\text{inner}})$ is the elastic required height calculated from content volume and inner column count.
  - $y_k$ is the vertical baseline position.

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header / Masthead (Immutable Top Margin)                │
├──────────────────────────────┬──────────────────────────────┤
│ Article 1 (Lead, S=2)        │ Article 2 (Major, S=2)       │
│ y: 0, h: 320pt               │ y: 0, h: 140pt               │
│                              ├──────────────────────────────┤
│                              │ Article 3 (Stacked, S=2)     │
│                              │ y: 154pt, h: 166pt           │
├──────────────────────────────┴──────────────────────────────┤
│ Horizontal Section Rule (Aligned Baseline at y = 334pt)      │
├─────────────────────────────────────────────────────────────┤
│ Article 4 (Anchor Banner / Ad, S=4, y: 340pt, h: 120pt)      │
└─────────────────────────────────────────────────────────────┘
```

### C. Available Rectangular Region Tracking

The engine models available space using an **Occupancy Rectangle Ledger** $\mathcal{L}_{\text{free}}$:

1. Initially, $\mathcal{L}_{\text{free}} = \{ \text{PrintableArea} \}$.
2. Locked elements and fixed advertisements are subtracted from $\mathcal{L}_{\text{free}}$, splitting free space into maximal disjoint rectangular regions.
3. As articles are placed, remaining free regions update dynamically.

---

## 3. Algorithm Selection & Comparative Analysis

We evaluate four distinct algorithmic paradigms for newspaper page composition:

| Algorithm Paradigm                                   |   Time Complexity    | Space Complexity | Strengths                                                                                                                                             | Weaknesses                                                                                                                                                 | Suitability for Newspaper Studio  |
| :--------------------------------------------------- | :------------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------: |
| **1. Greedy First-Fit Decreasing (FFD)**             |    $O(N \log N)$     |      $O(N)$      | Simplest to implement; immediate execution (<1ms).                                                                                                    | Trapped in local sub-optima; leaves large jagged voids; cannot pair short articles together under a tall neighbor.                                         |     ❌ Poor editorial quality     |
| **2. Skyline / MaxRects 2D Bin Packing**             | $O(N^2)$ to $O(N^3)$ |      $O(N)$      | Proven 2D geometric efficiency; prevents overlaps by construction.                                                                                    | Assumes rigid, fixed-dimension rectangles. In journalism, article height is **elastic** (changes dynamically with column span).                            | ❌ Incompatible with elastic text |
| **3. Pure Branch-and-Bound / Backtracking**          | $O(S^N)$ worst-case  |      $O(N)$      | Finds mathematically optimal global score; guarantees optimal baselines.                                                                              | Exponential state expansion. For $N=12$ stories with 4 span choices, $4^{12} \approx 16.7\text{M}$ leaves; risks 50–200ms UI pauses without heavy pruning. | ⚠️ Over-engineered, latency risk  |
| **4. Hybrid Deterministic Modular Heuristic (HDMH)** |   $O(N \cdot C^2)$   |    $O(N + C)$    | **Recommended.** Bounded search space; models 2D modular sector decomposition; handles elastic text heights natively; deterministic; <10ms execution. | Requires structured sector splitting heuristics.                                                                                                           |          **Recommended**          |

### Recommendation & Justification: Hybrid Deterministic Modular Heuristic (HDMH)

The **Hybrid Deterministic Modular Heuristic (HDMH)** is recommended because:

1. Real newspaper layouts are **modular**, not arbitrary 2D packing puzzles. Human editors arrange pages into 2 to 4 vertical sectors (Lead Sector, Mid-Page Body, Bottom Anchor/Ad Band).
2. By decomposing the page into horizontal bands and allowing multi-story vertical column stacking within multi-column sectors, HDMH combines the global alignment of modular design with the flexibility of 2D sub-slotting.
3. Its computational complexity is strictly polynomial: $O(N \cdot C^2)$. For an 8-column broadsheet with 10 articles, the solver evaluates fewer than 640 states, executing in **< 8ms** on any standard client browser without web workers or server round-trips.

---

## 4. Algorithmic Pseudocode (HDMH Engine)

```typescript
function balanceNewspaperPage(
  page: NewspaperPage,
  doc: NewspaperDocument,
  options: BalancingOptions
): BalancingResult {
  const columnCount = resolvePageColumnCount(doc, page);
  const bounds = getPageLayoutBounds(page, doc);

  // 1. Separate Locked and Unlocked Elements
  const lockedArticles = page.articles.filter((a) => a.locked || a.lockPosition);
  const unlockedArticles = page.articles.filter((a) => !a.locked && !a.lockPosition);

  // 2. Build Obstacle Map from Locked Articles and Ads
  const obstacleMap = buildObstacleMap(lockedArticles, bounds, columnCount);

  // 3. Sort Unlocked Articles by Editorial Importance and Content Volume
  const sortedArticles = sortEditorialPriority(unlockedArticles);

  // 4. Calculate Content Volume and Permissible Span Matrix
  const candidateProfiles = sortedArticles.map((art) => {
    return calculatePermissibleSpans(art, columnCount, doc.layout);
  });

  // 5. Partition Page into Modular Vertical Bands
  const bands = generateModularBands(bounds, obstacleMap, candidateProfiles, columnCount);

  // 6. Pack Articles into Bands with 2D Vertical Column Stacking
  const placements: PlacedArticle[] = [];
  for (const band of bands) {
    const bandPlacements = solveBandPlacement(band, candidateProfiles, columnCount);
    placements.push(...bandPlacements);
  }

  // 7. Tune Inner Multi-Columns and Micro-Spacing
  harmonizeBaselinesAndInnerColumns(placements, doc.layout);

  // 8. Evaluate Score and Verify Acceptance Criteria
  const score = evaluateLayoutScore(placements, bounds, obstacleMap);
  const overflowIssues = detectUnplacedArticles(unlockedArticles, placements);

  return {
    balancedArticles: assembleBalancedArticles(page.articles, placements),
    score,
    overflowIssues,
    hasChanges: checkHasGeometryChanged(page.articles, placements),
  };
}
```

---

## 5. Article Readability & Inner Column Constraints

Inner multi-column body formatting must **never be set blindly equal to the outer page column span**. Doing so causes severe typographical collapse in Devanagari script.

### A. Physical Column Width Limits for Devanagari Script

In Devanagari typography, words cannot be hyphenated arbitrarily without severing complex conjuncts (_samyuktaksaras_) and vowel signs (_matras_).

- An average Hindi news word occupies 5.5 characters ($\approx 32\text{pt}$ at $10\text{pt}$ font size).
- Long compound words (e.g., `अंतरराष्ट्रीय`, `पर्यावरणविदों`, `विश्वविद्यालय`) measure $65 - 85\text{pt}$ wide.
- If a column is narrower than **$45\text{mm}$ ($128\text{pt}$)**, lines hold only 2 to 3 words. Under justified text alignment (`text-align: justify; text-justify: inter-word;`), this produces severe typographical rivers (wide empty white gaps between words) and clipped conjuncts.

### B. Inner Body Column Selection Rules

Let:

- $S_{\text{outer}}$ = Outer grid column span ($1$ to $C$).
- $W(S_{\text{outer}})$ = Physical width of the article container.
- $W_{\text{inner}}(c) = \frac{W(S_{\text{outer}}) - (c - 1) \cdot G_{\text{inner}}}{c}$ = Width of an individual inner body column.
- $N_{\text{words}}$ = Total word count of the article body.

The inner column count $c_{\text{inner}}$ is determined deterministically:

$$ \begin{cases}
c_{\text{inner}} = 1, & \text{if } S_{\text{outer}} = 1 \text{ or } N_{\text{words}} < 120 \\
c_{\text{inner}} = 2, & \text{if } S_{\text{outer}} \in \{2, 3\} \text{ and } N_{\text{words}} \ge 120 \text{ and } W_{\text{inner}}(2) \ge 45\text{mm} \\
c_{\text{inner}} = 3, & \text{if } S_{\text{outer}} \ge 3 \text{ and } N_{\text{words}} \ge 280 \text{ and } W_{\text{inner}}(3) \ge 45\text{mm} \\
c_{\text{inner}} = 4, & \text{if } S_{\text{outer}} \ge 5 \text{ and } N_{\text{words}} \ge 500 \text{ and } W_{\text{inner}}(4) \ge 50\text{mm} \\
c_{\text{inner}} = 1, & \text{otherwise (fallback to preserve readable line measure)}
\end{cases}$$

### C. Column Gap and Divider Rules
- **Inner Column Gap:** $G_{\text{inner}} = 12\text{pt} - 14\text{pt}$ (proportional to body font size).
- **Column Divider Rule:** `1px solid #cbd5e1` (rendered only when $c_{\text{inner}} \ge 2$ and column width $\ge 50\text{mm}$).

---

## 6. Editorial Control & Obstacle Preservation

The balancer adheres to strict editorial preservation invariants:

```
┌────────────────────────────────────────────────────────┐
│ EDITORIAL PRESERVATION INVARIANTS                      │
├────────────────────────────────────────────────────────┤
│ 1. NEVER relocate an article with locked === true      │
│ 2. NEVER change dimensions of an ad or locked banner   │
│ 3. NEVER modify an article with lockPosition === true  │
│ 4. PRESERVE column span if lockSpan === true           │
│ 5. NEVER truncate or delete body text                  │
│ 6. NEVER shrink font sizes below readability minimums  │
└────────────────────────────────────────────────────────┘
```

1. **Locked Articles (`art.locked === true`):**
   - Coordinates ($x, y, w, h$), column spans, and inner columns remain strictly fixed.
   - The balancer generates layout bands *around* locked articles.
2. **Manually Positioned Articles (`art.lockPosition === true`):**
   - Pinned to their existing coordinates. Treated as immutable spatial obstacles.
3. **Locked Column Spans (`art.lockSpan === true`):**
   - The engine may reorder or adjust the vertical baseline of the article, but its `columnSpan` is locked to the publisher's chosen integer.
4. **Advertisements (`elementType === 'advertisement'`):**
   - Advertisements have fixed commercial contracts (e.g., "Page 1 Bottom Banner, $4\text{ col} \times 100\text{mm}$" or "Ear Panel, $1\text{ col} \times 40\text{mm}$").
   - Advertisements are automatically marked as `locked: true` upon placement unless explicitly unlocked by the publisher.
5. **Reserved Empty Regions:**
   - Intentional editorial breathing room or designated ad placeholders (`isReserved: true`) are modeled as obstacles with zero text content, preventing the balancer from filling them.

---

## 7. White-Space Classification & Scoring Function

Newspaper composition does not strive for 100% ink coverage. Commercial broadsheets target **84% to 91% editorial density**, with the remaining space serving as structural breathing room.

### A. Classification of White Space

```
White Space Types:
├── 1. Accidental Voids (UNDESIRABLE)
│   ├── Horizontal wrap hole (empty column slot next to short story)
│   └── Vertical cliff (200px gap under short story in tall row)
├── 2. Intentional Editorial Space (DESIRABLE)
│   ├── Headline sinkage (8-16pt breathing room above kicker/headline)
│   ├── Paragraph indentations (12pt first-line indent)
│   └── Section rule gutters (4-8pt margin around horizontal rules)
└── 3. Reserved Space (PROTECTED)
    ├── Commercial ad reservations
    └── Photo white borders / caption gutters
```

### B. Objective Balancing Cost Function

The balance score for any candidate page layout is evaluated via an objective cost function $J(\mathcal{P})$:

$$J(\mathcal{P}) = w_1 \cdot C_{\text{void}} + w_2 \cdot C_{\text{variance}} + w_3 \cdot C_{\text{priority}} + w_4 \cdot C_{\text{aspect}} + w_5 \cdot C_{\text{density}}$$

Where:
1. **Accidental Void Penalty ($C_{\text{void}}$):**
   $$C_{\text{void}} = \sum_{\text{voids}} \left(\frac{\text{Area}_{\text{void}}}{\text{Area}_{\text{printable}}}\right)^2 \times 1000$$
   *Quadratic penalty heavily penalizes large contiguous gaping holes.*
2. **Baseline Height Variance ($C_{\text{variance}}$):**
   $$C_{\text{variance}} = \sum_{\text{bands}} \sum_{c=1}^{C} \left( y_{\text{bottom}, c} - \bar{y}_{\text{band}} \right)^2$$
   *Measures baseline misalignment across columns in the same band.*
3. **Editorial Priority Inversion ($C_{\text{priority}}$):**
   $$C_{\text{priority}} = \sum_{A_i, A_j} \max(0, y_i - y_j) \quad \text{for } \text{Priority}(A_i) > \text{Priority}(A_j)$$
   *Penalizes placing a `minor` story physically higher on the page than a `lead` story.*
4. **Aspect Ratio Distortion ($C_{\text{aspect}}$):**
   $$C_{\text{aspect}} = \sum_{A_i} \left| \log\left(\frac{AR_{\text{actual}}(A_i)}{AR_{\text{target}}(A_i)}\right) \right|$$
   *Penalizes tall skinny ribbons ($AR < 0.3$) or wide flat pancakes ($AR > 4.0$).*
5. **Density Target Deviation ($C_{\text{density}}$):**
   $$C_{\text{density}} = \left| \text{Density}_{\text{actual}} - 0.88 \right| \times 200$$
   *Rewards overall page density near the sweet spot of 88%, avoiding over-crowding (>96%) or under-filling (<75%).*

---

## 8. Pagination Scope & Overflow Handling

In strict compliance with user instructions:
- **No Automatic Relocation across Pages:** The engine will **NOT** silently push articles to Page 2 or Page 3 during Phase 2A/2B.
- **Reporting Overset Content:** When total article content exceeds the printable area of the current page, the balancer:
  1. Fills the current page with the highest-priority articles up to optimal density ($88\%$).
  2. Flags remaining unplaced articles in a clear, publisher-facing **Editorial Overset Notice**:
     > **"अतिरिक्त सामग्री चेतावनी (Overflow Advisory):"**
     > 2 लेख (व्यापार समाचार, खेल संक्षेप) इस पृष्ठ पर सुरक्षित रूप से नहीं समा सकते। कृपया पृष्ठ का आकार बदलें या इन लेखों को पृष्ठ 2 पर स्थानांतरित करें।
  3. Leaves the unplaced articles in the page's staging shelf without deleting their text.

---

## 9. Measurable Acceptance Criteria & Benchmarking Plan

### A. Acceptance Criteria Matrix

| Criterion | Metric | Tolerance | Verification Tool |
| :--- | :--- | :---: | :--- |
| **No Content Loss** | Word and character count before vs. after | Exactly 0 difference | Automated string checksum |
| **No Geometric Overlaps** | Pairwise AABB intersection area | Exactly $0.0\text{ mm}^2$ | Geometric collision detector |
| **No Text Clipping** | Container height vs. required scroll height | $h_{\text{container}} \ge h_{\text{required}}$ | Phase 1 DOM measurement |
| **Locked Element Invariance** | Coordinate delta for locked items ($\Delta x, \Delta y, \Delta w, \Delta h$) | Exactly $0.0\text{ mm}$ | Asserted equality |
| **Minimum Column Measure** | Width of any body column | $\ge 45\text{ mm}$ ($128\text{ pt}$) | Layout rule validator |
| **Canvas vs. PDF Parity** | Physical layout coordinates in editor vs. PDF output | $\le 0.5\text{ pt}$ | Visual regression test |
| **Determinism** | Output AST over 100 consecutive runs with identical input | 100% identical hash | Determinism regression test |

### B. Benchmarking Plan across Page Column Configurations
Performance will be measured using high-resolution monotonic timers (`performance.now()`) on standard client hardware:

| Configuration | Test Document Description | Max Allowed Latency | Target Latency |
| :--- | :--- | :---: | :---: |
| **4-Column Tabloid** | 5 articles (1 lead, 2 major, 2 minor) | $< 16\text{ ms}$ (1 frame) | $< 4\text{ ms}$ |
| **6-Column Broadsheet** | 8 articles + 1 locked bottom advertisement | $< 25\text{ ms}$ | $< 8\text{ ms}$ |
| **8-Column Broadsheet** | 12 articles + 2 locked ads + 1 lead package | $< 35\text{ ms}$ | $< 12\text{ ms}$ |
| **12-Column Modular Grid** | 14 articles + mixed spans (2 to 6 cols) | $< 50\text{ ms}$ | $< 18\text{ ms}$ |

---

## 10. Test Scenarios Matrix

```
Test Cases:
├── TC-01: Standard 4-Col Tabloid (Lead + 3 Articles)
├── TC-02: 6-Col Broadsheet with Locked Bottom Banner Ad
├── TC-03: Heavy Devanagari Conjuncts & Matra Readability Check
├── TC-04: Fixed-Height Article Safety Integration (Phase 1 Protection)
├── TC-05: Multi-Story Column Stacking (Tall Lead next to 2 Short Stories)
├── TC-06: Manually Pinned Center Story with Dynamic Surrounding Balancing
├── TC-07: Overfilled Page Overset Reporting (Zero Silent Spillover)
└── TC-08: Complete Undo/Redo Transaction Parity
```

---

## 11. Incremental Implementation Plan

Implementation will proceed in atomic steps only after explicit user approval:

```mermaid
flowchart LR
    Step1["Step 1: Core Balancing Engine (balancer.ts)"] --> Step2["Step 2: Readability & Devanagari Tuner"]
    Step2 --> Step3["Step 3: Locked Element & Obstacle Guard"]
    Step3 --> Step4["Step 4: Auto-Arrange Modal & Undo Transaction"]
    Step4 --> Step5["Step 5: Visual E2E & Performance Benchmarks"]
```

1. **Step 1: Core 2D Balancing Engine (`packages/template-engine/src/balancer.ts`)**
   - Implement `calculatePermissibleSpans` and `solveModularBands`.
   - Unit tests covering 4-col and 6-col permutations.
2. **Step 2: Readability & Devanagari Column Width Tuner**
   - Implement inner column selection formula based on physical millimeter limits.
   - Assert zero column widths $<45\text{mm}$.
3. **Step 3: Locked Obstacle & Editorial Constraint Guard**
   - Implement obstacle subtraction and immutable preservation for locked elements.
4. **Step 4: Interactive Auto-Arrange Modal (`apps/web/src/components/studio/AutoArrangeModal.tsx`)**
   - Build side-by-side visual preview, movement ledger, and undo/redo support.
5. **Step 5: Monorepo Verification & Visual Playwright Benchmarks**
   - Run typecheck, lint, unit tests, and performance benchmark suite.

---

*This revised specification is submitted for review. No application code has been modified.*
$$
