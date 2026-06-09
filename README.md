# TrackRega

TrackRega is a Hebrew budget tracking app focused on fast weekly manual tracking.

The product approach is intentionally different from classic financial planning flows:
instead of starting with a long backward analysis and only then building a budget,
TrackRega starts with a short weekly tracking habit. The budget becomes clearer from
real behavior over time.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Optional local fallback while access_codes table is not ready:
VITE_SIGNUP_ACCESS_CODE=TRACKREGA
```

3. Run the app:

```bash
npm run dev
```

## Supabase

The database schema lives in `supabase/schema.sql`.

For an existing Supabase project, apply `supabase/admin-policies.sql` in the SQL editor
to add admin access, signup access codes, and subscription-ready fields.

## Product Notes

- Signup is currently gated by a general access code.
- Access codes are stored as SHA-256 hashes, not raw codes.
- Payment is not connected yet, but the schema includes plan and subscription fields
  for a future Stripe or similar integration.
