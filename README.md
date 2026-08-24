# Signet Admin Panel

Admin console for **Signet Employment Hub** — companies, candidates, jobs, applications, articles, FAQs, and legal content. Connects to the same Firebase project as the Signet web/mobile apps (`job-portal-app-72db3`).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/login](http://localhost:5173/login)

Requires a Firebase Auth user with a Firestore document `users/{uid}` where `userType` is `"admin"`.

## Production build

```bash
npm run build
```

Output: `dist/` (static SPA)

## Deploy to VPS (Hestia — same as Signet site)

The main Signet site uses `/Users/shubhamsingh/jobi/scripts/vps-deploy.sh` with PM2 + Nginx.  
The admin panel is a **static SPA**, so Nginx serves `dist/` directly (no PM2).

### 1. On Hestia — create subdomain

In Hestia Control Panel:

1. **Web → Add Domain** (or subdomain): `admin.signetemploymenthub.com`
2. Enable **SSL** (Let's Encrypt)
3. Point DNS **A record** for `admin` to your VPS IP

> Use the same base domain as your live site. If your site is `signetemploymenthub.com`, use `admin.signetemploymenthub.com`.

### 2. Firebase — authorize domain

Firebase Console → **Authentication → Settings → Authorized domains**

Add: `admin.signetemploymenthub.com`

### 3. Push code to GitHub

Repo: `https://github.com/signeteduau/signet_job_admin.git`

```bash
git add .
git commit -m "Deploy admin panel"
git push origin main
```

### 4. Run deploy on VPS (as root)

Copy the script to the server or clone the repo, then:

```bash
cd /path/to/signet-admin   # or clone fresh on VPS
bash scripts/vps-deploy.sh
```

Or with custom domain/user:

```bash
HESTIA_USER=user ADMIN_DOMAIN=admin.signetemploymenthub.com bash scripts/vps-deploy.sh
```

The script will:

- Install Node.js 20 (if missing)
- Clone/pull `signet_job_admin` into `/home/user/apps/signet-admin`
- Run `npm ci && npm run build`
- Copy `dist/` → `/home/user/web/admin.signetemploymenthub.com/public_html`
- Configure Nginx SPA routing (`try_files` for React Router)
- Rebuild the Hestia web domain

### 5. Verify

- `https://admin.signetemploymenthub.com/login`
- Sign in with an admin Firebase account

### Re-deploy after changes

```bash
ssh root@YOUR_VPS
bash /home/user/apps/signet-admin/scripts/vps-deploy.sh
```

Or pull latest on VPS manually:

```bash
cd /home/user/apps/signet-admin && git pull && npm ci && npm run build
rsync -av --delete dist/ /home/user/web/admin.signetemploymenthub.com/public_html/
```

## Stack

- React 19 + Vite 7
- Firebase Auth + Firestore
- Tailwind CSS
- React Router 7
