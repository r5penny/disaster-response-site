const fs = require('fs');
const cities = JSON.parse(fs.readFileSync('cities.json', 'utf8'));
const svcs = ['water-damage-restoration', 'fire-damage-restoration', 'mold-remediation', 'sewage-cleanup'];
const BASE = 'https://disaster911.net';
const today = '2026-02-22';

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

const pages = [
    { url: BASE + '/', pri: '1.0', freq: 'weekly' },
    { url: BASE + '/about/', pri: '0.8', freq: 'monthly' },
    { url: BASE + '/contact/', pri: '0.8', freq: 'monthly' },
    { url: BASE + '/insurance-claims/', pri: '0.8', freq: 'monthly' },
    { url: BASE + '/service-areas/', pri: '0.7', freq: 'monthly' },
    { url: BASE + '/blog/', pri: '0.7', freq: 'weekly' },
    { url: BASE + '/privacy-policy/', pri: '0.3', freq: 'yearly' },
    { url: BASE + '/terms/', pri: '0.3', freq: 'yearly' },
];

svcs.forEach(s => {
    pages.push({ url: BASE + '/' + s + '/', pri: '0.9', freq: 'monthly' });
    cities.forEach(c => pages.push({ url: BASE + '/' + s + '/' + c.id + '/', pri: '0.8', freq: 'monthly' }));
});
blogSlugs.forEach(s => pages.push({ url: BASE + '/blog/' + s + '/', pri: '0.6', freq: 'monthly' }));

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map(p => '  <url>\n    <loc>' + p.url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>' + p.freq + '</changefreq>\n    <priority>' + p.pri + '</priority>\n  </url>').join('\n') +
    '\n</urlset>';
fs.writeFileSync('sitemap.xml', xml, 'utf8');

const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /wp-admin/',
    'Disallow: /?s=',
    '',
    'Sitemap: https://disaster911.net/sitemap.xml',
    '',
    '# Allow all major search bots explicitly',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    '',
    '# Allow AI crawlers access to helpful content',
    'User-agent: GPTBot',
    'Allow: /blog/',
    'Allow: /about/',
    'Allow: /water-damage-restoration/',
    'Allow: /fire-damage-restoration/',
    'Allow: /mold-remediation/',
    'Allow: /sewage-cleanup/',
    '',
    'User-agent: CCBot',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
].join('\n');
fs.writeFileSync('robots.txt', robots, 'utf8');

console.log('sitemap.xml: ' + pages.length + ' URLs');
console.log('robots.txt written');
