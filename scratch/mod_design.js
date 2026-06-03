const fs = require('fs');
const path = require('path');

const tailwindPath = path.join(__dirname, '..', 'frontend', 'tailwind.config.js');
let twConfig = fs.readFileSync(tailwindPath, 'utf8');

twConfig = twConfig.replace(/dark: '#1F1F1F',/, "dark: '#0A0A0A',");
twConfig = twConfig.replace(/gray: '#2C2C2C',/, "gray: '#141414',");
twConfig = twConfig.replace(/border: '#3A3A3A'/, "border: '#2A2A2A'");

fs.writeFileSync(tailwindPath, twConfig, 'utf8');

const indexCssPath = path.join(__dirname, '..', 'frontend', 'src', 'index.css');
let cssConfig = fs.readFileSync(indexCssPath, 'utf8');
cssConfig = cssConfig.replace(/--background: #1F1F1F;/g, "--background: #0A0A0A;");
cssConfig = cssConfig.replace(/background-color: #1F1F1F;/g, "background-color: #0A0A0A;");
fs.writeFileSync(indexCssPath, cssConfig, 'utf8');

console.log('Colors updated');
