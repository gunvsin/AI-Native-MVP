# Design System Strategy: The Sovereign Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Ledger**
In the world of startup revenue marketplaces, trust is not built with flashy gradients, but with surgical precision. Ledgity's design language, "Ledger Gold," treats financial data with the reverence of a historical ledger while maintaining the speed of a modern fintech platform.

## 2. Visual Principles
- **Institutional Clarity:** High contrast, generous whitespace, and a rigid grid system.
- **Data as Hero:** Numbers are never secondary. They are highlighted using the primary gold accent to denote value and verification.
- **Sovereign Trust:** A "dark mode" that feels like a private vault and a "light mode" that feels like a clean, professional audit report.

## 3. Design Tokens

### Colors (CommBank Inspired)
- **Primary Gold:** `#FFCC00` (Used for CTAs, Verification badges, and key financial highlights)
- **Deep Charcoal:** `#1B1C1C` (Primary text, headings, and deep backgrounds)
- **Pure White:** `#FCF9F8` (Main backgrounds for light mode)
- **Surface Grey:** `#F6F3F2` (Card backgrounds and subtle section separators)
- **Verification Green:** `#27AE60` (Positive growth and status indicators)

### Typography
- **Primary Font:** `Manrope`
- **Headings:** Bold, tight tracking, high-impact (700-900 weight).
- **Body:** Clean, legible, medium tracking for financial data (400-500 weight).
- **Monospace:** Used for Transaction IDs and API keys.

### UI Geometry
- **Radius:** `4px` (Tight corners to imply professional rigidity).
- **Elevation:** Flat design. Use tonal shifts (light grey vs white) instead of heavy shadows to create depth.

## 4. Components

### Marketplace Cards
High-density data containers.
- **Header:** Startup name and category.
- **Body:** MRR, Asking Price, and Multiple (Gold highlighted).
- **Footer:** Call to action (View Details).

### Onboarding Steps
A persistent side-navigation system that tracks progress from "Introduction" to "Review & Submit."
- **Active State:** Gold border-right and high-contrast text.
- **Completed State:** Checkmark icon with institutional grey.

### Verification Badge
The "Ledger Verified" seal.
- **Style:** Gold icon on a dark background or Gold text.
- **Usage:** Applied only to revenue streams connected via Stripe or Plaid.

## 5. Implementation Notes for Firebase
When integrating with your Firebase project, ensure the `Primary Gold` is mapped to your main action classes. For the charts, use a custom color scale transitioning from `Deep Charcoal` to `Primary Gold` to represent revenue growth.