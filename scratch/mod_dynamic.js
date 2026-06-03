const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function refactorClasses(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Backgrounds
    content = content.replace(/bg-slate-50/g, 'bg-aldebaran-dark');
    content = content.replace(/bg-slate-100/g, 'bg-aldebaran-gray');
    content = content.replace(/bg-slate-200/g, 'bg-aldebaran-gray');
    content = content.replace(/bg-white/g, 'bg-aldebaran-dark');
    
    // Texts
    content = content.replace(/text-slate-900/g, 'text-theme-strong');
    content = content.replace(/text-slate-800/g, 'text-theme-normal');
    content = content.replace(/text-slate-700/g, 'text-theme-normal');
    content = content.replace(/text-slate-500/g, 'text-theme-weak');
    content = content.replace(/text-slate-400/g, 'text-theme-weak');
    
    // Borders
    content = content.replace(/border-slate-300/g, 'border-aldebaran-border');
    
    // Specifics
    content = content.replace(/bg-\[#D25A17\]/g, 'bg-aldebaran-orange');

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      refactorClasses(fullPath);
    }
  }
}

processDir(srcDir);

// Update index.css
const indexCssPath = path.join(srcDir, 'index.css');
let cssConfig = fs.readFileSync(indexCssPath, 'utf8');
cssConfig = cssConfig.replace(/color: #0F172A;/g, "");
fs.writeFileSync(indexCssPath, cssConfig, 'utf8');

// Update tailwind.config.js
const tailwindPath = path.join(__dirname, '..', 'frontend', 'tailwind.config.js');
let twConfig = fs.readFileSync(tailwindPath, 'utf8');
const regex = /colors:\s*{\s*aldebaran:\s*{[^}]*}\s*}/;
const newColors = `colors: {
        aldebaran: {
          dark: 'var(--bg-base)',
          gray: 'var(--bg-surface)',
          border: 'var(--border-subtle)',
          gold: 'var(--accent-gold)',
          goldDark: 'var(--accent-orange)',
          orange: 'var(--accent-orange)'
        },
        theme: {
          strong: 'var(--text-strong)',
          normal: 'var(--text-normal)',
          weak: 'var(--text-weak)',
        }
      }`;
twConfig = twConfig.replace(regex, newColors);
twConfig = twConfig.replace(/extend:\s*{/, "extend: {\n      darkMode: 'class',");
fs.writeFileSync(tailwindPath, twConfig, 'utf8');

console.log('Dynamic theme ready!');
