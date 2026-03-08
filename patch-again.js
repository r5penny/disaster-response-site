const fs = require('fs');
let c = fs.readFileSync('rebuild-city-pages.js', 'utf8');

// Ensure CITIES_DATA is loaded
if (!c.includes('const CITIES_DATA')) {
    c = c.replace(
        "const path = require('path');",
        "const path = require('path');\nconst CITIES_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json'), 'utf8'));"
    );
}

const geoBlock = `
  const extra = CITIES_DATA.find(x => x.id === c.slug) || { hook: 'Local topography significantly impacts property moisture. Contact Disaster Response for hyper-local assessment.', risk: 'Pipe bursts, drainage issues, appliance failures.' };
  const geoHTML = \`
<div class="neo-card" style="margin:3.5rem 0; padding:3rem; background:#fff; border-left:5px solid var(--accent); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:12px;">
  <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
    <div style="background:var(--bg-light); padding:1rem; border-radius:50%; color:var(--accent);">
      <i class="fa-solid fa-map-location-dot fa-2x"></i>
    </div>
    <h2 style="color:#000; margin:0; font-size:1.8rem;">Local Geography & Property Risks in \${name}, MI</h2>
  </div>
  <p class="lead" style="font-size:1.15rem; line-height:1.7; color:var(--text-main);">\${extra.hook}</p>
  
  <div style="margin-top:2rem; background:var(--bg-light); border:1px solid var(--border); padding:2rem; border-radius:8px;">
    <h3 style="margin-top:0; margin-bottom:1rem; font-size:1.3rem; color:#000; border-bottom:2px solid var(--border); padding-bottom:0.5rem;">Specific \${county} County Constraints</h3>
    <p style="font-weight:600; font-size:1.1rem; color:#334155; margin:0; line-height:1.6;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent); margin-right:0.5rem;"></i> \${extra.risk}</p>
  </div>
  
  <p style="margin-top:2rem; font-size:1.05rem; color:#475569; line-height:1.8; padding-top:1.5rem; border-top:1px solid var(--border);">Our Walker, MI headquarters is approximately \${minutes} minutes from \${name}. This precise proximity is critical. It allows our IICRC-certified emergency team to navigate \${county} County direct routes to reach your property before the 24-hour microbial threshold is crossed. Because we understand the exact environmental pressures of \${name} — whether dealing with clay soil hydrostatic pressure, local watershed flooding, or architectural age factors — our mitigation strategy prevents unnecessary demolition and drastically reduces your restoration costs. We do not use the same boilerplate drying approach for a Heritage Hill historic home that we would for a 1990s build in \${name}; our science is customized to your geography.</p>
</div>\`;

  return \`
\${geoHTML}
`;

// Replace waterBody
c = c.replace(
    /  return `\n<h2>\$\{v === 0 \? 'Emergency Water Damage Response for'/g,
    geoBlock + "<h2>${v === 0 ? 'Emergency Water Damage Response for'"
);

// Replace fireBody
c = c.replace(
    /  return `\n<h2>\$\{\['Fire & Smoke Damage Response for'/g,
    geoBlock + "<h2>${['Fire & Smoke Damage Response for'"
);

// Replace moldBody
c = c.replace(
    /  return `\n<h2>\$\{\['Professional Mold Remediation in'/g,
    geoBlock + "<h2>${['Professional Mold Remediation in'"
);

// Replace sewageBody
c = c.replace(
    /  return `\n<h2>\$\{\['24\/7 Sewage Backup Response for'/g,
    geoBlock + "<h2>${['24/7 Sewage Backup Response for'"
);

fs.writeFileSync('rebuild-city-pages.js', c);
console.log('Successfully patched geo blocks into all 4 services.');
