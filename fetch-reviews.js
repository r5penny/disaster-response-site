/**
 * fetch-reviews.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pulls real Google reviews from the Places API and saves them to
 * reviews-cache.json — the website reads that file, so your API key
 * NEVER touches the browser.
 *
 * SETUP (one time):
 *   1. Get a free Google API key:
 *      → https://console.cloud.google.com/
 *      → Create project → Enable "Places API (New)" or "Places API"
 *      → Credentials → Create API Key
 *      → (Restrict it to "IP addresses" for server use)
 *
 *   2. Paste your key below where it says PASTE_YOUR_API_KEY_HERE
 *
 * RUN:
 *   node fetch-reviews.js
 *
 * SCHEDULE (Windows Task Scheduler or just run manually):
 *   Run once a week to keep reviews fresh.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const API_KEY  = 'PASTE_YOUR_API_KEY_HERE';
const PLACE_ID = 'ChIJ9f8TU0GyGYgRKUghuAZi1Mo'; // Disaster Response by Ryan

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const OUT = path.join(__dirname, 'reviews-cache.json');

const url = `https://maps.googleapis.com/maps/api/place/details/json`
    + `?place_id=${PLACE_ID}`
    + `&fields=name,rating,user_ratings_total,reviews`
    + `&reviews_sort=newest`
    + `&key=${API_KEY}`;

console.log('Fetching reviews from Google Places API...');

https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);

            if (data.status !== 'OK') {
                console.error('❌ API error:', data.status, data.error_message || '');
                process.exit(1);
            }

            const result = data.result;
            const reviews = (result.reviews || [])
                .filter(r => r.rating >= 4)
                .map(r => ({
                    author_name:             r.author_name,
                    author_url:              r.author_url,
                    profile_photo_url:       r.profile_photo_url,
                    rating:                  r.rating,
                    text:                    r.text,
                    relative_time_description: r.relative_time_description,
                    time:                    r.time,
                }));

            const cache = {
                fetched_at:          new Date().toISOString(),
                place_id:            PLACE_ID,
                name:                result.name,
                rating:              result.rating,
                user_ratings_total:  result.user_ratings_total,
                reviews,
            };

            fs.writeFileSync(OUT, JSON.stringify(cache, null, 2), 'utf8');

            console.log(`✅ Saved ${reviews.length} reviews to reviews-cache.json`);
            console.log(`   Rating: ${result.rating} ⭐  (${result.user_ratings_total} total)`);
            reviews.forEach((r, i) =>
                console.log(`   ${i + 1}. ${r.author_name} — ${r.rating}★  "${r.text.slice(0, 60)}..."`)
            );
        } catch (err) {
            console.error('❌ Parse error:', err.message);
            process.exit(1);
        }
    });
}).on('error', err => {
    console.error('❌ Network error:', err.message);
    process.exit(1);
});
