const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the table block
const searchStr = '{/* FILTROS E TABELA PRINCIPAL */}';
const index = content.indexOf(searchStr);

if (index !== -1) {
  content = content.substring(0, index) + '  </div>\n  );\n};\n\nexport default Dashboard;\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Table removed from Dashboard.jsx');
} else {
  console.log('Search string not found.');
}
