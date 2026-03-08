const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf-8');

const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/);
const headerMatch = indexHtml.match(/(<!-- Top Emergency Bar -->[\s\S]*?<!-- Hero Section -->)/);
const footerMatch = indexHtml.match(/(<!-- Footer -->[\s\S]*?<\/html>)/);

const headTemplate = headMatch ? headMatch[1] : '';
let headerHtml = headerMatch ? headerMatch[1].replace('<!-- Hero Section -->', '') : '';
const footerHtml = footerMatch ? footerMatch[1] : '';

function createPage(route, title, h1, content, isCity = false) {
    const dir = path.join(__dirname, route);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let myHead = headTemplate
        .replace(/<title>.*?<\/title>/, '<title>' + title + '</title>')
        .replace(/<meta name="description" content=".*?">/, '<meta name="description" content="' + h1 + '. Ryan answers personally, 24/7 emergency response for West Michigan. Local, trusted family business since 1981.">')
        .replace(/<link rel="canonical" href=".*?">/, '<link rel="canonical" href="https://disaster911.net' + route + '">');

    let depth = (route.match(/\//g) || []).length;
    if (route === '/') depth = 0;

    let relPath = depth > 1 ? '../'.repeat(depth - 1) : './';
    myHead = myHead.replace(/href="styles\.css"/, 'href="' + relPath + 'styles.css"');

    // Fix image paths in header if not root
    let myHeader = headerHtml.replace(/href="\//g, 'href="' + relPath);
    let myFooter = footerHtml.replace(/src="script\.js"/, 'src="' + relPath + 'script.js"')
        .replace(/href="\//g, 'href="' + relPath);

    const schema = isCity ? '\n<!-- Local & Breadcrumb Schema -->\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "BreadcrumbList",\n  "itemListElement": [{\n    "@type": "ListItem", "position": 1, "name": "Services", "item": "https://disaster911.net/water-damage-restoration/"\n  },{\n    "@type": "ListItem", "position": 2, "name": "' + title.split(' | ')[0] + '"\n  }]\n}\n</script>\n' : '';

    let heroH1 = h1.indexOf('Ryan Answers Personally') > -1 ? h1.replace('Ryan Answers Personally', '<span class="highlight">Ryan Answers Personally</span>') : h1;

    const hero = '\n<section class="hero" style="padding: 5rem 0 7rem 0;">\n    <div class="hero-overlay"></div>\n    <div class="container hero-content" style="grid-template-columns: 1fr;">\n        <div class="hero-text center" style="margin: 0 auto;">\n            <h1 style="font-size: 2.8rem;">' + heroH1 + '</h1>\n            <p class="subheadline" style="margin: 0 auto 2rem;">Family-owned since 1981. Direct insurance billing. 24/7/365.</p>\n            <div class="hero-actions" style="justify-content: center;">\n                <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse">\n                    <i class="fa-solid fa-phone"></i> Call (616) 822-1978 — Ryan Answers\n                </a>\n            </div>\n        </div>\n    </div>\n</section>\n';

    const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' + myHead + schema + '</head>\n<body>\n' + myHeader + hero + '<main class="page-content section-padding bg-light">\n    <div class="container">\n        <div style="background:#fff; padding: 4rem; border-radius: 1rem; box-shadow: var(--shadow-md); border: 1px solid var(--bg-subtle);">\n            ' + content + '\n        </div>\n    </div>\n</main>\n' + myFooter + '</body>\n</html>';

    // Replace all absolute paths in content with relative paths for local viewing
    let finalHtml = html.replace(/href="\//g, 'href="' + relPath);
    // Let's not double replace if it started with //

    fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const citiesNames = [
    "Grand Rapids", "Rockford", "Kentwood", "Holland", "Muskegon", "Grandville",
    "Jenison", "Hudsonville", "Lowell", "Ada", "East Grand Rapids", "Comstock Park",
    "Walker", "Wyoming", "Cutlerville", "Byron Center", "Caledonia", "Forest Hills",
    "Coopersville", "Allendale", "Zeeland", "Spring Lake", "Grand Haven", "Ferrysburg",
    "Norton Shores", "Fruitport", "whitehall", "Montague", "Cedar Springs", "Sparta",
    "Alpine", "Plainfield", "Cascade", "Gaines", "Georgetown", "Jamestown",
    "Port Sheldon", "Blendon", "Tallmadge", "Wright", "Chester", "Sullivan",
    "Ravenna", "Moorland"
];

const cities = citiesNames.map(name => {
    return {
        id: name.toLowerCase().replace(/ /g, '-') + '-mi',
        name: name,
        hook: `We provide rapid emergency restoration services for homes and businesses throughout ${name}. When disaster strikes, our Walker MI based team is dispatched immediately to protect your property.`
    };
});

const services = [
    { id: 'water-damage-restoration', name: 'Water Damage Restoration' },
    { id: 'fire-damage-restoration', name: 'Fire Damage Restoration' },
    { id: 'mold-remediation', name: 'Mold Remediation' },
    { id: 'sewage-cleanup', name: 'Sewage Cleanup' }
];

// Generate city links for a service hub
function generateCityLinks(serviceId) {
    let linksHtml = '<h3 style="margin-top: 3rem;">Service Areas for ' + serviceId.replace(/-/g, ' ') + '</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">';
    cities.forEach(city => {
        linksHtml += '<a href="/' + serviceId + '/' + city.id + '/" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center; font-weight: 600;">' + city.name + '</a>';
    });
    linksHtml += '</div>';
    return linksHtml;
}

const pages = [
    {
        route: '/about/',
        title: 'About Disaster Response by Ryan | Walker, MI',
        h1: 'About Disaster Response by Ryan',
        content: '\n<h2>My Promise: I Answer My Own Phone. Always.</h2>\n<p class="lead">Second-generation family business since 1981.</p>\n<p>Welcome to Disaster Response. My father founded this company over 40 years ago, and I took over in 2016. What makes us different? We aren\'t a massive national franchise. There is no call center or out-of-state dispatcher.</p>\n<p>When you call (616) 822-1978 at 3 AM with water flooding your basement, you speak with me. I dispatch my trusted crew, including our Lead Techs Steve, Shawn, and Rigoberto, to your home within minutes.</p>\n<ul>\n    <li><i class="fa-solid fa-check" style="color:var(--accent)"></i> <strong>IICRC Certified</strong></li>\n    <li><i class="fa-solid fa-check" style="color:var(--accent)"></i> <strong>Michigan Builder\'s License</strong></li>\n    <li><i class="fa-solid fa-check" style="color:var(--accent)"></i> <strong>Direct billing for all major insurance carriers</strong></li>\n</ul>\n'
    },
    {
        route: '/insurance-claims/',
        title: 'Insurance Claims for Water & Fire Damage | Grand Rapids MI',
        h1: 'We Handle the Paperwork. You Focus on Your Family.',
        content: '\n<h2>Direct Insurance Billing in West Michigan</h2>\n<p>Dealing with property damage is stressful enough without having to fight your insurance company. We work with State Farm, Allstate, Farmers, and all major carriers directly.</p>\n<p>We use industry-standard Xactimate documentation to ensure every drop of water and inch of damage is cataloged and approved by your adjuster.</p>\n<h3>What to do immediately:</h3>\n<ol>\n    <li>Call us first at (616) 822-1978</li>\n    <li>Document the damage safely without disturbing anything</li>\n    <li>Do not throw out any affected belongings until they are logged</li>\n</ol>\n'
    },
    {
        route: '/water-damage-restoration/',
        title: 'Water Damage Restoration Grand Rapids & West Michigan | IICRC Certified',
        h1: 'Water Damage Restoration in Grand Rapids & West Michigan',
        content: '\n<p class="lead">If you have water damage in Grand Rapids, call (616) 822-1978 — Ryan answers personally, 24/7.</p>\n<h2>Why Speed Matters</h2>\n<p>Mold can begin growing within 24 to 48 hours after water intrusion. Our 60-minute response time prevents secondary structural damage and limits contamination.</p>\n<h3>Our 6-Step Restoration Process</h3>\n<ol>\n    <li><strong>Assessment:</strong> Immediate thermal imaging and moisture metering.</li>\n    <li><strong>Extraction:</strong> Fast removal of standing water based on IICRC Category parameters.</li>\n    <li><strong>Drying:</strong> High-velocity air movers and dehumidifiers.</li>\n    <li><strong>Dehumidification:</strong> Precision control to restore ambient limits.</li>\n    <li><strong>Monitoring:</strong> Daily logged visits until dry goals are met.</li>\n    <li><strong>Restoration:</strong> Full reconstruction using our Michigan Builder\'s License.</li>\n</ol>\n' + generateCityLinks('water-damage-restoration')
    },
    {
        route: '/fire-damage-restoration/',
        title: 'Fire Damage Restoration & Smoke Cleanup Grand Rapids',
        h1: 'Fire & Smoke Damage Restoration in West Michigan',
        content: '\n<p class="lead">Rapid mitigation after a fire guarantees your structural integrity.</p>\n<p>Our team expertly removes harsh soot, sanitizes deep smoke odors using thermal fogging, and completely reconstructs your home. We handle the direct insurance billing for fire claims so you can focus on recovering.</p>\n<p>Call Ryan at (616) 822-1978 right now.</p>\n' + generateCityLinks('fire-damage-restoration')
    },
    {
        route: '/mold-remediation/',
        title: 'Mold Remediation Services Grand Rapids MI | Disaster Response by Ryan',
        h1: 'Certified Mold Remediation in West Michigan',
        content: '\n<p class="lead">Safe, IICRC-certified containment and removal of harmful mold.</p>\n<p>West Michigan\'s humid summers and damp basements create ideal mold environments. We build negative pressure containments and utilize HEPA filtration to eliminate spores efficiently and safely.</p>\n' + generateCityLinks('mold-remediation')
    },
    {
        route: '/sewage-cleanup/',
        title: 'Sewage Cleanup & Biohazard Removal Grand Rapids MI',
        h1: 'Category 3 Sewage Backup Cleanup — Ryan Answers Personally',
        content: '\n<p class="lead">Do not attempt to clean sewage yourself. It represents an extreme Category 3 biohazard.</p>\n<p>We deploy specialized protective gear to safely remove all sewage, completely disinfect the subfloor, and pass clearance testing. Available 24/7 for all sewage emergencies.</p>\n' + generateCityLinks('sewage-cleanup')
    },
    {
        route: '/contact/',
        title: 'Contact Disaster Response by Ryan | (616) 822-1978',
        h1: 'Contact Disaster Response by Ryan',
        content: '\n<p class="lead">24/7 Emergency Service for West Michigan.</p>\n<h2>Call (616) 822-1978</h2>\n<p>Ryan answers personally. We respond in 60 minutes or less.</p>\n<p><strong>Office Location:</strong><br>3707 Northridge Dr NW STE 10, Walker, MI 49544, USA<br>Walker, MI 49544</p>\n'
    },
    {
        route: '/service-areas/',
        title: 'West Michigan Service Areas | Disaster Response by Ryan',
        h1: 'Providing Emergency Service to West Michigan',
        content: '\n<p class="lead">We service a 60-mile radius around Walker, MI.</p>\n<p>Including 44 local cities across West Michigan.</p>\n' + generateCityLinks('water-damage-restoration')
    },
    { route: '/blog/how-much-does-water-damage-restoration-cost-in-michigan/', title: 'How much does water damage restoration cost in Michigan? | Disaster Response by Ryan', h1: 'How much does water damage restoration cost in Michigan?', content: '<p class="lead">Authoritative guide on How much does water damage restoration cost in Michigan?.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/does-homeowners-insurance-cover-water-damage-in-michigan/', title: 'Does homeowners insurance cover water damage in Michigan? | Disaster Response by Ryan', h1: 'Does homeowners insurance cover water damage in Michigan?', content: '<p class="lead">Authoritative guide on Does homeowners insurance cover water damage in Michigan?.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/water-damage-timeline-what-happens-in-the-first-24-48-72-hours/', title: 'Water damage timeline: what happens in the first 24/48/72 hours | Disaster Response by Ryan', h1: 'Water damage timeline: what happens in the first 24/48/72 hours', content: '<p class="lead">Authoritative guide on Water damage timeline: what happens in the first 24/48/72 hours.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/mold-after-water-damage-how-fast-does-it-grow-in-michigan/', title: 'Mold after water damage: how fast does it grow in Michigan? | Disaster Response by Ryan', h1: 'Mold after water damage: how fast does it grow in Michigan?', content: '<p class="lead">Authoritative guide on Mold after water damage: how fast does it grow in Michigan?.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/frozen-pipe-burst-grand-rapids-what-to-do-first/', title: 'Frozen pipe burst Grand Rapids: what to do first | Disaster Response by Ryan', h1: 'Frozen pipe burst Grand Rapids: what to do first', content: '<p class="lead">Authoritative guide on Frozen pipe burst Grand Rapids: what to do first.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/sump-pump-failure-cleanup-grand-rapids/', title: 'Sump pump failure cleanup Grand Rapids | Disaster Response by Ryan', h1: 'Sump pump failure cleanup Grand Rapids', content: '<p class="lead">Authoritative guide on Sump pump failure cleanup Grand Rapids.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/basement-flooding-grand-rapids-causes-and-restoration/', title: 'Basement flooding Grand Rapids: causes and restoration | Disaster Response by Ryan', h1: 'Basement flooding Grand Rapids: causes and restoration', content: '<p class="lead">Authoritative guide on Basement flooding Grand Rapids: causes and restoration.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/category-3-sewage-backup-health-risks-and-cleanup/', title: 'Category 3 sewage backup: health risks and cleanup | Disaster Response by Ryan', h1: 'Category 3 sewage backup: health risks and cleanup', content: '<p class="lead">Authoritative guide on Category 3 sewage backup: health risks and cleanup.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/water-damage-restoration-vs-mitigation-what-s-the-difference/', title: 'Water damage restoration vs. mitigation: what\'s the difference? | Disaster Response by Ryan', h1: 'Water damage restoration vs. mitigation: what\'s the difference?', content: '<p class="lead">Authoritative guide on Water damage restoration vs. mitigation: what\'s the difference?.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/how-to-document-water-damage-for-your-insurance-claim/', title: 'How to document water damage for your insurance claim | Disaster Response by Ryan', h1: 'How to document water damage for your insurance claim', content: '<p class="lead">Authoritative guide on How to document water damage for your insurance claim.</p><p>We will cover everything you need to know about this emergency and how our local Grand Rapids team can help mitigate the damage.</p><h3>Fast Response is Key</h3><p>Call Ryan at (616) 822-1978. Direct insurance billing available.</p><p style="margin-top: 2rem;"><strong>Return to <a href="/blog/">Blog</a></strong></p>' },
    { route: '/blog/', title: 'Blog | Disaster Response by Ryan', h1: 'Water Damage & Restoration Blog', content: '<p class="lead">Learn more about water, fire, and mold damage in West Michigan.</p><ul><li><a href="/blog/how-much-does-water-damage-restoration-cost-in-michigan/">How much does water damage restoration cost in Michigan?</a></li><li><a href="/blog/does-homeowners-insurance-cover-water-damage-in-michigan/">Does homeowners insurance cover water damage in Michigan?</a></li><li><a href="/blog/water-damage-timeline-what-happens-in-the-first-24-48-72-hours/">Water damage timeline: what happens in the first 24/48/72 hours</a></li><li><a href="/blog/mold-after-water-damage-how-fast-does-it-grow-in-michigan/">Mold after water damage: how fast does it grow in Michigan?</a></li><li><a href="/blog/frozen-pipe-burst-grand-rapids-what-to-do-first/">Frozen pipe burst Grand Rapids: what to do first</a></li><li><a href="/blog/sump-pump-failure-cleanup-grand-rapids/">Sump pump failure cleanup Grand Rapids</a></li><li><a href="/blog/basement-flooding-grand-rapids-causes-and-restoration/">Basement flooding Grand Rapids: causes and restoration</a></li><li><a href="/blog/category-3-sewage-backup-health-risks-and-cleanup/">Category 3 sewage backup: health risks and cleanup</a></li><li><a href="/blog/water-damage-restoration-vs-mitigation-what-s-the-difference/">Water damage restoration vs. mitigation: what\'s the difference?</a></li><li><a href="/blog/how-to-document-water-damage-for-your-insurance-claim/">How to document water damage for your insurance claim</a></li></ul>' }
];

pages.forEach(function (p) {
    createPage(p.route, p.title, p.h1, p.content);
});

services.forEach(function (svc) {
    let readableSvc = svc.name;

    cities.forEach(function (city) {
        let title = readableSvc + " " + city.name + " MI | Same-Day Response | (616) 822-1978";
        let h1 = readableSvc + " in " + city.name + ", MI — Ryan Answers Personally";
        let content =
            '\n<h2 style="color: var(--accent);">Local Emergency Response for ' + city.name + '</h2>\n' +
            '<p class="lead">' + city.hook + '</p>\n' +
            '<p>If you have ' + readableSvc.toLowerCase() + ' in ' + city.name + ', call (616) 822-1978 immediately. We\'re based in Walker and arrive safely to ' + city.name + ' extremely fast. Our process ensures that secondary damage is halted within 24 hours of the main event, and we work quickly to assess, mitigate, and reconstruct your property.</p>\n' +
            '<h3>We Cover Your Area</h3>\n' +
            '<p>Our team understands the local geography and building structures in ' + city.name + '. State Farm, Allstate, Farmers, and all major carriers are accepted. You\'ll deal exclusively with a Michigan-licensed builder and IICRC-certified restoration expert—never a call center. Because Ryan handles estimates personally, your insurance adjuster will receive industry-standard Xactimate documentation, resulting in faster approvals and fewer headaches.</p>\n' +
            '<h3>What To Do Next</h3>\n' +
            '<p>Do not wait. Water damage, mold spores, and structural weaknesses exacerbate by the hour. Do not attempt to use household vacuum cleaners or bleach, as this often causes permanent material destruction. Instead, reach out to our emergency line right now for immediate direction on how to limit damage before we arrive on scene.</p>\n' +
            '<blockquote>"When you call (616) 822-1978 at 2am, Ryan Penny picks up."</blockquote>\n' +
            '<p style="margin-top: 2rem;"><strong>Return to <a href="/' + svc.id + '/">' + readableSvc + ' Hub</a></strong></p>\n';

        createPage('/' + svc.id + '/' + city.id + '/', title, h1, content, true);
    });
});

console.log("Site successfully compiled.");
