# 🚀 Deployment Guide — Disaster Response by Ryan
**Replace your current disaster911.net site with this build**

---

## What's in This Build

| Item | Count |
|------|-------|
| Core pages (home, about, contact, etc.) | 8 |
| Service hub pages (water, fire, mold, sewage) | 4 |
| City service pages | 200+ |
| Blog posts | 10 |
| **Total pages** | **~230** |

---

## Option A — Deploy as Static Site (Recommended — Fastest)

This site is plain HTML/CSS/JS. No PHP, no database. Upload the files and it works.

### Step 1 — Prepare Your Files

Everything in this folder IS the site. You do not need to run any build scripts.

```
DisasterResponse-Build-2026-02-27/
  index.html          ← homepage
  styles.css          ← all styles
  script.js           ← all JavaScript
  google-reviews.js   ← Google review cards
  water-damage-restoration/
  fire-damage-restoration/
  mold-remediation/
  sewage-cleanup/
  blog/
  about/
  contact/
  ...etc
```

### Step 2 — Upload to Your Hosting

**Using cPanel File Manager (most common):**
1. Log into cPanel → File Manager
2. Navigate to `public_html/`
3. Delete or backup your old site files
4. Upload all files from this folder into `public_html/`
5. Make sure `index.html` is at the root: `public_html/index.html`

**Using FTP (FileZilla etc.):**
1. Connect to your server
2. Navigate to `/public_html/` or `/var/www/html/`
3. Upload all files, preserving folder structure

### Step 3 — Set Up Clean URLs (Apache)

Your site uses "pretty URLs" like `/water-damage-restoration/ada-mi/` instead of
`/water-damage-restoration/ada-mi/index.html`.

Create (or upload) an `.htaccess` file at the root with this content:

```apache
Options -Indexes
DirectoryIndex index.html

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash issues
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)/$ /$1 [L,R=301]

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/jpeg "access plus 6 months"
  ExpiresByType image/png "access plus 6 months"
  ExpiresByType image/webp "access plus 6 months"
</IfModule>
```

> **Note:** If you're on Nginx instead of Apache, you'll need a `location` block instead.
> Ask your host which server they use.

---

## Option B — Deploy to WordPress (Keep WP for CMS, Use This as Theme)

This is more complex but lets you edit pages from the WP admin dashboard.

### Step 1 — Set Up WordPress Plugins

Install these free plugins in WP Admin → Plugins → Add New:

| Plugin | Purpose |
|--------|---------|
| **WP All Import** | Import city pages from CSV |
| **Advanced Custom Fields (ACF)** | Store city-specific data |
| **RankMath or Yoast SEO** | Manage meta titles/descriptions |
| **WP Rocket** (paid) or **W3 Total Cache** (free) | Page speed |

### Step 2 — Import City Pages

1. Open `wp-config.json` in this folder and add your WordPress credentials:
   ```json
   {
     "url": "https://disaster911.net",
     "username": "your_wp_admin_username",
     "applicationPassword": "xxxx xxxx xxxx xxxx xxxx xxxx"
   }
   ```

   To get an Application Password:
   - WP Admin → Users → Your Profile → scroll to "Application Passwords"
   - Name it "Site Import" → click "Add New Application Password"
   - Copy the password shown (you won't see it again)

2. Run the import generator:
   ```bash
   node generate-wordpress-import.js
   ```
   This creates `wordpress-migration/city-pages-import.csv`

3. In WP Admin → WP All Import → New Import
   - Upload the CSV file
   - Map fields to your ACF fields
   - Run the import

### Step 3 — Copy Theme Files

The HTML, CSS, and JS in this build need to become a WordPress theme.
This is advanced — consider hiring a WordPress developer for this part,
or use Option A (static site) instead.

---

## GoHighLevel (GHL) Integration

### What's Already Set Up

✅ GHL traffic tracking script is on every page:
```html
<script src="https://link.msgsndr.com/js/traffic-source.js"></script>
```
This already tracks visitor source/attribution in your GHL dashboard.

### Connect the Contact Form

The contact form on `/contact/` currently shows a success message but
doesn't send data to GHL yet. To fix this:

**Step 1 — Create a GHL Webhook**
1. Log into GoHighLevel
2. Go to: Settings → Integrations → Webhooks (or use Automation → Triggers)
3. Create a "Contact Form Submission" webhook
4. Copy the webhook URL

**Step 2 — Paste the URL in script.js**

Open `script.js` and find this line near the top:
```javascript
const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE';
```

Replace it with your real URL:
```javascript
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/YOUR_ACTUAL_URL';
```

**Step 3 — (Alternative) Embed a GHL Form**

Instead of a webhook, you can embed a GHL-hosted form directly.
In GHL: Sites → Forms → [your form] → Embed → copy the iframe code.

Then in `contact/index.html`, replace the `<form id="contact-form">` block with:
```html
<!-- GHL Embedded Form -->
<iframe src="YOUR_GHL_FORM_EMBED_URL" style="width:100%; height:600px; border:none;"></iframe>
```

### Phone Call Tracking

To track phone calls from your site in GHL:
1. GHL → Phone Numbers → Add Number (get a tracking number)
2. Replace `(616) 822-1978` in the HTML with your GHL tracking number
3. Forward that number to your real number in GHL settings
4. GHL will log every call as a "Contact" in your CRM

---

## Checklist Before Going Live

- [ ] All images uploaded to `/images/` folder on server
- [ ] `logo.png`, `iicrc-badge.svg`, `mi-builder-badge.svg` in `/images/`
- [ ] GHL webhook URL added to `script.js`
- [ ] `.htaccess` uploaded to root
- [ ] Test contact form submits (check GHL CRM for new lead)
- [ ] Test all nav links work
- [ ] Test on mobile (iPhone and Android)
- [ ] Submit new sitemap to Google Search Console: `https://disaster911.net/sitemap.xml`
- [ ] Verify robots.txt allows Googlebot: `https://disaster911.net/robots.txt`

---

## Quick Fix Reference

| Problem | Solution |
|---------|----------|
| Pages return 404 | Check `.htaccess` is uploaded and Apache mod_rewrite is enabled |
| Images not loading | Check `/images/` folder uploaded correctly, paths start with `/images/` |
| Form not sending to GHL | Add your webhook URL to `GHL_WEBHOOK_URL` in script.js |
| Google reviews not showing | Check `reviews-cache.json` is in root, run `node fetch-reviews.js` to refresh |
| CSS not loading | Check `styles.css` is in root directory |

---

## Files You Can Delete (Build Tools — Not Part of Live Site)

These are development scripts used to generate the site. Safe to delete from server:
```
build.js, build2.js, build-city-pages-v2.js, build-hub-pages.js
rebuild-city-pages.js, rebuild-inventory.js
fetch-live-data.js, fetch-reviews.js, fetch-seo-data.js
generate-wordpress-import.js, process-photos.js, deploy-photos.js
patch-city-pages.js, patch-again.js, fixer.js, repair.js, fix-theme.js
write-blogs.js, write-dashboard.js, write-sitemap.js
verify.js, server.js, seo-dashboard.html
package.json, package-lock.json
bulk-sms-update.js, google-gateway.js, replace-address.js
keep-server-running.bat
Disaster.md (the audit report)
colors.txt, colors2.txt, blog.txt
```

**Do NOT delete from server:**
```
index.html, styles.css, script.js, google-reviews.js
All HTML folders (water-damage-restoration/, about/, contact/, etc.)
/images/ folder
reviews-cache.json
sitemap.xml, robots.txt
```
