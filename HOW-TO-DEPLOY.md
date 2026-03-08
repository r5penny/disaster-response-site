# How to Replace Your Website — Step by Step
**Written for: First time doing this yourself, GoDaddy hosting**
**Time needed: About 30–45 minutes**

---

## Before You Start — Read This

**What you're doing in plain English:**
Your new website is sitting in a folder on your Desktop right now.
GoDaddy is holding your live website on their servers (computers in a data center).
You're going to upload your new files to GoDaddy so visitors see the new site.

**Nothing can go terribly wrong if you follow this order:**
1. Back up the old site first ← most important step
2. Connect GHL so your form works
3. Upload the new site
4. Test it

---

## PART 1 — Connect GoHighLevel to Your Contact Form (5 minutes)

Do this BEFORE you upload anything, while you're still on your own computer.

**What this does:** Right now the contact form shows a "success" message but
doesn't actually send you the lead. This step makes leads go into your GHL inbox.

### Step 1 — Find Your GHL Webhook URL

1. Open GoHighLevel (log in at app.gohighlevel.com)
2. Click **Settings** (gear icon, bottom left)
3. Click **Integrations**
4. Scroll down and click **Webhooks**
5. Click **+ Add Webhook** (or **Create Webhook**)
6. Name it: `Website Contact Form`
7. For **Events**, select: `Contact Created` or `Form Submitted`
8. Copy the URL it gives you — looks like:
   `https://services.leadconnectorhq.com/hooks/abc123.../webhook-trigger/...`

**OR — Easier option: Use a GHL Form Embed instead**

If you have a form already built in GHL:
1. GHL → Sites → Forms → click your form → Embed
2. Copy the "Iframe Embed" code
3. Skip ahead to Step 3 below but paste the iframe code instead

### Step 2 — Paste the URL Into Your Site

1. On your Desktop, open the `DisasterResponse-Build-2026-02-27` folder
2. Find the file called `script.js` — right-click it → **Open with** → **Notepad**
3. Look at line 17 — you'll see:
   ```
   const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE';
   ```
4. Replace `YOUR_GHL_WEBHOOK_URL_HERE` with the URL you copied from GHL.
   It should look like:
   ```
   const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/abc...';
   ```
5. Press **Ctrl + S** to save the file. Close Notepad.

---

## PART 2 — Zip Your New Website (2 minutes)

You need to compress the folder into a single .zip file so it uploads fast.

1. Go to your Desktop
2. Find the folder: `DisasterResponse-Build-2026-02-27`
3. Right-click the folder
4. Click **Compress to ZIP file** (Windows 11)
   — OR — **Send to → Compressed (zipped) folder** (older Windows)
5. A new file appears: `DisasterResponse-Build-2026-02-27.zip`
6. This might take 1–2 minutes — the site is big (230+ pages)

---

## PART 3 — Log Into GoDaddy and Back Up Your Old Site (10 minutes)

**Why back up first?** If anything goes wrong, you can restore the old site.
This takes 3 extra minutes and gives you complete safety.

### Step 1 — Open GoDaddy cPanel

1. Go to **godaddy.com** and log in
2. Click your name (top right) → **My Products**
3. Find **Web Hosting** → click **Manage**
4. Look for a button called **cPanel** → click it
   (A new tab opens with GoDaddy's server control panel)

### Step 2 — Open File Manager

1. In cPanel, find the section called **Files**
2. Click **File Manager**
3. A file browser opens — it looks like Windows Explorer but for your server

### Step 3 — Navigate to Your Website Files

1. On the left side, click the folder called **public_html**
   (This is where your live website lives)
2. You'll see your current website files here

### Step 4 — Back Up the Old Site

1. Click once on any file to make sure you're in the right place
2. Press **Ctrl + A** to select ALL files and folders
3. Click **Compress** in the top toolbar
4. Choose **Zip Archive**
5. Name it: `OLD-SITE-BACKUP-2026-02-27.zip`
6. Click **Compress Files**
7. Wait for it to finish (could take a few minutes)
8. You now have a backup of your old site stored on GoDaddy

---

## PART 4 — Upload the New Site (15 minutes)

### Step 1 — Upload the Zip File

1. You should still be in File Manager, inside `public_html`
2. Click **Upload** in the top toolbar
3. A new tab opens with an upload area
4. Click **Select File** (or drag your zip file into the browser)
5. Navigate to your Desktop → select `DisasterResponse-Build-2026-02-27.zip`
6. Wait for the upload progress bar to reach 100%
   (This takes a few minutes — the zip is large)
7. Close the upload tab when done
8. Go back to the File Manager tab and press **F5** to refresh

### Step 2 — Extract (Unzip) the New Site

1. In File Manager, you should now see the zip file you uploaded
2. Click once on `DisasterResponse-Build-2026-02-27.zip` to select it
3. Click **Extract** in the top toolbar
4. A box asks where to extract — type: `/public_html`
5. Click **Extract Files**
6. Wait — this might take 2–3 minutes

### Step 3 — Move Files to the Right Place

After extracting, the files end up inside a sub-folder like:
`public_html/DisasterResponse-Build-2026-02-27/`

But they need to be directly inside `public_html/`.
Here's how to move them:

1. Open the extracted folder (double-click it in File Manager)
2. Press **Ctrl + A** to select everything inside
3. Click **Move** in the toolbar
4. In the box that appears, type: `/public_html`
5. Click **Move Files**
6. It asks if you want to overwrite — click **Yes** (this replaces your old site)

### Step 4 — Delete the Empty Folder and Zip File

1. Navigate back to `public_html`
2. Click the now-empty folder `DisasterResponse-Build-2026-02-27`
3. Click **Delete** → confirm
4. Click the zip file `DisasterResponse-Build-2026-02-27.zip`
5. Click **Delete** → confirm

---

## PART 5 — Add the .htaccess File (5 minutes)

This file tells GoDaddy's server how to handle your website URLs.
Without it, your city pages might give "404 Not Found" errors.

1. In File Manager, make sure you're in `public_html`
2. Click **+ File** in the toolbar to create a new file
3. Name it exactly: `.htaccess` (with a dot at the start, no extension)
4. Click **Create New File**
5. Right-click the new `.htaccess` file → **Edit**
6. Delete anything in there and paste this:

```
Options -Indexes
DirectoryIndex index.html

# Force HTTPS (keeps your site secure)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Speed up your site by caching images and CSS
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

7. Click **Save Changes** → close the editor

---

## PART 6 — Test Everything (5 minutes)

### Check 1 — Does the site load?
1. Open a new browser tab
2. Type your domain: `https://disaster911.net`
3. You should see the new homepage ✅

### Check 2 — Does a city page work?
1. Go to: `https://disaster911.net/water-damage-restoration/grand-rapids-mi/`
2. Should load a full page ✅

### Check 3 — Does the contact form work?
1. Go to: `https://disaster911.net/contact/`
2. Fill in a fake name and phone number
3. Click Send
4. Check your GHL inbox — did a new contact appear?

### Check 4 — Does the mobile floating bar show?
1. On your phone, visit `https://disaster911.net`
2. You should see a red "Call" button and a green "Text" button at the bottom ✅

---

## PART 7 — Tell Google About the New Site (2 minutes)

Google needs to know your site changed so it re-crawls it.

1. Go to: **search.google.com/search-console**
2. Log in with the Google account that owns this property
3. On the left, click **Sitemaps**
4. Click **+ Add a new sitemap**
5. Type: `sitemap.xml`
6. Click **Submit**

Google will start crawling your new pages over the next few days.

---

## If Something Goes Wrong

**"My site shows a blank page"**
→ The files might be in the wrong folder. Check that `index.html` is directly
  inside `public_html/`, not inside a sub-folder.

**"I get 404 errors on city pages"**
→ The `.htaccess` file is missing or wrong. Redo Part 5.

**"The site looks broken / no CSS"**
→ Check that `styles.css` is directly in `public_html/` (same level as index.html)

**"The contact form doesn't send to GHL"**
→ Check that you saved the GHL webhook URL in `script.js` (Part 1)

**"I want to go back to the old site"**
→ In cPanel File Manager, find `OLD-SITE-BACKUP-2026-02-27.zip`
→ Extract it back into `public_html/` (overwrite the new files)

---

## Quick Reference — Important File Locations After Upload

```
public_html/
  index.html          ← your homepage
  styles.css          ← all the site styles
  script.js           ← JavaScript (has your GHL webhook URL)
  google-reviews.js   ← shows Google review cards
  reviews-cache.json  ← saved review data
  sitemap.xml         ← tells Google all your pages
  robots.txt          ← tells Google what to crawl
  .htaccess           ← server rules (you created this in Part 5)
  /images/            ← all photos
  /water-damage-restoration/  ← water damage pages
  /fire-damage-restoration/   ← fire damage pages
  /mold-remediation/          ← mold pages
  /sewage-cleanup/            ← sewage pages
  /blog/              ← blog posts
  /about/             ← about page
  /contact/           ← contact page
```

---

## You Did It

Once the site is live and the form is sending leads to GHL, you're done.
Your old dev handled this behind the scenes — now you know how it works.

Save this file somewhere safe. Next time you need to update the site,
the process is the same: edit files on your computer, zip, upload, extract.
```
