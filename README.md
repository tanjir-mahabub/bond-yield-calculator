# Bond Yield Calculator

A full-stack fixed income analytics web application built with **React** + **NestJS** in TypeScript throughout.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)

---

## Features

### Inputs

| Field              | Description                    |
| ------------------ | ------------------------------ |
| Face Value         | Principal amount of the bond   |
| Annual Coupon Rate | Yearly interest rate (%)       |
| Market Price       | Current traded price           |
| Years to Maturity  | Remaining life of the bond     |
| Coupon Frequency   | Annual or Semi-Annual payments |

### Outputs

- **Current Yield** — annual coupon income ÷ market price
- **Yield to Maturity (YTM)** — total annualised return if held to maturity
- **Total Interest Earned** — sum of all coupon payments over bond life
- **Premium / Discount indicator** — whether bond trades above, below, or at face value (with amount and %)

### Cash Flow Schedule

Full periodic table showing: Period · Payment Date · Coupon Payment · Cumulative Interest · Remaining Principal

---

## Tech Stack

| Layer      | Technology                         | Purpose                          |
| ---------- | ---------------------------------- | -------------------------------- |
| Frontend   | React 18, TypeScript, Vite         | UI and state management          |
| Backend    | NestJS 10, TypeScript              | REST API and domain logic        |
| Validation | class-validator, class-transformer | DTO validation and type coercion |
| Styling    | Pure CSS, mobile-first             | Responsive layout (xs → xl)      |
| Fonts      | Libre Baskerville, IBM Plex Mono   | Editorial financial aesthetic    |

---

## Project Structure

```
bond-yield-calculator/
├── backend/
│   └── src/
│       ├── main.ts              # Bootstrap: global pipe, CORS, env config
│       ├── app.module.ts        # NestJS root module
│       ├── bond.controller.ts   # HTTP boundary — routes only, no logic
│       ├── bond.service.ts      # Domain logic — YTM, yield, cash flows
│       ├── bond.dto.ts          # Input validation + response interfaces
│       └── math.utils.ts        # Pure functions: bisection solver, PV calc
│
└── frontend/
    └── src/
        ├── App.tsx              # Root orchestrator — form state + layout
        ├── main.tsx             # React entry point
        ├── index.css            # Global styles with responsive breakpoints
        ├── components/
        │   ├── BondForm.tsx     # Controlled input form (memoised)
        │   ├── MetricsGrid.tsx  # Four key metric cards (memoised)
        │   └── CashFlowTable.tsx# Paginated cash flow table (memoised)
        ├── hooks/
        │   └── useBondCalculator.ts  # API call + loading/error state
        ├── types/
        │   └── bond.ts          # Shared TypeScript interfaces
        └── utils/
            ├── api.ts           # Fetch wrapper for /api/bond/calculate
            └── format.ts        # Currency and percent formatters
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
npm run start:dev
# API running at http://localhost:3001
```

### 2. Frontend

```bash
# New terminal
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

> The Vite dev server proxies `/api` → `http://localhost:3001` so no CORS configuration is needed during development.

---

## API Reference

### `POST /api/bond/calculate`

**Request**

```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 950,
  "yearsToMaturity": 10,
  "couponFrequency": "semi-annual"
}
```

**Response**

```json
{
  "currentYield": 5.2632,
  "ytm": 5.5789,
  "totalInterestEarned": 500.0,
  "premiumOrDiscount": "discount",
  "premiumDiscountAmount": 50.0,
  "premiumDiscountPercent": 5.0,
  "cashFlowSchedule": [
    {
      "period": 1,
      "paymentDate": "2026-08-23",
      "couponPayment": 25.0,
      "cumulativeInterest": 25.0,
      "remainingPrincipal": 1000.0
    }
  ]
}
```

**Validation rules**
| Field | Rule |
|-------|------|
| faceValue | > 0 |
| annualCouponRate | 0 – 100 |
| marketPrice | > 0 |
| yearsToMaturity | 0.5 – 100 |
| couponFrequency | `"annual"` or `"semi-annual"` |

Extra fields are rejected (`forbidNonWhitelisted: true`). String numbers are auto-coerced (`@Transform`).

---

## YTM Algorithm

YTM is solved numerically using the **Bisection Method** (`math.utils.ts`):

```
PV = Σ( C / (1+r)^t ) + F / (1+r)^n
```

| Variable | Meaning                                           |
| -------- | ------------------------------------------------- |
| `C`      | Coupon payment per period                         |
| `r`      | Periodic yield rate (annualised × periodsPerYear) |
| `F`      | Face value                                        |
| `n`      | Total number of periods                           |

**Why Bisection over Newton-Raphson?**
Bond price is a strictly monotone decreasing function of yield — bisection is guaranteed to converge. Newton-Raphson can diverge near zero-coupon bonds or extreme discount/premium scenarios. 200 iterations converge to < $0.00001 accuracy.

---

## Architecture Decisions

### Backend

- **`math.utils.ts` is pure** — no NestJS imports, independently unit-testable
- **`ValidationPipe` is global** — declared once in `main.ts`, not per-route
- **CORS origins from env** — `ALLOWED_ORIGINS` env var, falls back to localhost
- **Controller has no logic** — only declares the route and delegates to service
- **`forbidNonWhitelisted: true`** — extra request fields are rejected at the boundary

### Frontend

- **`React.memo` on all components** — `BondForm` does not re-render when results update
- **`useCallback` on handlers** — stable references prevent unnecessary child renders
- **`useBondCalculator` hook** — all API state isolated; swap fetch for React Query without touching components
- **`min-width: 0` on grid children** — prevents post-calculate overflow on mobile (CSS Grid `auto` min-width bug)
- **Cached `Intl.NumberFormat`** — formatter instance created once, not on every render

---

## Environment Variables

### Backend

| Variable          | Default                 | Description                                |
| ----------------- | ----------------------- | ------------------------------------------ |
| `PORT`            | `3001`                  | API server port                            |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins               |
| `NODE_ENV`        | —                       | Set to `production` to suppress debug logs |
