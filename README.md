## Dua & Ayah Companion

Next.js + Supabase app for emotionally guided Qur'anic ayah/dua reflections.

## Getting Started

1) Install dependencies:

```bash
npm install
```

2) Add environment variables (`.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_URL=http://localhost:3000
```

3) Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If you already have another project on port 3000 (e.g. BiteSync), use:

```bash
npm run dev:3001
```

Then open [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Database Setup

Apply SQL migration in Supabase:

- `supabase/migrations/001_mvp_core.sql`

## Seed MVP Content

Seed baseline approved content (15 rows: 5 categories x 3 each):

```bash
npm run seed:mvp
```

Validate seed quality:

```bash
npm run seed:check
```

Both commands require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
