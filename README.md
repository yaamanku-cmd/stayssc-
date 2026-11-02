# STAYSCAPE — Hotel Booking System

> **Find your stay. Make it memorable.**

STAYSCAPE is a premium, **ultra-responsive hotel discovery and booking platform**. It demonstrates an end-to-end luxury travel workflow (search → multi-criteria filtering → details → live price calculation → checkout → confirmation → booking history) using semantic HTML, modern CSS, modular vanilla JavaScript, and browser `localStorage`. It is designed to be hosted seamlessly as a static site on Amazon S3.

> ⚠️ **This is a demonstration.** No real hotels, reservations, availability, or payments are involved. All hotels, prices, ratings, and reviews are fictional sample data.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Run locally](#run-locally)
5. [How the demo booking works](#how-the-demo-booking-works)
6. [Pages](#pages)
7. [Deploy to Amazon S3](#deploy-to-amazon-s3)
8. [Known limitations](#known-limitations)
9. [Future scope](#future-scope)
10. [Images and credits](#images-and-credits)

---

## Features

- **Home page** with hero search panel, destination cards, featured hotels, value propositions, and an editorial banner.
- **Search & filters:** destination, dates, guests, price range, rating, amenities, and sorting (recommended, price low→high, price high→low, rating).
- **Hotel details:** hero image, gallery, amenities, room info, house rules, and a live price calculator.
- **Checkout** with inline validation and an itemised price summary.
- **Confirmation page** with a unique demo booking ID and printable summary.
- **My bookings:** upcoming, past, and cancelled demo bookings with an accessible cancellation dialog.
- **Favourites** that persist across visits.
- **Admin demo dashboard** with statistics, a searchable bookings table, and local add/edit/delete for sample hotels.
- **About page** describing the problem, objectives, architecture, limitations, and future scope.
- **Responsive & accessible:** works from 360px mobile to 1440px+ desktop, keyboard navigable, respects `prefers-reduced-motion`.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend Structure | HTML5 (semantic) |
| Frontend Styling | CSS3 (custom properties, Grid, Flexbox, responsive breakpoints) |
| Frontend Behaviour | Vanilla JavaScript (ES6+) & React 18 (Discovery engine) |
| Backend Runtime | Node.js (v18+) |
| Backend Framework | Express 5 with CORS & request logging |
| Persistence | Persistent JSON file database with atomic updates (`stayscape.json`) |
| API Client | `assets/js/api.js` (auto-detects connectivity with graceful offline fallback) |
| Icons | Lucide (CDN, with fallback) |
| Fonts | DM Sans & Playfair Display (Google Fonts, with system fallbacks) |
| Testing | Native Node.js test runner (`node --test`) |
| Hosting Options | Node.js server (`http://localhost:5000`) or Amazon S3 static website hosting |

## Project structure

```
stayscape/
├── index.html               # Home
├── search.html              # Search results + filters (React 18)
├── hotel.html               # Hotel details (?id=…)
├── checkout.html            # Booking checkout
├── confirmation.html        # Booking confirmation (?id=…)
├── bookings.html            # My bookings & cancellation
├── admin.html               # Admin demo dashboard & inventory CRUD
├── about.html               # Project information
├── server.js                # Express backend server entry point
├── package.json             # Dependencies and scripts (start, dev, test)
├── BACKEND_API.md           # Complete REST API specifications & endpoints
├── backend/
│   ├── database/
│   │   ├── db.js            # Atomic persistence service
│   │   ├── seedData.js      # Curated hotels, destinations, demo bookings
│   │   └── data/            # Generated persistent database file
│   ├── controllers/
│   │   ├── hotelsController.js
│   │   ├── bookingsController.js
│   │   ├── adminController.js
│   │   └── reviewsController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   └── routes/
│       ├── hotelsRoutes.js
│       ├── bookingsRoutes.js
│       ├── adminRoutes.js
│       ├── destinationsRoutes.js
│       ├── reviewsRoutes.js
│       └── apiRoutes.js
├── tests/
│   └── api.test.js          # Automated backend test suite
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── api.js           # REST API client SDK
│   │   ├── data.js          # Sample dataset
│   │   ├── common.js        # Shared helpers, nav, storage, toasts, modal
│   │   ├── search-react.js  # Discovery engine
│   │   ├── hotel.js
│   │   ├── checkout.js
│   │   ├── bookings.js
│   │   └── admin.js
│   └── images/              # Local images
├── README.md
├── CLAUDE.md
└── DEPLOY_TO_S3.md
```

## Run locally

### Option 1 — Full Stack (Recommended)

Start the Node.js / Express backend server:

```bash
npm install
npm start
```

Then visit:
- **Web App:** <http://localhost:5000>
- **API Documentation:** <http://localhost:5000/api/docs>
- **API Health:** <http://localhost:5000/api/health>

To run in development watch mode:
```bash
npm run dev
```

To run the automated backend test suite:
```bash
npm test
```

### Option 2 — Static Offline Mode

The application is engineered with an offline fallback. If the backend is not running, all pages automatically fall back to browser `localStorage` and display a "Demo Storage" badge.

Double-click `index.html` or run:
```bash
python -m http.server 8000
```

An internet connection is needed for photos, fonts, and icons because they load from external CDNs. If they fail, the site shows neutral fallbacks and remains usable.

## How the demo booking works

1. **Search** — choose a destination, dates, and guests (or browse featured stays).
2. **Filter & sort** — narrow results by price, rating, amenities, and destination.
3. **View details** — open a hotel to see its gallery, amenities, and rules.
4. **Pick dates** — the total updates live:

   ```
   Total room price = nightly rate × number of nights
   ```

   Taxes/fees are either excluded with a clear note or itemised as sample charges. *Demo pricing only. No actual room inventory is checked.*
5. **Checkout** — enter guest details. Inputs are validated (required fields, email format, date order, guest capacity).
6. **Save** — the price is recalculated in JavaScript, a unique booking ID is generated, and the record is saved to `localStorage`.
7. **Confirmation** — shows the saved booking, clearly labelled as a simulated demo.
8. **My bookings** — view upcoming, past, and cancelled bookings. Cancelling updates the saved status; the record stays in history.

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Hero search, destinations, featured stays |
| Search | `search.html` | Results, filters, sorting |
| Hotel details | `hotel.html?id=…` | Gallery, amenities, booking card |
| Checkout | `checkout.html` | Guest form and price summary |
| Confirmation | `confirmation.html?id=…` | Demo booking summary |
| My bookings | `bookings.html` | Booking history & cancellation |
| Admin demo | `admin.html` | Sample statistics and hotel management |
| About | `about.html` | Project documentation |

Each page is a separate HTML file, so refreshing any page works on S3 without server-side routing.

## Deploy to Amazon S3

See **[DEPLOY_TO_S3.md](DEPLOY_TO_S3.md)** for the full guide. In short:

1. Create an S3 bucket.
2. Enable **Static website hosting** with `index.html` as the index document.
3. Upload all project files, preserving the folder structure.
4. Review the public-access and bucket-policy implications **before** making the site public.
5. Open the S3 website endpoint to test.

Notes:
- S3 website endpoints serve **HTTP only**. HTTPS requires an additional service such as CloudFront (optional, may incur cost).
- No AWS keys or secrets are used in the frontend.
- Remember to delete the bucket and files when you are finished to avoid charges.

## Known limitations

- **Not a real booking system.** There is no backend, real inventory, payment, or hotel integration.
- **Data is stored only in your browser** (`localStorage`). It is not in AWS, is not shared between devices or browsers, and disappears if browser data is cleared.
- **No real authentication.** The "My bookings" email filter and the admin page are demonstrations only — they are *not* secure and do not isolate users on a shared browser.
- **Sample content.** Hotels, prices, ratings, review counts, and availability are fictional and static.
- **External dependencies.** Photos, fonts, and icons depend on internet access and third-party availability.
- Admin changes affect only the local browser's sample data.

## Future scope

- User authentication and accounts
- Backend APIs and a persistent database
- Real-time availability and inventory checks
- Payment gateway integration
- Email confirmations
- Reviews from verified guests
- Map-based search and multi-room bookings
- HTTPS and a custom domain via a CDN

## Images and credits

- Hotel and destination photographs are loaded from [Unsplash](https://unsplash.com) via direct URLs. Check the licence/terms before reuse, and credit photographers where appropriate.
- All image URLs are listed in one place (`assets/js/data.js`) and can be swapped for local files in `assets/images/`.
- Icons by [Lucide](https://lucide.dev). Fonts by Google Fonts.
- Hotel names and details are fictional. No partnership with any real hotel or booking brand is implied.

---

© STAYSCAPE Luxury Stays. All rights reserved.
