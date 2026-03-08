const express = require("express");
const path = require("path");
const fs = require("fs");
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const WordPressService = require("./wordpress-service");
const GoogleGateway = require("./google-gateway");

const app = express();
const PORT = 8080;

// Setup LiveReload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname);
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// Middleware to inject livereload script
app.use(connectLiveReload());

const wp = new WordPressService();
const google = new GoogleGateway();

app.use(express.static(__dirname));

// ============================================================
// SITEMAP-DRIVEN SCANNER — REAL DATA ONLY
// ============================================================

/**
 * Parse sitemap.xml and return all URLs listed in it
 */
function parseSitemap() {
  const sitemapPath = path.join(__dirname, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    return { error: "sitemap.xml not found", urls: [] };
  }
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
  const urls = locMatches.map((m) => m.replace(/<\/?loc>/g, ""));
  return { error: null, urls };
}

/**
 * Convert a sitemap URL to a local file path
 * e.g., https://disaster911.net/about/ -> ./about/index.html
 */
function urlToLocalPath(sitemapUrl) {
  const base = "https://disaster911.net";
  let route = sitemapUrl.replace(base, "");
  if (route === "" || route === "/") {
    return path.join(__dirname, "index.html");
  }
  // Remove trailing slash, add index.html
  if (route.endsWith("/")) {
    return path.join(__dirname, route, "index.html");
  }
  return path.join(__dirname, route);
}

/**
 * Run real SEO audit on a single HTML file
 * Returns factual data only — no guessing
 */
function auditPage(filePath, sitemapUrl) {
  const result = {
    url: sitemapUrl,
    localPath: filePath,
    exists: false,
    fileSize: 0,
    seo: {
      hasTitle: false,
      title: null,
      titleLength: 0,
      hasMetaDescription: false,
      metaDescription: null,
      metaDescriptionLength: 0,
      hasH1: false,
      h1: null,
      h1Count: 0,
      hasCanonical: false,
      canonical: null,
      hasSchema: false,
      schemaTypes: [],
      hasOGTags: false,
      hasPhoneLink: false,
      hasNAP: false,
      wordCount: 0,
      imageCount: 0,
      imagesWithoutAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
    },
    issues: [],
    score: 0,
  };

  if (!fs.existsSync(filePath)) {
    result.issues.push(
      "FILE_MISSING: Page listed in sitemap but file does not exist locally",
    );
    return result;
  }

  result.exists = true;
  const stat = fs.statSync(filePath);
  result.fileSize = stat.size;

  const html = fs.readFileSync(filePath, "utf8");

  // Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    result.seo.hasTitle = true;
    result.seo.title = titleMatch[1].trim();
    result.seo.titleLength = result.seo.title.length;
    if (result.seo.titleLength < 30)
      result.issues.push("TITLE_SHORT: Title under 30 characters");
    if (result.seo.titleLength > 60)
      result.issues.push("TITLE_LONG: Title over 60 characters");
  } else {
    result.issues.push("TITLE_MISSING: No <title> tag found");
  }

  // Meta Description
  const metaDescMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
  );
  if (metaDescMatch) {
    result.seo.hasMetaDescription = true;
    result.seo.metaDescription = metaDescMatch[1].trim();
    result.seo.metaDescriptionLength = result.seo.metaDescription.length;
    if (result.seo.metaDescriptionLength < 70)
      result.issues.push(
        "META_DESC_SHORT: Meta description under 70 characters",
      );
    if (result.seo.metaDescriptionLength > 160)
      result.issues.push(
        "META_DESC_LONG: Meta description over 160 characters",
      );
  } else {
    result.issues.push("META_DESC_MISSING: No meta description found");
  }

  // H1 Tags
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  result.seo.h1Count = h1Matches.length;
  if (h1Matches.length > 0) {
    result.seo.hasH1 = true;
    result.seo.h1 = h1Matches[0].replace(/<[^>]+>/g, "").trim();
  } else {
    result.issues.push("H1_MISSING: No H1 tag found");
  }
  if (h1Matches.length > 1) {
    result.issues.push(
      "H1_MULTIPLE: Multiple H1 tags found (" + h1Matches.length + ")",
    );
  }

  // Canonical
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i,
  );
  if (canonicalMatch) {
    result.seo.hasCanonical = true;
    result.seo.canonical = canonicalMatch[1];
  } else {
    result.issues.push("CANONICAL_MISSING: No canonical URL specified");
  }

  // Schema/Structured Data
  const schemaMatches =
    html.match(
      /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi,
    ) || [];
  if (schemaMatches.length > 0) {
    result.seo.hasSchema = true;
    schemaMatches.forEach((s) => {
      try {
        const json = JSON.parse(
          s.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, ""),
        );
        if (json["@type"]) result.seo.schemaTypes.push(json["@type"]);
      } catch (e) {
        /* invalid JSON */
      }
    });
  }

  // Open Graph
  result.seo.hasOGTags = /<meta\s+property=["']og:/i.test(html);

  // Phone link (CTA)
  result.seo.hasPhoneLink = /href=["']tel:/i.test(html);

  // NAP (Name, Address, Phone) — check for the real business info
  result.seo.hasNAP =
    html.includes("616") &&
    html.includes("822-1978") &&
    html.includes("Walker");

  // Word count (strip tags, count words)
  const textOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  result.seo.wordCount = textOnly.split(" ").filter((w) => w.length > 0).length;

  // Images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  result.seo.imageCount = imgMatches.length;
  result.seo.imagesWithoutAlt = imgMatches.filter(
    (img) => !img.match(/alt=["'][^"']+["']/i),
  ).length;
  if (result.seo.imagesWithoutAlt > 0) {
    result.issues.push(
      "IMG_ALT_MISSING: " +
        result.seo.imagesWithoutAlt +
        " image(s) missing alt text",
    );
  }

  // Links
  const linkMatches = html.match(/<a\s[^>]*href=["']([^"']*?)["']/gi) || [];
  linkMatches.forEach((link) => {
    const hrefMatch = link.match(/href=["']([^"']*?)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith("http") && !href.includes("disaster911.net")) {
        result.seo.externalLinks++;
      } else if (
        !href.startsWith("tel:") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("#")
      ) {
        result.seo.internalLinks++;
      }
    }
  });

  // Word count warning
  if (
    result.seo.wordCount < 300 &&
    !sitemapUrl.includes("/blog/") &&
    sitemapUrl !== "https://disaster911.net/privacy-policy/" &&
    sitemapUrl !== "https://disaster911.net/terms/"
  ) {
    result.issues.push(
      "THIN_CONTENT: Page has only " +
        result.seo.wordCount +
        " words (target 300+)",
    );
  }

  // Calculate honest SEO score (0-100)
  let score = 0;
  if (result.seo.hasTitle) score += 15;
  if (result.seo.titleLength >= 30 && result.seo.titleLength <= 60) score += 5;
  if (result.seo.hasMetaDescription) score += 15;
  if (
    result.seo.metaDescriptionLength >= 70 &&
    result.seo.metaDescriptionLength <= 160
  )
    score += 5;
  if (result.seo.hasH1 && result.seo.h1Count === 1) score += 15;
  if (result.seo.hasCanonical) score += 10;
  if (result.seo.hasSchema) score += 10;
  if (result.seo.hasPhoneLink) score += 5;
  if (result.seo.hasNAP) score += 5;
  if (result.seo.wordCount >= 300) score += 10;
  if (result.seo.imagesWithoutAlt === 0 && result.seo.imageCount > 0)
    score += 5;
  result.score = score;

  return result;
}

/**
 * Full sitemap-driven audit
 */
function runFullAudit() {
  const startTime = Date.now();
  const logs = [];
  const { error, urls } = parseSitemap();

  if (error) {
    logs.push(`[CRITICAL] ${error}`);
    return { logs, summary: null, pages: [] };
  }

  logs.push(
    `[${new Date().toLocaleTimeString()}] 🚀 SITEMAP-DRIVEN AUDIT STARTING...`,
  );
  logs.push(`[SITEMAP] Found ${urls.length} URLs in sitemap.xml`);

  const pageResults = [];
  let verified = 0;
  let missing = 0;
  let totalScore = 0;
  let totalIssues = 0;
  const issueBreakdown = {};

  urls.forEach((url, i) => {
    const localPath = urlToLocalPath(url);
    const audit = auditPage(localPath, url);
    pageResults.push(audit);

    if (audit.exists) {
      verified++;
      totalScore += audit.score;

      // Log every page with its score
      const shortUrl = url.replace("https://disaster911.net", "");
      if (audit.score >= 80) {
        logs.push(`[✅ ${audit.score}/100] ${shortUrl}`);
      } else if (audit.score >= 50) {
        logs.push(
          `[⚠️ ${audit.score}/100] ${shortUrl} — ${audit.issues.length} issue(s)`,
        );
      } else {
        logs.push(
          `[❌ ${audit.score}/100] ${shortUrl} — ${audit.issues.length} issue(s)`,
        );
      }
    } else {
      missing++;
      logs.push(`[🚫 MISSING] ${url}`);
    }

    // Track issue types
    audit.issues.forEach((issue) => {
      const type = issue.split(":")[0];
      totalIssues++;
      issueBreakdown[type] = (issueBreakdown[type] || 0) + 1;
    });
  });

  const elapsedMs = Date.now() - startTime;
  const avgScore = verified > 0 ? Math.round(totalScore / verified) : 0;

  logs.push("");
  logs.push(
    `[${new Date().toLocaleTimeString()}] 🏆 AUDIT COMPLETE in ${elapsedMs}ms`,
  );
  logs.push(`[SUMMARY] Pages in Sitemap: ${urls.length}`);
  logs.push(`[SUMMARY] Pages Verified Locally: ${verified}/${urls.length}`);
  logs.push(`[SUMMARY] Pages Missing: ${missing}`);
  logs.push(`[SUMMARY] Average SEO Score: ${avgScore}/100`);
  logs.push(`[SUMMARY] Total Issues Found: ${totalIssues}`);

  if (Object.keys(issueBreakdown).length > 0) {
    logs.push("");
    logs.push("[ISSUE BREAKDOWN]");
    Object.entries(issueBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        logs.push(`  ${type}: ${count} page(s)`);
      });
  }

  const summary = {
    totalInSitemap: urls.length,
    verified,
    missing,
    avgScore,
    totalIssues,
    issueBreakdown,
    elapsedMs,
  };

  return { logs, summary, pages: pageResults };
}

// ============================================================
// API ROUTES — ALL REAL DATA
// ============================================================

// FULL SITEMAP AUDIT
app.get("/api/rescan", async (req, res) => {
  try {
    const result = runFullAudit();
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, logs: [`[FATAL] ${e.message}`] });
  }
});

// LIVE SITE CHECK — actually hit disaster911.net to verify pages are online
app.get("/api/live-check", async (req, res) => {
  try {
    const { urls } = parseSitemap();
    // Only check a sample (first 10) to avoid hammering the server
    const sample = urls.slice(0, 10);
    const results = await google.batchCheckLiveUrls(sample);
    const alive = results.filter((r) => r.alive).length;
    res.json({
      source: "REAL_HTTP_CHECK",
      checked: sample.length,
      totalInSitemap: urls.length,
      alive,
      dead: sample.length - alive,
      results,
    });
  } catch (e) {
    res.json({ source: "ERROR", error: e.message });
  }
});

// WORDPRESS STATUS — honest about connection state
app.get("/api/gateway/wordpress", async (req, res) => {
  try {
    const isConfigured = wp.config && wp.config.username !== "YOUR_WP_USERNAME";
    const { urls } = parseSitemap();
    res.json({
      source: isConfigured ? "LIVE_API" : "LOCAL_SCAN",
      connected: isConfigured,
      url: wp.config ? wp.config.url : "https://disaster911.net",
      lastScan: new Date().toLocaleString(),
      pagesInSitemap: urls.length,
      syncStatus: isConfigured
        ? "Connected to WP API"
        : "WP API Not Connected — showing local data only",
      message: isConfigured
        ? null
        : "Update wp-config.json with real WordPress credentials to enable live sync.",
    });
  } catch (e) {
    res.json({ source: "ERROR", connected: false, error: e.message });
  }
});

// GOOGLE GATEWAY — honest about connection state
app.get("/api/gateway/google", async (req, res) => {
  try {
    const searchData = await google.fetchSearchPerformance();
    const analytics = await google.fetchAnalytics();
    res.json({ search: searchData, analytics: analytics });
  } catch (e) {
    res.json({ search: null, analytics: null, error: e.message });
  }
});

// GMB DATA — from reviews-cache.json
app.get("/api/gmb", (req, res) => {
  try {
    const cachePath = path.join(__dirname, "reviews-cache.json");
    if (fs.existsSync(cachePath)) {
      const data = JSON.parse(fs.readFileSync(cachePath, "utf8"));
      res.json(data);
    } else {
      res.status(404).json({ error: "reviews-cache.json not found" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SEO DATA — from seo-data.json
app.get("/api/seo-data", (req, res) => {
  try {
    const dataPath = path.join(__dirname, "seo-data.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      res.json(data);
    } else {
      res.status(404).json({ error: "seo-data.json not found" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// INDEPENDENT VERIFICATION — proves every claim is real
app.get("/api/verify", async (req, res) => {
  try {
    const checks = [];
    const startTime = Date.now();

    // CHECK 1: Count <loc> tags in sitemap.xml directly (raw string match)
    const sitemapRaw = fs.readFileSync(
      path.join(__dirname, "sitemap.xml"),
      "utf8",
    );
    const locCount = (sitemapRaw.match(/<loc>/g) || []).length;
    checks.push({
      test: "Sitemap URL Count",
      method: "Raw regex count of <loc> tags in sitemap.xml",
      result: locCount,
      pass: true,
    });

    // CHECK 2: Pick 5 random sitemap URLs and verify files exist on disk with real stats
    const { urls } = parseSitemap();
    const sampleIndices = [];
    while (sampleIndices.length < Math.min(5, urls.length)) {
      const idx = Math.floor(Math.random() * urls.length);
      if (!sampleIndices.includes(idx)) sampleIndices.push(idx);
    }
    const fileSamples = sampleIndices.map((idx) => {
      const url = urls[idx];
      const localPath = urlToLocalPath(url);
      const exists = fs.existsSync(localPath);
      const detail = {
        url: url.replace("https://disaster911.net", ""),
        localPath,
        exists,
      };
      if (exists) {
        const stat = fs.statSync(localPath);
        const html = fs.readFileSync(localPath, "utf8");
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const metaMatch = html.match(
          /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
        );
        const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
        detail.fileSize = stat.size;
        detail.lastModified = stat.mtime.toISOString();
        detail.title = titleMatch ? titleMatch[1] : null;
        detail.titleLength = titleMatch ? titleMatch[1].length : 0;
        detail.metaDesc = metaMatch
          ? metaMatch[1].substring(0, 100) +
            (metaMatch[1].length > 100 ? "..." : "")
          : null;
        detail.metaDescLength = metaMatch ? metaMatch[1].length : 0;
        detail.h1Count = h1Matches.length;
        detail.h1Text =
          h1Matches.length > 0
            ? h1Matches[0].replace(/<[^>]+>/g, "").trim()
            : null;
      }
      return detail;
    });
    checks.push({
      test: "Random File Verification (5 pages)",
      method: "Read raw bytes from disk, extract SEO tags with regex",
      samples: fileSamples,
      pass: fileSamples.every((s) => s.exists),
    });

    // CHECK 3: Live HTTP spot-check — hit disaster911.net directly
    const spotCheckUrls = [
      "https://disaster911.net/",
      "https://disaster911.net/about/",
      "https://disaster911.net/contact/",
      "https://disaster911.net/blog/",
      "https://disaster911.net/water-damage-restoration/",
    ];
    const liveResults = await google.batchCheckLiveUrls(spotCheckUrls);
    checks.push({
      test: "Live HTTP Spot-Check (disaster911.net)",
      method:
        "Real HTTP GET requests to disaster911.net — status codes returned by their server",
      results: liveResults.map((r) => ({
        url: r.url.replace("https://disaster911.net", ""),
        statusCode: r.statusCode,
        alive: r.alive,
        error: r.error || null,
      })),
      pass: liveResults.some((r) => r.alive),
    });

    // CHECK 4: Verify robots.txt exists and has correct sitemap reference
    const robotsPath = path.join(__dirname, "robots.txt");
    const robotsExists = fs.existsSync(robotsPath);
    let robotsCheck = { exists: robotsExists };
    if (robotsExists) {
      const robotsContent = fs.readFileSync(robotsPath, "utf8");
      robotsCheck.hasSitemapRef = robotsContent
        .toLowerCase()
        .includes("sitemap");
      robotsCheck.content = robotsContent.substring(0, 300);
    }
    checks.push({
      test: "robots.txt Verification",
      method: "Read file from disk, check for Sitemap directive",
      result: robotsCheck,
      pass: robotsExists && robotsCheck.hasSitemapRef,
    });

    const elapsed = Date.now() - startTime;

    res.json({
      source: "INDEPENDENT_VERIFICATION",
      timestamp: new Date().toISOString(),
      elapsedMs: elapsed,
      allPassed: checks.every((c) => c.pass),
      checks,
    });
  } catch (e) {
    res.status(500).json({ source: "ERROR", error: e.message });
  }
});

// Keep-Alive Ping
app.get("/api/ping", (req, res) => res.send("pong"));

// ============================================================
// AUTO-SCAN: Populate seo-data.json on startup
// ============================================================
function autoScanOnStartup() {
  console.log("\n🔄 AUTO-SCAN: Running full SEO audit on startup...");
  const startTime = Date.now();
  const { error, urls } = parseSitemap();

  if (error || urls.length === 0) {
    console.error("❌ Cannot scan: sitemap issue");
    return;
  }

  let verified = 0;
  let missing = 0;
  let totalScore = 0;
  let totalIssues = 0;
  const issueBreakdown = {};

  urls.forEach((url) => {
    const localPath = urlToLocalPath(url);
    const audit = auditPage(localPath, url);

    if (audit.exists) {
      verified++;
      totalScore += audit.score;
    } else {
      missing++;
    }

    audit.issues.forEach((issue) => {
      const type = issue.split(":")[0];
      totalIssues++;
      issueBreakdown[type] = (issueBreakdown[type] || 0) + 1;
    });
  });

  const avgScore = verified > 0 ? Math.round(totalScore / verified) : 0;
  const elapsed = Date.now() - startTime;

  // Load GMB cache
  let gmbData = null;
  const reviewsPath = path.join(__dirname, "reviews-cache.json");
  if (fs.existsSync(reviewsPath)) {
    try {
      gmbData = JSON.parse(fs.readFileSync(reviewsPath, "utf8"));
    } catch (e) {
      /* skip */
    }
  }

  // Build honest seo-data.json
  const now = new Date();
  const data = {
    _NOTICE:
      "ALL DATA HERE IS EITHER VERIFIED FROM LOCAL FILES OR MARKED AS REQUIRING EXTERNAL API. NOTHING IS MADE UP.",
    lastScanned: now.toISOString(),
    siteUrl: "https://disaster911.net",

    localAudit: {
      source: "LOCAL_FILE_SCAN",
      description: "Data from scanning real HTML files listed in sitemap.xml.",
      scanDate: now.toISOString(),
      pagesInSitemap: urls.length,
      pagesVerifiedLocally: verified,
      pagesMissing: missing,
      avgSeoScore: avgScore,
      totalIssues: totalIssues,
      issueBreakdown: issueBreakdown,
    },

    googleSearchConsole: {
      source: "NOT_CONNECTED",
      status: "Google Search Console API credentials not configured.",
      howToConnect:
        "Add OAuth2 credentials to google-gateway.js to enable live GSC data.",
      organicTraffic: null,
      totalClicks: null,
      totalImpressions: null,
      averageCTR: null,
      averagePosition: null,
      pagesIndexedByGoogle: null,
    },

    googleAnalytics: {
      source: "NOT_CONNECTED",
      status: "Google Analytics 4 API credentials not configured.",
      howToConnect:
        "Add GA4 credentials to google-gateway.js to enable live analytics data.",
      activeUsers: null,
      sessions: null,
      bounceRate: null,
    },

    domainAuthority: {
      source: "NOT_CONNECTED",
      status: "No Moz or Ahrefs API configured.",
      howToConnect: "Sign up for Moz API or Ahrefs API and integrate.",
      value: null,
    },

    backlinks: {
      source: "NOT_CONNECTED",
      status: "No backlink API configured.",
      howToConnect: "Integrate Ahrefs or Moz Link API.",
      total: null,
      referringDomains: null,
    },

    keywordRankings: {
      source: "NOT_CONNECTED",
      status:
        "No rank tracking API configured. Cannot determine keyword positions without GSC API or a rank tracker.",
      howToConnect:
        "Option 1: Connect GSC API. Option 2: Integrate SERPapi.com or DataForSEO.",
      keywords: [],
    },

    mapPack: {
      source: "NOT_CONNECTED",
      status: "Local pack rankings require a rank tracking API.",
      howToConnect: "Integrate BrightLocal or LocalFalcon.",
      rankings: [],
    },

    googleBusinessProfile: {
      source: gmbData ? "LOCAL_CACHE" : "NOT_AVAILABLE",
      description: gmbData
        ? "Data from reviews-cache.json. May not be current."
        : "No reviews-cache.json found.",
      placeId: gmbData ? gmbData.place_id : null,
      name: gmbData ? gmbData.name : "Disaster Response by Ryan",
      rating: gmbData ? gmbData.rating : null,
      reviewCount: gmbData
        ? gmbData.user_ratings_total ||
          (gmbData.reviews ? gmbData.reviews.length : 0)
        : null,
      reviewsVerified: false,
      note: "Review count from local cache file. Connect Google Places API for live data.",
    },

    wordpress: {
      source: "NOT_CONNECTED",
      status: "WordPress API credentials not configured in wp-config.json.",
      howToConnect: "Update wp-config.json with real credentials.",
    },
  };

  const dataPath = path.join(__dirname, "seo-data.json");
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

  console.log(`✅ AUTO-SCAN COMPLETE in ${elapsed}ms`);
  console.log(`📋 Sitemap: ${urls.length} URLs`);
  console.log(`✅ Verified: ${verified} | ❌ Missing: ${missing}`);
  console.log(`📊 Avg SEO Score: ${avgScore}/100`);
  console.log(`⚠️  Issues: ${totalIssues}`);
  if (Object.keys(issueBreakdown).length > 0) {
    Object.entries(issueBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
  }
  console.log(`\n💾 seo-data.json UPDATED with verified data.`);
}

// ============================================================
// SERVER START
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`\n🚀 AUTHORITY ENGINE active at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/seo-dashboard.html`);

  // Run auto-scan to populate seo-data.json with real data
  autoScanOnStartup();

  // Auto-open dashboard in browser
  const { exec } = require("child_process");
  const url = `http://localhost:${PORT}/seo-dashboard.html`;
  const platform = process.platform;
  if (platform === "win32") exec(`start ${url}`);
  else if (platform === "darwin") exec(`open ${url}`);
  else exec(`xdg-open ${url}`);

  console.log(`\n🌐 Dashboard opened in your browser.`);
  console.log(`   If it didn't open, go to: ${url}`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is busy. Kill the existing process and retry.`,
    );
    console.error(`   Run: taskkill /F /IM node.exe   then try again.`);
    process.exit(1);
  }
});
