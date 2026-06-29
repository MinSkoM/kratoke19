# Kratoke Steel Shop LINE LIFF App

Mobile-first LINE LIFF ordering app for a steel materials shop. The app uses React, TypeScript, Vite, Tailwind CSS, React Router, LINE LIFF, and Google Apps Script as a bridge to Google Sheets.

## Features

- LINE LIFF profile loading in production.
- Development mock LINE profile for local work.
- Product catalog grouped by product ID prefix.
- Search by product name or ID.
- Product image lookup from `public/{product-name}.jpg`.
- Variant selection by detail, size, and thickness.
- Cart with quantity controls.
- Pickup and delivery checkout modes.
- Delivery address confirmation and inline editing.
- Member registration/profile editing with PDPA consent copy.
- Google Apps Script order submission.
- LINE Flex Message receipt when running inside LINE.
- Order history page.
- Public `/calculator` pricing estimator that can be opened from a direct link without LINE login.
- Vercel SPA rewrite support.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript |
| Routing | React Router DOM 7 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| LINE | `@line/liff` |
| Backend bridge | Google Apps Script |
| Data store | Google Sheets |
| Hosting | Vercel |

## Setup

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
VITE_LIFF_ID="YOUR_LIFF_ID_HERE"
VITE_GAS_URL="YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
```

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
npm run clean
```

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite on port `3000` and host `0.0.0.0`. |
| `npm run lint` | Runs TypeScript checking with `tsc --noEmit`. |
| `npm run build` | Builds production output into `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run clean` | Removes `dist/`. |

## Project Structure

```text
src/
  app/
    providers/        Browser/router providers
    routes/           Route composition
    useShopApp.ts     High-level app orchestration hook
  features/
    cart/             Cart state and cart sheet UI
    checkout/         Order submission and LINE receipt logic
    line-auth/        LIFF/profile initialization hook
    member/           Registration/profile feature
    order-history/    Order history feature
    pricing-calculator/
    products/         Product catalog and variant selection
  lib/
    env.ts            Environment helpers
    gasClient.ts      Google Apps Script API client
    liffClient.ts     LINE LIFF wrapper
  types/
    index.ts          Shared TypeScript types
  utils/
    fmt.ts
    productImage.ts
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Redirects to `/menu`. |
| `/menu` | Product catalog, search, variant selection, add to cart. |
| `/calculator` | Public steel price estimator using GAS product data, without LINE login. |
| `/history` | Current user's order history. |
| `/register` | Member registration and profile editing. |

## API Client

All Google Apps Script calls are centralized in `src/lib/gasClient.ts`.

The existing API contract is preserved:

- `GET ?action=checkMember&lineId=<LINE_USER_ID>`
- `GET ?action=getProducts`
- `POST action=register`
- `POST action=submitOrder`
- `GET ?action=getHistory&lineId=<LINE_USER_ID>`

Exported functions:

- `checkMember(lineId)`
- `getProducts()`
- `registerMember(payload)`
- `submitOrder(payload)`
- `getHistory(lineId)`

The client checks HTTP status, parses JSON safely, validates `status: "success"` responses where expected, and throws useful errors for invalid response shapes.

## LINE LIFF

LINE behavior is wrapped in `src/lib/liffClient.ts` and `src/features/line-auth/useLineAuth.ts`.

- Production initializes LIFF with `VITE_LIFF_ID`.
- Production redirects to LINE login when needed.
- Development skips LIFF initialization and uses the mock user `Udev001`.
- `/calculator` skips LIFF initialization so it can be shared as a normal web link.
- Missing LIFF ID is reported as a clean runtime error.
- LINE client checks, message sending, and window closing are exposed through the wrapper.

## Pricing Calculator

The `/calculator` route lives under `src/features/pricing-calculator/`.

The calculator uses the same Google Apps Script product data as the shop menu. It supports:

- Public access without LINE login.
- Product name price lookup for screenshot capture.
- Filters for `รายละเอียด`, `ขนาด`, and `หนา`.
- Menu-style product and variant selection.
- Quantity-based item estimates.
- Product subtotal and total only, with no shipping fee.

This feature is intentionally separate from checkout, so calculator items are estimates only and are not submitted as orders.

## Public Assets

Product images live in `public/` and are resolved by product name:

```ts
`/${product.name}.jpg`
```

Current product image files:

- `ตัวซี.jpg`
- `แป๊บเหลี่ยม.jpg`
- `รางน้ำ.jpg`
- `แป๊บแบน.jpg`
- `แป๊บกลม.jpg`
- `เหล็กฉาก.jpg`

## Deployment

For Vercel, set these environment variables in the project dashboard:

- `VITE_LIFF_ID`
- `VITE_GAS_URL`

`vercel.json` rewrites all paths to `index.html` so React Router routes work on direct visits and refreshes.

## Notes

- `dist/` is generated output and is ignored.
- `.DS_Store` is ignored.
- `App.tsx` is now a thin shell around layout, providers, routes, and `useShopApp`.
- Business logic is organized into feature hooks and `lib/` clients.
