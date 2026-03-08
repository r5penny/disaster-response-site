const fs = require('fs');
let c = fs.readFileSync('rebuild-city-pages.js', 'utf8');

// The file got messed up. Let's find exactly the spots where `return \`` SHOULD be and ensure it's there ONLY ONCE.
// The 4 functions: waterBody, fireBody, moldBody, sewageBody

function fixMethod(methodStartRegex) {
    let match = c.match(methodStartRegex);
    if (!match) return;
}

// Easier: just remove ALL `return \`` followed by `return \``
while (c.includes('return `\n  return `')) {
    c = c.replace('return `\n  return `', 'return `');
}

fs.writeFileSync('rebuild-city-pages.js', c);
console.log('Fixed double return backticks');
