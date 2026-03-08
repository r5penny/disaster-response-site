const fs = require('fs');
let c = fs.readFileSync('rebuild-city-pages.js', 'utf8');

c = c.replace(/<h2>\$\{v === 0 \? 'Emergency Water Damage Response for'/g, '  return `\n<h2>${v === 0 ? \'Emergency Water Damage Response for\'');
c = c.replace(/<h2>\$\{\['Fire \& Smoke Damage Response for'/g, '  return `\n<h2>${[\'Fire & Smoke Damage Response for\'');
c = c.replace(/<h2>\$\{\['Professional Mold Remediation in'/g, '  return `\n<h2>${[\'Professional Mold Remediation in\'');
c = c.replace(/<h2>\$\{\['Emergency Sewage Cleanup for'/g, '  return `\n<h2>${[\'Emergency Sewage Cleanup for\'');

fs.writeFileSync('rebuild-city-pages.js', c);
console.log('Fixed syntax errors');
