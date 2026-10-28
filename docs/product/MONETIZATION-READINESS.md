# E-PAPER STUDIO — MONETIZATION READINESS SPECIFICATION

## 1. Executive Strategy & Boundary Principles

While actual third-party payment gateways (such as Razorpay or Stripe) and paywalls are deliberately excluded from this engineering phase to prevent speculative bloat, the application architecture must establish clean, provider-agnostic interfaces for future commercial monetization.

---

## 2. Entitlement & Tier Boundaries

Future commercialization can differentiate tiers through clear capability flags without altering the core document schema:

| Capability / Feature Flag      | Starter Tier (Community / Free)                    | Pro Publisher Tier (Subscription)                   | Enterprise / Media House                      |
| :----------------------------- | :------------------------------------------------- | :-------------------------------------------------- | :-------------------------------------------- |
| **Page Count per Publication** | Up to 2 pages                                      | Up to 16 pages                                      | Unlimited pages                               |
| **Export Formats**             | Standard Vector PDF (with subtle footer watermark) | Clean Vector PDF (no watermark), PNG raster spreads | High-res PDF/X-1a, CMYK print pre-flight, SVG |
| **Available Paper Formats**    | A4, Tabloid                                        | Broadsheet, Berliner, Tabloid, A3, A4, Custom       | All + Custom press roll dimensions            |
| **Cloud Storage Slots**        | 3 local / synced drafts                            | 100 cloud publications + revisions                  | Unlimited + Organization workspaces           |
| **Devanagari Font Catalog**    | 4 core fonts                                       | All 8 curated OFL fonts + Custom TTF upload         | All + Licensed foundry typeface loading       |
| **Collaboration**              | Single editor                                      | 3 concurrent contributors                           | Full multi-seat editorial desk roles          |

---

## 3. Provider-Independent Subscription Model

The architecture abstracts subscription verification through a clean interface:

```typescript
export interface UserSubscriptionContext {
  userId: string;
  tier: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  expiresAt?: string;
  entitlements: {
    maxPagesPerDocument: number;
    canExportWatermarkFree: boolean;
    allowedPageSizes: Array<'broadsheet' | 'berliner' | 'tabloid' | 'a3' | 'a4'>;
    canUploadCustomFonts: boolean;
    cloudStorageLimit: number;
  };
}

export const DEFAULT_ANONYMOUS_ENTITLEMENTS: UserSubscriptionContext['entitlements'] = {
  maxPagesPerDocument: 8,
  canExportWatermarkFree: true, // Permissive during MVP testing
  allowedPageSizes: ['broadsheet', 'berliner', 'tabloid', 'a3', 'a4'],
  canUploadCustomFonts: false,
  cloudStorageLimit: 10,
};
```

---

## 4. Architectural Rules for Future Billing Integration

1. **No Fake Paywalls or Broken Checkout Buttons**: Never display disabled or non-functional payment dialogs to active users during production use.
2. **Document Schema Decoupling**: The newspaper JSON document format (`NewspaperDocument`) remains strictly format-agnostic; it contains zero payment or billing metadata.
3. **Database Isolation**: Future subscription billing records (e.g. `user_subscriptions`, `invoices`, `usage_ledger`) remain in an isolated schema extension without modifying core document JSON columns.
