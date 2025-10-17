# CircleSave Design Guidelines

## Design Approach
**System-Based:** Drawing from modern FinTech leaders (Stripe, Wise, Revolut) with shadcn/ui components. Emphasis on clarity, trust, and data hierarchy essential for financial applications.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 221 83% 53% (Trust blue - professional banking)
- Background: 0 0% 100%
- Card: 0 0% 98%
- Border: 214 32% 91%
- Muted: 210 40% 96%
- Success: 142 76% 36% (Contributions/positive)
- Warning: 38 92% 50% (Upcoming payments)
- Destructive: 0 84% 60% (Overdue/alerts)

**Dark Mode:**
- Primary: 217 91% 60%
- Background: 222 47% 11%
- Card: 217 33% 17%
- Border: 217 33% 24%
- Success: 142 71% 45%

### B. Typography
**Fonts:** Inter (primary), JetBrains Mono (amounts/numbers)
- Headings: Inter 600-700 (text-2xl to text-4xl)
- Body: Inter 400-500 (text-sm to text-base)
- Financial Amounts: JetBrains Mono 600 (tabular-nums for alignment)
- Labels: Inter 500 text-xs uppercase tracking-wide

### C. Layout System
**Spacing Units:** 4, 6, 8, 12, 16, 24 (p-4, gap-6, m-8 pattern)
- Section padding: py-16 to py-24
- Card padding: p-6 to p-8
- Component gaps: gap-4 to gap-6
- Container: max-w-7xl mx-auto px-4

### D. Component Library

**Navigation:**
- Top nav: Glassmorphic header with backdrop-blur-lg, border-b
- Include: Logo, main links, notifications bell (with badge), user avatar dropdown
- Mobile: Sheet-based drawer navigation

**Hero Section:**
- Full-width gradient background (primary to primary-muted)
- Large hero image showing diverse group of people collaborating financially
- Headline + subheadline in white overlaid on image with dark overlay (bg-black/40)
- Two CTAs: Primary solid button + Ghost/outline with backdrop-blur-md
- Trust indicators below: "£2M+ saved together" badges

**Dashboard Cards:**
- Active savings circles as grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card shows: Circle name, current round number, progress bar (shadcn Progress), next payout date, contribution status badge
- Hover: subtle shadow-lg transition
- Use Card, CardHeader, CardContent, CardFooter from shadcn

**Data Displays:**
- Transaction history: Table with alternating row colors
- Contribution timeline: Vertical stepper with Check/Clock icons
- Member list: Avatar group with Tooltip for names
- Financial summary: Stats grid with large numbers (text-3xl font-mono)

**Status Indicators:**
- Badges: "Active" (success), "Pending" (warning), "Completed" (muted), "Your Turn" (primary)
- Progress bars: Multi-segment for contribution rounds
- Icons: CircleDollarSign, Users, TrendingUp, Calendar from lucide-react

**Forms:**
- Create Circle wizard: Multi-step with Progress indicator
- Contribution forms: Large amount input with currency symbol, date picker for schedule
- Validation: Inline error states with destructive colors

**Interactive Elements:**
- Action cards: Bordered cards with hover:border-primary transition
- Quick actions: Floating action button (bottom-right) for "New Contribution"
- Modals: Dialog/AlertDialog for confirmations (withdraw, leave circle)

### E. Images Section

**Hero Image:** 
Full-width banner (1920x800px) showing diverse group of friends/family around a table with laptops and phones, representing trust and collaboration. Apply dark overlay (40% opacity) for text legibility. Position at top of landing page.

**Dashboard Illustrations:**
- Empty state: Illustrated graphic of people forming a circle (400x300px) for "No active circles" state
- Success illustrations: Celebration graphic when payout received

**Trust Section:**
- Small partner/security badges (120x60px) showing bank-level encryption
- Team photos in "About" section showing real people behind platform

## Page-Specific Layouts

**Landing Page (7 sections):**
1. Hero with image + CTA buttons with blur background
2. How It Works: 3-column grid with numbered steps, icons
3. Benefits: Staggered 2-column feature cards with illustrations
4. Trust & Security: Centered content with badge grid below
5. Live Stats: Animated counter showing total circles, members, saved amount
6. Testimonials: 3-column card grid with avatars
7. Footer: 4-column grid (Product, Company, Resources, Newsletter signup)

**Dashboard:**
- Top metrics row: 4 stat cards showing total saved, active circles, next payout, pending contributions
- Main grid: Active circles cards
- Sidebar: Upcoming events, quick actions, recent activity feed

**Circle Detail Page:**
- Header with circle name, member avatars, settings
- Contribution timeline (left) + Member status table (right)
- Payment schedule calendar below
- Floating "Make Contribution" button

## Animations
Minimal and purposeful:
- Card hover: translate-y-[-4px] transition-transform
- Button interactions: Built-in shadcn states
- Number counters: Count-up effect on stats (use react-countup)
- Progress bars: Smooth width transitions

## Accessibility
- Maintain WCAG AAA contrast ratios (7:1 for text)
- All financial amounts with aria-labels including full currency
- Keyboard navigation for all interactive elements
- Dark mode toggle with system preference detection
- Focus indicators: ring-2 ring-offset-2 ring-primary