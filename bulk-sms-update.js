const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let totalFiles = 0;
let changedFiles = 0;

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full, files);
        else if (entry.endsWith('.html')) files.push(full);
    }
    return files;
}

// All text replacements — order matters (most specific first)
const replacements = [
    // ---- Floating CTA: convert single <a> to two-button <div> ----
    [
        `<a href="tel:6168221978" class="mobile-floating-cta">\n        <i class="fa-solid fa-phone"></i> Call Now — We Answer 24/7\n    </a>`,
        `<div class="mobile-floating-cta">\n        <a href="tel:6168221978" class="mfc-call"><i class="fa-solid fa-phone"></i> Call</a>\n        <a href="sms:6168221978" class="mfc-text"><i class="fa-solid fa-comment-sms"></i> Text</a>\n    </div>`
    ],
    // ---- Header btn-subtitle ----
    [
        `<span class="btn-subtitle">Our Team Answers 24/7</span>`,
        `<span class="btn-subtitle">Call or Text — 24/7</span>`
    ],
    // ---- Hero call button text ----
    [
        `<i class="fa-solid fa-phone"></i> Call (616) 822-1978 — We Answer 24/7`,
        `<i class="fa-solid fa-phone"></i> Call (616) 822-1978`
    ],
    // ---- Emergency bars / banners ----
    [
        `Our Team Responds 24/7`,
        `24/7 Emergency Response`
    ],
    [
        `Our Team Answers 24/7`,
        `Call or Text 24/7`
    ],
    [
        `We Answer 24/7`,
        `24/7 Response`
    ],
    // ---- About page ----
    [
        `When disaster hits, you reach our team — available 24/7`,
        `When disaster hits, call or text our team — available 24/7`
    ],
    // ---- Contact page ----
    [
        `You'll reach our team — available 24/7, 365 days a year. No call center, no dispatcher.`,
        `Call or text — available 24/7, 365 days a year. No call center, no dispatcher.`
    ],
    // ---- Water damage page — body copy ----
    [
        `When you call (616) 822-1978, Ryan answers and we deploy immediately.`,
        `Call or text (616) 822-1978 and we deploy immediately.`
    ],
    [
        `"Call (616) 822-1978. Ryan answers. We handle everything from first call to final walkthrough."`,
        `"Call or text (616) 822-1978 — we handle everything from first contact to final walkthrough."`
    ],
    // ---- Any remaining generic patterns ----
    [
        `Ryan answers and we deploy`,
        `we deploy`
    ],
    [
        `Ryan answers. We handle`,
        `We handle`
    ],
    // ---- Catch-all for "Our Team Responds" variants ----
    [
        `Our Team Responds Fast`,
        `Our Team Responds Fast`  // keep — this is fine, it's in the H1 and doesn't imply personal answer
    ],
];

const allFiles = walk(ROOT);

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const [from, to] of replacements) {
        if (from === to) continue; // skip no-ops
        content = content.split(from).join(to);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log('Updated:', path.relative(ROOT, file));
    }
    totalFiles++;
}

console.log(`\nDone. ${changedFiles} of ${totalFiles} HTML files updated.`);
