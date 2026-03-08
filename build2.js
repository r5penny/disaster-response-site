const fs = require('fs');
const path = require('path');

const cities = JSON.parse(fs.readFileSync('cities.json','utf-8'));
const BASE = 'https://disaster911.net';

const services = [
  {id:'water-damage-restoration', name:'Water Damage Restoration', icon:'fa-house-flood-water', color:'#1A3A5C'},
  {id:'fire-damage-restoration', name:'Fire & Smoke Damage Restoration', icon:'fa-fire-flame-curved', color:'#E8450A'},
  {id:'mold-remediation', name:'Mold Remediation', icon:'fa-biohazard', color:'#2D6A4F'},
  {id:'sewage-cleanup', name:'Sewage Cleanup', icon:'fa-pipe-circle-check', color:'#6B4226'}
];

function slug(name){ return name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); }

function header(rel, active){
  rel = rel || './';
  return `<!-- Top Emergency Bar -->
<div class="emergency-bar">
  <div class="container">
    <span><i class="fa-solid fa-triangle-exclamation"></i> 24/7/365 Emergency Response  Ryan Answers Personally</span>
    <a href="tel:6168221978" style="color:#000;font-weight:700;"><i class="fa-solid fa-phone"></i> (616) 822-1978</a>
  </div>
</div>
<header class="site-header">
  <div class="container header-inner">
    <div class="logo"><a href="${rel}"><img src="/images/logo.png" alt="Disaster Response by Ryan  Walker MI" width="220" height="60" style="object-fit:contain;"></a></div>
    <nav class="desktop-nav"><ul>
      <li><a href="${rel}water-damage-restoration/" class="${active==='water'?'active':''}">Water Damage</a></li>
      <li><a href="${rel}fire-damage-restoration/" class="${active==='fire'?'active':''}">Fire &amp; Smoke</a></li>
      <li><a href="${rel}mold-remediation/" class="${active==='mold'?'active':''}">Mold</a></li>
      <li><a href="${rel}sewage-cleanup/" class="${active==='sewage'?'active':''}">Sewage</a></li>
      <li><a href="${rel}about/">About Ryan</a></li>
      <li><a href="${rel}insurance-claims/">Insurance</a></li>
      <li><a href="${rel}blog/">Blog</a></li>
    </ul></nav>
    <div class="header-cta">
      <a href="tel:6168221978" class="btn btn-primary btn-pulse">
        <i class="fa-solid fa-phone"></i> (616) 822-1978
        <span class="btn-subtitle">Ryan Answers Personally</span>
      </a>
    </div>
    <button class="mobile-menu-toggle" aria-label="Toggle menu"><i class="fa-solid fa-bars"></i></button>
  </div>
</header>
<nav class="mobile-nav"><ul>
  <li><a href="${rel}water-damage-restoration/">Water Damage</a></li>
  <li><a href="${rel}fire-damage-restoration/">Fire &amp; Smoke</a></li>
  <li><a href="${rel}mold-remediation/">Mold Remediation</a></li>
  <li><a href="${rel}sewage-cleanup/">Sewage Cleanup</a></li>
  <li><a href="${rel}about/">About Ryan</a></li>
  <li><a href="${rel}insurance-claims/">Insurance Claims</a></li>
  <li><a href="${rel}blog/">Blog</a></li>
  <li><a href="${rel}contact/">Contact</a></li>
</ul></nav>`;
}

function footer(rel){
  rel = rel || './';
  return `<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-col">
      <div class="footer-logo"><img src="/images/logo.png" alt="Disaster Response by Ryan" width="200" height="55" style="object-fit:contain;filter:brightness(0) invert(1);"></div>
      <p>Family-owned restoration company serving West Michigan since 1981. IICRC certified. Ryan answers personally  always.</p>
      <div class="footer-badges">
        <span class="badge badge-dark"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
        <span class="badge badge-dark"><i class="fa-solid fa-house-chimney"></i> MI Builder's License</span>
      </div>
    </div>
    <div class="footer-col">
      <h3>Contact</h3>
      <address class="nap">
        Disaster Response by Ryan<br>
        3707 Northridge Dr NW STE 10<br>
        Walker, MI 49544<br>
        <a href="tel:6168221978">(616) 822-1978</a><br>
        <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a>
      </address>
      <div class="mt-2"><strong>24/7 Emergency Service</strong></div>
    </div>
    <div class="footer-col">
      <h3>Services</h3>
      <ul class="footer-links">
        <li><a href="${rel}water-damage-restoration/">Water Damage Restoration</a></li>
        <li><a href="${rel}fire-damage-restoration/">Fire &amp; Smoke Damage</a></li>
        <li><a href="${rel}mold-remediation/">Mold Remediation</a></li>
        <li><a href="${rel}sewage-cleanup/">Sewage Cleanup</a></li>
        <li><a href="${rel}insurance-claims/">Insurance Claims</a></li>
        <li><a href="${rel}blog/">Restoration Blog</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h3>Top Service Areas</h3>
      <ul class="footer-links">
        <li><a href="${rel}water-damage-restoration/grand-rapids-mi/">Grand Rapids, MI</a></li>
        <li><a href="${rel}water-damage-restoration/rockford-mi/">Rockford, MI</a></li>
        <li><a href="${rel}water-damage-restoration/kentwood-mi/">Kentwood, MI</a></li>
        <li><a href="${rel}water-damage-restoration/holland-mi/">Holland, MI</a></li>
        <li><a href="${rel}water-damage-restoration/muskegon-mi/">Muskegon, MI</a></li>
        <li><a href="${rel}service-areas/">View All ${cities.length} Cities </a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>&copy; 2026 Disaster Response by Ryan. All Rights Reserved. | <a href="tel:6168221978">(616) 822-1978</a></p>
      <div class="legal-links">
        <a href="${rel}privacy-policy/">Privacy Policy</a>
        <a href="${rel}terms/">Terms of Service</a>
        <a href="${rel}sitemap.xml">Sitemap</a>
      </div>
    </div>
  </div>
</footer>
<a href="tel:6168221978" class="mobile-floating-cta"><i class="fa-solid fa-phone"></i> Call Now  Ryan Answers</a>
<script src="${rel}script.js"></script>`;
}

function localSchema(city, service){
  return `<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"LocalBusiness",
      "name":"Disaster Response by Ryan",
      "url":"https://disaster911.net",
      "telephone":"(616) 822-1978",
      "email":"rpenny@disaster911.net",
      "address":{"@type":"PostalAddress","streetAddress":"3707 Northridge Dr NW STE 10","addressLocality":"Walker","addressRegion":"MI","postalCode":"49544","addressCountry":"US"},
      "geo":{"@type":"GeoCoordinates","latitude":43.0011,"longitude":-85.7335},
      "openingHours":"Mo-Su 00:00-24:00",
      "priceRange":"$$",
      "image":"https://disaster911.net/images/logo.png",
      "sameAs":["https://www.google.com/maps/place/Disaster+Response+by+Ryan","https://www.facebook.com/disaster911net","https://www.bing.com/local?lid=disaster911"],
      "areaServed":${JSON.stringify(cities.map(c=>c.name+', MI'))}
    },
    {
      "@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":"${BASE}/"},
        {"@type":"ListItem","position":2,"name":"${service.name}","item":"${BASE}/${service.id}/"}
        ${city ? `,${'{"@type":"ListItem","position":3,"name":"'+service.name+' '+city.name+' MI","item":"'+BASE+'/'+service.id+'/'+city.id+'/"}'}` : ''}
      ]
    }
    ${city ? `,${'{"@type":"Service","serviceType":"'+service.name+'","provider":{"@type":"LocalBusiness","name":"Disaster Response by Ryan"},"areaServed":{"@type":"City","name":"'+city.name+'","containedInPlace":{"@type":"State","name":"Michigan"}},"availableChannel":{"@type":"ServiceChannel","servicePhone":"(616) 822-1978"}}'}` : ''}
  ]
}
</script>`;
}

function head(title, desc, canonical, rel, extraSchema){
  rel = rel||'./';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="US-MI">
<meta name="geo.placename" content="Walker, Michigan">
<meta name="geo.position" content="43.0011;-85.7335">
<!-- Open Graph -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Disaster Response by Ryan">
<!-- Bing / Microsoft -->
<meta name="msvalidate.01" content="disaster911-bing-verify">
<meta name="msapplication-TileColor" content="#1A3A5C">
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="${rel}styles.css">
${extraSchema||''}
</head>`;
}

function cityLinks(svcId){
  return `<div class="city-grid-links">
  <h3>We Serve All of West Michigan  ${cities.length} Communities Strong</h3>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem;margin-top:1.5rem;">
    ${cities.map(c=>`<a href="/${svcId}/${c.id}/" class="city-link-card">${c.name}, MI</a>`).join('\n    ')}
  </div>
</div>`;
}

function write(route, html){
  const dir = path.join(__dirname, route);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'), html);
}

//  CITY PAGES (all services  all cities) 
services.forEach(svc => {
  cities.forEach(city => {
    const title = `${svc.name} ${city.name} MI | Same-Day Response | (616) 822-1978 | Disaster Response by Ryan`;
    const desc = `${svc.name} in ${city.name}, MI  Ryan answers personally. Family business since 1981, ${city.min} minutes from your door. Direct insurance billing with State Farm, Allstate, Farmers. Call (616) 822-1978  24/7.`;
    const canonical = `${BASE}/${svc.id}/${city.id}/`;
    const svcKey = svc.id.includes('water')?'water':svc.id.includes('fire')?'fire':svc.id.includes('mold')?'mold':'sewage';

    const waterSpecific = svc.id==='water-damage-restoration' ? `
<h3>Water Damage Categories in ${city.name}</h3>
<p>IICRC standards define three water damage categories important for proper restoration in ${city.name} properties:</p>
<ul>
  <li><strong>Category 1 (Clean Water):</strong> Pipe breaks, supply line failures, overflow from clean sources. Common in ${city.name}'s ${city.risk.split(',')[0].trim()} situations.</li>
  <li><strong>Category 2 (Gray Water):</strong> Washing machine overflow, dishwasher backup, sump pump failure. Requires sanitization.</li>
  <li><strong>Category 3 (Black Water):</strong> Sewage backup, river flooding, ground surface water. Biohazard  never clean this yourself. Call (616) 822-1978 immediately.</li>
</ul>
<h3>Our 6-Step Restoration Process for ${city.name}</h3>
<ol>
  <li><strong>Assessment:</strong> Thermal imaging cameras and professional moisture meters identify all affected areas  including hidden moisture behind walls.</li>
  <li><strong>Extraction:</strong> Industrial truck-mount extractors remove standing water in minutes, not hours.</li>
  <li><strong>Drying:</strong> High-velocity air movers placed strategically for maximum airflow across wet surfaces.</li>
  <li><strong>Dehumidification:</strong> Commercial-grade dehumidifiers reduce ambient humidity to IICRC-standard dry goals.</li>
  <li><strong>Monitoring:</strong> Daily logged visits with calibrated moisture meters until dry goals are confirmed met.</li>
  <li><strong>Reconstruction:</strong> Full rebuild using our Michigan Builder's License  one company, start to finish.</li>
</ol>` : '';

    const fireSpecific = svc.id==='fire-damage-restoration' ? `
<h3>Fire & Smoke Damage Restoration Process for ${city.name}</h3>
<p>Smoke damage in ${city.name} properties requires specialized chemistry  smoke particles are acidic and continue etching surfaces for days after the fire is out. Speed matters.</p>
<ol>
  <li><strong>Emergency Board-Up & Tarping:</strong> We secure your ${city.name} property immediately to prevent weather and theft intrusion.</li>
  <li><strong>Soot Categorization:</strong> Wet smoke vs. dry smoke vs. protein residue require different cleaning protocols  we assess and select the right chemistry.</li>
  <li><strong>Air Scrubbing:</strong> HEPA-filtered air scrubbers run continuously to capture airborne soot particles throughout your ${city.name} property.</li>
  <li><strong>Surface Cleaning:</strong> All soot-affected surfaces cleaned using appropriate dry, wet, or chemical sponge methods.</li>
  <li><strong>Thermal Fogging / Ozone:</strong> Penetrating odor neutralization eliminates smoke smell from structural cavities that surface cleaning cannot reach.</li>
  <li><strong>Full Reconstruction:</strong> Our Michigan Builder's License allows complete rebuild  no handoffs to a separate contractor.</li>
</ol>` : '';

    const moldSpecific = svc.id==='mold-remediation' ? `
<h3>Why Mold is Especially Problematic in ${city.name}</h3>
<p>West Michigan's continental climate  wet springs, humid summers, and dramatic freeze-thaw cycles  creates near-ideal conditions for mold growth. In ${city.name} specifically: ${city.risk}. Mold spores begin colonizing within 24-48 hours of water intrusion.</p>
<h3>Our IICRC S520 Mold Remediation Protocol</h3>
<ol>
  <li><strong>Containment:</strong> Negative-pressure containment barriers prevent spore migration to unaffected areas of your ${city.name} property.</li>
  <li><strong>HEPA Air Filtration:</strong> Continuous air scrubbing captures airborne spores through the project.</li>
  <li><strong>Physical Removal:</strong> Affected materials removed and HEPA-vacuumed per IICRC S520 standards.</li>
  <li><strong>Anti-Microbial Treatment:</strong> EPA-registered biocidal agents applied to all affected surfaces.</li>
  <li><strong>Post-Remediation Verification:</strong> Third-party testing available to confirm clearance before reconstruction.</li>
  <li><strong>Reconstruction:</strong> Full rebuild with our Michigan Builder's License.</li>
</ol>` : '';

    const sewageSpecific = svc.id==='sewage-cleanup' ? `
<h3>Sewage Backup in ${city.name}  Category 3 Biohazard Warning</h3>
<p>Sewage backup is classified as Category 3 (Black Water)  containing E. coli, hepatitis A, and dozens of other pathogens. Never attempt to clean sewage yourself. In ${city.name}, the primary causes include: ${city.risk}.</p>
<h3>Our Category 3 Sewage Cleanup Protocol</h3>
<ol>
  <li><strong>PPE Deployment:</strong> Full Tyvek suits, N95/P100 respirators, and chemical-resistant gloves  no exposure to our crews or your family.</li>
  <li><strong>Sewage Extraction:</strong> Specialized sewage-rated pumps and extractors remove all contaminated material.</li>
  <li><strong>Material Removal:</strong> All porous materials (carpet, pad, drywall, insulation) in the contamination zone are removed and disposed of properly.</li>
  <li><strong>Surface Disinfection:</strong> EPA-registered hospital-grade disinfectants applied to all structural surfaces.</li>
  <li><strong>Air Scrubbing:</strong> HEPA filtration runs continuously to capture bio-aerosols.</li>
  <li><strong>Clearance Testing:</strong> We confirm contamination is eliminated before reconstruction begins.</li>
</ol>` : '';

    const faqItems = [
      {q:`How fast can you respond to ${svc.name.toLowerCase()} in ${city.name}?`, a:`Ryan typically arrives at ${city.name} properties within ${city.min} minutes of your call. Walker is our base  we dispatch immediately, no call center delay. Call (616) 822-1978 and Ryan answers personally.`},
      {q:`Do you bill insurance directly for ${svc.name.toLowerCase()} in ${city.name}?`, a:`Yes. We bill State Farm, Allstate, Farmers, and all major carriers directly for ${city.name} property claims. We prepare full Xactimate documentation so your adjuster has everything needed for rapid claim approval.`},
      {q:`What causes ${svc.id.includes('water')?'water damage':'this type of damage'} most commonly in ${city.name}?`, a:`In ${city.name}, the primary causes are: ${city.risk}. Our team understands ${city.name}'s specific geography and builds restoration plans around these local risk factors.`},
      {q:`Are you IICRC certified for work in ${city.name}?`, a:`Yes  all Disaster Response by Ryan technicians are IICRC certified. We also carry a Michigan Builder's License, allowing us to handle full structural reconstruction in ${city.name} from start to finish  no handoffs to a separate contractor.`}
    ];

    const faqSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  ${faqItems.map(f=>`{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`).join(',\n  ')}
]}</script>`;

    const h1 = `${svc.name} in ${city.name}, MI  Ryan Answers Personally`;
    const html = `${head(title, desc, canonical, '../../', localSchema(city, svc)+'\n'+faqSchema)}
<body>
${header('../../', svcKey)}
<nav class="breadcrumb-nav">
  <div class="container">
    <a href="/">Home</a> &rsaquo; <a href="/${svc.id}/">${svc.name}</a> &rsaquo; ${city.name}, MI
  </div>
</nav>
<section class="hero city-hero" style="padding:4rem 0 6rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <div class="hero-badges">
        <span class="badge"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
        <span class="badge"><i class="fa-solid fa-clock"></i> ${city.min} Min Response</span>
      </div>
      <h1>${h1}</h1>
      <p class="subheadline">Family-owned since 1981. Based in Walker  <strong>${city.min} minutes from ${city.name}</strong>. Direct insurance billing. 24/7/365.</p>
      <div class="hero-actions" style="justify-content:center;">
        <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse">
          <i class="fa-solid fa-phone"></i> Call (616) 822-1978  Ryan Answers
        </a>
        <a href="/contact/" class="btn btn-secondary btn-large">Request Service Online</a>
      </div>
    </div>
  </div>
</section>

<section class="social-proof">
  <div class="container social-proof-inner">
    <div class="proof-item"><div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div><span class="proof-text">5.0 Google Rating</span></div>
    <div class="proof-item"><i class="fa-solid fa-stopwatch proof-icon"></i><span class="proof-text">~${city.min} min to ${city.name}</span></div>
    <div class="proof-item"><i class="fa-solid fa-shield-halved proof-icon"></i><span class="proof-text">Direct Insurance Billing</span></div>
  </div>
</section>

<main class="page-content section-padding bg-light">
  <div class="container" style="max-width:900px;">
    <div class="content-card">
      <h2 style="color:var(--accent);">Why ${city.name} Residents Call Ryan First</h2>
      <p class="lead">${city.hook}</p>
      <p>When you call (616) 822-1978, Ryan Penny answers personally  not a receptionist, not a dispatcher, not a call center. We're ${city.min} minutes away in Walker and we deploy immediately.</p>

      <div class="trust-bar">
        <div class="trust-item"><i class="fa-solid fa-certificate"></i><span>IICRC Certified</span></div>
        <div class="trust-item"><i class="fa-solid fa-file-invoice-dollar"></i><span>Direct Insurance Billing</span></div>
        <div class="trust-item"><i class="fa-solid fa-hammer"></i><span>MI Builder's License</span></div>
        <div class="trust-item"><i class="fa-solid fa-clock"></i><span>24/7/365 Response</span></div>
      </div>

      <h2>Local ${svc.name} Risk in ${city.name}</h2>
      <p>Understanding ${city.name}'s specific geography is critical to effective restoration. Primary risk factors here include: <strong>${city.risk}</strong>.</p>
      <p>Our team has handled restoration projects across ${city.name} and understands exactly how these local conditions drive damage patterns. We build our response plan around ${city.name}'s specific environment  not a generic national playbook.</p>

      ${waterSpecific}${fireSpecific}${moldSpecific}${sewageSpecific}

      <h2>Insurance Claims  We Handle the Paperwork</h2>
      <p>Dealing with property damage is stressful enough without fighting your insurance company. We work directly with State Farm, Allstate, Farmers, and all major carriers for ${city.name} claims. Our Xactimate documentation is prepared by Ryan personally  adjusters get exactly what they need for rapid approval.</p>
      <blockquote>"When you call (616) 822-1978 at 2am, Ryan Penny picks up. That's been true since 1981 and it's still true today."</blockquote>

      <h2>Frequently Asked Questions  ${city.name}</h2>
      <div class="faq-container" itemscope itemtype="https://schema.org/FAQPage">
        ${faqItems.map(f=>`<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <button class="faq-question" itemprop="name">${f.q}<i class="fa-solid fa-chevron-down"></i></button>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text"><p>${f.a}</p></div></div>
        </div>`).join('\n        ')}
      </div>

      <div style="margin-top:3rem;padding:2rem;background:#fff;color:#000;border-radius:.75rem;text-align:center;">
        <h3 style="color:#000;margin-bottom:.5rem;">Ready to Help ${city.name}  Right Now</h3>
        <p style="margin-bottom:1.5rem;opacity:.9;">24/7/365. Ryan answers personally. ${city.min} minutes to your door.</p>
        <a href="tel:6168221978" class="btn btn-accent btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call (616) 822-1978</a>
      </div>

      <p style="margin-top:2rem;"><strong> <a href="/${svc.id}/">${svc.name} Hub  All West Michigan Cities</a></strong></p>
    </div>
  </div>
</main>
${footer('../../')}
</body></html>`;

    write(`/${svc.id}/${city.id}/`, html);
  });
});

//  SERVICE HUB PAGES 
services.forEach(svc => {
  const svcKey = svc.id.includes('water')?'water':svc.id.includes('fire')?'fire':svc.id.includes('mold')?'mold':'sewage';
  const title = `${svc.name} Grand Rapids & West Michigan | IICRC Certified | 24/7 | (616) 822-1978`;
  const desc = `${svc.name} across all of West Michigan. Ryan answers personally  family business since 1981. IICRC certified. Direct insurance billing with all major carriers. Call (616) 822-1978, 24/7.`;
  const canonical = `${BASE}/${svc.id}/`;

  const waterContent = svc.id==='water-damage-restoration' ? `
<h2>Why Speed Matters  What Happens in 24/48/72 Hours</h2>
<p>Mold begins colonizing within <strong>24-48 hours</strong> of water intrusion. Structural materials degrade. Drywall turns to pulp. Hardwood floors warp permanently. Every hour you wait costs money and increases health risk.</p>
<p>When you call (616) 822-1978, Ryan answers and we deploy immediately. Our Walker, MI base puts us within 60 minutes of every community we serve.</p>
<h2>Water Damage Categories  What We're Dealing With</h2>
<ul>
  <li><strong>Category 1  Clean Water:</strong> Supply line breaks, appliance overflows, roof leaks. Safest category but still requires professional drying to prevent mold.</li>
  <li><strong>Category 2  Gray Water:</strong> Washing machine overflow, dishwasher backup, toilet overflow (no solids). Contains contaminants  requires sanitization.</li>
  <li><strong>Category 3  Black Water:</strong> Sewage backup, river flooding, ground surface water intrusion. Biohazard level. Never attempt to clean yourself. Call us immediately.</li>
</ul>
<h2>Our 6-Step IICRC Water Damage Process</h2>
<ol>
  <li><strong>Assessment & Documentation:</strong> Thermal imaging cameras and calibrated moisture meters map all affected areas  including hidden moisture in walls.</li>
  <li><strong>Water Extraction:</strong> Industrial truck-mount extractors  far more powerful than anything you can rent  remove standing water in minutes.</li>
  <li><strong>Structural Drying:</strong> High-velocity air movers create rapid evaporation from all wet surfaces simultaneously.</li>
  <li><strong>Dehumidification:</strong> Commercial dehumidifiers lower ambient humidity to IICRC-standard dry goals  typically 35-45% relative humidity.</li>
  <li><strong>Daily Monitoring:</strong> We return daily with moisture meters to log readings until dry goals are confirmed met across all materials.</li>
  <li><strong>Full Reconstruction:</strong> Our Michigan Builder's License lets us rebuild everything  drywall, flooring, cabinetry  one company, start to finish.</li>
</ol>
<h2>Equipment We Use</h2>
<p>Not all restoration companies carry professional-grade equipment. We use:</p>
<ul>
  <li><strong>Thermal Imaging Cameras:</strong> See moisture behind walls without destructive probing</li>
  <li><strong>Calibrated Moisture Meters:</strong> Pinpoint moisture in wood, drywall, and concrete</li>
  <li><strong>Truck-Mount Extractors:</strong> Remove thousands of gallons of water per hour</li>
  <li><strong>High-Velocity Air Movers:</strong> Industrial-grade drying speed</li>
  <li><strong>Commercial Dehumidifiers:</strong> LGR (Low-Grain Refrigerant) units that extract moisture even in low-humidity conditions</li>
</ul>` : `<p class="lead">We provide professional ${svc.name} services across all of West Michigan  ${cities.length} communities served from our Walker, MI base. Ryan answers personally. Call (616) 822-1978 anytime, 24/7/365.</p>`;

  const html = `${head(title, desc, canonical, '../', localSchema(null, svc))}
<body>
${header('../', svcKey)}
<section class="hero" style="padding:5rem 0 7rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <div class="hero-badges">
        <span class="badge"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
        <span class="badge"><i class="fa-solid fa-clock"></i> 24/7/365 Response</span>
      </div>
      <h1>${svc.name} in Grand Rapids &amp; West Michigan  <span class="highlight">Ryan Answers Personally</span></h1>
      <p class="subheadline">Family-owned since 1981. Walker, MI  serving all of West Michigan within 60 minutes. Direct insurance billing.</p>
      <div class="hero-actions" style="justify-content:center;">
        <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call (616) 822-1978  Ryan Answers</a>
        <a href="/contact/" class="btn btn-secondary btn-large">Request Service Online</a>
      </div>
    </div>
  </div>
</section>

<main class="page-content section-padding bg-light">
  <div class="container" style="max-width:900px;">
    <div class="content-card">
      ${svc.id === 'water-damage-restoration' ? waterContent : ''}
      ${svc.id === 'fire-damage-restoration' ? `
<h2>The First 48 Hours After a Fire</h2>
<p>Smoke particles are highly acidic and continue etching glass, tarnishing metal, and discoloring plastics long after the fire is out. If not neutralized quickly, structural materials can suffer permanent damage. This is why we dispatch from Walker immediately.</p>
<h2>Our 6-Step Fire & Smoke Damage Restoration Process</h2>
<ol>
  <li><strong>Emergency Board-Up & Tarping:</strong> We secure your property to prevent weather intrusion and unauthorized access while restoration begins.</li>
  <li><strong>Soot Assessment:</strong> Different fires produce different soot (wet smoke, dry smoke, protein residue). We identify the residue to select the exact chemical sponge or cleaning solvent required.</li>
  <li><strong>Air Scrubbing & Filtration:</strong> Industrial HEPA air scrubbers run 24/7 to capture airborne particulate and begin odor reduction.</li>
  <li><strong>Surface Cleaning & Deodorization:</strong> We clean all salvageable surfaces and use thermal fogging or ozone treatments to pull trapped smoke molecules out of porous structural materials.</li>
  <li><strong>Water Remediation:</strong> Firefighting efforts often leave thousands of gallons of water behind. We extract and dry the structure to prevent secondary mold growth.</li>
  <li><strong>Full Reconstruction:</strong> With our Michigan Builder's License, we rebuild the damaged structure completely—drywall, roofing, flooring, and paint. One crew, start to finish.</li>
</ol>
      ` : ''}
      ${svc.id === 'mold-remediation' ? `
<h2>Why West Michigan Homes Are Vulnerable to Mold</h2>
<p>Our humid summers and freeze/thaw cycles create chronic conditions for mold. In our 60-mile service area around Grand Rapids, mold spores typically colonize within 24 to 48 hours of any untreated water intrusion. Ignoring a musty smell only increases the ultimate cost of remediation.</p>
<h2>Our IICRC S520 Mold Remediation Protocol</h2>
<ol>
  <li><strong>Inspection & Testing:</strong> We identify the moisture source feeding the mold—because if you don't stop the water, the mold will return.</li>
  <li><strong>Containment:</strong> We construct negative-pressure physical barriers to ensure mold spores cannot spread to unaffected areas of your home during removal.</li>
  <li><strong>Air Filtration:</strong> Commercial HEPA air scrubbers continuously capture airborne spores throughout the remediation process.</li>
  <li><strong>Physical Removal:</strong> We actively remove contaminated porous materials entirely (drywall, carpet) and HEPA-vacuum structural wood. We do not just "bleach" mold, which leaves root structures intact.</li>
  <li><strong>Antimicrobial Treatment:</strong> EPA-registered biocides are applied to non-porous surfaces and framing to prevent regrowth.</li>
  <li><strong>Restoration:</strong> We repair the moisture source, rebuild the affected area, and return your property to pre-loss condition.</li>
</ol>
      ` : ''}
      ${svc.id === 'sewage-cleanup' ? `
<h2>Category 3 Biohazard Warning</h2>
<p>Sewage backups represent a Category 3 (Black Water) emergency. This water contains severe pathogens including E. coli, hepatitis, and salmonella. Contact with contaminated water or even inhaling aerosolized particles can cause serious illness. <strong>Never attempt to clean a sewage backup yourself.</strong></p>
<h2>Our Category 3 Sewage Cleanup Protocol</h2>
<ol>
  <li><strong>PPE & Containment:</strong> Our technicians deploy in full Tyvek suits and respirators. We contain the affected area to protect the rest of your home from bio-aerosols.</li>
  <li><strong>Safe Extraction:</strong> Using specialized sewage extractors, we safely remove all contaminated liquid and solid waste.</li>
  <li><strong>Contaminated Material Removal:</strong> All porous materials containing sewage (carpet, padding, drywall, insulation) cannot be cleaned and must be safely disposed of as biohazard waste.</li>
  <li><strong>Medical-Grade Sanitization:</strong> We apply EPA-registered, hospital-grade disinfectants to all hard surfaces and structural wood to eliminate pathogens entirely.</li>
  <li><strong>Structural Drying:</strong> We dry the sanitized structure to IICRC standards to prevent subsequent mold growth.</li>
  <li><strong>Reconstruction & Clearance:</strong> We can provide third-party environmental clearance testing, followed by full reconstruction of the affected area.</li>
</ol>
      ` : ''}
      <h2>Insurance Claims  Direct Billing</h2>
      <p>We work directly with State Farm, Allstate, Farmers, and all major insurance carriers. Ryan handles Xactimate documentation personally  your adjuster gets exactly what they need for rapid claim approval. You focus on your family, we handle the paperwork.</p>
      <blockquote>"Call (616) 822-1978. Ryan answers. We handle everything from first call to final walkthrough."</blockquote>
      ${cityLinks(svc.id)}
    </div>
  </div>
</main>
${footer('../')}
</body></html>`;

  write(`/${svc.id}/`, html);
});

//  ABOUT PAGE 
{
  const title = 'About Ryan Penny | Disaster Response by Ryan | Walker, MI | (616) 822-1978';
  const desc = 'Ryan Penny is a second-generation IICRC-certified restoration contractor. Family business since 1981. Ryan answers his phone personally  always. Call (616) 822-1978, 24/7/365.';
  write('/about/', `${head(title,desc,`${BASE}/about/`,'../',localSchema(null,services[0]))}
<body>
${header('../','about')}
<section class="hero" style="padding:5rem 0 7rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <h1>About Disaster Response by Ryan  <span class="highlight">A Family Business Since 1981</span></h1>
      <p class="subheadline">Ryan Penny answers his own phone. Always.</p>
    </div>
  </div>
</section>
<main class="page-content section-padding bg-light">
  <div class="container" style="max-width:900px;">
    <div class="content-card">
      <h2>My Promise to You</h2>
      <p class="lead">When you call (616) 822-1978 at 2am after a pipe burst, I answer. Not a receptionist. Not a call center. Me  Ryan Penny.</p>
      <p>My father founded this company in 1981, building it on the principle that West Michigan families deserve to speak with the person doing the work  not an 800 number. I took over in 2016 carrying that same commitment forward.</p>
      <p>This isn't a franchise. There's no national playbook. There's no corporate margin skimming your restoration budget. There's just a family that has been taking care of West Michigan homes for over 40 years.</p>
      <h2>Our Team</h2>
      <ul>
        <li><strong>Ryan Penny</strong>  Owner &amp; Operator (answers personally, handles all estimates)</li>
        <li><strong>Steve</strong>  Lead Technician</li>
        <li><strong>Shawn</strong>  Lead Technician</li>
        <li><strong>Rigoberto</strong>  Lead Technician</li>
      </ul>
      <h2>Certifications &amp; Licenses</h2>
      <ul>
        <li><i class="fa-solid fa-certificate" style="color:var(--accent)"></i> <strong>IICRC Certified</strong>  Institute of Inspection, Cleaning &amp; Restoration Certification</li>
        <li><i class="fa-solid fa-hammer" style="color:var(--accent)"></i> <strong>Michigan Builder's License</strong>  Full structural reconstruction capability</li>
        <li><i class="fa-solid fa-file-invoice-dollar" style="color:var(--accent)"></i> <strong>Direct Insurance Billing</strong>  Approved with State Farm, Allstate, Farmers, and all major carriers</li>
      </ul>
      <h2>Why "Not a Franchise" Matters to You</h2>
      <p>When you hire a franchise restoration company, your money pays franchise fees to a national brand. Your job gets dispatched to whoever is available. Your adjuster communicates with a regional coordinator who may never set foot on your property.</p>
      <p>When you call Disaster Response by Ryan: Ryan answers. Ryan arrives or dispatches Steve, Shawn, or Rigoberto himself. Ryan reviews your Xactimate documentation before it goes to your adjuster. One accountable person from first call to final walkthrough.</p>
      <p>We serve ${cities.length} communities across a 60-mile radius from Walker  Grand Rapids, Holland, Muskegon, Rockford, and everything in between.</p>
      <div style="margin-top:2rem;text-align:center;">
        <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call Ryan  (616) 822-1978</a>
      </div>
    </div>
  </div>
</main>
${footer('../')}
</body></html>`);
}

//  INSURANCE CLAIMS PAGE 
{
  const title = 'Insurance Claims for Water & Fire Damage | Grand Rapids MI | Disaster Response by Ryan';
  const desc = 'We handle insurance claims directly with State Farm, Allstate, Farmers and all major carriers. Xactimate documentation, direct billing. You focus on your family. Call (616) 822-1978.';
  write('/insurance-claims/', `${head(title,desc,`${BASE}/insurance-claims/`,'../',localSchema(null,services[0]))}
<body>
${header('../','insurance')}
<section class="hero" style="padding:5rem 0 7rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <h1>We Handle the Paperwork. <span class="highlight">You Focus on Your Family.</span></h1>
      <p class="subheadline">Direct insurance billing with all major carriers. Xactimate documentation. No surprises.</p>
    </div>
  </div>
</section>
<main class="page-content section-padding bg-light">
  <div class="container" style="max-width:900px;">
    <div class="content-card">
      <h2>Direct Insurance Billing  How It Works</h2>
      <p class="lead">Dealing with property damage is stressful enough without having to fight your insurance company. We work directly with your carrier so you don't have to.</p>
      <p>Ryan Penny personally prepares your Xactimate estimate  the industry-standard software used by adjusters nationwide. Your insurance company receives complete, professional documentation that leaves nothing on the table.</p>
      <h2>Carriers We Work With</h2>
      <ul>
        <li><strong>State Farm</strong>  Direct billing, approved contractor</li>
        <li><strong>Allstate</strong>  Direct billing, approved contractor</li>
        <li><strong>Farmers Insurance</strong>  Direct billing, approved contractor</li>
        <li><strong>All other major carriers</strong>  We work with every insurance provider in Michigan</li>
      </ul>
      <h2>What to Do Immediately After Property Damage</h2>
      <ol>
        <li><strong>Call Ryan first at (616) 822-1978</strong>  We guide you through immediate steps to limit damage before we arrive</li>
        <li><strong>Document everything safely</strong>  Photos and video of all damage before any cleanup</li>
        <li><strong>Do NOT throw anything away</strong>  Every damaged item must be logged for your claim</li>
        <li><strong>Do NOT use household vacuums</strong>  They spread contamination and destroy claim evidence</li>
        <li><strong>Then call your insurance company</strong>  We can assist with this call</li>
      </ol>
      <h2>Does Insurance Cover Water Damage?</h2>
      <p>Most standard homeowner policies cover <em>sudden and accidental</em> water damage from internal sources (burst pipes, appliance failures, overflow). Flooding from external sources (rivers, surface water) typically requires a separate flood insurance policy (NFIP/FEMA).</p>
      <p>Mold remediation coverage varies by policy  but if the mold resulted from a covered water event, remediation is often included. Ryan helps you understand your coverage before work begins.</p>
      <div style="margin-top:2rem;text-align:center;">
        <a href="tel:6168221978" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call (616) 822-1978  Ryan Answers</a>
      </div>
    </div>
  </div>
</main>
${footer('../')}
</body></html>`);
}

//  SERVICE AREAS PAGE 
{
  const title = `West Michigan Service Areas  All ${cities.length} Communities | Disaster Response by Ryan`;
  const desc = `Disaster Response by Ryan serves ${cities.length} communities within a 60-mile radius of Walker, MI. Emergency restoration for water, fire, mold, and sewage. Call (616) 822-1978, 24/7.`;
  write('/service-areas/', `${head(title,desc,`${BASE}/service-areas/`,'../',localSchema(null,services[0]))}
<body>
${header('../','areas')}
<section class="hero" style="padding:5rem 0 7rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <h1>Serving ${cities.length} West Michigan Communities  <span class="highlight">60-Mile Radius from Walker, MI</span></h1>
      <p class="subheadline">Ryan answers personally. We dispatch immediately. Average response under 60 minutes.</p>
    </div>
  </div>
</section>
<main class="page-content section-padding bg-light">
  <div class="container">
    <div class="content-card">
      <p class="lead">Disaster Response by Ryan operates from 3707 Northridge Dr NW STE 10, Walker, MI 49544, USA, Walker, MI 49544  centrally positioned to cover all of West Michigan. We serve the following communities for water damage restoration, fire damage restoration, mold remediation, and sewage cleanup:</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:2rem;">
        ${cities.map(c=>`<div class="service-area-card">
          <h3 style="font-size:1rem;margin-bottom:.5rem;">${c.name}, MI</h3>
          <p style="font-size:.8rem;margin-bottom:.5rem;color:var(--text-muted);">~${c.min} min from Walker</p>
          <ul style="list-style:none;padding:0;font-size:.8rem;">
            <li><a href="/water-damage-restoration/${c.id}/">Water Damage</a></li>
            <li><a href="/fire-damage-restoration/${c.id}/">Fire Damage</a></li>
            <li><a href="/mold-remediation/${c.id}/">Mold Remediation</a></li>
            <li><a href="/sewage-cleanup/${c.id}/">Sewage Cleanup</a></li>
          </ul>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</main>
${footer('../')}
</body></html>`);
}

//  CONTACT PAGE 
{
  write('/contact/', `${head('Contact Disaster Response by Ryan | (616) 822-1978 | Walker, MI','Emergency restoration contact for West Michigan. Ryan answers personally 24/7. Call (616) 822-1978 or email rpenny@disaster911.net.',`${BASE}/contact/`,'../',localSchema(null,services[0]))}
<body>
${header('../','contact')}
<section class="hero" style="padding:5rem 0 7rem;">
  <div class="hero-overlay"></div>
  <div class="container hero-content" style="grid-template-columns:1fr;">
    <div class="hero-text center" style="margin:0 auto;">
      <h1>Contact Disaster Response by Ryan</h1>
      <p class="subheadline">24/7 Emergency Response  Ryan Answers Personally</p>
    </div>
  </div>
</section>
<main class="page-content section-padding bg-light">
  <div class="container" style="max-width:900px;">
    <div class="content-card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;">
        <div>
          <h2>Call Ryan Now</h2>
          <p class="lead"><a href="tel:6168221978" style="font-size:2rem;font-weight:800;color:var(--accent);">(616) 822-1978</a></p>
          <p>Ryan answers personally. No call center. No dispatcher. 24 hours a day, 7 days a week, 365 days a year.</p>
          <h3>Office Location</h3>
          <address style="font-style:normal;line-height:2;">
            Disaster Response by Ryan<br>
            3707 Northridge Dr NW STE 10, Walker, MI 49544, USA<br>
            Walker, MI 49544<br>
            <a href="tel:6168221978">(616) 822-1978</a><br>
            <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a>
          </address>
        </div>
        <div>
          <h2>Request Service Online</h2>
          <form id="contact-form" style="display:flex;flex-direction:column;gap:1rem;">
            <input type="text" id="cf-name" placeholder="Your Name" required style="padding:.75rem;border:1px solid #ddd;border-radius:.5rem;">
            <input type="tel" id="cf-phone" placeholder="Your Phone Number" required style="padding:.75rem;border:1px solid #ddd;border-radius:.5rem;">
            <input type="text" id="cf-city" placeholder="Your City / Address" style="padding:.75rem;border:1px solid #ddd;border-radius:.5rem;">
            <textarea id="cf-msg" placeholder="Describe the damage situation..." rows="4" style="padding:.75rem;border:1px solid #ddd;border-radius:.5rem;resize:vertical;"></textarea>
            <button type="submit" class="btn btn-primary btn-large"><i class="fa-solid fa-paper-plane"></i> Send Request</button>
          </form>
          <p style="margin-top:1rem;font-size:.85rem;color:var(--text-muted);">For fastest response, call (616) 822-1978 directly. Ryan answers personally.</p>
        </div>
      </div>
      <div style="margin-top:3rem;border-radius:.75rem;overflow:hidden;height:350px;">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11697.892913506488!2d-85.7460145!3d43.0016021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8819af8b7b75e01b%3A0xc6eb9ac3546a1073!2s3707%20Northridge%20Dr%20NW%20Ste%2010%2C%20Walker%2C%20MI%2049544!5e0!3m2!1sen!2sus!4v1714150821234!5m2!1sen!2sus" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>
  </div>
</main>
${footer('../')}
</body></html>`);
}

//  PRIVACY POLICY 
write('/privacy-policy/', `${head('Privacy Policy | Disaster Response by Ryan','Privacy policy for disaster911.net  Disaster Response by Ryan, Walker, MI.',`${BASE}/privacy-policy/`,'../','')}
<body>${header('../','')}<main class="page-content section-padding bg-light"><div class="container" style="max-width:800px;"><div class="content-card"><h1>Privacy Policy</h1><p>Last updated: February 2026</p><p>Disaster Response by Ryan ("we", "our", "us") operates disaster911.net. We collect only the minimum information necessary to provide restoration services  your name, phone number, address, and damage description when you contact us. We do not sell your information. We do not use third-party advertising trackers. For questions: <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a> or (616) 822-1978.</p></div></div></main>${footer('../')}</body></html>`);

//  TERMS OF SERVICE 
write('/terms/', `${head('Terms of Service | Disaster Response by Ryan','Terms of service for disaster911.net.',`${BASE}/terms/`,'../','')}
<body>${header('../','')}<main class="page-content section-padding bg-light"><div class="container" style="max-width:800px;"><div class="content-card"><h1>Terms of Service</h1><p>Last updated: February 2026</p><p>By using disaster911.net, you agree to our service terms. All restoration work is performed under contract per Michigan law. Payment terms are established at project initiation. Insurance billing is handled per carrier agreements. Questions: (616) 822-1978 or <a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a></p></div></div></main>${footer('../')}</body></html>`);

console.log(`\n Site compiled successfully!`);
console.log(`   ${services.length} services  ${cities.length} cities = ${services.length*cities.length} city pages`);
console.log(`   + Hub pages, About, Insurance, Service Areas, Contact, Blog, Privacy, Terms`);
console.log(`   Total approximate pages: ${services.length*cities.length + 20}+`);
