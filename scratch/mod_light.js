const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function replaceColors(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Text colors
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-slate-200/g, 'text-slate-800');
    content = content.replace(/text-slate-300/g, 'text-slate-700');
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-slate-500/g, 'text-slate-400');
    
    // Background colors
    content = content.replace(/bg-slate-900/g, 'bg-slate-50');
    content = content.replace(/bg-slate-800/g, 'bg-slate-100');
    content = content.replace(/bg-slate-700/g, 'bg-slate-200');
    
    // Border colors
    content = content.replace(/border-slate-700/g, 'border-slate-300');
    content = content.replace(/border-slate-600/g, 'border-slate-300');
    
    // App.jsx specific hardcoded dark hex
    content = content.replace(/bg-\[#141414\]/g, 'bg-white');
    content = content.replace(/bg-\[#0A0A0A\]/g, 'bg-slate-50');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated colors in ' + path.basename(filePath));
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      replaceColors(fullPath);
    }
  }
}

// 1. Process all components and pages
processDir(srcDir);

// 2. Update Tailwind config
const tailwindPath = path.join(__dirname, '..', 'frontend', 'tailwind.config.js');
if (fs.existsSync(tailwindPath)) {
  let twConfig = fs.readFileSync(tailwindPath, 'utf8');
  twConfig = twConfig.replace(/dark: '#0A0A0A'/, "dark: '#F8FAFC'");
  twConfig = twConfig.replace(/gray: '#141414'/, "gray: '#FFFFFF'");
  twConfig = twConfig.replace(/border: '#2A2A2A'/, "border: '#E2E8F0'");
  // textMain is not used much but change it anyway
  twConfig = twConfig.replace(/textMain: '#4D4D4D'/, "textMain: '#1E293B'");
  fs.writeFileSync(tailwindPath, twConfig, 'utf8');
  console.log('Updated tailwind.config.js');
}

// 3. Update index.css variables
const indexCssPath = path.join(srcDir, 'index.css');
if (fs.existsSync(indexCssPath)) {
  let cssConfig = fs.readFileSync(indexCssPath, 'utf8');
  cssConfig = cssConfig.replace(/--background: #0A0A0A;/g, "--background: #F8FAFC;");
  cssConfig = cssConfig.replace(/--foreground: #F4F6F8;/g, "--foreground: #0F172A;");
  cssConfig = cssConfig.replace(/background-color: #0A0A0A;/g, "background-color: #F8FAFC;");
  cssConfig = cssConfig.replace(/color: #F4F6F8;/g, "color: #0F172A;");
  fs.writeFileSync(indexCssPath, cssConfig, 'utf8');
  console.log('Updated index.css');
}

console.log('Theme changed to light mode!');
