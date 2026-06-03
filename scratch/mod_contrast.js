const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function fixContrast(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert the broken light grays to darker slate
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    
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
      fixContrast(fullPath);
    }
  }
}

processDir(srcDir);
console.log('Contrast fixed!');
