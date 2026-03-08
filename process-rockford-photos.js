const fs = require('fs');
const path = require('path');

const SOURCE_DIR = "C:\\Users\\Ryan\\Desktop\\Rockford Water Damage";
const TARGET_DIR = path.join(__dirname, 'images', 'processed', 'rockford');

if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

async function processRockford() {
    console.log(`🔍 Scanning ${SOURCE_DIR}...`);
    
    const allFiles = fs.readdirSync(SOURCE_DIR).filter(f => /\.(heic|jpg|jpeg|png)$/i.test(f));
    
    if (allFiles.length === 0) {
        console.log("❌ No photos found.");
        return;
    }

    const step = Math.max(1, Math.floor(allFiles.length / 6));
    const selected = [];
    for (let i = 0; i < allFiles.length && selected.length < 6; i += step) {
        selected.push(allFiles[i]);
    }

    console.log(`📸 Selected ${selected.length} photos.`);

    let assetsHTML = '\n<!-- ROCKFORD JOB PHOTOS START -->\n<div class="job-gallery" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">';
    let schemaItems = [];

    selected.forEach((file, index) => {
        const ext = path.extname(file).toLowerCase();
        const newName = `water-damage-restoration-rockford-mi-job-${index + 1}${ext}`;
        const altText = `Real job site photo: Water damage restoration in Rockford, MI - Part ${index + 1}`;
        
        fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(TARGET_DIR, newName));

        assetsHTML += `\n    <div class="gallery-item">\n        <img src="/images/processed/rockford/${newName}" alt="${altText}" loading="lazy" style="width:100%; border-radius:8px; aspect-ratio:4/3; object-fit:cover;">\n    </div>`;

        schemaItems.push({
            "@type": "ImageObject",
            "contentUrl": `https://disaster911.net/images/processed/rockford/${newName}`,
            "name": `Rockford Water Damage Job Site Photo ${index + 1}`,
            "description": `Real-world proof of water damage restoration performed in Rockford, MI.`,
            "contentLocation": { "@type": "Place", "name": "Rockford, MI" }
        });
    });

    assetsHTML += '\n</div>\n<!-- ROCKFORD JOB PHOTOS END -->\n';

    const rockfordPath = path.join(__dirname, 'water-damage-restoration', 'rockford-mi', 'index.html');
    if (fs.existsSync(rockfordPath)) {
        let content = fs.readFileSync(rockfordPath, 'utf8');
        
        // Exact match from the file read
        const searchStr = '<h2>Emergency Water Damage Response for Rockford, MI</h2>';
        
        if (content.includes(searchStr)) {
            if (!content.includes('ROCKFORD JOB PHOTOS START')) {
                // Insert AFTER the heading
                content = content.replace(searchStr, searchStr + '\n' + assetsHTML);
                
                // Inject into Schema
                const schemaEnd = /\]\s*<\/script>/;
                if (schemaEnd.test(content)) {
                    const schemaStr = schemaItems.map(item => JSON.stringify(item)).join(',');
                    content = content.replace(schemaEnd, ',' + schemaStr + ']</script>');
                }

                fs.writeFileSync(rockfordPath, content, 'utf8');
                console.log(`✅ Injected photos and schema into ${rockfordPath}`);
            } else {
                console.log(`ℹ️ Photos already present in ${rockfordPath}`);
            }
        } else {
            console.log("❌ Could not find exact injection string.");
        }
    }

    console.log(`🚀 Done! ${selected.length} photos staged in images/processed/rockford/`);
}

processRockford();
