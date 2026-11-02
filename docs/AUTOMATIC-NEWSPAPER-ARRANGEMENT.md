# Automatic Newspaper Arrangement & Composition Engine

## Executive Summary

Laying out a professional multi-column broadsheet by manually tweaking column spans, row heights, and text boxes takes an experienced DTP operator 30–60 minutes per page. For a solo local publisher on a tight morning deadline, this friction can be prohibitive.

This document specifies the algorithmic architecture of the **Smart Compose / Auto-Arrange Engine (स्वचालित समाचार संयोजन इंजन)**. Given a collection of 5 to 15 raw news stories with attached images, the engine deterministically generates a balanced, aesthetically authentic newspaper broadsheet in less than 2 seconds, strictly complying with traditional journalistic layout rules.

---

## 1. Traditional Newspaper Layout Principles & Heuristics

Authentic broadsheet composition is governed by time-tested editorial principles:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE A: LEAD STORY / ANCHOR (मुख्य लीड समाचार)                         │
│ • Position: Top-Center or Top-Left (below masthead)                    │
│ • Column Span: 4 to 8 columns (Wide banner headline, 36–56 pt)         │
│ • Media: Dominant hero photograph (16:9 or 3:2 aspect ratio)           │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE B: SECONDARY ANCHORS & OPINION (प्रमुख समाचार एवं द्वितीयक खबरें)    │
│ • Position: Flanking lead story or immediately below                   │
│ • Column Span: 2 to 3 columns (Headline: 20–28 pt)                     │
│ • Media: Medium photo or infographic table                             │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE C: SIDEBAR / BRIEFS (समाचार संक्षेप / एक नज़र में)                │
│ • Position: Leftmost or Rightmost single column (Full vertical run)    │
│ • Format: 4 to 8 bulleted news snippets separated by dinkus rules (✦)   │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE D: BOTTOM ANCHOR & COMMERCIAL FOOTER (निचला एंकर व विज्ञापन)      │
│ • Position: Bottom row spanning page width                             │
│ • Format: Light human-interest story OR Commercial strip ad            │
└────────────────────────────────────────────────────────────────────────┘
```

### The 7 Golden Rules of Print Newspaper Composition:

1. **Rule of Dominance:** Exactly _one_ story must dominate the page as the Lead Story. Two equally large headlines competing for eye attention ("tombstoning") is prohibited.
2. **Image Separation (No Photo Collisions):** Two photographic elements must never touch directly; they must always be separated by at least one column of editorial body copy.
3. **No Trapped White Space:** The layout must pack tightly. An empty cell or irregular hole in the middle of a page is an editorial failure.
4. **Column Alignment & Flow:** Body text must flow downwards across columns in balanced rectangular modules.
5. **Headline Size Proportionality:** Headline font sizes must strictly follow the editorial priority hierarchy: Lead ($48\text{–}64\text{ pt}$) $>$ Major ($24\text{–}32\text{ pt}$) $>$ Secondary ($16\text{–}20\text{ pt}$) $>$ Brief ($12\text{–}14\text{ pt}$).
6. **Commercial Ad Protection:** Locked advertisement spots (e.g. Bottom Banner, Quarter Page) must never be overlapped or displaced by news articles.
7. **Vertical Dynamic Balance:** Heavy graphic elements (dark photos, bold headlines) at the top must be counterbalanced by an anchor story or rule at the bottom.

---

## 2. Mathematical Model: 2D Priority Bin-Packing

The automatic arrangement engine treats page composition as a constrained **2D Modular Bin-Packing Problem** over an $N$-column grid ($N = 6$ or $8$ for broadsheet, $N = 4$ or $5$ for tabloid):

### 2.1 The Grid Formulation

Let a page be represented as a discrete matrix:
$$\mathbf{M} \in \{0, 1\}^{R \times C}$$
where $C$ is the total column count (e.g., $C = 8$), $R$ is the modular row height units (e.g., $R = 24$), and:
$$M_{r, c} = \begin{cases} 1 & \text{if cell }(r, c)\text{ is occupied (ad or placed story)} \\ 0 & \text{if cell }(r, c)\text{ is available} \end{cases}$$

### 2.2 Input Stories Array $\mathcal{S}$

Each input story $s_i \in \mathcal{S}$ has:

- Priority $P_i \in \{\text{Lead (4)}, \text{Major (3)}, \text{Standard (2)}, \text{Brief (1)}\}$
- Word count $W_i$
- HasImage $I_i \in \{0, 1\}$

### 2.3 Step-by-Step Composition Algorithm

```
ALGORITHM: SmartComposePage(PageBlueprint, StagedStories, LockedAds)
1. INITIALIZE Grid Matrix M of size R × C with 0s.
2. PLACE LockedAds: Mark corresponding cells in M as 1.
3. SORT StagedStories by Priority DESC, WordCount DESC.
   - Designate s_0 (highest priority) as LEAD_STORY.
   - Designate stories with category 'briefs' into BRIEFS_COLUMN.

4. PLACE LEAD_STORY (s_0):
   - In an 8-column broadsheet, assign ColumnSpan = 5 (or 8 if mega-lead).
   - Place at top: (r=0, c=0) or (r=0, c=1 if left briefs column is active).
   - Reserve hero image container. Mark M cells occupied.

5. PLACE BRIEFS_COLUMN (Optional / if briefs exist):
   - Assign ColumnSpan = 1, spanning entire vertical height (c=0 or c=C-1).
   - Stack brief items vertically. Mark M cells occupied.

6. PLACE MAJOR STORIES (Priority 3):
   - Find candidate rectangles in M with ColumnSpan = 2 or 3.
   - Constraint Check: Ensure image does NOT touch s_0's hero image.
   - Mark cells occupied.

7. PLACE STANDARD STORIES (Priority 2):
   - Fit into remaining 2-column or 1-column voids.

8. GAP FILLING & DENSITY PACKING:
   - If any void of height h and width w remains:
     a. Expand adjacent story column span or row span.
     b. OR inject a "Fillers & Quotes" snippet (सुविचार / आज का पंचांग / हास्य-व्यंग्य).

9. OPTICAL PASS (Micro-balancing):
   - Calculate total height delta across columns.
   - Adjust headline font sizes (±2 pt) to ensure bottom baseline alignment.
10. RETURN Optimized Page State.
```

---

## 3. Layout Patterns Generated by the Engine

The engine generates three distinct authentic front-page patterns based on publisher preference:

### Pattern A: Classic Broadsheet Dominant (परंपरागत मुख्य लीड)

- **Top:** 5-column Lead Story with 16:9 photo + 3-column Major Anchor right.
- **Middle:** 2-column Opinion piece + 4-column Double-Story split + 2-column State brief.
- **Bottom:** Full 8-column Commercial Footer Banner or Civic Anchor.

### Pattern B: Twin-Lead Anchor Spread (दोहरी बड़ी खबरें)

- **Top:** Full 8-column Masthead + Dateline.
- **Upper Zone:** Two 4-column balanced leads side-by-side with staggered headline heights and photo on opposite sides (Rule of Separation).
- **Lower Zone:** 4 stories of 2 columns each.

### Pattern C: News Digest & Sidebar Broadsheet (संक्षेप एवं प्रादेशिक दर्पण)

- **Left Column (Col 1):** "एक नज़र में" (10 brief news updates running top to bottom).
- **Cols 2–6:** Lead story and secondary reports.
- **Cols 7–8:** Commercial quarter-page sponsor ad or local crime digest.

---

## 4. UI Controls & User Override Workflow

The automated engine is built to assist the publisher, never to restrict them:

1. **"Smart Arrange / स्वतः संयोजन" Button:**
   - Located in the Canvas Topbar and Mobile Format Drawer.
   - Single tap executes the algorithm on current staged articles in $< 1\text{ s}$.
2. **"Shuffle Layout / नया लेआउट आज़माएं":**
   - Cycles through alternate permutations (Pattern A $\to$ Pattern B $\to$ Pattern C) while keeping the same news text.
3. **Manual Pinning / Locking (पिन करें):**
   - The publisher can click the "Lock Position" icon on any story (e.g. Lead Story). When "Smart Arrange" is subsequently clicked, locked stories remain frozen while unlocked stories reflow around them.
4. **Drag-and-Swap:**
   - If the publisher dislikes a specific placement, dragging Story A over Story B swaps their column spans and positions seamlessly.
