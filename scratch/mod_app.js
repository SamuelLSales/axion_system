const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="flex bg-aldebaran-dark min-h-screen text-slate-100 font-sans">[\s\S]*?<\/div>\s*<\/Router>/;

const newApp = `<div className="flex bg-[#0A0A0A] min-h-screen text-slate-100 font-sans p-2 sm:p-4 lg:p-8">
  <div className="flex flex-1 bg-[#141414] border border-[#2A2A2A] rounded-none shadow-2xl overflow-hidden max-w-[1800px] mx-auto">
  {/* Barra Lateral Esquerda */}
  <Sidebar />

  {/* Corpo Principal do Sistema */}
  <div className="flex-1 flex flex-col min-w-0 bg-[#141414]">
  {/* Cabeçalho Superior Fixo */}
  <Header />

  {/* Área de Visualização das Páginas */}
  <main className="flex-1 overflow-y-auto bg-[#141414]">
  <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/contratos/:id" element={<DetalheContrato />} />
  <Route path="/contratos/novo" element={<NovoContrato />} />
  <Route path="/responsaveis" element={<Responsaveis />} />
  <Route path="/area/:area" element={<Contratos />} />
  <Route path="/contratos" element={<Contratos />} />
  </Routes>
  </main>
  </div>
  </div>
  </div>
  </Router>`;

content = content.replace(regex, newApp);
fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx updated');
