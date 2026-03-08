/**
 * fetch-customer-photos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches real customer-contributed photos from your Google Business Profile
 * using the Google Business Profile API v4 (media.customers endpoint).
 *
 * WHAT THIS DOES:
 *   Customers who take photos at your job sites or add photos to your
 *   Google Maps listing are "customer contributors". This script pulls
 *   those photos and saves them to customer-photos-cache.json so your
 *   website can display them without ever exposing API credentials.
 *
 * SETUP (one time — takes about 10 minutes):
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 1: Enable the Google Business Profile API
 *   → Go to: https://console.cloud.google.com/
 *   → Select your project (or create one)
 *   → Search "Google Business Profile API" → Enable it
 *
 * Step 2: Create OAuth 2.0 Credentials
 *   → Google Cloud Console → APIs & Services → Credentials
 *   → + Create Credentials → OAuth 2.0 Client ID
 *   → Application type: "Desktop app"
 *   → Name it "GBP Photo Fetcher" → Create
 *   → Download the JSON file → rename it to "gbp-credentials.json"
 *   → Place it in this same folder
 *
 * Step 3: Find your Account and Location IDs
 *   → Run:  node fetch-customer-photos.js --list
 *   → It will print your account ID and location ID
 *   → Paste them into the config below
 *
 * Step 4: Run it
 *   → node fetch-customer-photos.js
 *   → First run opens a browser for you to sign in with your Google account
 *   → After approving, it saves a token and never asks again
 *
 * WHY OAuth instead of a simple API key?
 *   Because you're accessing YOUR OWN private business data (not public data).
 *   OAuth proves you own the account. A regular API key would let anyone
 *   who stole it read your business data — OAuth prevents that.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';
const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const url     = require('url');
const crypto  = require('crypto');

// ── CONFIG — Fill these in after running with --list ──────────────────────────
const CONFIG = {
    // Your Google Business Profile account ID
    // Looks like: accounts/123456789012345
    accountId: 'accounts/YOUR_ACCOUNT_ID',

    // Your specific location/business ID
    // Looks like: accounts/123456789012345/locations/987654321098765
    locationId: 'accounts/YOUR_ACCOUNT_ID/locations/YOUR_LOCATION_ID',

    // How many customer photos to fetch (max 100)
    pageSize: 50,

    // Where to save the output
    outputFile: path.join(__dirname, 'customer-photos-cache.json'),

    // Where to save the OAuth token after first login
    tokenFile: path.join(__dirname, 'gbp-token.json'),

    // Your OAuth credentials file (downloaded from Google Cloud Console)
    credentialsFile: path.join(__dirname, 'gbp-credentials.json'),
};

// ── OAuth 2.0 Scopes needed ───────────────────────────────────────────────────
// We only request READ access — this script never modifies your listing
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

// ── Load credentials ──────────────────────────────────────────────────────────
function loadCredentials() {
    if (!fs.existsSync(CONFIG.credentialsFile)) {
        console.error(`
❌ Missing: gbp-credentials.json

Please follow the SETUP steps in the comments at the top of this file.
Short version:
  1. Go to https://console.cloud.google.com/
  2. APIs & Services → Credentials → Create OAuth 2.0 Client ID (Desktop app)
  3. Download the JSON → rename to gbp-credentials.json → place in this folder
`);
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(CONFIG.credentialsFile, 'utf8'));
    // Credentials file has either "installed" (desktop app) or "web" key
    return raw.installed || raw.web;
}

// ── OAuth Token Management ────────────────────────────────────────────────────
function loadToken() {
    if (fs.existsSync(CONFIG.tokenFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.tokenFile, 'utf8'));
    }
    return null;
}

function saveToken(token) {
    fs.writeFileSync(CONFIG.tokenFile, JSON.stringify(token, null, 2));
    console.log('✅ OAuth token saved to:', CONFIG.tokenFile);
}

// ── Request a new access token using OAuth authorization code flow ────────────
function getNewToken(credentials) {
    return new Promise((resolve, reject) => {
        const authUrl = buildAuthUrl(credentials);

        console.log('\n🔐 Authorization Required');
        console.log('─────────────────────────────────────────');
        console.log('Open this URL in your browser to sign in:');
        console.log('\n' + authUrl + '\n');
        console.log('─────────────────────────────────────────');
        console.log('Waiting for Google to redirect back...');
        console.log('(A local server is listening on port 3456)\n');

        // Start a temporary local server to receive the OAuth callback
        const server = http.createServer(async (req, res) => {
            const parsed = url.parse(req.url, true);
            if (parsed.pathname !== '/callback') {
                res.end('Waiting...');
                return;
            }

            const code = parsed.query.code;
            if (!code) {
                res.end('Error: no code received');
                reject(new Error('No authorization code received'));
                server.close();
                return;
            }

            res.end('<h2>✅ Authorized! You can close this tab and return to the terminal.</h2>');
            server.close();

            try {
                const token = await exchangeCodeForToken(credentials, code);
                saveToken(token);
                resolve(token);
            } catch (err) {
                reject(err);
            }
        });

        server.listen(3456, 'localhost');
    });
}

function buildAuthUrl(credentials) {
    const params = new url.URLSearchParams({
        client_id:     credentials.client_id,
        redirect_uri:  'http://localhost:3456/callback',
        response_type: 'code',
        scope:         SCOPES.join(' '),
        access_type:   'offline',   // Gets a refresh token so you don't re-authorize every hour
        prompt:        'consent',   // Forces consent screen to ensure we get refresh_token
    });
    return (credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth') + '?' + params.toString();
}

function exchangeCodeForToken(credentials, code) {
    return new Promise((resolve, reject) => {
        const body = new url.URLSearchParams({
            code,
            client_id:     credentials.client_id,
            client_secret: credentials.client_secret,
            redirect_uri:  'http://localhost:3456/callback',
            grant_type:    'authorization_code',
        }).toString();

        const tokenUrl = credentials.token_uri || 'https://oauth2.googleapis.com/token';
        const parsed   = new url.URL(tokenUrl);
        const options  = {
            hostname: parsed.hostname,
            path:     parsed.pathname + parsed.search,
            method:   'POST',
            headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const token = JSON.parse(data);
                    if (token.error) reject(new Error(token.error_description || token.error));
                    else {
                        // Store expiry timestamp so we know when to refresh
                        token.expiry_date = Date.now() + (token.expires_in * 1000);
                        resolve(token);
                    }
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Refresh access token using refresh token ──────────────────────────────────
function refreshAccessToken(credentials, token) {
    return new Promise((resolve, reject) => {
        const body = new url.URLSearchParams({
            client_id:     credentials.client_id,
            client_secret: credentials.client_secret,
            refresh_token: token.refresh_token,
            grant_type:    'refresh_token',
        }).toString();

        const tokenUrl = credentials.token_uri || 'https://oauth2.googleapis.com/token';
        const parsed   = new url.URL(tokenUrl);
        const options  = {
            hostname: parsed.hostname,
            path:     parsed.pathname,
            method:   'POST',
            headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const fresh = JSON.parse(data);
                fresh.refresh_token = fresh.refresh_token || token.refresh_token; // Keep old refresh token
                fresh.expiry_date   = Date.now() + (fresh.expires_in * 1000);
                resolve(fresh);
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── HTTPS GET helper ──────────────────────────────────────────────────────────
function apiGet(apiUrl, accessToken) {
    return new Promise((resolve, reject) => {
        const parsed = new url.URL(apiUrl);
        https.get({
            hostname: parsed.hostname,
            path:     parsed.pathname + parsed.search,
            headers:  { 'Authorization': `Bearer ${accessToken}` },
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error('JSON parse error: ' + body.substring(0, 200))); }
            });
        }).on('error', reject);
    });
}

// ── List accounts and locations (for setup) ───────────────────────────────────
async function listAccountsAndLocations(accessToken) {
    console.log('\n📋 Your Google Business Profile Accounts & Locations:');
    console.log('─────────────────────────────────────────────────────');

    const accounts = await apiGet('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', accessToken);
    if (!accounts.accounts || accounts.accounts.length === 0) {
        console.log('No accounts found. Make sure your Google account manages a Business Profile.');
        return;
    }

    for (const account of accounts.accounts) {
        console.log(`\nAccount: ${account.name}`);
        console.log(`  → accountId: "${account.name}"`);

        // List locations under this account
        const locsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,websiteUri`;
        const locs    = await apiGet(locsUrl, accessToken);
        if (locs.locations) {
            for (const loc of locs.locations) {
                console.log(`\n  Location: ${loc.title || loc.name}`);
                console.log(`    → locationId: "${loc.name}"`);
            }
        }
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log('Copy the accountId and locationId values into CONFIG at the top of this file.\n');
}

// ── Fetch customer-contributed media ─────────────────────────────────────────
// Uses: GET /v4/{parent=accounts/*/locations/*}/media/customers
async function fetchCustomerPhotos(accessToken) {
    console.log('📸 Fetching customer-contributed photos...');

    const apiUrl = `https://mybusiness.googleapis.com/v4/${CONFIG.locationId}/media/customers`
        + `?pageSize=${CONFIG.pageSize}`;

    const data = await apiGet(apiUrl, accessToken);

    if (data.error) {
        console.error('❌ API error:', data.error.message);
        console.error('Code:', data.error.code);
        if (data.error.code === 403) {
            console.error('\nPermission denied. Make sure:');
            console.error('  1. Google Business Profile API is enabled in your Google Cloud project');
            console.error('  2. Your account owns/manages this Business Profile location');
        }
        process.exit(1);
    }

    const mediaItems = data.mediaItems || [];
    console.log(`✅ Found ${mediaItems.length} customer photo(s)`);

    // Transform to a simple format for use on the website
    const photos = mediaItems.map(item => ({
        name:         item.name,                    // Resource name (internal ID)
        googleUrl:    item.googleUrl,               // Hosted URL of the photo
        thumbnailUrl: item.thumbnailUrl,            // Smaller version for grids
        createTime:   item.createTime,              // When customer uploaded it
        dimensions:   item.dimensions || null,      // Width/height if available
    })).filter(p => p.googleUrl); // Only keep items with a usable URL

    return photos;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const isListMode = process.argv.includes('--list');
    const credentials = loadCredentials();

    // Load existing token or get a new one
    let token = loadToken();

    if (!token) {
        console.log('No saved token found. Starting OAuth authorization flow...');
        token = await getNewToken(credentials);
    } else if (Date.now() > (token.expiry_date - 60000)) {
        // Token expires within 1 minute — refresh it
        console.log('Token expired. Refreshing...');
        token = await refreshAccessToken(credentials, token);
        saveToken(token);
    }

    const accessToken = token.access_token;

    if (isListMode) {
        // Just show account/location IDs so user can configure CONFIG above
        await listAccountsAndLocations(accessToken);
        return;
    }

    // Verify CONFIG has been filled in
    if (CONFIG.locationId.includes('YOUR_')) {
        console.error('\n❌ Setup required: edit CONFIG.locationId in this file.');
        console.error('   Run with --list to see your IDs:\n');
        console.error('   node fetch-customer-photos.js --list\n');
        process.exit(1);
    }

    // Fetch the photos
    const photos = await fetchCustomerPhotos(accessToken);

    // Save to cache file
    const output = {
        fetched_at: new Date().toISOString(),
        location:   CONFIG.locationId,
        count:      photos.length,
        photos,
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved ${photos.length} photo(s) to: ${CONFIG.outputFile}`);
    console.log('Run this script weekly to keep photos fresh.\n');
    console.log('To display on your website, the customer-photo-gallery.js snippet');
    console.log('reads customer-photos-cache.json and renders the photo grid.\n');
}

main().catch(err => {
    console.error('\n❌ Unexpected error:', err.message);
    process.exit(1);
});
