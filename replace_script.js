const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/TeacherSaeDetailPage.jsx', 'utf8');
c = c.replace(
  'className="bg-indigo-900 rounded-3xl p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"',
  'className="bg-indigo-900 rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-5"'
);
c = c.replace(
  'className="bg-indigo-500/30 text-indigo-100 font-bold uppercase text-xs tracking-widest px-3 py-1 rounded-full w-max mb-3 mx-auto md:mx-0 border border-indigo-400/30"',
  'className="bg-indigo-500/30 text-indigo-100 font-bold uppercase text-[10px] tracking-widest px-3 py-1 rounded-md w-max mb-2 mx-auto md:mx-0 border border-indigo-400/30"'
);
c = c.replace(
  '<h2 className="text-3xl font-black text-white tracking-tight mb-2">Phase {phase.numero} : {phase.titre}</h2>',
  '<h2 className="text-2xl font-black text-white tracking-tight mb-2">Phase {phase.numero} : {phase.titre}</h2>'
);
c = c.replace(
  '<p className="text-indigo-200 font-medium">L\\'échéance de cette phase est fixée au <strong className="text-white">{new Date(phase.dateFin).toLocaleDateString()}</strong>.</p>',
  '<p className="text-indigo-200 text-sm font-medium">L\\'échéance de cette phase est fixée au <strong className="text-white">{new Date(phase.dateFin).toLocaleDateString()}</strong>.</p>'
);
c = c.replace(
  'className="relative z-10 flex flex-col bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl items-center min-w-[150px]"',
  'className="relative z-10 flex flex-col bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl items-center min-w-[120px]"'
);
c = c.replace(
  '<span className="text-4xl font-black text-white">{mockPhaseTracking.length}</span>',
  '<span className="text-3xl font-black text-white">{mockPhaseTracking.length}</span>'
);
c = c.replace(
  '<span className="text-sm font-bold text-indigo-200 mt-1">Soumissions</span>',
  '<span className="text-xs font-bold text-indigo-200 mt-1">Soumissions</span>'
);
c = c.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">'
);
c = c.replace(
  /className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow"/g,
  'className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow"'
);
c = c.replace(
  /className="flex justify-between items-start border-b border-gray-100 pb-3"/g,
  'className="flex justify-between items-start border-b border-gray-100 pb-2"'
);
c = c.replace(
  /<h4 className="font-black text-lg text-gray-900 flex items-center gap-3">/g,
  '<h4 className="font-bold text-base text-gray-900 flex items-center gap-2">'
);
c = c.replace(
  /className={`text-xs font-bold px-3 py-1 rounded-md/g,
  'className={`text-[10px] font-bold px-2.5 py-1 rounded-md'
);
c = c.replace(
  /<span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Journal de bord<\/span>/g,
  '<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Journal de bord</span>'
);
c = c.replace(
  /className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl italic border border-gray-100 overflow-y-auto max-h-\[120px\]"/g,
  'className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg italic border border-gray-100 overflow-y-auto max-h-[100px]"'
);
fs.writeFileSync('frontend/src/pages/TeacherSaeDetailPage.jsx', c, 'utf8');
console.log("Done");
