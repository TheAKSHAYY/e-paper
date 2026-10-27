# Product Requirements Document (PRD) — E-Paper Studio

## 1. Executive Summary

**E-Paper Studio** is a cloud-native SaaS platform designed for authors, newsrooms, productivity creators, and organizations to author, generate, and distribute beautiful, high-contrast digital publications tailored specifically for e-paper (electronic ink) devices and high-resolution print.

Target hardware includes:

- Amazon Kindle Scribe (10.2", 300 DPI)
- reMarkable 2 & Paper Pro (10.3", 226/229 DPI)
- Kobo Elipsa & Libra series
- Onyx Boox Tab Ultra / Note Air
- Supernote A5X / Nomad
- Standard Archival Print (A4, A5)

---

## 2. Target Personas

1. **Digital Periodical Publishers & Journalists**: Publishing daily or weekly bespoke newsletters, morning briefings, and community newspapers formatted for distraction-free reading.
2. **Productivity & Journal Creators**: Designing customized digital planners, bullet journals, habit trackers, and calendars with hyperlinked navigation for stylus note-taking tablets.
3. **Enterprise & Technical Teams**: Generating automated executive summaries, analytical digests, and compliance reports formatted for reading on e-ink tablets.

---

## 3. Core Features & Capabilities

### 3.1 Document & Template Studio (apps/web)

- **Visual Composition Canvas**: Block-based canvas designed with e-paper physical dimensions and aspect ratios.
- **E-Ink Grayscale Simulator**: Live preview mode rendering the layout in 16-level grayscale with simulated e-ink electrophoretic contrast.
- **Pre-Built Template Library**:
  - Classic broadsheet and tabloid newspapers (multi-column flow, drop caps, headline banners).
  - Weekly and monthly hyperlinked productivity planners.
  - Morning digests (curated feeds, weather, calendar integration).
  - Crosswords, puzzles, and interactive reading challenges.

### 3.2 Multilingual Typography Engine (packages/typography)

- Optical weight correction to prevent thin stroke dropouts at 200–300 DPI.
- Multi-script font support:
  - Latin & Extended Cyrillic (e.g., Literata, Newsreader)
  - Arabic & Hebrew (complex right-to-left shaping with ligatures)
  - CJK (Chinese, Japanese, Korean ideographs with baseline harmonization)
  - Devanagari & South Asian scripts
- Automated column balancing and orphan/widow suppression across all languages.

### 3.3 High-Fidelity Rendering & PDF Generation (apps/renderer)

- Headless Chromium rendering engine using Playwright to generate PDF/A compliant vector documents.
- True vector text embedding (selectable, searchable, crisp on high-DPI screens).
- Optional image dithering (Floyd-Steinberg / Atkinson algorithms) optimized for 1-bit and 4-bit (16 levels) e-paper screens.
- Hyperlink generation for PDF internal page-to-page navigation (essential for planners).

### 3.4 Publishing & Delivery Automation

- **Scheduled Publishing**: Automated daily/weekly issue compilation.
- **Delivery Channels**:
  - "Send-to-Kindle" email integration.
  - Direct cloud sync integration (reMarkable Cloud API, Dropbox, Google Drive).
  - RSS / Webhook delivery.
  - Direct download links via Supabase Storage signed URLs.

### 3.5 SaaS Subscriptions & Billing

- **Tier Free**: Single publication, manual PDF export, community templates.
- **Tier Pro**: Unlimited publications, automated daily delivery, custom fonts, Send-to-Kindle automation.
- **Tier Team / Enterprise**: Team collaboration, custom branding, API access, self-hosted font storage.

---

## 4. Non-Functional Requirements

- **Performance**: PDF compilation for 10-page publication completes in < 3.5 seconds.
- **Scalability**: Decoupled asynchronous worker queue capable of handling thousands of concurrent issue deliveries.
- **Reliability**: Worker fault tolerance with retry policies and dead-letter queues.
- **Security**: Strict tenant isolation via Supabase Row-Level Security (RLS) and sanitization of user content prior to Chromium rendering.
