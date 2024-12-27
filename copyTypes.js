const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Paths to your custom and generated files
const customDTS = path.join(srcDir, 'classical.d.ts'); // Your custom `classical.d.ts`
const outputDTS = path.join(distDir, 'classical.d.ts'); // Generated `classical.d.ts`

// Check if the custom file exists
if (!fs.existsSync(customDTS)) {
    console.error(`Custom definition file not found: ${customDTS}`);
    process.exit(1);
}

// Ensure the output directory exists
if (!fs.existsSync(distDir)) {
    console.error(`Output directory not found: ${distDir}`);
    process.exit(1);
}

// Overwrite the generated `classical.d.ts` with the custom version
fs.copyFileSync(customDTS, outputDTS);

console.log(`Overwritten: ${outputDTS} with ${customDTS}`);
