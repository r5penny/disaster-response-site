const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let changed = 0;

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full, files);
        else if (entry.endsWith('.html')) files.push(full);
    }
    return files;
}

// Match any single-line or multiline mobile-floating-cta <a> tag and replace with two-button div
// Handles both single-line and multiline variants
const PATTERN = /<a href="tel:6168221978" class="mobile-floating-cta">[^<]*(?:<i[^>]*><\/i>)[^<]*<\/a>/g;
const REPLACEMENT = `<div class="mobile-floating-cta"><a href="tel:6168221978" class="mfc-call"><i class="fa-solid fa-phone"></i> Call</a><a href="sms:6168221978" class="mfc-text"><i class="fa-solid fa-comment-sms"></i> Text</a></div>`;

for (const file of walk(ROOT)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('class="mobile-floating-cta"')) continue;
    // Skip files that already have the new div version
    if (content.includes('class="mfc-call"')) continue;

    const updated = content.replace(PATTERN, REPLACEMENT);
    if (updated !== content) {
        fs.writeFileSync(file, updated, 'utf8');
        changed++;
        console.log('Fixed:', path.relative(ROOT, file));
    }
}

console.log(`\nFixed ${changed} files.`);
