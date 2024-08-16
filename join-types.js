const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

const globalDts = path.join(srcDir, 'global.d.ts');
const indexDts = path.join(distDir, 'index.d.ts');

// Read the contents of both files
const globalDtsContent = fs.readFileSync(globalDts, 'utf8');
const indexDtsContent = fs.readFileSync(indexDts, 'utf8');

// Combine the contents, ensuring there's a newline between them
const combinedContent = `${globalDtsContent}\n\n${indexDtsContent}`;

// Write the combined content back to index.d.ts
fs.writeFileSync(indexDts, combinedContent, 'utf8');

console.log(`Combined global.d.ts and original index.d.ts into ${indexDts}`);
