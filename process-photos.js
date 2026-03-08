const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INCOMING_DIR = path.join(__dirname, 'images', 'incoming');
const PROCESSED_DIR = path.join(__dirname, 'images', 'processed');
const INVENTORY_PATH = path.join(__dirname, 'images', 'photo-inventory.json');

const serviceMap = { '1': 'Water Damage Restoration', '2': 'Fire Damage Restoration', '3': 'Mold Remediation', '4': 'Sewage Cleanup' };
const slugMap = { '1': 'water-damage-restoration', '2': 'fire-damage-restoration', '3': 'mold-remediation', '4': 'sewage-cleanup' };

async function processPhotos() {
    if (!fs.existsSync(INCOMING_DIR)) fs.mkdirSync(INCOMING_DIR, { recursive: true });
    if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

    const files = fs.readdirSync(INCOMING_DIR).filter(f => /\.(jpg|jpeg|png|heic)$/i.test(f));

    if (files.length === 0) {
        console.log('❌ No new photos found in images/incoming/');
        process.exit(0);
    }

    console.log(`📸 Found ${files.length} photos to process.`);

    let serviceId, city, feature;

    if (process.argv.length >= 5) {
        serviceId = process.argv[2];
        city = process.argv[3];
        feature = process.argv[4];
    } else {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q) => new Promise(res => rl.question(q, res));
        serviceId = await ask('Select Service (1: Water, 2: Fire, 3: Mold, 4: Sewage): ');
        city = await ask('Enter City Name (e.g. Grand Rapids): ');
        feature = await ask('Describe the main feature (e.g. Moisture Meter): ');
        rl.close();
    }

    const svcSlug = slugMap[serviceId] || 'restoration';
    const svcLabel = serviceMap[serviceId] || 'Restoration';
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const featSlug = feature.toLowerCase().replace(/\s+/g, '-');

    // Load existing inventory
    let inventory = [];
    if (fs.existsSync(INVENTORY_PATH)) {
        try {
            inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
        } catch(e) { inventory = []; }
    }

    files.forEach((file, index) => {
        const ext = path.extname(file);
        const timestamp = Date.now();
        const newName = `${svcSlug}-${featSlug}-${citySlug}-mi-${timestamp}-${index + 1}${ext}`;
        
        fs.renameSync(path.join(INCOMING_DIR, file), path.join(PROCESSED_DIR, newName));

        const altText = `${feature} during ${svcLabel.toLowerCase()} in ${city}, MI`;
        
        inventory.push({
            filename: newName,
            service: svcLabel,
            city: city,
            feature: feature,
            alt: altText,
            processedAt: new Date().toISOString(),
            schema: {
                "@type": "ImageObject",
                "contentUrl": `https://disaster911.net/images/processed/${newName}`,
                "name": `${feature} in ${city}, MI`,
                "description": altText,
                "contentLocation": { "@type": "Place", "name": `${city}, MI` }
            }
        });
    });

    fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf8');
    console.log(`✅ Processed ${files.length} photos and updated inventory.`);
    console.log(`🚀 Report data ready at: images/photo-inventory.json`);
}

processPhotos();
