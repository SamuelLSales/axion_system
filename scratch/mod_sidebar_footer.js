const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'Sidebar.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the top toggle button
const topToggleRegex = /{\/\* Botão de Toggle \(Abre e Fecha\) \*\/}[\s\S]*?<\/button>/;
content = content.replace(topToggleRegex, '');

// 2. Replace the footer
const footerRegex = /{\/\* QUICK ACTIONS FOOTER \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newFooter = `{/* TOGGLE FOOTER */}
  <div className="p-4 border-t border-aldebaran-border">
  <button
  onClick={() => setIsExpanded(!isExpanded)}
  title={isExpanded ? "Recolher Menu" : "Expandir Menu"}
  className="flex items-center justify-center gap-2 py-2.5 bg-aldebaran-gray hover:bg-aldebaran-border text-theme-weak hover:text-theme-strong rounded-none text-xs font-bold border border-aldebaran-border transition shadow-sm w-full"
  >
  {isExpanded ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
  {isExpanded && (
  <span className="whitespace-nowrap overflow-hidden animate-fade-in">
  Recolher Aba
  </span>
  )}
  </button>
  </div>`;

content = content.replace(footerRegex, newFooter);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Sidebar toggle moved to footer');
