/**
 * fetch-reviews-gbp.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches ALL Google reviews using the Google Business Profile API v4.
 *
 * WHY this is better than fetch-reviews.js (which uses Places API):
 *   - Places API: returns only the 5 most recent reviews
 *   - GBP API:    returns ALL reviews, paginated — you get your full review history
 *   - GBP API:    shows whether you've replied to each review
 *   - GBP API:    lets you see review content in full (Places API truncates long ones)
 *
 * Uses the same OAuth credentials as fetch-customer-photos.js.
 * Run that script first with --list to get your locationId.
 *
 * WHAT IS PAGINATION?
 *   If you have 50 reviews, the API doesn't send all 50 at once — it sends
 *   them in "pages" of 10 or 20. This script automatically requests the next
 *   page until there are no more, then combines everything together.
 *
 * SETUP:
 *   1. Complete the setup in fetch-customer-photos.js first (OAuth credentials)
 *   2. Fill in your locationId in CONFIG below
 *   3. Run: node fetch-reviews-gbp.js
 *
 * The output overwrites reviews-cache.json so google-reviews.js on your
 * website automatically picks up the new data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');
const urlMod = require('url');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
    // Same locationId as fetch-customer-photos.js
    // Example: 'accounts/123456789012345/locations/987654321098765'
    locationId: 'accounts/YOUR_ACCOUNT_ID/locations/YOUR_LOCATION_ID',

    // How many reviews per page (max 50 per GBP API limits)
    pageSize: 50,

    // Minimum star rating to include in website cache (1-5)
    // Set to 4 to only show 4★ and 5★ reviews on your site
    minRatingForSite: 4,

    // Output files
    fullCacheFile: path.join(__dirname, 'reviews-full-cache.json'), // All reviews (for your records)
    siteCacheFile: path.join(__dirname, 'reviews-cache.json'),       // Filtered for website display

    tokenFile:       path.join(__dirname, 'gbp-token.json'),
    credentialsFile: path.join(__dirname, 'gbp-credentials.json'),
};

// ── Load OAuth token (created by fetch-customer-photos.js) ───────────────────
function loadToken() {
    if (!fs.existsSync(CONFIG.tokenFile)) {
        console.error(`
❌ No OAuth token found.

Please run fetch-customer-photos.js first to authorize your Google account:
  node fetch-customer-photos.js --list

This creates the gbp-token.json file that this script needs.
`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(CONFIG.tokenFile, 'utf8'));
}

function loadCredentials() {
    if (!fs.existsSync(CONFIG.credentialsFile)) {
        console.error('❌ Missing gbp-credentials.json. See fetch-customer-photos.js for setup steps.');
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(CONFIG.credentialsFile, 'utf8'));
    return raw.installed || raw.web;
}

// ── Refresh token if expired ──────────────────────────────────────────────────
function refreshToken(credentials, token) {
    return new Promise((resolve, reject) => {
        const body = new urlMod.URLSearchParams({
            client_id:     credentials.client_id,
            client_secret: credentials.client_secret,
            refresh_token: token.refresh_token,
            grant_type:    'refresh_token',
        }).toString();

        const req = https.request({
            hostname: 'oauth2.googleapis.com',
            path:     '/token',
            method:   'POST',
            headers:  { 'Content-Type': 'application/x-www-form-urlencoded' },
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const fresh = JSON.parse(data);
                fresh.refresh_token = fresh.refresh_token || token.refresh_token;
                fresh.expiry_date   = Date.now() + (fresh.expires_in * 1000);
                fs.writeFileSync(CONFIG.tokenFile, JSON.stringify(fresh, null, 2));
                resolve(fresh);
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── API GET helper ────────────────────────────────────────────────────────────
function apiGet(apiUrl, accessToken) {
    return new Promise((resolve, reject) => {
        const parsed = new urlMod.URL(apiUrl);
        https.get({
            hostname: parsed.hostname,
            path:     parsed.pathname + parsed.search,
            headers:  { 'Authorization': `Bearer ${accessToken}` },
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error('JSON parse error: ' + body.substring(0, 300))); }
            });
        }).on('error', reject);
    });
}

// ── Fetch all reviews (handles pagination automatically) ──────────────────────
async function fetchAllReviews(accessToken) {
    const allReviews = [];
    let pageToken    = null;  // "pageToken" is like a bookmark — the API gives you one if there's a next page
    let pageNumber   = 1;
    let totalFetched = 0;

    console.log('📝 Fetching reviews (all pages)...');

    do {
        // Build URL — add pageToken if we have one (tells API where to continue)
        let apiUrl = `https://mybusiness.googleapis.com/v4/${CONFIG.locationId}/reviews`
            + `?pageSize=${CONFIG.pageSize}&orderBy=updateTime desc`;

        if (pageToken) {
            apiUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        const data = await apiGet(apiUrl, accessToken);

        if (data.error) {
            console.error('❌ API error:', data.error.message, '(code:', data.error.code + ')');
            if (data.error.code === 404) {
                console.error('\nLocation not found. Double-check your locationId in CONFIG.');
            }
            process.exit(1);
        }

        const reviews = data.reviews || [];
        allReviews.push(...reviews);
        totalFetched += reviews.length;

        console.log(`  Page ${pageNumber}: fetched ${reviews.length} review(s) (total so far: ${totalFetched})`);

        // If API provides a nextPageToken, there are more pages to fetch
        pageToken = data.nextPageToken || null;
        pageNumber++;

    } while (pageToken); // Keep going until no more pages

    console.log(`\n✅ Total reviews fetched: ${allReviews.length}`);
    return allReviews;
}

// ── Transform raw API review into clean format ────────────────────────────────
function transformReview(r) {
    return {
        // Reviewer info
        author_name:              r.reviewer?.displayName || 'Anonymous',
        profile_photo_url:        r.reviewer?.profilePhotoUrl || '',

        // Rating (1-5 stars)
        rating:                   r.starRating ? starRatingToNumber(r.starRating) : 0,
        star_rating_label:        r.starRating, // "FIVE", "FOUR", etc.

        // Review text (may be empty if reviewer only left a star rating)
        text:                     r.comment || '',

        // Dates
        create_time:              r.createTime,
        update_time:              r.updateTime,
        relative_time_description: formatRelativeTime(r.createTime),

        // Whether you've responded (useful for monitoring)
        has_reply:                !!r.reviewReply,
        reply_text:               r.reviewReply?.comment || '',
        reply_time:               r.reviewReply?.updateTime || '',

        // Internal GBP resource name (needed if you want to post a reply)
        review_id:                r.name,
    };
}

// ── Convert GBP's text star rating to number ──────────────────────────────────
// WHY: The GBP API returns "FIVE" instead of 5 — this converts it
function starRatingToNumber(label) {
    const map = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    return map[label] || 0;
}

// ── Format a date as "2 months ago" style text ────────────────────────────────
function formatRelativeTime(isoDate) {
    if (!isoDate) return '';
    const diff   = Date.now() - new Date(isoDate).getTime();
    const days   = Math.floor(diff / 86400000);
    const weeks  = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years  = Math.floor(days / 365);

    if (days < 2)    return 'Yesterday';
    if (days < 7)    return `${days} days ago`;
    if (weeks < 5)   return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    if (CONFIG.locationId.includes('YOUR_')) {
        console.error('\n❌ Setup required: fill in CONFIG.locationId in this file.');
        console.error('   Run: node fetch-customer-photos.js --list  to find your IDs\n');
        process.exit(1);
    }

    const credentials = loadCredentials();
    let token         = loadToken();

    // Refresh token if expired
    if (Date.now() > (token.expiry_date - 60000)) {
        console.log('Token expired. Refreshing...');
        token = await refreshToken(credentials, token);
    }

    const rawReviews = await fetchAllReviews(token.access_token);

    // Transform all reviews
    const allTransformed = rawReviews.map(transformReview);

    // Calculate overall stats
    const totalRatings  = allTransformed.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = allTransformed.length ? (totalRatings / allTransformed.length).toFixed(1) : '0.0';
    const withText      = allTransformed.filter(r => r.text.trim().length > 0);
    const unanswered    = allTransformed.filter(r => !r.has_reply && r.rating <= 3);

    // Print summary
    console.log('\n📊 Review Summary:');
    console.log(`   Average rating: ${averageRating} ⭐ (${allTransformed.length} total reviews)`);
    console.log(`   Reviews with text: ${withText.length}`);
    if (unanswered.length > 0) {
        console.log(`   ⚠️  Unanswered negative reviews: ${unanswered.length} (check reviews-full-cache.json)`);
    }

    // Save full cache (all reviews, for your records)
    const fullOutput = {
        fetched_at:          new Date().toISOString(),
        location:            CONFIG.locationId,
        rating:              parseFloat(averageRating),
        user_ratings_total:  allTransformed.length,
        reviews:             allTransformed,
    };
    fs.writeFileSync(CONFIG.fullCacheFile, JSON.stringify(fullOutput, null, 2));
    console.log(`\n💾 Full cache saved: ${CONFIG.fullCacheFile}`);

    // Save site cache (only high-rated, for website display)
    // Format matches what google-reviews.js expects
    const siteReviews = allTransformed
        .filter(r => r.rating >= CONFIG.minRatingForSite && r.text.trim().length > 10)
        .sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
        .slice(0, 10); // Show up to 10 on the website

    const siteOutput = {
        fetched_at:         new Date().toISOString(),
        rating:             parseFloat(averageRating),
        user_ratings_total: allTransformed.length,
        reviews:            siteReviews.map(r => ({
            author_name:              r.author_name,
            profile_photo_url:        r.profile_photo_url,
            rating:                   r.rating,
            text:                     r.text,
            relative_time_description: r.relative_time_description,
        })),
    };
    fs.writeFileSync(CONFIG.siteCacheFile, JSON.stringify(siteOutput, null, 2));
    console.log(`💾 Site cache saved: ${CONFIG.siteCacheFile} (${siteReviews.length} reviews shown on website)`);
    console.log('\nRun this script weekly to keep reviews fresh.\n');
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
