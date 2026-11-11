# ZarPay

ZarPay is an Indonesian-language credit scoring and loan risk assessment application built with Next.js App Router, TypeScript, and Supabase.

## What works

- Supabase email/password sign-up, sign-in, email confirmation callback, and sign-out.
- Public landing page describing the simulation, scoring scale, user roles, and limitations.
- Borrower and evaluator experiences with role checks on the server.
- Borrower-only application creation, validated on the server and persisted in PostgreSQL.
- A transparent 300–850 simulated credit score, estimated monthly payment, post-loan DTI, and risk tier.
- Evaluator decisions include the reviewing account, timestamp, and required rationale.
- Row-level security for application and profile reads; application writes use a server-only service role key after authentication and role checks.
- Server-paginated dashboard with database-side search and status filtering.
- Responsive application details, validation/error feedback, and scoring tests.
- No seeded accounts or application records; the public landing page does not present fabricated applicant results.

The public landing page is `/`. Authenticated users work from `/dashboard`; borrowers can create a new application at `/apply`.

## Project structure

- `app/` contains App Router pages, route handlers, shared layout, and global design tokens.
- `app/styles/` groups global styles by workspace, authentication/forms, marketing, and responsive behavior.
- `src/components/marketing/` separates the landing-page shell and quick navigation from its content sections.
- `src/components/dashboard/` separates dashboard orchestration, page-scoped insights, the application list, detail/review dialog, and dashboard-specific formatters.
- `src/components/forms/` separates application state/submission from result and live-preview presentation.
- `src/lib/` contains scoring, validation, authentication, and Supabase client helpers.
- `supabase/migrations/` contains the ordered database schema and hardening migrations.

## Important: academic simulation only

The scoring formula and 12% APR payment estimate are illustrative rules for an academic project. They are not calibrated or validated lending decisions, a credit bureau score, a loan offer, or financial advice. Do not use the score to approve real applicants without independent validation, fairness and compliance review, suitable lending disclosures, and a production-grade risk model.

## Requirements

- Node.js 22.0 or newer
- A Supabase project

## Configure Supabase

1. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key.
   - `SUPABASE_SERVICE_ROLE_KEY`: the server-side service role key. Never expose this key in browser code or commit it.
2. In the Supabase SQL Editor, run every SQL migration in `supabase/migrations` in filename order. The production-hardening migration stops if existing applications contain fractional Rupiah amounts; reconcile those records explicitly before retrying instead of rounding financial data silently.
3. In Supabase Auth URL Configuration, set the Site URL to the deployed HTTPS origin and add the exact production origin followed by `/auth/callback` to the redirect allow list. Email confirmation redirects use the origin of the site where registration starts.
4. Configure email confirmation and production SMTP in Supabase before inviting real users.
5. Start the app and create an account. New accounts are assigned the `borrower` role by a database trigger.
6. To promote an evaluator, run this statement in the Supabase SQL Editor, replacing the email with the intended account:

   ```sql
   update public.profiles as p
   set role = 'evaluator'
   from auth.users as u
   where p.id = u.id
     and lower(u.email) = lower('evaluator@example.com');
   ```

   Verify the affected account before running the statement. There is intentionally no self-service role selector.

The application returns a setup screen when the public Supabase URL/key are missing. Provide the public variables during the production build because Next.js embeds `NEXT_PUBLIC_*` values into the client bundle. API writes also require `SUPABASE_SERVICE_ROLE_KEY`; the key is used only in server routes and must be kept secret.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify and build

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
```

The production server can be started with `npm run start` after a successful build. Use a Node.js-capable deployment target and configure all environment variables there. Authenticated pages are dynamically rendered and should not be placed behind shared caches that ignore private cache headers.

## Before a real production launch

- Add automated unit tests for scoring boundaries and API authorization, plus Supabase RLS integration tests.
- Enable Supabase Auth protections appropriate for the deployment (rate limits, CAPTCHA or bot protection, MFA for evaluators, secure email delivery, and redirect allow lists).
- Add append-only audit events, monitoring, backup/restore procedures, retention and deletion workflows, and privacy notices. The current review fields provide decision provenance, not an immutable event history.
- Have the score model, DTI methodology, decision criteria, accessibility, and Indonesian legal/compliance obligations independently reviewed.
- Configure and verify the production domain, HTTPS, CSP/security headers, database backups, and incident response.
