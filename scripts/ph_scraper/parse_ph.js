const fs = require('fs');
const html = fs.readFileSync('ph_archive.html', 'utf8');

// Find font-family
const fontMatches = html.match(/font-family:[^;}]+/g);
if (fontMatches) {
    console.log("FONTS:");
    const uniqueFonts = [...new Set(fontMatches)];
    uniqueFonts.slice(0, 5).forEach(f => console.log(f));
}

// Find CSS variables or padding/margin classes
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
if (styleMatches) {
    console.log("\nFOUND STYLES:", styleMatches.length);
    let allCss = styleMatches.map(s => s).join('\n');
    
    // Look for padding variables like --space
    const spaces = allCss.match(/--[\w-]+space[^:]*:[^;]+;/gi);
    if (spaces) {
        console.log("SPACING VARS:");
        [...new Set(spaces)].forEach(s => console.log(s));
    }
    
    // Look for border-radius
    const radius = allCss.match(/border-radius:[^;]+;/gi);
    if (radius) {
         console.log("\nBORDER RADIUS:");
         [...new Set(radius)].slice(0, 10).forEach(r => console.log(r));
    }

    // Look for font-size
    const fontSizes = allCss.match(/font-size:[^;]+;/gi);
    if (fontSizes) {
         console.log("\nFONT SIZES:");
         [...new Set(fontSizes)].slice(0, 10).forEach(r => console.log(r));
    }
} else {
    console.log("No <style> tags found, CSS might be linked.");
    const linkMatches = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi);
    console.log(linkMatches);
}
