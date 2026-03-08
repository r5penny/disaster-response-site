const fs = require('fs');
const path = require('path');

const CITIES_PATH = path.join(__dirname, 'cities.json');
const OUTPUT_CSV_PATH = path.join(__dirname, 'wordpress-migration', 'city-pages-import.csv');

// Load city data
let cities = [];
try {
    cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
} catch (e) {
    console.error('Error reading cities.json:', e);
    process.exit(1);
}

// Service configurations (URL slug, label)
const services = [
    { slug: 'water-damage-restoration', label: 'Water Damage Restoration' },
    { slug: 'fire-damage-restoration', label: 'Fire Damage Restoration' },
    { slug: 'mold-remediation', label: 'Mold Remediation' },
    { slug: 'sewage-cleanup', label: 'Sewage Cleanup' }
];

// Helper to escape CSV fields
function escapeCSV(field) {
    if (field == null) return '';
    const stringField = String(field).replace(/"/g, '""'); // Escape double quotes
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
        return `"${stringField}"`;
    }
    return stringField;
}

// Header row for WP All Import / Ultimate CSV Importer
const header = [
    'post_title',
    'post_name',
    'post_type',
    'post_status',
    'meta_title',
    'meta_description',
    'acf_city_name',
    'acf_service_label',
    'acf_distance_minutes',
    'acf_local_hook',
    'acf_local_risk'
].join(',');

const rows = [];

cities.forEach(city => {
    services.forEach(service => {
        // Construct unique SEO data
        const title = `${service.label} in ${city.name}, MI — Ryan Answers Personally`;
        // Slug pattern: /water-damage-restoration/grand-rapids-mi/
        // Note: WP import slug usually defines the last part. We need rewrite rules for the full structure.
        // For import, we'll give it a unique slug to avoid collision.
        const slug = `${service.slug}-${city.id}`; 
        
        // Dynamic Meta Description
        const hookSnippet = city.hook ? city.hook.substring(0, 100) : '';
        const metaDesc = `Emergency ${service.label.toLowerCase()} in ${city.name}, MI. ${city.min} minutes away. ${hookSnippet}... Call (616) 822-1978 — Ryan answers 24/7.`;

        // Add row
        rows.push([
            escapeCSV(title),
            escapeCSV(slug),
            escapeCSV('city_page'), // Custom Post Type
            escapeCSV('publish'),
            escapeCSV(title),
            escapeCSV(metaDesc),
            escapeCSV(city.name),
            escapeCSV(service.label),
            escapeCSV(city.min),
            escapeCSV(city.hook),
            escapeCSV(city.risk)
        ].join(','));
    });
});

// Write CSV file
const csvContent = [header, ...rows].join('\n');

// Ensure directory exists
if (!fs.existsSync(path.dirname(OUTPUT_CSV_PATH))) {
    fs.mkdirSync(path.dirname(OUTPUT_CSV_PATH));
}

fs.writeFileSync(OUTPUT_CSV_PATH, csvContent, 'utf8');

console.log(`✅ Generated ${rows.length} city pages in ${OUTPUT_CSV_PATH}`);
