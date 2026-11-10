# ZarPay

ZarPay is an Indonesian-language credit scoring and loan risk assessment application built with Next.js App Router, TypeScript, and Supabase.

## What works

- Supabase email/password sign-up, sign-in, email confirmation callback, and sign-out.
- Public landing page describing the simulation, scoring scale, user roles, and limitations.
- Borrower and evaluator experiences with role checks on the server.
- Borrower-only application creation, validated on the server and persisted in PostgreSQL.
- A transparent 300–850 simulated credit score, estimated monthly payment, post-loan DTI, and risk tier.
- Evaluator review decisions for pending applications.
- Row-level security for application and profile reads; application writes use a server-only service role key after authentication and role checks.
- Responsive dashboard, filtering, application details, and validation/error feedback.

The public landing page is `/`. Authenticated users work from `/dashboard`; borrowers can create a new application at `/apply`.

## Important: academic simulation only

The scoring formula and 12% APR payment estimate are illustrative rules for an academic project. They are not calibrated or validated lending decisions, a credit bureau score, a loan offer, or financial advice. Do not use the score to approve real applicants without independent validation, fairness and compliance review, suitable lending disclosures, and a production-grade risk model.

## Requirements

- Node.js 20.9 or newer
- A Supabase project

## Configure Supabase

1. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key.
   - `SUPABASE_SERVICE_ROLE_KEY`: the server-side service role key. Never expose this key in browser code or commit it.
   - `NEXT_PUBLIC_SITE_URL`: the canonical app origin, such as `http://localhost:3000` locally or the HTTPS production URL.
2. In the Supabase SQL Editor, run `supabase/migrations/20261110130000_initial_schema.sql`.
3. In Supabase Auth URL Configuration, set the Site URL to `NEXT_PUBLIC_SITE_URL` and add `<site-url>/auth/callback` to the redirect allow list.
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
npx tsc --noEmit
npm run build
```

The production server can be started with `npm run start` after a successful build. Use a Node.js-capable deployment target and configure all environment variables there. Authenticated pages are dynamically rendered and should not be placed behind shared caches that ignore private cache headers.

## Before a real production launch

- Add automated unit tests for scoring boundaries and API authorization, plus Supabase RLS integration tests.
- Enable Supabase Auth protections appropriate for the deployment (rate limits, CAPTCHA or bot protection, MFA for evaluators, secure email delivery, and redirect allow lists).
- Add monitoring, audit logging for evaluator actions, backup/restore procedures, retention rules, and privacy notices.
- Have the score model, DTI methodology, decision criteria, accessibility, and Indonesian legal/compliance obligations independently reviewed.
- Configure and verify the production domain, HTTPS, CSP/security headers, database backups, and incident response.
