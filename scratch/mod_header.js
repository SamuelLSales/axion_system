const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'Header.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Sun and Moon imports
content = content.replace(/,\s*Sun,\s*Moon/g, '');

// 2. Remove isDark state
content = content.replace(/const\s+\[isDark,\s*setIsDark\]\s*=\s*useState\(true\);/g, '');

// 3. Remove document.documentElement.classList.add('dark');
content = content.replace(/\/\/ Default to dark mode as requested by user\s*\n\s*document\.documentElement\.classList\.add\('dark'\);\s*\n/g, '');

// 4. Remove toggleTheme function
content = content.replace(/const\s+toggleTheme\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};/g, '');

// 5. Remove Theme Toggle button JSX
const buttonRegex = /{\/\*\s*Theme Toggle\s*\*\/}[\s\S]*?<\/button>/g;
content = content.replace(buttonRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Header modified successfully');
