# Auth & OAuth setup (BUG-013)

Configure **exact** redirect URLs in both places below.

## Supabase Auth

In the Supabase dashboard → **Authentication** → **URL configuration**, add:

- `http://localhost:3000/auth/callback`
- `https://<your-production-domain>/auth/callback`

Legacy `/callback` is forwarded to `/auth/callback` for older redirect URLs, but new projects should use **`/auth/callback`** only.

## Google Cloud Console

OAuth client **Authorised redirect URIs** must include Supabase’s Google handler (from Supabase docs) **and** your site callback if required by your flow. Also add **JavaScript origins** for:

- `http://localhost:3000`
- `https://<your-production-domain>`

Match the Supabase **Site URL** and **Redirect URLs** to your deployed origin.

## PWA icons

Run `node scripts/generate-pwa-icons.mjs` after `npm install` to generate `public/icon-192.png` and `public/icon-512.png` (requires `sharp`). Replace with final branded artwork before store / marketing submission.
