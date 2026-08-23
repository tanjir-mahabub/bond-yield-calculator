# Fixed Income Analytics Workbench

A production-minded bond analytics application built with React 19, TypeScript, Vite, and NestJS. It turns a simple yield calculator into an interactive fixed-income workbench with cash-flow valuation, interest-rate risk, scenario analysis, and resilient client-side execution.

## Product capabilities

- Yield to maturity solved numerically with a bounded bisection algorithm
- Current yield and effective annual yield
- Premium, discount, and par classification
- Macaulay duration, modified duration, convexity, and DV01
- Price–yield curve across ±200 basis-point scenarios
- Annual, semi-annual, and quarterly coupon frequencies
- Coupon, principal, total cash flow, and discounted present-value schedule
- CSV export for the complete projected schedule
- Discount, par, premium, and zero-coupon presets
- Responsive dark/light interface with keyboard and reduced-motion support
- API-first calculation with a deterministic local fallback for reliable live demos
- Validation at the NestJS HTTP boundary and automated numerical regression tests

## Architecture

```text
Browser
  ├─ React presentation and orchestration
  ├─ typed API adapter with timeout/network fallback
  └─ pure local bond engine for deployment resilience

NestJS API
  ├─ DTO validation and strict request boundary
  ├─ domain service for analytics orchestration
  └─ pure numerical utilities and regression tests
```

The backend remains authoritative when `VITE_API_URL` is configured. The frontend ships an equivalent pure calculation engine so the public application remains fully functional when no API host is configured or a network request times out.

## Core equations

Bond price:

```text
P = Σ(C / (1 + r)^t) + F / (1 + r)^n
```

YTM is the periodic rate `r` that matches calculated present value to observed market price. The solver uses bisection over `(-1, 10]`, supporting negative-yield premium scenarios while retaining guaranteed convergence for valid fixed-rate bonds.

Risk analytics are calculated from discounted cash flows:

- Macaulay duration — present-value-weighted time to receipt
- Modified duration — first-order price sensitivity to yield
- Convexity — second-order curvature adjustment
- DV01 — estimated currency price movement for one basis point

## API

`POST /api/bond/calculate`

```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 950,
  "yearsToMaturity": 10,
  "couponFrequency": "semi-annual"
}
```

The response contains headline yield metrics, risk analytics, a seven-point yield scenario set, and the full cash-flow schedule.

### Validation

| Field | Rule |
|---|---|
| `faceValue` | Greater than zero |
| `annualCouponRate` | 0–100% |
| `marketPrice` | Greater than zero |
| `yearsToMaturity` | 0.5–100 years |
| `couponFrequency` | `annual`, `semi-annual`, or `quarterly` |

Unknown request properties are rejected. Numeric strings are transformed at the DTO boundary.

## Run locally

```bash
# Terminal 1
cd backend
npm ci
npm run start:dev

# Terminal 2
cd frontend
npm ci
npm run dev
```

Vite proxies local `/api` requests to `http://localhost:3001`. For a hosted API, set:

```bash
VITE_API_URL=https://your-api.example.com
```

## Quality gates

```bash
cd frontend && npm run lint && npm run build
cd backend && npm test
```

CI runs frontend lint/build and backend build/regression tests for every pull request and push to `main`.

## Important note

This project is an engineering demonstration and educational analytics tool. It is not investment advice and does not model taxes, accrued interest, day-count conventions, credit risk, callable features, or transaction costs.
