#!/usr/bin/env node
/**
 * patch-all-pages.js
 * ------------------
 * Patches ALL inner pages to match the homepage's dark theme template.
 * 
 * Fixes:
 * 1. Hub page sidebars: background:#fff → dark theme
 * 2. Static pages (about, contact, insurance, service-areas): 
 *    light content cards → dark theme cards
 * 3. Broken mi-builder-badge.svg → styled inline badge (matches homepage)
 * 4. Duplicate </body></html> closing tags
 * 5. Service-areas hardcoded #fff → dark theme
 * 6. City link cards: white bg on dark body → dark theme
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let filesFixed = 0;
let totalFixes = 0;

// ─── HELPER ───
function patchFile(filePath, patches) {
    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ SKIP (not found): ${filePath}`);
        return;
    }
    let html = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;

    for (const [label, find, replace] of patches) {
        if (typeof find === 'string') {
            if (html.includes(find)) {
                html = html.split(find).join(replace);
                changeCount++;
                console.log(`    ✓ ${label}`);
            }
        } else {
            // RegExp
            if (find.test(html)) {
                html = html.replace(find, replace);
                changeCount++;
                console.log(`    ✓ ${label}`);
            }
        }
    }

    if (changeCount > 0) {
        fs.writeFileSync(filePath, html, 'utf8');
        filesFixed++;
        totalFixes += changeCount;
    }
    return changeCount;
}

// ─── MI BUILDER BADGE REPLACEMENT ───
// The old broken badge reference
const OLD_BADGE_BLOCK = `<div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
                        <img src="/images/mi-builder-badge.svg" alt="MI Builder's License" width="50" height="50">
                        <span style="font-size:0.6rem; font-weight:700; color:var(--text-muted);">#2101187907</span>
                    </div>`;

// The new styled inline badge that matches the homepage
const NEW_BADGE_BLOCK = `<div style="display:flex;flex-direction:column;align-items:center;gap:0.2rem;">
                        <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#1a365d,#2a4a7f);display:flex;align-items:center;justify-content:center;border:2px solid #3b82f6;">
                            <i class="fa-solid fa-house-chimney" style="color:#fff;font-size:1.1rem;"></i>
                        </div>
                        <span style="font-size:0.6rem;font-weight:700;color:var(--text-muted);">MI #2101187907</span>
                    </div>`;

// Also handle the slightly different formatting in generated pages
const OLD_BADGE_GENERATED = `<span class="badge badge-dark"><i class="fa-solid fa-house-chimney"></i> MI Builder's License</span>`;

// ─── COMMON PATCHES ───
// These apply to about, contact, insurance, service-areas pages
const COMMON_PATCHES = [
    // Fix broken mi-builder-badge.svg (multi-line version)
    [
        'Fix broken MI builder badge (multi-line)',
        OLD_BADGE_BLOCK,
        NEW_BADGE_BLOCK
    ],
    // Fix duplicate </body></html> at end of file
    [
        'Fix duplicate </body></html>',
        `</html></body>
</html>`,
        `</html>`
    ],
    // Another variant of duplicate closing
    [
        'Fix duplicate closing tags (variant)',
        `</html></body>\n</html>`,
        `</html>`
    ],
];

// ─── HUB SIDEBAR PATCHES ───
// White sidebar cards → dark theme
const HUB_SIDEBAR_PATCHES = [
    // "Why Disaster Response" card
    [
        'Fix sidebar "Why" card: white → dark',
        'style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;">Why Disaster Response by Ryan?</h3>',
        'style="background:var(--bg-light);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;color:#fff;">Why Disaster Response by Ryan?</h3>'
    ],
    // Insurance carriers card
    [
        'Fix sidebar "Insurance" card: white → dark',
        'style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;">We Bill These Carriers Directly</h3>',
        'style="background:var(--bg-light);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;color:#fff;">We Bill These Carriers Directly</h3>'
    ],
    // Other services card
    [
        'Fix sidebar "Other Services" card: white → dark',
        'style="background:#fff;border:1px solid var(--bg-subtle);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;">Other Services</h3>',
        'style="background:var(--bg-light);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-lg);padding:1.5rem;">\n            <h3 style="margin:0 0 1rem;font-size:1rem;color:#fff;">Other Services</h3>'
    ],
];

// ─── STATIC PAGE "LIGHT CARD" PATCHES ───
const STATIC_PAGE_PATCHES = [
    // About / Insurance: bg-white card with shadow
    [
        'Fix light content card → dark theme (bg-white)',
        'style="background:var(--bg-white); padding: 4rem; border-radius: 1rem; box-shadow: var(--shadow-md); border: 1px solid var(--bg-subtle);"',
        'style="background:var(--bg-light); padding: 4rem; border-radius: 1rem; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.08);"'
    ],
    // Service areas: hardcoded #fff
    [
        'Fix service-areas #fff → dark theme',
        'style="background:#fff; padding: 4rem; border-radius: 1rem; box-shadow: var(--shadow-md); border: 1px solid var(--bg-subtle);"',
        'style="background:var(--bg-light); padding: 4rem; border-radius: 1rem; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.08);"'
    ],
    // Contact form card
    [
        'Fix contact form card → dark theme',
        'style="background:var(--bg-white); padding: 3rem; border-radius: 1rem; box-shadow: var(--shadow-lg);"',
        'style="background:var(--bg-light); padding: 3rem; border-radius: 1rem; box-shadow: var(--shadow-lg); border: 1px solid rgba(255,255,255,0.08);"'
    ],
];

// ─── SERVICE AREA CITY LINKS ───
// Fix the inline-styled city links with white bg
const CITY_LINK_PATCHES = [
    [
        'Fix city links: hardcoded #e2e8f0 border → dark theme',
        /style="padding: 0\.5rem; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center; font-weight: 600;"/g,
        'style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; text-align: center; font-weight: 600; background: var(--bg-light); color: #fff; text-decoration: none; transition: border-color 0.2s;"'
    ],
];

// ═══════════════════════════════════════════════════════════════
//  MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

console.log('\n🔧 PATCH ALL PAGES — Matching Homepage Dark Theme Template\n');
console.log('═'.repeat(60));

// 1. Patch static pages
const staticPages = [
    'about/index.html',
    'contact/index.html',
    'insurance-claims/index.html',
    'service-areas/index.html',
    'privacy-policy/index.html',
    'terms/index.html',
];

console.log('\n📄 STATIC PAGES:');
for (const page of staticPages) {
    const filePath = path.join(ROOT, page);
    console.log(`  ${page}:`);
    patchFile(filePath, [...COMMON_PATCHES, ...STATIC_PAGE_PATCHES, ...CITY_LINK_PATCHES]);
}

// 2. Patch hub pages (4 service type hubs)
const hubPages = [
    'water-damage-restoration/index.html',
    'fire-damage-restoration/index.html',
    'mold-remediation/index.html',
    'sewage-cleanup/index.html',
];

console.log('\n📄 HUB PAGES:');
for (const page of hubPages) {
    const filePath = path.join(ROOT, page);
    console.log(`  ${page}:`);
    patchFile(filePath, [...COMMON_PATCHES, ...HUB_SIDEBAR_PATCHES]);
}

// 3. Patch ALL city pages (51 cities × 4 service types = ~204 pages)
const serviceTypes = [
    'water-damage-restoration',
    'fire-damage-restoration',
    'mold-remediation',
    'sewage-cleanup',
];

console.log('\n📄 CITY PAGES:');
let cityCount = 0;
for (const serviceType of serviceTypes) {
    const serviceDir = path.join(ROOT, serviceType);
    if (!fs.existsSync(serviceDir)) continue;

    const cities = fs.readdirSync(serviceDir).filter(d => {
        const fullPath = path.join(serviceDir, d);
        return fs.statSync(fullPath).isDirectory() && d.endsWith('-mi');
    });

    console.log(`  ${serviceType}/ (${cities.length} city pages):`);

    for (const city of cities) {
        const cityFile = path.join(serviceDir, city, 'index.html');
        if (!fs.existsSync(cityFile)) continue;

        let html = fs.readFileSync(cityFile, 'utf8');
        let changed = false;

        // Fix white sidebar cards in city pages
        // These have the same pattern as hub pages
        if (html.includes('background:#fff;')) {
            html = html.replace(/background:#fff;/g, 'background:var(--bg-light);');
            changed = true;
        }
        // Fix white borders
        if (html.includes('border:1px solid var(--bg-subtle)')) {
            html = html.replace(/border:1px solid var\(--bg-subtle\)/g, 'border:1px solid rgba(255,255,255,0.1)');
            changed = true;
        }

        // Fix mi-builder-badge if present
        if (html.includes('mi-builder-badge.svg')) {
            html = html.replace(
                /<img src="\/images\/mi-builder-badge\.svg"[^>]*>/g,
                '<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#1a365d,#2a4a7f);display:flex;align-items:center;justify-content:center;border:2px solid #3b82f6;"><i class="fa-solid fa-house-chimney" style="color:#fff;font-size:1.1rem;"></i></div>'
            );
            changed = true;
        }

        // Fix duplicate closing tags
        if (html.includes('</html></body>\n</html>') || html.includes('</html></body>\r\n</html>')) {
            html = html.replace(/<\/html><\/body>\s*<\/html>/g, '</html>');
            changed = true;
        }

        // Fix city link cards with hardcoded light colors
        if (html.includes('color:var(--text-main);transition:border-color')) {
            // These city link cards in the "All Service Areas" section at bottom of city pages
            // already use var(--text-main) which is white, but they have white bg
            html = html.replace(
                /background:#fff;border:1px solid var\(--bg-subtle\);border-radius:var\(--radius-md\)/g,
                'background:var(--bg-light);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-md)'
            );
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(cityFile, html, 'utf8');
            cityCount++;
        }
    }
}
console.log(`  → ${cityCount} city pages patched`);

// 4. Patch blog pages
console.log('\n📄 BLOG PAGES:');
const blogDir = path.join(ROOT, 'blog');
if (fs.existsSync(blogDir)) {
    const blogFiles = [];
    // blog/index.html
    blogFiles.push(path.join(blogDir, 'index.html'));
    // blog/*/index.html
    const blogPosts = fs.readdirSync(blogDir).filter(d => {
        const fullPath = path.join(blogDir, d);
        return fs.statSync(fullPath).isDirectory();
    });
    for (const post of blogPosts) {
        blogFiles.push(path.join(blogDir, post, 'index.html'));
    }

    let blogCount = 0;
    for (const blogFile of blogFiles) {
        if (!fs.existsSync(blogFile)) continue;
        let html = fs.readFileSync(blogFile, 'utf8');
        let changed = false;

        // Fix white backgrounds
        if (html.includes('background:#fff;')) {
            html = html.replace(/background:#fff;/g, 'background:var(--bg-light);');
            changed = true;
        }
        // Fix bg-white
        if (html.includes("background:var(--bg-white);")) {
            // bg-white is already rgba(255,255,255,0.05) so it's fine in dark mode
        }
        // Fix mi-builder-badge
        if (html.includes('mi-builder-badge.svg')) {
            html = html.replace(
                /<img src="\/images\/mi-builder-badge\.svg"[^>]*>/g,
                '<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#1a365d,#2a4a7f);display:flex;align-items:center;justify-content:center;border:2px solid #3b82f6;"><i class="fa-solid fa-house-chimney" style="color:#fff;font-size:1.1rem;"></i></div>'
            );
            changed = true;
        }
        // Fix duplicate closing tags
        if (html.includes('</html></body>')) {
            html = html.replace(/<\/html><\/body>\s*<\/html>/g, '</html>');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(blogFile, html, 'utf8');
            blogCount++;
        }
    }
    console.log(`  → ${blogCount} blog pages patched`);
}

// ═══════════════════════════════════════════════════════════════
//  SUMMARY
// ═══════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(60));
console.log(`✅ COMPLETE — ${filesFixed} files fixed, ${totalFixes} patches + ${cityCount} city pages`);
console.log('═'.repeat(60));
console.log('\nAll pages now match the homepage dark theme template.');
console.log('Refresh your browser to see the changes.\n');
