const fs = require('fs'), path = require('path');

const checks = [];

// 1. Verify fire/ada page is service-correct
try {
    const adaFire = fs.readFileSync('fire-damage-restoration/ada-mi/index.html', 'utf8');
    checks.push({ label: 'Ada fire: canonical to fire hub', pass: adaFire.includes('/fire-damage-restoration/ada-mi/') });
    checks.push({ label: 'Ada fire: title contains fire', pass: adaFire.toLowerCase().includes('fire') });
    checks.push({ label: 'Ada fire: meta desc NOT water damage only', pass: !adaFire.includes('<meta name="description" content="Water damage') });
} catch (e) { checks.push({ label: 'Ada fire page READ ERROR', pass: false, err: e.message }); }

// 2. Blog index has links
try {
    const blogIdx = fs.readFileSync('blog/index.html', 'utf8');
    const count = (blogIdx.split('/blog/').length - 1);
    checks.push({ label: 'Blog index has 10+ blog links (found: ' + count + ')', pass: count >= 10 });
} catch (e) { checks.push({ label: 'Blog index READ ERROR', pass: false }); }

// 3. Sitemap
try {
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const count = sitemap.split('<loc>').length - 1;
    checks.push({ label: 'sitemap.xml has 200+ URLs (found: ' + count + ')', pass: count >= 200 });
} catch (e) { checks.push({ label: 'sitemap.xml MISSING', pass: false }); }

// 4. robots.txt
try {
    const robots = fs.readFileSync('robots.txt', 'utf8');
    checks.push({ label: 'robots.txt allows Googlebot', pass: robots.includes('Googlebot') });
    checks.push({ label: 'robots.txt allows GPTBot', pass: robots.includes('GPTBot') });
    checks.push({ label: 'robots.txt has sitemap', pass: robots.includes('Sitemap:') });
} catch (e) { checks.push({ label: 'robots.txt MISSING', pass: false }); }

// 5. Core pages exist
['about', 'contact', 'insurance-claims', 'service-areas'].forEach(p => {
    checks.push({ label: p + '/index.html exists', pass: fs.existsSync(p + '/index.html') });
});

// 6. All 4 service hubs
['water-damage-restoration', 'fire-damage-restoration', 'mold-remediation', 'sewage-cleanup'].forEach(s => {
    checks.push({ label: s + ' hub exists', pass: fs.existsSync(s + '/index.html') });
});

// 7. All 204 city pages
const cities = JSON.parse(fs.readFileSync('cities.json', 'utf8'));
const svcs = ['water-damage-restoration', 'fire-damage-restoration', 'mold-remediation', 'sewage-cleanup'];
let missing = [];
svcs.forEach(s => {
    cities.forEach(c => {
        if (!fs.existsSync(s + '/' + c.id + '/index.html')) missing.push(s + '/' + c.id);
    });
});
checks.push({ label: 'City pages missing (0 = all OK, found ' + missing.length + ')', pass: missing.length === 0 });
if (missing.length > 0) checks.push({ label: 'Sample missing: ' + missing.slice(0, 5).join(', '), pass: false });

// 8. Blog posts
const blogSlugs = [
    'how-much-does-water-damage-restoration-cost-in-michigan',
    'does-homeowners-insurance-cover-water-damage-in-michigan',
    'water-damage-timeline-what-happens-in-the-first-24-48-72-hours',
    'mold-after-water-damage-how-fast-does-it-grow-in-michigan',
    'frozen-pipe-burst-grand-rapids-what-to-do-first',
    'sump-pump-failure-cleanup-grand-rapids',
    'basement-flooding-grand-rapids-causes-and-restoration',
    'category-3-sewage-backup-health-risks-and-cleanup',
    'water-damage-restoration-vs-mitigation-whats-the-difference',
    'how-to-document-water-damage-for-your-insurance-claim'
];
blogSlugs.forEach(s => {
    checks.push({ label: 'blog/' + s, pass: fs.existsSync('blog/' + s + '/index.html') });
});

// 9. styles.css has new classes
try {
    const css = fs.readFileSync('styles.css', 'utf8');
    checks.push({ label: 'styles.css has .city-link-card', pass: css.includes('.city-link-card') });
    checks.push({ label: 'styles.css has .content-card', pass: css.includes('.content-card') });
    checks.push({ label: 'styles.css has .faq-container', pass: css.includes('.faq-container') });
    checks.push({ label: 'styles.css has .btn-accent', pass: css.includes('.btn-accent') });
    checks.push({ label: 'styles.css has .blog-grid', pass: css.includes('.blog-grid') });
} catch (e) { checks.push({ label: 'styles.css READ ERROR', pass: false }); }

// 10. Dashboard
checks.push({ label: 'seo-dashboard.html exists', pass: fs.existsSync('seo-dashboard.html') });

// Report
let passed = 0, failed = 0;
checks.forEach(c => {
    const icon = c.pass ? '✅' : '❌';
    console.log(icon + ' ' + c.label);
    if (c.pass) passed++; else failed++;
});
console.log('\n=== RESULT: ' + passed + ' passed, ' + failed + ' failed ===');
