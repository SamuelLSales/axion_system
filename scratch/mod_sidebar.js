const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'Sidebar.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /{\/\* BRAND HEADER \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newBrandHeader = `{/* BRAND HEADER */}
  <div className={\`p-6 border-b border-aldebaran-border flex items-center \${isExpanded ? 'justify-start' : 'justify-center'} min-h-[89px]\`}>
  <div className="flex items-center justify-center w-full">
  
  {isExpanded ? (
    <img src="/logo.png" alt="Aldebaran Consultoria" className="max-h-[35px] w-auto object-contain animate-fade-in" />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-aldebaran-gold flex items-center justify-center shadow-sm shrink-0 animate-fade-in">
    <Compass className="w-5 h-5 text-aldebaran-dark" />
    </div>
  )}

  </div>
  </div>`;

content = content.replace(regex, newBrandHeader);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Sidebar logo updated');
