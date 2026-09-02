# HealthPress — Node.js + PostgreSQL news website with CMS

A complete, responsive health-news publication inspired by the structure of the supplied reference, with an original modern design. The public website and admin CMS use the same PostgreSQL data, so published changes appear immediately.

## Included

- Public homepage, category pages, search and article pages
- Responsive mobile/tablet/desktop interface
- Password-protected CMS at `/admin`
- Create, edit, publish, feature and delete posts
- Categories that automatically populate the public navigation
- Editable site name, tagline, logo, hero, contact, social links and footer
- PostgreSQL schema, seed data and Docker database setup
- Secure hashed admin password and HTTP-only signed login cookie
- Dynamic SEO metadata for articles

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop (easiest option) or PostgreSQL 15+

## Step-by-step setup (Docker PostgreSQL)

1. Open PowerShell in this project folder.
2. Copy the environment template:

   `Copy-Item .env.example .env`

3. Edit `.env`. Change `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Generate a secret with:

   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Start PostgreSQL:

   `docker compose up -d`

5. Install packages:

   `npm install`

6. Create the database tables:

   `npm run db:push`

7. Add the admin account and sample content:

   `npm run db:seed`

8. Start the website:

   `npm run dev`

9. Open `http://localhost:3000`. The CMS is at `http://localhost:3000/admin`.

## Using an existing PostgreSQL server

Create a database called `healthpress`, then set `DATABASE_URL` in `.env`:

`DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/healthpress?schema=public"`

Run `npm run db:push` and `npm run db:seed` afterward.

## Everyday CMS workflow

1. Sign in at `/admin`.
2. Add categories first. They automatically become public menu items.
3. Open **Posts → New post**, add the story and image URL, select **Published**, then save.
4. Use **Site settings** to change branding, homepage text, email, social links and footer. Saving publishes those values immediately.
5. Draft posts remain private. Published posts appear immediately. Enable **Feature on homepage** to use a story as the large hero card.

## Images

The CMS accepts image URLs, which keeps deployment simple and database backups small. Use a direct HTTPS image URL from your media host, Cloudinary, S3 or WordPress media library. For production, configure a dedicated media provider and only allow trusted editors.

## Production

1. Set a production PostgreSQL `DATABASE_URL` and strong `AUTH_SECRET`.
2. Run `npm install`, `npm run db:push`, and `npm run build`.
3. Start with `npm start`, or deploy to any Node.js host (Railway, Render, Fly.io, VPS, etc.).
4. Configure HTTPS and set `NEXT_PUBLIC_SITE_URL` to the public domain.
5. Back up PostgreSQL regularly with your provider or `pg_dump`.

## Useful commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — production server
- `npm run db:push` — sync schema to PostgreSQL
- `npm run db:seed` — create admin/sample data
- `npm run db:studio` — visual database browser

## Important security note

Change the example admin password and `AUTH_SECRET` before putting the site online. Never commit `.env`.
