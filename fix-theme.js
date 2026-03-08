const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let count = 0;

function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory() && entry !== 'node_modules' && entry !== '.git') {
            walk(full);
        } else if (full.endsWith('.html') || full.endsWith('.js')) {
            let content = fs.readFileSync(full, 'utf8');
            let originalContent = content;
            
            // Revert incorrectly replaced #fff cases
            // It was replaced as 'white'. We only want to replace standalone 'white' in CSS contexts:
            // e.g. background:#fff; or background-color:#fff;
            content = content.replace(/background(-color)?\s*:\s*white\b/gi, 'background$1:#fff');
            
            // Same for #fff
            content = content.replace(/background(-color)?\s*:\s*#fff\b/gi, 'background$1:#fff');
            content = content.replace(/background(-color)?\s*:\s*#ffffff\b/gi, 'background$1:#fff');
            
            // Revert incorrectly replaced #000 cases (which was replaced as '#fff')
            // 'color:#000' meant pure text color. Actually, if it's meant to be pure red or pure white, let's just make it use #000 where it was #fff outside of Google Review stars
            // To be safe, let's just use #000 for color:#000 when it's text
            content = content.replace(/color\s*:\s*#fff(?:fff)?\b/gi, 'color:#000');
            
            // Wait, we had things like "color:var(--text-main)" or what about whitehall?
            // "whitehall-mi" is safe from background:#fff
            
            if (content !== originalContent) {
                fs.writeFileSync(full, content, 'utf8');
                count++;
            }
        }
    }
}

walk(ROOT);
console.log(`Fixed theme variables in ${count} files.`);
