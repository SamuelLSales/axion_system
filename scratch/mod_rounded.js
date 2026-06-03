const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function replaceRounded(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/rounded-md/g, 'rounded-none');
    content = content.replace(/rounded-lg/g, 'rounded-none');
    content = content.replace(/rounded-xl/g, 'rounded-none');
    content = content.replace(/rounded/g, 'rounded-none'); // Catches simple rounded
    content = content.replace(/rounded-none-none/g, 'rounded-none'); // Fix any double replacement
    content = content.replace(/rounded-none-full/g, 'rounded-full'); // Fix any double replacement
    content = content.replace(/rounded-none-sm/g, 'rounded-sm'); // Fix any double replacement
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + path.basename(filePath));
  }
}

const files = [
  path.join(srcDir, 'components', 'Sidebar.jsx'),
  path.join(srcDir, 'components', 'Header.jsx'),
  path.join(srcDir, 'components', 'StatusBadge.jsx'),
  path.join(srcDir, 'components', 'ProgressBar.jsx'),
  path.join(srcDir, 'pages', 'Dashboard.jsx'),
  path.join(srcDir, 'pages', 'Contratos.jsx'),
  path.join(srcDir, 'pages', 'DetalheContrato.jsx'),
  path.join(srcDir, 'pages', 'Responsaveis.jsx'),
  path.join(srcDir, 'pages', 'NovoContrato.jsx'),
];

files.forEach(replaceRounded);
