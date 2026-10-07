const fs = require('fs');
const css = fs.readFileSync('ph.css', 'utf8');

console.log("=== PRODUCT HUNT CSS ANALYSIS ===");

// Font families
const fontMatches = css.match(/font-family:([^;}]+)/g);
if (fontMatches) {
    console.log("\nFONTS:");
    [...new Set(fontMatches)].slice(0, 10).forEach(f => console.log(f.trim()));
}

// Font sizes
const fontSizeMatches = css.match(/font-size:([^;}]+)/g);
if (fontSizeMatches) {
    console.log("\nFONT SIZES:");
    [...new Set(fontSizeMatches)].slice(0, 10).forEach(f => console.log(f.trim()));
}

// Spacings/Padding
const paddingMatches = css.match(/padding:([^;}]+)/g);
if (paddingMatches) {
    console.log("\nPADDINGS:");
    [...new Set(paddingMatches)].slice(0, 15).forEach(f => console.log(f.trim()));
}

// Border Radius
const radiusMatches = css.match(/border-radius:([^;}]+)/g);
if (radiusMatches) {
    console.log("\nBORDER RADIUS:");
    [...new Set(radiusMatches)].slice(0, 15).forEach(f => console.log(f.trim()));
}

// Look for CSS variables
const rootVars = css.match(/--[\w-]+:[^;}]+/g);
if (rootVars) {
    console.log("\nCSS VARIABLES (First 20):");
    [...new Set(rootVars)].slice(0, 20).forEach(v => console.log(v.trim()));
}
