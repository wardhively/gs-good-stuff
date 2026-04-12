---
name: gs-good-stuff
description: Complete build context for G&S Good Stuff — a dahlia tuber farm operating system and live storefront PWA built on Next.js, Firebase, Leaflet, Claude API, and Stripe. Use this skill for any task involving the G&S Good Stuff project including scaffolding, building features, deploying to Firebase, configuring Firestore, implementing the storefront, working with the design system, map zones, inventory management, tuber lifecycle, offline-first PWA, weather integration, AI task generation, Stripe checkout, journal entries, equipment tracking, business planning, or the Growing Guide blog.
---

# G&S Good Stuff — Antigravity Skill

> Farm Operating System & Live Storefront for Gary & Suzy
> Addison, NY · 16 Acres · USDA Zone 5b · 42.10°N, 77.23°W

## Project Identity

- **App name:** G&S Good Stuff
- **Domain:** gsgoodstuff.com
- **Users:** Gary (field ops, iPhone, offline 80%) and Suzy (orders/shipping, desktop + iPhone)
- **Purpose:** Complete dahlia tuber farm management + public e-commerce storefront in one PWA
- **Business goal:** Scale from 100 to 80,000 tubers by 2030

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router, TypeScript) | `npx create-next-app@latest gs-good-stuff --typescript --tailwind --app --src-dir` |
| Styling | Tailwind CSS 3.x | Custom config with all design tokens below |
| PWA | @serwist/next | Service worker for offline + push notifications |
| Database | Cloud Firestore | Firebase JS SDK v10+ with offline persistence enabled |
| Auth | Firebase Auth | Email/password: gary@gsgoodstuff.com, suzy@gsgoodstuff.com |
| Storage | Firebase Storage | Photos: journal, products, receipts |
| Functions | Firebase Cloud Functions (Node.js 20) | AI cron, order webhooks, CalDAV, notifications |
| Hosting | Firebase Hosting | Serves PWA + storefront, CDN-backed |
| Maps | Leaflet.js + react-leaflet | ArcGIS tile cached in service worker. Dynamic import (no SSR). |
| Weather | Open-Meteo API | Free, no key. Coords: 42.10, -77.23 |
| AI | Anthropic Claude API (Sonnet) | Via Cloud Function. ~$5/mo |
| Payments | Stripe | @stripe/stripe-js + @stripe/react-stripe-js |
| Shipping | Pirate Ship API | Discounted USPS label generation |
| Charts | Recharts | Revenue dashboard, growth curves |
| Icons | Lucide React | Consistent stroke-based icon set |
| CI/CD | GitHub Actions -> firebase deploy | Push to main = production |

## Dependencies

```bash
npm install firebase leaflet react-leaflet recharts @stripe/stripe-js @stripe/react-stripe-js lucide-react date-fns
npm install -D @serwist/next
firebase init  # Hosting, Firestore, Functions, Storage, Auth
```

---

## File Structure

```
src/
├── app/
│   ├── (admin)/                    # Authenticated app (Gary & Suzy)
│   │   ├── layout.tsx              # Admin shell: header + bottom nav + auth guard
│   │   ├── map/page.tsx            # Map tab
│   │   ├── inventory/page.tsx      # Inventory tab
│   │   ├── tasks/page.tsx          # Tasks tab
│   │   ├── journal/page.tsx        # Journal tab
│   │   └── more/
│   │       ├── page.tsx            # More menu hub
│   │       └── [slug]/page.tsx     # Dynamic: biz, equip, orders, store, shop, rev, wx, cal, settings
│   ├── (store)/                    # Public storefront (unauthenticated)
│   │   ├── layout.tsx              # Store shell: nav, footer, social links
│   │   ├── page.tsx                # Homepage / hero
│   │   ├── shop/
│   │   │   ├── page.tsx            # Product grid
│   │   │   └── [id]/page.tsx       # Variety detail + Add to Cart
│   │   ├── blog/
│   │   │   ├── page.tsx            # Growing Guide (public journal entries)
│   │   │   └── [id]/page.tsx       # Individual blog post with share buttons
│   │   ├── about/page.tsx          # About the farm + social links
│   │   └── cart/page.tsx           # Cart + Stripe checkout
│   └── api/
│       ├── checkout/route.ts       # Stripe checkout session creation
│       └── webhook/route.ts        # Stripe webhook handler
├── components/
│   ├── ui/                         # Badge, Btn, Card, ProgressBar, etc.
│   ├── map/                        # FarmMap, ZonePolygon, ZoneDetail, WeatherBar
│   ├── admin/                      # Admin-specific components
│   └── store/                      # Store-specific components
├── lib/
│   ├── firebase.ts                 # Firebase app init + Firestore + Auth + Storage
│   ├── firestore.ts                # Collection refs, typed helpers, offline config
│   ├── auth.ts                     # Auth context provider + useAuth hook
│   ├── weather.ts                  # Open-Meteo fetch + soil temp calc + alert logic
│   ├── ai.ts                       # Claude API prompt builder + task parser
│   ├── types.ts                    # TypeScript interfaces for all data models
│   └── constants.ts                # Design tokens, status enums, Addison coordinates
├── hooks/
│   ├── useZones.ts
│   ├── useInventory.ts
│   ├── useTasks.ts
│   ├── useJournal.ts
│   └── useWeather.ts
public/
├── tiles/                          # ArcGIS tile cache (z/x/y PNGs)
functions/
└── src/
    ├── ai-tasks.ts                 # Morning task generation via Claude API
    ├── weather-cron.ts             # Scheduled weather pull + frost alerts
    ├── order-webhook.ts            # Stripe webhook -> order + inventory decrement
    ├── caldav.ts                   # CalDAV .ics feed generation
    └── notifications.ts            # Push notification dispatch
```

---

## Design System

### Color Tokens (tailwind.config.ts)

All colors must use these token names. Never hardcode hex values in components.

| Token | Hex | Usage |
|-------|-----|-------|
| soil | #4A3728 | Primary: headers, nav active, primary buttons |
| root | #332518 | Dark text, emphasis |
| petal | #C17F4E | Accent: CTAs, highlights, prices, notifications |
| petal-lt | #F5E4D2 | Accent light background |
| leaf | #5B7C4F | Success: growing status, revenue up, positive |
| leaf-lt | #E6EFE3 | Success light background |
| leaf-dk | #3D5933 | Dark green emphasis |
| bloom | #CB9B2D | Warning: sell-ready, caution, jugged |
| bloom-lt | #FCF3DC | Warning light background |
| frost | #B94A42 | Danger: alerts, overdue, urgent |
| frost-lt | #F9DEDD | Danger light background |
| creek | #3E7A8C | Info: stored status, weather, informational |
| creek-lt | #D6ECF2 | Info light background |
| cream | #FAF6EF | App background |
| linen | #FFFFFF | Card surfaces |
| clay | #F3ECE2 | Secondary surfaces, filter chips |
| fence | #E4DDD2 | Borders, dividers |
| fence-lt | #EDE7DF | Light borders |
| stone-c | #8B7D6B | Secondary text (use stone-c to avoid Tailwind conflict) |
| ash | #A99D8F | Tertiary text, placeholders |

### Typography

- **Display / Headers:** Bitter (Google Fonts), weights 600-800
- **Body / Labels:** DM Sans (Google Fonts), weights 400-700
- Load via `next/font/google` in root layout

### Component Patterns

- **Cards:** White bg, rounded-xl (14px), border border-fence-lt, p-3. Primary container for all content.
- **Badges:** Pill (rounded-full), text-[10px], font-bold, colored bg with white text. For status and source tags.
- **Buttons:** Primary = bg-soil text-white rounded-lg. Outline = bg-linen border-fence text-stone-c. Small variant for inline actions.
- **Bottom nav (mobile):** 5 tabs max. Active tab: soil-colored top bar + bold label. Lucide icons 20px.
- **Bottom sheet:** Slides up from map tap. 4px drag handle. Rounded-t-2xl. Dismissible.
- **Empty states:** Illustration + headline + brief copy + primary CTA. Never show blank screens.
- **Loading:** Skeleton screens (pulsing clay-colored rectangles). Never spinners.

---

## Status Lifecycle

The tuber lifecycle drives colors throughout the entire app:

```
stored -> jugged -> planted -> growing -> dug -> divided -> listed -> sold
                              |
                          attention (branch -- needs intervention)
```

| Status | Position | Color | Badge |
|--------|----------|-------|-------|
| stored | 1. In cooler/totes | creek | Stored |
| jugged | 2. Started in milk jugs | petal | Jugged |
| planted | 3. In ground | leaf | Planted |
| growing | 4. Active growth | leaf | Growing |
| attention | 4b. Needs intervention | frost | Attention |
| dug | 5. Harvested | stone-c | Dug |
| divided | 6. Clump divided | soil | Divided |
| listed | 7. On store | bloom | Listed |
| sold | 8. Purchased | leaf | Sold |

---

## Data Model (Firestore Collections)

### zones
```typescript
interface Zone {
  id: string;
  name: string;                    // "Zone 1 -- North Ridge"
  geometry: GeoJSON.Polygon;       // Array of [lng, lat] coords
  status: StatusEnum;              // Aggregate of varieties within
  elevation?: number;              // Feet -- affects frost risk
  drainage?: 'good' | 'fair' | 'poor';
  sun_exposure?: 'full' | 'partial' | 'shade';
  frost_risk?: 'low' | 'medium' | 'high';
  soil_notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### varieties
```typescript
interface Variety {
  id: string;
  name: string;                    // "Cafe au Lait"
  zone_id: string;                 // Ref to zone
  count: number;                   // Current tuber count
  status: StatusEnum;              // Lifecycle stage
  planted_date?: Timestamp;
  jugged_date?: Timestamp;
  expected_dig_date?: Timestamp;   // Auto: planted + 140 days
  division_yield?: number;         // Actual divisions per clump
  grade?: 'A' | 'B' | 'C';        // A=premium, B=standard, C=seconds
  price?: number;                  // Retail $/tuber when listed
  wholesale_price?: number;
  color_hex?: string;              // Swatch for UI
  bloom_form?: string;             // ADS: Dinnerplate, Ball, Decorative, etc.
  bloom_size?: string;             // AA/A/B/BB/M/MC
  height?: string;                 // Tall/Medium/Short
  season?: string;                 // Early/Mid/Late
  photo_urls?: string[];           // Firebase Storage URLs
  notes?: string;
  status_history?: Array<{ status: StatusEnum; timestamp: Timestamp; note?: string }>;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### tasks
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  source: 'ai' | 'weather' | 'equipment' | 'manual';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date: Timestamp;
  estimated_hours?: number;
  zone_id?: string;
  equipment_id?: string;
  variety_ids?: string[];
  status: 'pending' | 'accepted' | 'completed' | 'dismissed' | 'snoozed';
  calendar_event_id?: string;
  assigned_to?: string;            // "Gary" or "Suzy"
  created_at: Timestamp;
  completed_at?: Timestamp;
}
```

### journal_entries
```typescript
interface JournalEntry {
  id: string;
  title: string;
  body: string;                    // Markdown
  category: 'observation' | 'planting' | 'harvest' | 'maintenance' | 'business' | 'personal';
  zone_id?: string;
  variety_ids?: string[];          // Tagged varieties -- photos flow to store
  photo_urls?: string[];           // Firebase Storage URLs
  is_public?: boolean;             // If true -> published to Growing Guide blog
  public_title?: string;           // Edited title for blog
  public_body?: string;            // Edited body for blog
  weather_snapshot?: { temp_hi: number; temp_lo: number; conditions: string; precip: number };
  author: string;                  // "Gary" or "Suzy"
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### equipment
```typescript
interface Equipment {
  id: string;
  name: string;                    // "Kubota L2501"
  type: string;                    // Tractor, Implement, Generator
  make_model?: string;
  photo_url?: string;
  current_hours: number;           // Running total
  service_items: Array<{
    type: string;                  // "Oil Change"
    interval_hours: number;        // 250
    last_completed_at?: Timestamp;
    last_cost?: number;
  }>;
  maintenance_log?: Array<{
    date: Timestamp;
    type: string;
    notes?: string;
    cost?: number;
    receipt_url?: string;
  }>;
  status: 'ok' | 'due_soon' | 'overdue'; // Computed from hours vs interval
}
```

### orders
```typescript
interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent?: string;  // For refunds
  customer_name: string;
  customer_email: string;
  shipping_address: {
    line1: string; line2?: string; city: string; state: string; zip: string; country: string;
  };
  items: Array<{
    variety_id: string; name: string; quantity: number; unit_price: number;
  }>;
  subtotal: number;
  shipping_cost: number;
  discount?: number;
  total: number;
  status: 'pending' | 'packing' | 'shipped' | 'fulfilled' | 'refunded';
  tracking_number?: string;
  shipped_at?: Timestamp;
  created_at: Timestamp;
  notes?: string;
}
```

### weather_log
```typescript
interface WeatherLog {
  id: string;                      // "YYYY-MM-DD"
  date: string;
  forecast_json: object;           // Full 7-day from Open-Meteo
  actual_high: number;
  actual_low: number;
  precip_inches: number;
  soil_temp_est: number;           // Rolling avg calc
  frost_alert: boolean;            // True if any hour <= 32 F
}
```

### business_plan
```typescript
interface BusinessPlan {
  id: string;                      // Year: "2026"
  year: number;
  targets: { production: number; planted: number; sold: number; revenue: number; varieties: number; stock_purchase: number };
  actuals: { production: number; planted: number; sold: number; revenue: number; varieties: number; stock_purchase: number };
  milestones: Array<{ title: string; completed: boolean; completed_at?: Timestamp }>;
  budget: Array<{ category: string; budgeted: number; actual: number }>;
  notes?: string;
}
```

### settings (singleton doc)
```typescript
interface Settings {
  farm_name: string;               // "G&S Good Stuff"
  location: { lat: 42.10; lng: -77.23; elevation: 1020; zone: '5b' };
  last_frost_date: string;         // "05-15"
  first_frost_date: string;        // "10-01"
  stripe_account_id?: string;
  shipping_flat_rate: number;      // 9.45
  free_shipping_threshold: number; // 150
  notification_prefs: Record<string, { frost_alerts: boolean; morning_brief: boolean; orders: boolean; equipment: boolean; weekly_summary: boolean }>;
  social_links: { instagram: string; tiktok: string; facebook: string; pinterest: string };
  cooler_sensor_id?: string;
  cooler_safe_range: { min: 38; max: 48 };
}
```

---

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin (Gary & Suzy) -- full access
    match /zones/{doc} { allow read, write: if request.auth != null; }
    match /tasks/{doc} { allow read, write: if request.auth != null; }
    match /equipment/{doc} { allow read, write: if request.auth != null; }
    match /weather_log/{doc} { allow read, write: if request.auth != null; }
    match /business_plan/{doc} { allow read, write: if request.auth != null; }

    // Varieties -- admin full access, public sees listed only
    match /varieties/{doc} {
      allow read, write: if request.auth != null;
      allow read: if resource.data.status == 'listed' && resource.data.count > 0;
    }

    // Journal -- admin full access, public sees is_public only
    match /journal_entries/{doc} {
      allow read, write: if request.auth != null;
      allow read: if resource.data.is_public == true;
    }

    // Orders -- admin full access, webhook can create
    match /orders/{doc} {
      allow read, write: if request.auth != null;
      allow create: if true;  // Webhook creates orders
    }

    // Settings -- admin full access, public reads store config only
    match /settings/{doc} {
      allow read, write: if request.auth != null;
      allow read: if true;  // Public needs social_links, store config
    }
  }
}
```

---

## Cloud Functions

### ai-tasks (Scheduled: daily 6:00 AM ET)

**Flow:**
1. Fetch 7-day forecast from Open-Meteo for 42.10 N, 77.23 W (hourly: temp, precip, wind)
2. Read all zones + varieties from Firestore
3. Read all equipment with service status
4. Read last 5 journal entries
5. Read settings for frost dates and thresholds
6. Build Claude API prompt (see template below)
7. Call Anthropic API (claude-sonnet-4-20250514, max_tokens 2000)
8. Parse JSON response into task objects
9. Write tasks to Firestore
10. Send push notification: "Good morning, Gary. X tasks today."

**Claude API Prompt:**

System: `You are an AI farm advisor for a dahlia tuber operation in Addison, NY (Zone 5b, 42.10 N 77.23 W, 1020ft elevation, Canisteo River valley). Last frost May 15, first frost Oct 1. 138-day growing season. Generate a prioritized daily task list based on weather, inventory, and equipment state. Return ONLY a JSON array of task objects with fields: title, description, priority (urgent|high|medium|low), due_date, source (ai|weather|equipment), zone_id (optional), equipment_id (optional), estimated_hours.`

User: `Today is {date}. WEATHER: {7day_forecast_json}. ZONES: {zones_with_varieties_json}. EQUIPMENT: {equipment_json}. RECENT JOURNAL: {last_5_entries}. Generate tasks for today and the next 7 days.`

### weather-cron (Scheduled: every 6 hours)

1. Fetch from `https://api.open-meteo.com/v1/forecast?latitude=42.10&longitude=-77.23&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York`
2. Save to weather_log (one doc per day)
3. Soil temp estimate: `7_day_rolling_avg((high + low) / 2) * 0.85`
4. Frost check: if ANY hour <= 32 F during May 15 - Oct 1 -> push notification immediately
5. Rain check: if weekly total > 3 inches -> flag drainage concern
6. Cooler sensor: fetch temp from WiFi sensor API, alert if outside 38-48 F

### order-webhook (HTTP POST)

1. Verify Stripe webhook signature
2. On `checkout.session.completed`: create order doc in Firestore
3. Decrement variety count for each line item (Firestore transaction -- atomic)
4. If variety count reaches 0, set status to 'sold'
5. Send confirmation email to customer
6. Push notification to Suzy: "New order: $X from {name}"

### caldav (HTTP GET /api/calendar.ics)

1. Read all tasks with status 'accepted'
2. Read key dates from settings (last frost, first frost)
3. Generate .ics with VEVENT per task (title, due date, description, 1hr reminder)
4. Return with `Content-Type: text/calendar`
5. Gary subscribes in iPhone Settings -> Accounts -> Add Subscribed Calendar

### notifications

- Firebase Cloud Messaging (FCM)
- Categories: frost_alert (immediate), morning_brief (6AM), order_received (immediate), equipment_due (daily), weekly_summary (Sunday 6PM), cooler_alarm (immediate)
- Respect per-user prefs from settings doc

---

## Offline-First Rules

These are NON-NEGOTIABLE. Gary is offline 80% of the time.

1. **Service worker caches:** App shell, ArcGIS tiles (zoom 14-19 for property bbox), Google Fonts, icons
2. **Firestore offline persistence:** Enable on init. All reads from cache first. Writes queue locally.
3. **Always-cached collections:** zones, varieties, tasks, equipment, settings, weather_log (last 7 days), journal_entries (last 30)
4. **Online-only collections:** orders, customers (Suzy manages from WiFi)
5. **Photo capture offline:** Save to IndexedDB as blobs. Upload to Firebase Storage when online. Show pending indicator.
6. **Sync indicator in header:** Green dot = synced, amber = pending writes, red = offline. Tappable for detail.
7. **Leaflet map:** ArcGIS tiles pre-cached. Falls back to OpenStreetMap if not cached. Map bounds constrained to property.
8. **Weather data:** Show stale data with "Last updated: X hours ago" when offline.

---

## Map Implementation

- Use `react-leaflet` with `next/dynamic` (ssr: false)
- Base layer: `L.TileLayer` -> `/tiles/{z}/{x}/{y}.png` (ArcGIS cached tiles)
- Fallback: OpenStreetMap when tiles not cached
- Center: [42.10, -77.23], default zoom: 16, bounds: property bbox, max zoom: 19
- Zones: Leaflet Polygon from GeoJSON. Fill = statusColor[zone.status] at 20% opacity (40% selected). Stroke = same color, 1px dashed (2px solid selected).
- Zone labels: name + count centered via L.Tooltip
- Click zone -> bottom sheet with zone detail
- Long-press empty -> draw new zone polygon (Leaflet.Draw or custom)
- ArcGIS tiles: exported from ArcGIS Pro as z/x/y PNGs, stored in /public/tiles/, pre-cached by service worker on install (~50MB for 16 acres at zoom 14-19)

---

## Stripe Integration

- Stripe Checkout (embedded or hosted)
- API route `src/app/api/checkout/route.ts` creates checkout session with line items + shipping
- Webhook `src/app/api/webhook/route.ts` handles `checkout.session.completed`
- Inventory decrement via Firestore transaction (atomic -- prevents overselling)
- Shipping: flat rate $9.45, free at $150+ (configurable in settings)
- Promo codes: Stripe Promotion Codes
- Refunds: Suzy initiates from Orders screen -> Stripe Refund API via Cloud Function
- Use test keys during dev. Live keys at store launch.

---

## Storefront SEO

- Each variety: `/shop/[id]` with dynamic OG metadata + first photo as OG image
- Each blog post: `/blog/[id]` with slug from title. Article structured data.
- Sitemap at `/sitemap.xml` including all listed varieties + public blog posts
- robots.txt: allow all, disallow /admin routes
- Social share: OG images (1200x630) generated per variety with name, photo, price, branding
- Blog posts: share buttons for Instagram, TikTok, Facebook, Pinterest -> native share sheet
- Product <-> Blog cross-linking: variety detail shows related blog posts, blog posts show "Shop tubers" CTA

---

## Business Manager

### Dashboard
- Year banner: current year, X of 5, target 80K by 2030
- KPI cards: Revenue, Sold, Planted -- actual vs target
- Progress bars: Production, Sold, Revenue, Varieties, Stock -- all vs annual plan
- Milestones checklist (from business_plan doc)
- Budget vs actual by category

### Annual Plan
- 12-month scrollable timeline for Addison NY
- Phases: Dividing (petal), Jugging (bloom), Bed Prep (creek), Planting (leaf), Growing (leaf), Frost Watch (frost), Dig Season (frost)
- Current month highlighted with NOW badge
- Key dates: May 15 last frost, Oct 1 first frost, 138-day season

### 5-Year Roadmap
- Cards for 2026-2030. Active year = live data. Future = plan targets.
- Each: year, projected revenue, Planted/Produced/Sold metrics, milestones
- Growth curve bar chart: 100 -> 82,432

### Auto-updating actuals (Firestore triggers)
- Variety status -> 'planted': increment actuals.planted
- Variety status -> 'divided': add division count to actuals.production
- Order created: increment actuals.sold + actuals.revenue
- Variety created: increment actuals.varieties

---

## Social Links

All storefront pages include social links to:
- Instagram: @gsgoodstuff
- TikTok: @gsgoodstuff
- Facebook: G&S Good Stuff
- Pinterest: G&S Good Stuff

Social icons appear in: hero banner, About page, site footer.
Blog posts include share buttons that open native share sheet with caption + URL.

---

## Build Phases (Mission Order)

Execute in this order. Each phase ships a usable product.

| Phase | Week | Scope |
|-------|------|-------|
| 1. Foundation | 1 | Next.js + Firebase + Tailwind tokens + Auth + admin layout shell |
| 2. Map | 2 | Leaflet + zone CRUD + zone detail + weather bar |
| 3. Inventory | 3 | Variety CRUD + status lifecycle + filters + bulk update |
| 4. Journal | 4 | Entry CRUD + photo capture/upload + tagging + public toggle |
| 5. Tasks + AI | 5-6 | Task UI + Cloud Function + Claude API + push notifications |
| 6. Equipment | 6 | Equipment CRUD + service tracking + auto-task at 90% interval |
| 7. Weather | 7 | Open-Meteo integration + detail page + frost alerts + soil temp |
| 8. Business Mgr | 7 | Dashboard + annual plan + 5-year roadmap + auto-actuals |
| 9. Storefront | 8-9 | Store layout + product grid + Stripe checkout + order webhook |
| 10. Orders | 9 | Order management + packing slip + shipping label + emails |
| 11. Revenue | 10 | Dashboard + projections + variety ROI + AI recommendations |
| 12. Blog + Social | 10 | Growing Guide + blog pages + share buttons + SEO + sitemap |
| 13. Calendar | 11 | CalDAV feed + in-app calendar + iPhone subscription |
| 14. Settings | 11 | Notification prefs + Stripe config + data export |
| 15. Polish | 12 | Loading states + error handling + empty states + animations + a11y |

---

## Testing Checklist

### Offline
- [ ] All admin screens render with Service Workers -> Offline enabled
- [ ] Can create journal entry with photo offline; syncs on reconnect
- [ ] Can change variety status offline; map updates locally
- [ ] Map renders with cached ArcGIS tiles offline
- [ ] Weather bar shows stale data with "Last updated" indicator

### Mobile
- [ ] PWA installs to iPhone home screen with correct icon/splash
- [ ] Push notifications arrive (frost, morning brief, orders)
- [ ] Camera capture works for journal photos
- [ ] Bottom nav respects safe area on newer iPhones
- [ ] Map pinch-zoom smooth; zone taps work with fingers

### Store
- [ ] Only varieties with status 'listed' AND count > 0 appear
- [ ] Stripe test checkout completes; order appears in admin; inventory decrements
- [ ] Variety disappears from store when count reaches 0
- [ ] Blog renders; share buttons work; SEO metadata present

### AI
- [ ] Morning cron fires at 6AM ET; tasks appear in Firestore
- [ ] Tasks reference correct zones and equipment
- [ ] Frost alert generates urgent task identifying correct zones
- [ ] AI doesn't hallucinate varieties/zones that don't exist

### Data Integrity
- [ ] Order creation is atomic (inventory decrement fails -> order rolls back)
- [ ] Two simultaneous orders don't oversell (Firestore transaction)
- [ ] Business plan actuals auto-update on status changes and sales
- [ ] CalDAV feed generates valid .ics that iPhone can subscribe to
