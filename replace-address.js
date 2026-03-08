const fs = require('fs');
const path = require('path');

const root = process.cwd();
const oldAddress = '3707 Northridge Dr NW STE 10, Walker, MI 49544, USA';
const newAddress = '3707 Northridge Dr NW STE 10, Walker, MI 49544, USA';
const oldPlaceId = 'ChIJ9f8TU0GyGYgRKUghuAZi1Mo';
const newPlaceId = 'ChIJ9f8TU0GyGYgRKUghuAZi1Mo';

const textExtensions = new Set(['.html', '.htm', '.js', '.json', '.md', '.txt', '.css']);

const changedFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!textExtensions.has(ext)) continue;
      let content = fs.readFileSync(full, 'utf8');
      let updated = content;
      if (updated.includes(oldAddress)) {
        updated = updated.split(oldAddress).join(newAddress);
      }
      if (updated.includes(oldPlaceId)) {
        updated = updated.split(oldPlaceId).join(newPlaceId);
      }
      if (updated !== content) {
        fs.writeFileSync(full, updated, 'utf8');
        changedFiles.push(full);
      }
    }
  }
}

walk(root);

if (changedFiles.length === 0) {
  console.log('No files were changed.');
} else {
  console.log('Changed files:');
  for (const f of changedFiles) console.log(f);
  console.log('\nTotal changed:', changedFiles.length);
}
