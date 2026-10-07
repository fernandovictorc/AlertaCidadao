const fs = require('fs');
const css = fs.readFileSync('ph.css', 'utf8');

const vars = css.match(/--[\w-]+:[^;}]+/g);
if (vars) {
    console.log("CSS VARIABLES:");
    [...new Set(vars)].slice(0, 30).forEach(v => console.log(v.trim()));
}
