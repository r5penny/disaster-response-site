/**
 * Converts all HEIC fire damage photos to JPG and copies to images folder
 */
const heicConvert = require('heic-convert');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Ryan/Desktop/FIREDAMAGEPHOTOS_extracted';
const dstDir = __dirname + '/images';

const fileMap = [
  ['2025-10-24.heic',      'fire-damage-bedroom-soot-walls-grand-rapids-mi.jpg'],
  ['2025-10-24(1).heic',   'fire-damage-char-ceiling-structural-grand-rapids-mi.jpg'],
  ['2025-10-24(2).heic',   'fire-damage-room-total-loss-grand-rapids-mi.jpg'],
  ['2025-10-24(3).heic',   'fire-damage-smoke-soot-interior-grand-rapids-mi.jpg'],
  ['2025-10-24(4).heic',   'fire-damage-restoration-debris-grand-rapids-mi.jpg'],
  ['2025-10-24(5).heic',   'fire-damage-burned-structure-grand-rapids-mi.jpg'],
  ['2025-10-24(6).heic',   'fire-smoke-damage-hallway-grand-rapids-mi.jpg'],
  ['2025-10-24(7).heic',   'fire-damage-kitchen-soot-grand-rapids-mi.jpg'],
  ['2025-10-24(8).heic',   'fire-damage-contents-debris-grand-rapids-mi.jpg'],
  ['2025-10-24(9).heic',   'fire-damage-wall-char-soot-grand-rapids-mi.jpg'],
  ['2025-10-24(10).heic',  'fire-damage-restoration-job-site-01-grand-rapids-mi.jpg'],
  ['2025-10-24(11).heic',  'fire-damage-restoration-job-site-02-grand-rapids-mi.jpg'],
  ['2025-10-24(12).heic',  'fire-damage-restoration-job-site-03-grand-rapids-mi.jpg'],
  ['2025-10-24(13).heic',  'fire-damage-restoration-job-site-04-grand-rapids-mi.jpg'],
  ['2025-10-24(14).heic',  'fire-damage-restoration-job-site-05-grand-rapids-mi.jpg'],
  ['2025-10-24(15).heic',  'fire-damage-restoration-job-site-06-grand-rapids-mi.jpg'],
  ['2025-10-24(16).heic',  'fire-damage-restoration-job-site-07-grand-rapids-mi.jpg'],
  ['2025-10-24(17).heic',  'fire-damage-restoration-job-site-08-grand-rapids-mi.jpg'],
  ['2025-10-24(18).heic',  'fire-damage-restoration-job-site-09-grand-rapids-mi.jpg'],
  ['2025-10-24(19).heic',  'fire-damage-restoration-job-site-10-grand-rapids-mi.jpg'],
  ['2025-10-24(20).heic',  'fire-damage-restoration-job-site-11-grand-rapids-mi.jpg'],
  ['2025-10-24(21).heic',  'fire-damage-restoration-job-site-12-grand-rapids-mi.jpg'],
  ['2025-10-24(22).heic',  'fire-damage-restoration-job-site-13-grand-rapids-mi.jpg'],
  ['2025-10-24(23).heic',  'fire-damage-restoration-job-site-14-grand-rapids-mi.jpg'],
  ['2025-10-24(24).heic',  'fire-damage-restoration-job-site-15-grand-rapids-mi.jpg'],
  ['2025-10-24(25).heic',  'fire-damage-restoration-job-site-16-grand-rapids-mi.jpg'],
  ['2025-10-24(26).heic',  'fire-damage-restoration-job-site-17-grand-rapids-mi.jpg'],
  ['2025-10-24(27).heic',  'fire-damage-restoration-job-site-18-grand-rapids-mi.jpg'],
  ['2025-10-24(28).heic',  'fire-damage-restoration-job-site-19-grand-rapids-mi.jpg'],
  ['2025-10-24(29).heic',  'fire-damage-restoration-job-site-20-grand-rapids-mi.jpg'],
  ['2025-10-24(30).heic',  'fire-damage-restoration-job-site-21-grand-rapids-mi.jpg'],
  ['2025-10-24(31).heic',  'fire-damage-restoration-job-site-22-grand-rapids-mi.jpg'],
  ['2025-10-24(32).heic',  'fire-damage-restoration-job-site-23-grand-rapids-mi.jpg'],
];

(async () => {
  let converted = 0;
  for (const [src, dst] of fileMap) {
    const srcPath = path.join(srcDir, src);
    const dstPath = path.join(dstDir, dst);
    if (!fs.existsSync(srcPath)) { console.log('Missing:', src); continue; }
    try {
      const input = fs.readFileSync(srcPath);
      const output = await heicConvert({ buffer: input, format: 'JPEG', quality: 0.88 });
      fs.writeFileSync(dstPath, Buffer.from(output));
      converted++;
      process.stdout.write(`\rConverted ${converted}/${fileMap.length}: ${dst}`);
    } catch(e) {
      console.log('\nFailed:', src, e.message);
    }
  }
  console.log(`\n\nDone. ${converted} files converted to images/`);
})();
