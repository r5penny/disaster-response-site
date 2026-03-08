const fs = require('fs');
const path = require('path');

const PROCESSED_DIR = path.join(__dirname, 'images', 'processed');
const INVENTORY_PATH = path.join(__dirname, 'images', 'photo-inventory.json');

const inventory = [];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file === 'rockford') {
                scanFolder(filePath, 'Rockford', 'Water Damage Restoration', 'Job Site Proof', 'rockford/');
            }
            return;
        }
        processFile(file, '', 'Grand Rapids', 'Water Damage Restoration', 'Commercial Restoration');
    });
}

function scanFolder(dir, city, service, feature, prefix) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        processFile(file, prefix, city, service, feature);
    });
}

function processFile(file, prefix, city, service, feature) {
    if (/\.(jpg|jpeg|png|heic)$/i.test(file)) {
        let itemCity = city;
        let itemSvc = service;
        let itemFeat = feature;

        const lowFile = file.toLowerCase();
        
        if (lowFile.includes('cascade')) itemCity = 'Cascade';
        if (lowFile.includes('rockford')) itemCity = 'Rockford';
        if (lowFile.includes('grand-rapids')) itemCity = 'Grand Rapids';
        
        if (lowFile.includes('water-damage')) itemSvc = 'Water Damage Restoration';
        
        if (lowFile.includes('commercial')) itemFeat = 'Commercial Restoration';
        if (lowFile.includes('moisture-meter')) itemFeat = 'Moisture Detection';
        if (lowFile.includes('mitigation-demo')) itemFeat = 'Mitigation & Demolition';
        if (lowFile.includes('protimiter')) itemFeat = 'Protimeter & FLIR Assessment';

        const altText = `${itemFeat} during ${itemSvc.toLowerCase()} in ${itemCity}, MI`;
        const relativePath = prefix + file;

        inventory.push({
            filename: relativePath,
            service: itemSvc,
            city: itemCity,
            feature: itemFeat,
            alt: altText,
            processedAt: new Date().toISOString(),
            schema: {
                "@type": "ImageObject",
                "contentUrl": `https://disaster911.net/images/processed/${relativePath}`,
                "name": `${itemFeat} in ${itemCity}, MI`,
                "description": altText,
                "contentLocation": { "@type": "Place", "name": `${itemCity}, MI` }
            }
        });
    }
}

scanDir(PROCESSED_DIR);

fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf8');
console.log(`✅ Rebuilt inventory with ${inventory.length} items.`);
