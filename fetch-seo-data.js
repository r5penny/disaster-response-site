/**
 * FETCH-SEO-DATA.JS — REAL DATA ONLY
 *
 * This script scans local files and reports ONLY what can be verified.
 * It NEVER generates random numbers or fake rankings.
 *
 * What it CAN do (local file scan):
 *   - Count pages in sitemap.xml
 *   - Check if each page exists locally
 *   - Audit each page's on-page SEO (title, meta desc, H1, schema, etc.)
 *   - Calculate an honest on-page SEO score
 *
 * What it CANNOT do (requires external APIs):
 *   - Domain Authority (needs Moz/Ahrefs API)
 *   - Backlinks (needs Ahrefs/Moz API)
 *   - Google keyword rankings (needs GSC API or SERPapi)
 *   - Organic traffic (needs GA4/GSC API)
 *   - Map pack rankings (needs BrightLocal/LocalFalcon)
 *   - Google index status (needs GSC API)
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "seo-data.json");
const SITEMAP_PATH = path.join(__dirname, "sitemap.xml");
const REVIEWS_PATH = path.join(__dirname, "reviews-cache.json");

// ============================================================
// SITEMAP PARSER — reads real sitemap.xml
// ============================================================
function parseSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error("❌ sitemap.xml not found at", SITEMAP_PATH);
    return [];
  }
  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
  return locMatches.map((m) => m.replace(/<\/?loc>/g, ""));
}

// ============================================================
// URL -> LOCAL FILE PATH
// ============================================================
function urlToLocalPath(sitemapUrl) {
  const base = "https://disaster911.net";
  let route = sitemapUrl.replace(base, "");
  if (route === "" || route === "/") {
    return path.join(__dirname, "index.html");
  }
  if (route.endsWith("/")) {
    return path.join(__dirname, route, "index.html");
  }
  return path.join(__dirname, route);
}

// ============================================================
// AUDIT A SINGLE PAGE — extracts real data from HTML
// ============================================================
function auditPage(filePath) {
  const result = {
    exists: false,
    fileSize: 0,
    hasTitle: false,
    titleLength: 0,
    hasMetaDescription: false,
    metaDescriptionLength: 0,
    hasH1: false,
    h1Count: 0,
    hasCanonical: false,
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
    issues: [],
    score: 0,
  };

  if (!fs.existsSync(filePath)) {
    result.issues.push("FILE_MISSING");
    return result;
  }

  result.exists = true;
  const stat = fs.statSync(filePath);
  result.fileSize = stat.size;

  const html = fs.readFileSync(filePath, "utf8");

  // Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    result.hasTitle = true;
    result.titleLength = titleMatch[1].trim().length;
    if (result.titleLength < 30) result.issues.push("TITLE_SHORT");
    if (result.titleLength > 60) result.issues.push("TITLE_LONG");
  } else {
    result.issues.push("TITLE_MISSING");
  }

  // Meta Description
  const metaDescMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
  );
  if (metaDescMatch) {
    result.hasMetaDescription = true;
    result.metaDescriptionLength = metaDescMatch[1].trim().length;
    if (result.metaDescriptionLength < 70)
      result.issues.push("META_DESC_SHORT");
    if (result.metaDescriptionLength > 160)
      result.issues.push("META_DESC_LONG");
  } else {
    result.issues.push("META_DESC_MISSING");
  }

  // H1
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  result.h1Count = h1Matches.length;
  result.hasH1 = h1Matches.length > 0;
  if (h1Matches.length === 0) result.issues.push("H1_MISSING");
  if (h1Matches.length > 1) result.issues.push("H1_MULTIPLE");

  // Canonical
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i,
  );
  result.hasCanonical = !!canonicalMatch;
  if (!canonicalMatch) result.issues.push("CANONICAL_MISSING");

  // Schema
  const schemaMatches =
    html.match(
      /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi,
    ) || [];
  if (schemaMatches.length > 0) {
    result.hasSchema = true;
    schemaMatches.forEach((s) => {
      try {
        const json = JSON.parse(
          s.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, ""),
        );
        if (json["@type"]) result.schemaTypes.push(json["@type"]);
      } catch (e) {
        /* invalid JSON */
      }
    });
  }

  // Open Graph
  result.hasOGTags = /<meta\s+property=["']og:/i.test(html);

  // Phone link
  result.hasPhoneLink = /href=["']tel:/i.test(html);

  // NAP (Name, Address, Phone)
  result.hasNAP =
    html.includes("616") &&
    html.includes("822-1978") &&
    html.includes("Walker");

  // Word count
  const textOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  result.wordCount = textOnly.split(" ").filter((w) => w.length > 0).length;

  // Images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  result.imageCount = imgMatches.length;
  result.imagesWithoutAlt = imgMatches.filter(
    (img) => !img.match(/alt=["'][^"']+["']/i),
  ).length;
  if (result.imagesWithoutAlt > 0) result.issues.push("IMG_ALT_MISSING");

  // Links
  const linkMatches = html.match(/<a\s[^>]*href=["']([^"']*?)["']/gi) || [];
  linkMatches.forEach((link) => {
    const hrefMatch = link.match(/href=["']([^"']*?)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith("http") && !href.includes("disaster911.net")) {
        result.externalLinks++;
      } else if (
        !href.startsWith("tel:") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("#")
      ) {
        result.internalLinks++;
      }
    }
  });

  // Word count warning (skip blog, privacy, terms)
  if (result.wordCount < 300) {
    result.issues.push("THIN_CONTENT");
  }

  // Calculate honest SEO score (0-100)
  let score = 0;
  if (result.hasTitle) score += 15;
  if (result.titleLength >= 30 && result.titleLength <= 60) score += 5;
  if (result.hasMetaDescription) score += 15;
  if (result.metaDescriptionLength >= 70 && result.metaDescriptionLength <= 160)
    score += 5;
  if (result.hasH1 && result.h1Count === 1) score += 15;
  if (result.hasCanonical) score += 10;
  if (result.hasSchema) score += 10;
  if (result.hasPhoneLink) score += 5;
  if (result.hasNAP) score += 5;
  if (result.wordCount >= 300) score += 10;
  if (result.imagesWithoutAlt === 0 && result.imageCount > 0) score += 5;
  result.score = score;

  return result;
}

// ============================================================
// MAIN SCAN — reads real files only, writes honest results
// ============================================================
function scan() {
  console.log("");
  console.log("🔍 DISASTER RESPONSE BY RYAN — HONEST SEO SCAN");
  console.log("================================================");
  console.log("This scan reads REAL FILES only. No data is fabricated.");
  console.log("");

  const urls = parseSitemap();
  if (urls.length === 0) {
    console.error("No URLs found in sitemap. Aborting.");
    return;
  }

  console.log(`📋 Sitemap: ${urls.length} URLs found`);

  let verified = 0;
  let missing = 0;
  let totalScore = 0;
  let totalIssues = 0;
  const issueBreakdown = {};

  urls.forEach((url) => {
    const localPath = urlToLocalPath(url);
    const audit = auditPage(localPath);

    if (audit.exists) {
      verified++;
      totalScore += audit.score;
    } else {
      missing++;
    }

    audit.issues.forEach((issue) => {
      totalIssues++;
      issueBreakdown[issue] = (issueBreakdown[issue] || 0) + 1;
    });
  });

  const avgScore = verified > 0 ? Math.round(totalScore / verified) : 0;

  console.log(`✅ Pages verified locally: ${verified}/${urls.length}`);
  console.log(`❌ Pages missing: ${missing}`);
  console.log(`📊 Average on-page SEO score: ${avgScore}/100`);
  console.log(`⚠️  Total issues found: ${totalIssues}`);
  console.log("");

  if (Object.keys(issueBreakdown).length > 0) {
    console.log("Issue Breakdown:");
    Object.entries(issueBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} page(s)`);
      });
    console.log("");
  }

  // Read GMB cache
  let gmbData = null;
  if (fs.existsSync(REVIEWS_PATH)) {
    try {
      gmbData = JSON.parse(fs.readFileSync(REVIEWS_PATH, "utf8"));
    } catch (e) {
      console.warn("⚠️ Could not parse reviews-cache.json");
    }
  }

  // Build honest data file
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

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");

  console.log("================================================");
  console.log("✅ seo-data.json updated with VERIFIED DATA ONLY.");
  console.log("");
  console.log("⚠️  The following require external API connections:");
  console.log("   • Domain Authority → Moz or Ahrefs API");
  console.log("   • Backlinks → Ahrefs or Moz API");
  console.log("   • Keyword Rankings → GSC API or SERPapi");
  console.log("   • Organic Traffic → GA4 or GSC API");
  console.log("   • Map Pack Rankings → BrightLocal or LocalFalcon");
  console.log("   • Google Index Count → GSC API");
  console.log("");
}

scan();
