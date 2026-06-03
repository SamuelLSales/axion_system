const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

const replacements = [
  { search: /bg-\[\#111827\]/g, replace: 'bg-aldebaran-gray' },
  { search: /bg-\[\#0b0f19\]/g, replace: 'bg-aldebaran-dark' },
  { search: /border-slate-800/g, replace: 'border-aldebaran-border' },
  { search: /text-blue-500/g, replace: 'text-aldebaran-goldDark' },
  { search: /text-blue-400/g, replace: 'text-aldebaran-gold' },
  { search: /bg-blue-600/g, replace: 'bg-aldebaran-gold text-aldebaran-dark font-bold' },
  { search: /bg-blue-500\/10/g, replace: 'bg-aldebaran-gold/10' },
  { search: /bg-blue-500\/20/g, replace: 'bg-aldebaran-gold/20' },
  { search: /bg-blue-600\/20/g, replace: 'bg-aldebaran-gold/20' },
  { search: /border-blue-500\/20/g, replace: 'border-aldebaran-gold/20' },
  { search: /border-blue-500\/30/g, replace: 'border-aldebaran-gold/30' },
  { search: /shadow-blue-600\/10/g, replace: 'shadow-aldebaran-gold/10' },
  { search: /shadow-blue-500\/20/g, replace: 'shadow-aldebaran-gold/20' },
  { search: /hover:bg-blue-700/g, replace: 'hover:bg-aldebaran-goldDark hover:text-aldebaran-dark' },
  { search: /text-blue-600/g, replace: 'text-aldebaran-goldDark' },
  { search: /border-blue-500/g, replace: 'border-aldebaran-gold' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({ search, replace }) => {
        content = content.replace(search, replace);
      });
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walk(srcDir);
console.log('All files updated successfully!');
