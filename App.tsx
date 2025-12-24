
import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { ReportCard } from './components/ReportCard';
import { ExportActions } from './components/ExportActions';
import { ImageModal } from './components/ImageModal';
import { ProcessedReport, ReportData, INITIAL_REPORT_DATA, DEFAULT_LOGO } from './types';
import { processReportImage } from './services/geminiService';

const AppContent: React.FC = () => {
  const [reports, setReports] = useState<ProcessedReport[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingReport, setViewingReport] = useState<ProcessedReport | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'document'>('document');
  const [statusMessage, setStatusMessage] = useState("Listo para procesar");
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');

  const handleFiles = async (files: File[]) => {
    setIsProcessing(true);
    
    const newReports = files.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: f.name,
      status: 'processing' as const,
      confidenceScore: 0,
      data: { ...INITIAL_REPORT_DATA }
    }));

    setReports(prev => [...prev, ...newReports]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const currentReportId = newReports[i].id;
      
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Guardar preview inmediatamente
        setReports(prev => prev.map(r => r.id === currentReportId ? { ...r, originalImage: base64 } : r));
        setStatusMessage(`Transcribiendo: ${file.name}`);

        const result = await processReportImage(base64, file.type, selectedModel);
        
        setReports(prev => prev.map(r => 
          r.id === currentReportId ? { 
            ...r, 
            status: 'completed', 
            confidenceScore: result.score, 
            data: result.data 
          } : r
        ));
      } catch (error: any) {
        console.error("Error procesando:", file.name, error);
        setReports(prev => prev.map(r => 
          r.id === currentReportId ? { 
            ...r, 
            status: 'error', 
            errorMsg: error.message 
          } : r
        ));
      }
    }
    
    setIsProcessing(false);
    setStatusMessage("Proceso terminado");
    setTimeout(() => setStatusMessage("Listo"), 3000);
  };

  const handleUpdateReport = (id: string, field: keyof ReportData, value: any) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, data: { ...r.data, [field]: value } } : r));
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={DEFAULT_LOGO} alt="Iglumex" className="h-8 w-auto" />
            <h1 className="text-lg font-black text-blue-900 tracking-tight">DIGITALIZADOR <span className="text-blue-500">IGLÚMEX</span></h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
             <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
               <span className="text-[10px] font-bold text-blue-700 uppercase">Inteligencia:</span>
               <select 
                 value={selectedModel} 
                 onChange={e => setSelectedModel(e.target.value)}
                 className="text-xs bg-transparent font-bold text-blue-900 outline-none cursor-pointer"
               >
                 <option value="gemini-3-flash-preview">FLASH (Rápido)</option>
                 <option value="gemini-3-pro-preview">PRO (Preciso)</option>
               </select>
             </div>

             <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
               <button onClick={() => setViewMode('table')} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>TABLA</button>
               <button onClick={() => setViewMode('document')} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'document' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>FICHA</button>
             </div>

             {reports.some(r => r.status === 'completed') && <ExportActions reports={reports.filter(r => r.status === 'completed')} />}
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 border border-slate-200 text-center">
          <FileUpload onFilesSelected={handleFiles} disabled={isProcessing} />
          <p className={`mt-4 text-sm font-medium transition-colors ${isProcessing ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
            {statusMessage}
          </p>
        </div>

        {reports.length > 0 && (
          <div className="space-y-8 pb-20">
            {viewMode === 'table' ? (
              <ResultsTable reports={reports} onUpdateReport={handleUpdateReport as any} onDeleteReport={deleteReport} onViewImage={setViewingReport} />
            ) : (
              <div className="space-y-12">
                {reports.map(report => (
                  <div key={report.id} className="relative">
                    {report.status === 'processing' && (
                      <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center border-2 border-blue-100">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-black text-blue-900 text-lg uppercase tracking-widest">Leyendo reporte...</p>
                        <p className="text-slate-500 text-xs mt-2">Descifrando caligrafía y marcas</p>
                      </div>
                    )}
                    {report.status === 'error' && (
                      <div className="absolute inset-0 z-40 bg-red-50/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-8 text-center border-2 border-red-200">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                        </div>
                        <h3 className="font-bold text-red-800 text-xl mb-2">No se pudo digitalizar</h3>
                        <p className="text-red-600 text-sm max-w-md mb-6">{report.errorMsg}</p>
                        <div className="flex gap-3">
                          <button onClick={() => deleteReport(report.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-red-700">Eliminar archivo</button>
                        </div>
                      </div>
                    )}
                    <ReportCard 
                      report={report} 
                      onUpdateReport={handleUpdateReport} 
                      onDeleteReport={deleteReport} 
                      onViewImage={setViewingReport}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 p-6 text-center text-[10px] font-bold tracking-widest uppercase">
        © 2024 IGLÚMEX SISTEMAS TÉCNICOS | POTENCIADO POR INTELIGENCIA ARTIFICIAL
      </footer>

      <ImageModal 
        isOpen={!!viewingReport} 
        imageUrl={viewingReport?.originalImage} 
        title={viewingReport?.data.folio || 'Visualización'} 
        onClose={() => setViewingReport(null)} 
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
