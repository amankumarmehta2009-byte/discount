# DISCOUNT — Smart Shopping Ecosystem

**Tagline:** One Search. Every Store. Best Deal.

A runnable MVP starter containing:
- Responsive Next.js web app
- FastAPI backend with demo product/search/comparison/coupon/offer endpoints
- PostgreSQL schema and demo seed data
- Chrome Manifest V3 extension (popup + side panel + product detection)
- Admin dashboard starter
- Setup and integration documentation

> **Important:** Demo records are explicitly labelled. The starter does not scrape stores or claim live prices. Connect authorised APIs, affiliate feeds, or approved data providers before launching real comparisons.

## Repository structure

```text
DISCOUNT/
├── apps/
│   └── web/                 # Next.js web application
├── services/
│   └── api/                 # FastAPI backend
├── extension/               # Chrome Manifest V3 extension
├── database/                # PostgreSQL schema and seed data
├── docs/                    # Integration and deployment notes
├── .env.example
└── docker-compose.yml
```

## Requirements

- Node.js 20+
- Python 3.11+
- Docker Desktop (recommended for PostgreSQL)
- Google Chrome (for unpacked extension testing)

## 1. Start PostgreSQL

```bash
docker compose up -d db
```

The database is available on `localhost:5432`:
- database: `discount`
- username: `discount_user`
- password: `change_me_local`

For a local demo, the API can also run without PostgreSQL using its in-memory demo catalogue.

## 2. Start the API

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for interactive API documentation.

## 3. Start the web app

In a second terminal:

```bash
cd apps/web
npm install
cp ../../.env.example .env.local
npm run dev
```

Open http://localhost:3000.

## 4. Load the Chrome extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `DISCOUNT/extension` folder.
5. Open a supported product page on Amazon India, Flipkart, Meesho, or Myntra.
6. Click the DISCOUNT extension icon. The side panel can be opened from the extension UI.

The extension uses the API URL configured in `extension/config.js`. For local development it defaults to `http://localhost:8000`.

## 5. Configure environment variables

Copy `.env.example` and set secure values. Never commit real secrets.

## MVP functionality

- Product search and product detail pages
- Comparable listing view and effective-price calculator
- Price history endpoint and graph-ready data
- Coupon and bank-offer display
- Watchlist/price-alert API starter
- Chrome extension product detection, popup, side panel and manual fallback
- Admin overview starter

## Not production-ready yet

Before public launch, implement and test:
- Real authorised store/affiliate integrations and product variant matching
- User authentication, password reset, email verification and session security
- Persistent repository layer and database migrations
- Background price polling, alert delivery and notification preferences
- Marketplace payments, seller verification, dispute workflows and legal review
- Admin RBAC, audit logs, rate limiting, monitoring and security testing
- Privacy policy, terms, consent and data-retention controls

See `docs/ROADMAP.md` and `docs/INTEGRATIONS.md`.
