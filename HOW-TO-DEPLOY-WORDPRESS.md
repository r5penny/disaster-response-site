# How to Replace Your WordPress Site — Step by Step
**Written for: Complete beginner, GoDaddy hosting, WordPress currently live**
**Time needed: About 45–60 minutes**
**Difficulty: Easy — every step is written out exactly**

---

## What You're Doing (Plain English)

Your current site runs on WordPress. WordPress is software that uses a database
and PHP files to build pages on the fly every time someone visits.

Your NEW site is plain HTML — it's pre-built, faster, and simpler.
No database. No WordPress. Just files.

Here's the plan:
1. Save a full backup of your WordPress site (safety net)
2. Zip up your new site files
3. Connect GHL so your contact form sends leads
4. Clear out the old WordPress files from GoDaddy
5. Upload the new site files
6. Add one settings file (.htaccess)
7. Test everything works

**Your old site is NOT deleted — it's backed up. You can restore it any time.**

---

## STEP 1 — Back Up Your WordPress Site (10 minutes)

This is the most important step. Don't skip it.

### Option A — Backup from inside WordPress (easiest)

1. Open your browser → go to `disaster911.net/wp-admin`
2. Log in with your WordPress username and password
3. On the left menu, click **Plugins** → **Add New**
4. Search for: `UpdraftPlus`
5. Click **Install Now** → then **Activate**
6. Go to **Settings** → **UpdraftPlus Backups**
7. Click the big **Backup Now** button
8. Check both boxes: **Include your database** and **Include your files**
9. Click **Backup Now** again to confirm
10. Wait for it to finish (green checkmarks appear) — takes 5–10 minutes
11. Click **Existing Backups** tab → you'll see your backup listed
12. Click **Download** next to each piece (database, plugins, themes, uploads)
13. Save all those files to a folder on your Desktop called `WP-Backup-OLD`

### Option B — Backup from GoDaddy cPanel (alternative)

1. Log into godaddy.com → My Products → Web Hosting → Manage → cPanel
2. Scroll down to the **Files** section → click **Backup**
3. Click **Download a MySQL Database Backup** → select your database → download it
4. Click **Download a Home Directory Backup** → this downloads all your files
5. Save everything to a folder on your Desktop called `WP-Backup-OLD`

---

## STEP 2 — Connect GHL Before You Upload Anything (5 minutes)

Do this now while you can still easily find the file on your Desktop.

**Why:** This makes your contact form send real leads into GoHighLevel.
Without this, the form shows a success message but nothing goes to your inbox.

### Find Your GHL Webhook URL

1. Log into GoHighLevel (app.gohighlevel.com)
2. Click **Settings** (gear icon, bottom left)
3. Click **Integrations**
4. Look for **Webhooks** → click it
5. Click **+ Add Webhook** or **Create Webhook**
6. Name it: `Website Contact Form`
7. For the trigger/event, choose: **Contact Created**
8. Copy the URL it gives you — save it in a Notepad file temporarily

**If you can't find Webhooks in GHL:**
Try this instead — use a GHL embedded form:
- GHL → Sites → Forms → pick your form → Embed → copy the iframe code
- We'll paste that into the contact page instead (I can help with this later)

### Paste the URL Into Your Site

1. On your Desktop, open the `DisasterResponse-Build-2026-02-27` folder
2. Find the file called `script.js`
3. Right-click it → **Open with** → **Notepad** (or **Notepad++** if you have it)
4. Look near the top — you'll see this line:

   ```
   const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE';
   ```

5. Replace `YOUR_GHL_WEBHOOK_URL_HERE` with the URL you copied
   Example of what it should look like after:
   ```
   const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/abc123/webhook-trigger/xyz';
   ```

6. Press **Ctrl + S** to save → close Notepad

---

## STEP 3 — Zip Your New Site Folder (2 minutes)

1. On your Desktop, find the folder: `DisasterResponse-Build-2026-02-27`
2. Right-click the folder
3. Click **Compress to ZIP file** (Windows 11)
   — or — **Send to → Compressed (zipped) folder** (older Windows)
4. A file appears: `DisasterResponse-Build-2026-02-27.zip`
5. Takes 1–2 minutes — the site has 230+ pages

---

## STEP 4 — Log Into GoDaddy and Open File Manager (3 minutes)

1. Go to **godaddy.com** and log in with your GoDaddy account
2. Click your name (top right) → **My Products**
3. Find **Web Hosting** in the list → click **Manage** next to it
4. Look for a button that says **cPanel** → click it
   (A new tab opens — this is your server's file manager)
5. In cPanel, find the section called **Files** → click **File Manager**
6. A window opens that looks like Windows Explorer

---

## STEP 5 — Remove the Old WordPress Files (10 minutes)

**Important:** This only removes the WordPress files, NOT the database.
Your backup is safe. The database (all your old content) stays on GoDaddy's servers
unless you specifically delete it — and we're not doing that.

### Navigate to Your Site Files

1. On the left side of File Manager, click the folder called **public_html**
   (Everything inside here is what people see when they visit your website)

### Select and Delete the WordPress Files

You need to delete these specific WordPress files/folders.
Hold **Ctrl** and click each one to select multiple:

**Folders to delete:**
- `wp-admin`
- `wp-includes`
- `wp-content`

**Files to delete:**
- `index.php`
- `wp-config.php`
- `wp-login.php`
- `wp-cron.php`
- `wp-settings.php`
- `wp-blog-header.php`
- `wp-activate.php`
- `wp-comments-post.php`
- `wp-links-opml.php`
- `wp-load.php`
- `wp-mail.php`
- `wp-signup.php`
- `wp-trackback.php`
- `xmlrpc.php`
- `.htaccess` (WordPress put its own version here — we'll add a new one)

To delete them:
1. Click the first file/folder to select it
2. Hold **Ctrl** and click each additional one
3. Once all are selected, click **Delete** in the top toolbar
4. Check the box that says **Skip the trash** (permanent delete)
5. Click **Confirm**

**Don't worry if you can't find all of them** — some might not exist.
Just delete what you can see.

---

## STEP 6 — Upload Your New Site (15 minutes)

1. You should still be in File Manager, inside `public_html`
2. Click **Upload** in the top toolbar
3. A new upload tab opens
4. Click **Select File** (or drag your zip into the upload area)
5. Find and select: `DisasterResponse-Build-2026-02-27.zip` from your Desktop
6. Watch the progress bar — wait for it to reach **100%**
7. Close the upload tab when done
8. Go back to the main File Manager tab and press **F5** to refresh

---

## STEP 7 — Extract (Unzip) the New Site (5 minutes)

1. In File Manager, inside `public_html`, you should see the zip file you uploaded
2. Click once on `DisasterResponse-Build-2026-02-27.zip` to highlight it
3. Click **Extract** in the top toolbar
4. A box appears asking where to extract
5. Make sure it says `/public_html` — if not, type that in
6. Click **Extract Files**
7. Wait 2–3 minutes for it to finish

---

## STEP 8 — Move Files Into the Right Place (5 minutes)

After extracting, the files land inside a sub-folder:
`public_html/DisasterResponse-Build-2026-02-27/`

But they need to be directly inside `public_html/` so your homepage works.

1. In File Manager, double-click to open the `DisasterResponse-Build-2026-02-27` sub-folder
2. Press **Ctrl + A** to select everything inside it
3. Click **Move** in the top toolbar
4. A box appears — type: `/public_html`
5. Click **Move Files**
6. If it says "files already exist, overwrite?" — click **Yes / Overwrite**

Now go back to `public_html` (click it on the left side).
You should see `index.html` sitting there directly. That means it worked.

### Clean Up

1. Click the now-empty `DisasterResponse-Build-2026-02-27` folder → **Delete**
2. Click `DisasterResponse-Build-2026-02-27.zip` → **Delete**

---

## STEP 9 — Create Your .htaccess File (5 minutes)

This file is like traffic rules for your server.
Without it, links to your city pages will give "Page Not Found" errors.

1. Make sure you're in `public_html` in File Manager
2. Click **+ File** in the top toolbar
3. Type the filename exactly: `.htaccess`
   (starts with a dot, no other extension)
4. Click **Create New File**
5. Find the new `.htaccess` file → right-click it → **Edit**
6. Delete anything already in there
7. Paste ALL of this exactly:

```
Options -Indexes
DirectoryIndex index.html

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Speed: cache images and scripts
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/jpeg "access plus 6 months"
  ExpiresByType image/png "access plus 6 months"
  ExpiresByType image/webp "access plus 6 months"
  ExpiresByType image/svg+xml "access plus 6 months"
</IfModule>
```

8. Click **Save Changes** → close the editor

---

## STEP 10 — Test Your Site (5 minutes)

Open a new browser tab and check these one by one:

**Homepage:**
→ Visit `https://disaster911.net`
→ Should load your new site ✅

**A city page:**
→ Visit `https://disaster911.net/water-damage-restoration/grand-rapids-mi/`
→ Should load (not a 404 error) ✅

**Contact form:**
→ Visit `https://disaster911.net/contact/`
→ Fill in a test name and phone number → Submit
→ Check your GoHighLevel inbox — did the lead appear? ✅

**Mobile view:**
→ On your phone, visit `https://disaster911.net`
→ Should see a red CALL button at the bottom of the screen ✅

---

## STEP 11 — Tell Google About the New Site (2 minutes)

1. Go to: **search.google.com/search-console** (log in with your Google account)
2. Make sure `disaster911.net` is selected on the left
3. Click **Sitemaps** in the left menu
4. Click the box that says **Enter sitemap URL**
5. Type: `sitemap.xml`
6. Click **Submit**

Google will re-crawl your site over the next few days. Your old rankings are safe —
you kept all the same URLs that Google already knows about.

---

## If Something Doesn't Look Right

**Site shows blank page or old WordPress page**
→ Clear your browser cache: Press **Ctrl + Shift + Delete** → clear everything → refresh

**City pages give "404 Not Found"**
→ The `.htaccess` file is missing or saved wrong — redo Step 9

**Site looks unstyled (no colors, no layout)**
→ The `styles.css` file is in the wrong place
→ In File Manager, make sure `styles.css` is directly inside `public_html/`

**Contact form doesn't send to GHL**
→ Re-check that you saved `script.js` with the correct GHL webhook URL (Step 2)

**"I want my old WordPress site back"**
→ You have two options:
   Option 1: Re-install WordPress in GoDaddy (My Products → WordPress → Install)
             Then use UpdraftPlus to restore your backup
   Option 2: Your original backup files are in the `WP-Backup-OLD` folder on your Desktop
             Contact GoDaddy support and they can help you restore

---

## What WordPress Being Gone Means Day-to-Day

**What you lose:**
- The WordPress dashboard (wp-admin) where you edited pages visually
- The ability to add blog posts from a dashboard

**What you gain:**
- Site loads much faster (no PHP, no database queries)
- Less security risk (WordPress gets hacked constantly — HTML can't be)
- 200+ city pages already built and SEO-ready
- Simpler — no plugins to update, no WordPress breaking

**To edit a page going forward:**
Open the HTML file in Notepad, make your change, save, re-upload that one file.
For example, to edit your About page:
→ Open `about/index.html` in Notepad
→ Find the text you want to change → change it → save
→ Upload just that one file to `public_html/about/` in File Manager
→ Done

---

## You're Done

Your site is live, GHL is connected, and Google knows about your pages.
The guide above covers every step you'd need to do this again.

Questions? Open this file and re-read the relevant step.
Each part is labeled so you can jump to exactly what you need.
```
