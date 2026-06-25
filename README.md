# Kratoke Steel Shop — LINE LIFF App

Mobile e-commerce ordering app for a steel materials shop, running inside LINE via LIFF (LINE Front-end Framework).

## Features

- **Product catalog** — Browse steel products grouped by category (A–E), with cascading size/thickness variant selection (Shopee/Lazada style)
- **Cart & ordering** — Add items, adjust quantities, and submit orders through LINE
- **Product images** — Category cover images served from `public/` folder
- **Google Sheets backend** — Product data (name, size, thickness, color, weight, price) fetched live from Google Apps Script
- **PDPA compliant** — User consent required before collecting personal data; supports data deletion requests

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| LINE integration | LIFF SDK |
| Backend / data | Google Apps Script (GAS) |
| Hosting | Vercel |

## Getting Started

**Prerequisites:** Node.js 18+

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` with your credentials:
   ```
   VITE_LIFF_ID=your_liff_id
   VITE_GAS_URL=your_gas_web_app_url
   ```

3. Run locally (dev mode bypasses LIFF with a mock profile):
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  components/
    Menu.tsx        # Product browser (group cards → variant selector)
    Cart.tsx        # Cart and checkout
    Register.tsx    # User profile / PDPA consent
  utils/
    productImage.ts # Resolves product images from public/{name}.jpg
  types.ts          # Shared TypeScript interfaces
  App.tsx           # Root, LIFF init, routing
public/
  *.jpg             # Product category images (filename = product name)
```

## Data Source (Google Apps Script)

The GAS `getProducts` function reads the product sheet with columns:

| Col | Field | Description |
|---|---|---|
| A | id | Product ID (first char = group A–E) |
| B | category | Category name |
| C | name | Product name (used for image filename) |
| D | size | Size (e.g. `2"x1"`) |
| E | hole | Hole size |
| F | thickness | Thickness (mm) |
| G | color | Color tag |
| H | weight | Weight (kg) |
| I | price | Price (THB) |

## Deployment

Deploy to Vercel with environment variables `VITE_LIFF_ID` and `VITE_GAS_URL` set in the Vercel dashboard. The `.env` file must never be committed.
