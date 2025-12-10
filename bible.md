# 📖 LOUAAB Project Bible

## 🌍 Environment Details
- **Server IP**: `164.90.190.154`
- **User**: `root`
- **Project Path**: `/root/louaab-project`
- **Local Path**: `E:\projet-2026\louaab-project`

---

## 🚀 Deployment Workflow (Hybrid Dev Mode)
We use a "Hybrid Dev Mode" to allow for **instant updates** on production without rebuilding the entire application for every small change.

### 1️⃣ Enable Dev Mode on Server
**When:** You start a coding session and want fast updates.
**Command (Remote):**
```bash
ssh root@164.90.190.154 "/root/louaab-project/switch-to-dev.sh"
```
*   **What it does:** Stops the production server and starts `npm run dev` (with Turbopack).
*   **Effect:** The site supports Hot Module Replacement (HMR).

### 2️⃣ Sync Changes Instantly
**When:** You have made code changes locally and want to see them live.
**Command (Local PowerShell):**
```powershell
./sync-to-prod.ps1
```
*   **What it does:**
    1.  Zips your local `src` folder.
    2.  Uploads it to the server.
    3.  Unzips it into the project folder.
*   **Effect:** Changes appear immediately (or within seconds) on the site.

### 3️⃣ Switch Back to Production
**When:** You are finished working or want to restore maximum performance.
**Command (Remote):**
```bash
ssh root@164.90.190.154 "/root/louaab-project/switch-to-prod.sh"
```
*   **What it does:** Builds the project (`npm run build`) and starts it in production mode (`npm start`).

---

## 🛠️ Troubleshooting
- **Files not updating?**
    - Check if the server is actually in dev mode (`pm2 list` should show `npm` running `dev`).
    - Run `./sync-to-prod.ps1` again.
- **"CheckOverlap" missing?**
    - We fixed a deployment issue where `src/app/ages/[age]/page.tsx` wasn't updating due to brackets in the filename. The `sync-to-prod.ps1` script handles this by zipping the entire `src` folder.

## 📂 Key Files
- `src/lib/toys-data.ts`: Core logic for toy data and deduplication.
- `src/app/ages/page.tsx`: Main ages page (overlap logic).
- `src/app/ages/[age]/page.tsx`: Age detail page (overlap logic).
## Jouets sync note
- /jouets different from admin: rebuild in prod (`cd /root/louaab-project && npm run build`) then `pm2 restart louaab-frontend` to drop the old toys-mapping fallback.
