const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'DetalheContrato.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const corruptedIndex = content.indexOf("</div>m 'react-router-dom';");

if (corruptedIndex !== -1) {
  // Get the good top part (which has the new layout!)
  const topPart = content.substring(0, corruptedIndex + 6); // up to </div>
  
  // Find the historic block in the corrupted part to recover the bottom of the component
  const addFaseMarker = '{/* BOTÃO ADICIONAR FASE NO FINAL */}';
  const addFaseIndex = content.lastIndexOf(addFaseMarker);
  
  if (addFaseIndex !== -1) {
    const bottomPart = content.substring(addFaseIndex);
    
    // Stitch them together with the closing tags for the phases loop
    const fixedContent = topPart + '\n      </div>\n    )\n  }) // end map fases\n  ) : (\n    <div className="py-8 border border-dashed border-aldebaran-border rounded-md flex flex-col items-center justify-center text-slate-500 gap-2">\n      <p className="text-sm font-medium">Este contrato não possui nenhuma fase cadastrada.</p>\n      <button onClick={() => setModalFaseAberto(true)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-xs font-semibold">Criar Primeira Fase</button>\n    </div>\n  )}\n\n  ' + bottomPart;
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('File repaired successfully!');
  } else {
    console.log('Could not find addFase marker');
  }
} else {
  console.log('Corrupted index not found');
}
