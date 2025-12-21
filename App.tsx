
import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { MobileReportCard } from './components/MobileReportCard';
import { ReportCard } from './components/ReportCard';
import { ExportActions } from './components/ExportActions';
import { ImageModal } from './components/ImageModal';
import { ProcessedReport, ReportData, INITIAL_REPORT_DATA, DEFAULT_LOGO } from './types';
import { processReportImage } from './services/geminiService';

const AppContent: React.FC = () => {
  const [reports, setReports] = useState<ProcessedReport[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [viewingReport, setViewingReport] = useState<ProcessedReport | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'document'>('document');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Esperando archivos...");
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProcessingCount(0);
    
    const incomingReports: ProcessedReport[] = files.map(f => ({
      id: generateId(), 
      filename: f.name,
      status: 'processing',
      confidenceScore: 0,
      data: { ...INITIAL_REPORT_DATA }
    }));

    setReports(prev => [...prev, ...incomingReports]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reportId = incomingReports[i].id;
      
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        // Guardamos la imagen original para visualización
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, originalImage: base64 } : r));
        setStatusMessage(`Procesando: ${file.name}`);
        
        const { data, score } = await processReportImage(base64, file.type, selectedModel);
        
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: 'completed', confidenceScore: score, data: data } : r
        ));
      } catch (error: any) {
        console.error("Error procesando archivo:", error);
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: 'error', errorMsg: error.message || "Error desconocido" } : r
        ));
      } finally {
        setProcessingCount(prev => prev + 1);
      }
    }
    
    setIsProcessing(false);
    setStatusMessage("Procesamiento finalizado");
    setTimeout(() => setStatusMessage("Listo"), 3000);
  };

  const handleUpdateReport = (id: string, field: keyof ReportData, value: any) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, data: { ...r.data, [field]: value } } : r));
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={DEFAULT_LOGO} alt="Iglumex" className="h-8 w-auto" />
            <h1 className="text-lg font-extrabold text-blue-900 hidden sm:block">Digitalizador IGLÚMEX</h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
             <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
               <span className="text-[10px] font-bold text-blue-700 uppercase">Modelo:</span>
               <select 
                 value={selectedModel} 
                 onChange={e => setSelectedModel(e.target.value)}
                 className="text-xs bg-transparent font-medium text-blue-900 outline-none cursor-pointer"
               >
                 <option value="gemini-3-flash-preview">Flash (Rápido)</option>
                 <option value="gemini-3-pro-preview">Pro (Inteligente)</option>
               </select>
             </div>

             <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
               <button 
                 onClick={() => setViewMode('table')} 
                 className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 TABLA
               </button>
               <button 
                 onClick={() => setViewMode('document')} 
                 className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'document' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 DOCUMENTO
               </button>
             </div>

             {reports.some(r => r.status === 'completed') && <ExportActions reports={reports.filter(r => r.status === 'completed')} />}
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 border border-slate-200">
          <FileUpload onFilesSelected={handleFiles} disabled={isProcessing} />
        </div>

        {reports.length > 0 && (
          <div className="space-y-6">
            {viewMode === 'table' ? (
              <ResultsTable 
                reports={reports} 
                onUpdateReport={handleUpdateReport as any} 
                onDeleteReport={deleteReport} 
                onViewImage={setViewingReport} 
              />
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {reports.map(report => (
                  <div key={report.id} className="relative group">
                    {report.status === 'processing' && (
                      <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-blue-900">Digitalizando reporte...</p>
                      </div>
                    )}
                    {report.status === 'error' && (
                      <div className="absolute inset-0 z-40 bg-red-50/90 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <h3 className="font-bold text-red-800 text-lg">Error de Transcripción</h3>
                        <p className="text-red-600 text-sm mb-4">{report.errorMsg}</p>
                        <button 
                          onClick={() => deleteReport(report.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md"
                        >
                          Quitar y Reintentar
                        </button>
                      </div>
                    )}
                    <ReportCard 
                      report={report} 
                      onUpdateReport={handleUpdateReport} 
                      onDeleteReport={deleteReport} 
                      onViewImage={setViewingReport}
                      isActive={activeReportId === report.id}
                      onClick={() => setActiveReportId(report.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 text-center">
        <p className="text-xs text-slate-400 font-medium">© 2024 IGLÚMEX - Herramienta Interna de Digitalización AI</p>
      </footer>

      <ImageModal 
        isOpen={!!viewingReport} 
        imageUrl={viewingReport?.originalImage} 
        title={viewingReport?.data.folio || 'Reporte'} 
        onClose={() => setViewingReport(null)} 
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
