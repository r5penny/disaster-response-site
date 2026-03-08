const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INVENTORY_PATH = path.join(ROOT, 'images', 'photo-inventory.json');

function deploy() {
    console.log('🚀 Starting Smart Photo Deployment...');
    
    if (!fs.existsSync(INVENTORY_PATH)) {
        console.error('❌ Photo inventory not found.');
        return;
    }

    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
    
    // Group inventory by city
    const photosByCity = {};
    inventory.forEach(item => {
        if (!photosByCity[item.city]) photosByCity[item.city] = [];
        photosByCity[item.city].push(item);
    });

    const services = ['water-damage-restoration', 'fire-damage-restoration', 'mold-remediation', 'sewage-cleanup'];
    let updatedCount = 0;

    services.forEach(svc => {
        const svcDir = path.join(ROOT, svc);
        if (!fs.existsSync(svcDir)) return;

        const cityDirs = fs.readdirSync(svcDir);
        cityDirs.forEach(citySlug => {
            const indexFile = path.join(svcDir, citySlug, 'index.html');
            if (!fs.existsSync(indexFile)) return;

            // Map slug back to City Name (e.g. grand-rapids-mi -> Grand Rapids)
            const cityName = citySlug.split('-').slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // Priority 1: Use specific city photos if available
            // Priority 2: Use general Grand Rapids photos as representative West MI proof
            let cityPhotos = photosByCity[cityName] || photosByCity['Grand Rapids'];
            
            if (cityPhotos && cityPhotos.length > 0) {
                // Select up to 4 photos
                const selected = cityPhotos.slice(0, 4);
                updatePage(indexFile, selected, cityName);
                updatedCount++;
            }
        });
    });

    console.log(`
✅ Successfully deployed optimized photos to ${updatedCount} pages.`);
}

function updatePage(filePath, photos, cityName) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. HTML Injection
    const galleryHTML = `
<!-- SMART JOB GALLERY START -->
<div style="margin:2.5rem 0;">
  <p style="font-size:.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:1rem;">Real-World Proof: ${cityName} Job Site Photos</p>
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
    ${photos.map(p => `
    <div style="border-radius:8px; overflow:hidden; aspect-ratio:4/3; background:#f1f5f9; border:1px solid #e2e8f0;">
      <img src="/images/processed/${p.filename}" alt="${p.alt}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
    </div>`).join('')}
  </div>
</div>
<!-- SMART JOB GALLERY END -->
`;

    // Inject before the first H2 or Process section
    const searchTarget = content.includes('<h2>Our') ? /<h2>Our/ : /<h2>/;
    if (!content.includes('SMART JOB GALLERY START')) {
        content = content.replace(searchTarget, match => galleryHTML + match);
    }

    // 2. Schema Injection (Append to existing JSON-LD)
    const schemaEnd = /\]\s*<\/script>/;
    if (schemaEnd.test(content) && !content.includes('ImageObject')) {
        const schemaItems = photos.map(p => JSON.stringify(p.schema)).join(',');
        content = content.replace(schemaEnd, ',' + schemaItems + ']</script>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

deploy();
