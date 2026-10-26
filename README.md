# Nasim Bin Jasim: link page (Next.js + Supabase + Vercel)

A clone of https://linktr.ee/nasimbinjasim that you host yourself. Everything on the page
(photo, name, bio, contact icons, link buttons, their order) is stored in Supabase and edited
from `/admin`. No redeploy is needed to change content.

## 1. Supabase (database + login)
1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, replace `YOUR@EMAIL.COM` with your admin email, and run it. (Tables are prefixed `lp_` so the script can share a project with other apps.)
3. Open **Authentication → Users → Add user**. Create your admin email and password.
4. Only the email written in `lp_is_admin()` can edit the page, so other users of the project cannot change it.
5. Open **Project Settings → API Keys** (or the **Connect** dialog) and copy the
   Project URL and the publishable key (`sb_publishable_...`). The legacy `anon` key also works.

## 2. Run locally (optional)
```bash
npm install
cp .env.example .env.local   # then paste your two values
npm run dev                  # http://localhost:3000 and http://localhost:3000/admin
```

## 3. Deploy on Vercel
1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository (framework is detected as Next.js).
3. Under **Environment Variables** add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**. Your page is at `/`, the editor is at `/admin`.

## 4. Fill in your contact icons
The public Linktree page shows only the icon labels (Phone, Facebook, WhatsApp, Telegram, Email),
not the actual numbers or URLs, so they are seeded as hidden placeholders.
In `/admin → Contact icons`, enter your real values, tick **Show on page**, and save.
- Phone / WhatsApp: number with country code, e.g. `+8801XXXXXXXXX`
- Telegram: `@username` or a `https://t.me/...` link
- Facebook: full profile URL
- Email: address

## Notes
- Profile photo: the seed uses the image URL from your Linktree. Linktree may change or remove it, so
  for a permanent photo upload one to a public Supabase Storage bucket and paste its URL in `/admin`.
- Each link button counts clicks (shown in `/admin`).
- Custom domain: Vercel project → Settings → Domains.
