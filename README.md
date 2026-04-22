This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Website Roaster Env

`src/app/api/roast/route.js` supports cost-control and model-routing env vars:

```bash
# Main cost target (0-70). Default: 40
ROASTER_COST_TARGET_PERCENT=40

# Optional overrides (if omitted, derived from target profile)
ROASTER_DEPTH_ONE_MAX_LINKS=3
ROASTER_PAGE_STAGE_ONE_MAX_CHARS=500
ROASTER_GLOBAL_SITE_CONTENT_MAX_CHARS=2200
ROASTER_BASE_MAX_TOKENS=1200
ROASTER_BASE_RETRY_MAX_TOKENS=1600
ROASTER_REVENUE_MAX_TOKENS=700
ROASTER_REVENUE_RETRY_MAX_TOKENS=1000

# In-memory cache
ROASTER_CACHE_TTL_SECONDS=86400
ROASTER_CACHE_MAX_ENTRIES=500
ROASTER_PROMPT_VERSION=1

# Model routing
ROASTER_PRIMARY_MODEL=claude-3-5-haiku-latest
ROASTER_FALLBACK_MODEL=claude-sonnet-4-20250514
ROASTER_ENABLE_MODEL_FALLBACK=true
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
