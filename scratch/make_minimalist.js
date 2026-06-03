const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

const replacements = [
  // Reduzir bordas arredondadas exageradas (típico de IA)
  { search: /rounded-2xl/g, replace: 'rounded-lg' },
  { search: /rounded-xl/g, replace: 'rounded-md' },
  
  // Remover sombras coloridas ou muito fortes (típico de IA)
  { search: /shadow-md shadow-aldebaran-gold\/20/g, replace: 'shadow-sm' },
  { search: /shadow-lg shadow-aldebaran-gold\/10/g, replace: 'shadow-sm' },
  { search: /shadow-aldebaran-gold\/10/g, replace: '' },
  { search: /shadow-aldebaran-gold\/20/g, replace: '' },
  { search: /shadow-lg/g, replace: 'shadow-sm' },
  { search: /shadow-2xl/g, replace: 'shadow-md' },
  
  // Reduzir badges fluorescentes ou blocos de cor exagerados
  { search: /bg-aldebaran-gold\/10 text-aldebaran-gold border border-aldebaran-gold\/20/g, replace: 'text-aldebaran-gold text-xs font-semibold' },
  { search: /bg-emerald-500\/10 text-emerald-400 border border-emerald-500\/20/g, replace: 'text-emerald-500 text-xs font-semibold' },
  { search: /bg-rose-500\/10 text-rose-400 border border-rose-500\/20/g, replace: 'text-rose-500 text-xs font-semibold' },
  { search: /bg-yellow-500\/10 text-yellow-400 border border-yellow-500\/20/g, replace: 'text-yellow-500 text-xs font-semibold' },
  { search: /bg-aldebaran-gold\/20/g, replace: 'bg-aldebaran-gray' },
  { search: /border-aldebaran-gold\/30/g, replace: 'border-aldebaran-border' },
  { search: /bg-emerald-500\/10/g, replace: 'bg-transparent text-emerald-500' },
  { search: /bg-rose-500\/10/g, replace: 'bg-transparent text-rose-500' },
  { search: /bg-yellow-500\/10/g, replace: 'bg-transparent text-yellow-500' },
  
  // Limpar gradientes se houver
  { search: /bg-gradient-to-r/g, replace: 'bg-aldebaran-gray' },
  { search: /from-[\w-]+ to-[\w-]+/g, replace: '' },
  
  // Remover animações exageradas (bounce, pulse constante, spin-slow em locais normais)
  { search: /animate-pulse/g, replace: '' },
  { search: /animate-bounce/g, replace: '' },
  { search: /animate-spin-slow/g, replace: '' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({ search, replace }) => {
        content = content.replace(search, replace);
      });
      
      // Fix double spaces created by empty replacements
      content = content.replace(/  +/g, ' ');
      // Fix class=" " artifacts
      content = content.replace(/className=" "/g, 'className=""');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Minimalized: ${fullPath}`);
      }
    }
  }
}

walk(srcDir);
console.log('All files minimalized successfully!');
