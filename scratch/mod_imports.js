const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'DetalheContrato.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/ChevronUp\s*}\s*from\s*'lucide-react';/, "ChevronUp,\n  FileSpreadsheet\n} from 'lucide-react';");
content = content.replace(/getResponsaveis\s*}\s*from\s*'\.\.\/services\/api';/, "getResponsaveis,\n  exportarCSV\n} from '../services/api';");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Imports added!');
