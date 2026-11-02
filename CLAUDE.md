# CLAUDE.md — STAYSCAPE

Guidance for Claude (and other AI coding assistants) working in this repository.
Read this file fully before making changes.

## Project summary

**STAYSCAPE — Premium Hotel Booking System**
Tagline: *"Find your stay. Make it memorable."*

A static, frontend-only hotel booking **platform**. It runs from plain HTML/CSS/JS, is hosted on Amazon S3 static website hosting, and stores demo data in the browser's `localStorage`.

It must look like a polished commercial travel platform while remaining honest that it is a demo: no backend, no real reservations, no payments.

## Hard rules (never break these)

1. **No backend, no build step.** Plain HTML5, CSS3, vanilla JavaScript only. No React/Vue, Node, Flask, Django, Spring Boot, Lambda, databases, or payment gateways.
2. **No secrets or sensitive data.** Never add AWS keys, API secrets, real admin credentials, passwords, or payment details anywhere in the source.
3. **Be honest in the UI.** Every booking is a *simulated demo*. Never imply a real reservation, real payment, real hotel partnership, live availability, or verified reviews.
4. **localStorage is not AWS.** Never claim bookings are stored in AWS. They live only in the user's browser and can be cleared.
5. **No fake security.** Email-based booking lookup and the admin page are demonstrations, not authentication. Do not claim user isolation or secure role checks.
6. **No `alert()` / `confirm()` / `prompt()`** for normal interactions. Use inline errors, toasts, and the custom accessible modal.
7. **Relative paths only** (`assets/css/styles.css`, never `/assets/...`). Every page must work on refresh from an S3 website endpoint — no server-side routing, no history-API routes.
8. **No invented contact info** and no real brand logos or partnership claims.
9. **No console errors, dead links, or broken images.**

## Folder structure

```
stayscape/
├── index.html           # Home
├── search.html          # Search results + filters
├── hotel.html           # Hotel details (?id=…)
├── checkout.html        # Booking checkout
├── confirmation.html    # Booking confirmation (?id=…)
├── bookings.html        # My bookings
├── admin.html           # Admin demo dashboard
├── about.html           # Project information
├── assets/
│   ├── css/
│   │   ├── styles.css       # Design tokens + components
│   │   └── responsive.css   # Breakpoints
│   ├── js/
│   │   ├── data.js          # Hotels, destinations, image asset list (data only)
│   │   ├── common.js        # Shared helpers, nav, storage, toasts, modal, card component
│   │   ├── search.js
│   │   ├── hotel.js
│   │   ├── checkout.js
│   │   ├── bookings.js
│   │   └── admin.js
│   └── images/
│       └── README.md        # Notes for optional local images
├── README.md
├── CLAUDE.md
└── DEPLOY_TO_S3.md
```

Keep content (HTML), styles (CSS), sample data (`data.js`), and behaviour (page JS) cleanly separated. Do not put booking logic in `data.js`.

## Design system

**Fonts:** DM Sans (body), Playfair Display (editorial headings), with system-font fallbacks.

**Colour tokens** (define once as CSS custom properties on `:root`):

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#172B3A` | Primary, headings, footer |
| `--ivory` | `#FAF8F3` | Page background |
| `--white` | `#FFFFFF` | Cards, inputs |
| `--sage` | `#879B83` | Success, secondary accents |
| `--sand` | `#E8DDCD` | Borders, soft surfaces |
| `--charcoal` | `#5F686D` | Body/muted text |
| `--copper` | `#BD825B` | Accent, primary CTAs, highlights |

**Style rules**
- Editorial luxury-travel look with modern booking usability. Generous whitespace.
- Card radius 12–18px, thin borders, subtle shadows.
- Avoid heavy gradients, neon, purple "AI" gradients, glassmorphism, and clutter.
- Animations are sparing (hover, gentle image zoom, dropdowns, subtle entrance) and must respect `prefers-reduced-motion`.
- Every interactive element needs hover, focus-visible, active, and (where relevant) loading, empty, and error states.
- Images use `object-fit: cover` with consistent aspect ratios.

## Data model

**Hotel** (in `data.js`): `id`, `name`, `city`, `location`, `image`, `gallery[]`, `description`, `pricePerNight` (INR), `rating`, `reviewCount` (sample), `stars`, `amenities[]`, `roomType`, `capacity`, `checkIn`, `checkOut`, `availability` (sample status).

- At least 12 fictional hotels across the destinations: Goa, Jaipur, Manali, Mumbai, Bengaluru, Udaipur, Noida, Delhi. (The brief says "six destinations" but lists eight — support all eight.)
- Never reuse one photo across hotels. Keep all image URLs in one central asset list so they are easy to replace.
- Label ratings, reviews, and availability as sample/demo data.

**Booking record** (localStorage): `bookingId`, `hotelId`, `hotelName`, `city`, `image`, `guestName`, `email`, `phone` (optional), `guests`, `checkIn`, `checkOut`, `nights`, `pricePerNight`, `total`, `specialRequest`, `status` (`confirmed` | `cancelled`), `createdAt`, `cancelledAt` (optional).

"Upcoming" and "Past" are derived from dates at render time; only `confirmed` / `cancelled` are stored.

**localStorage keys** (namespace everything with `stayscape:`):
- `stayscape:bookings`
- `stayscape:favourites`
- `stayscape:hotels` (admin-edited copy of the dataset, falls back to `data.js`)
- `stayscape:lastSearch`

Wrap all storage access in `try/catch` (private mode / quota / disabled storage) and degrade gracefully.

## Business logic

- **Total = nightly rate × nights.** Nights = whole days between check-in and check-out. Always recompute totals in JavaScript at submission; never trust a displayed value.
- Show the calculation transparently. Either exclude taxes/fees with a clear note or itemise sample charges — never hide fees.
- Required note on pricing: *"Demo pricing only. No actual room inventory is checked."*
- Date validation: check-in not in the past, check-out strictly after check-in. Parse `YYYY-MM-DD` as **local** dates to avoid timezone off-by-one errors.
- Guests: positive integer, ≤ the hotel's sample capacity.
- Booking IDs: unique, human-readable, e.g. `SS-YYYYMMDD-XXXXXX`. The ID on the confirmation page must match a saved record.
- Prevent double submission (disable the button while processing).
- Cancellation requires the custom modal, persists `status: "cancelled"`, and the record stays visible in history.
- **Always escape user-provided text** (name, email, special request) before inserting into HTML (use `textContent` or an `escapeHTML` helper). No unsanitised `innerHTML` with user input.

## Page requirements (short checklist)

- **Home:** sticky nav, hero with search panel, 8 destination cards, featured hotel cards, "Why STAYSCAPE", editorial banner, footer with demo disclaimer.
- **Search:** destination/dates/guests; price range, rating, amenities, destination filters; sort (recommended, price ↑/↓, rating); live result count; reset; empty state; criteria preserved when going to details and back.
- **Hotel details:** hero, gallery, amenities with icons, room info, house rules, sticky booking card (desktop) that updates totals live.
- **Checkout:** two-column desktop / one-column mobile; inline validation; itemised summary; demo disclaimer.
- **Confirmation:** heading "Your demo booking is confirmed.", booking ID, summary, `window.print()` button, links to bookings and search.
- **My bookings:** ask for booking email to filter local history and explain the limitation; Upcoming / Past / Cancelled; cancel via modal; "saved only in this browser" notice.
- **Admin:** labelled *"Administrative demonstration — local sample data only."* Stat cards, searchable/filterable bookings table, add/edit/delete hotels (local only) with confirmation dialogs. No credentials.
- **About:** problem, objectives, features, tech, workflow, S3 architecture diagram (inline SVG/CSS: Browser → S3 static website → JavaScript → localStorage), limitations, future scope.

## Accessibility & responsiveness

- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`), one `h1` per page, labels on every field, meaningful `alt` text.
- Visible `:focus-visible` outlines; keyboard-operable nav and dialogs (focus trap, `Esc` to close, return focus on close).
- Validation and toasts announced via `aria-live`; invalid fields use `aria-invalid` and `aria-describedby`.
- Colour contrast ≥ WCAG AA.
- Breakpoints to verify: 360px, 768px, 1024px, 1440px+. No horizontal page overflow. Touch targets ≥ 44px. Admin tables scroll horizontally or collapse to cards on mobile.

## Images & icons

- Hotel/destination photos from Unsplash (direct URLs). Every `<img>` needs an `onerror` fallback (neutral placeholder keeping the layout stable), plus explicit aspect ratio or dimensions to avoid layout shift.
- Lucide icons via CDN with graceful fallback if the CDN fails (the UI must remain usable without icons).
- External images/fonts/icons need internet access; document this in the README.

## Coding conventions

- Vanilla ES6+, no modules required (plain `<script>` tags, loaded in order: `data.js` → `common.js` → page script). Use `defer`.
- `const`/`let`, strict equality, small single-purpose functions, JSDoc comments on non-obvious helpers.
- Shared UI (nav, footer, toast, modal, hotel card, formatting, storage) lives in `common.js`, not duplicated per page.
- Currency formatted with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.
- CSS: design tokens in `:root`, BEM-ish class names, mobile-first, `responsive.css` for breakpoints only.
- Use direct links between HTML pages (`href="search.html"`); pass state via query string (`hotel.html?id=3&checkin=…`) or localStorage — never hash/History routes that break S3 refresh.

## Local development

No install step. Either:

```bash
# Option A: open directly
open index.html          # macOS
start index.html         # Windows

# Option B: simple local server (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Testing checklist (run before declaring work complete)

1. Inspect the file tree; confirm it matches the structure above.
2. Check every relative link and asset path; no 404s in the Network tab.
3. Console shows no errors on any page.
4. Date and price calculations: 1 night, multi-night, month boundary, check-out ≤ check-in (rejected), past dates (rejected).
5. Search: case-insensitive city, combined filters, each sort, reset, empty state.
6. Full flow: search → details → checkout → confirmation → my bookings → cancel → still listed as cancelled.
7. Refresh each page; localStorage data and favourites persist.
8. Break an image URL on purpose; fallback appears, layout holds.
9. Responsive at 360 / 768 / 1024 / 1440px; no horizontal scroll.
10. Keyboard-only pass: nav, forms, modal focus trap, `Esc`.
11. Test with localStorage disabled/cleared; the app must not crash.
12. Admin counts match actual hotel and booking data.

## Documentation to keep in sync

- `README.md` — what it is, features, run locally, structure, limitations.
- `DEPLOY_TO_S3.md` — step-by-step S3 static hosting, public-access security implications, HTTP vs HTTPS (S3 website endpoints are HTTP-only; HTTPS needs CloudFront, which is optional and may incur cost), cleanup to avoid charges.
- `assets/images/README.md` — how to add local images and licensing reminders.

If you change behaviour, data shape, or storage keys, update the docs in the same change.

## Working style

- Work in stages: design system → data → home + cards → search → details → checkout → confirmation → bookings → admin → about → testing → deployment docs.
- Don't stop at mockups; deliver working interactions.
- Fix errors before reporting completion, and state honestly anything that could not be verified.
- Prefer minimal, targeted edits to existing files over rewrites. Don't add dependencies without a strong reason.
