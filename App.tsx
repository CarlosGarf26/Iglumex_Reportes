
import React, { useState, useEffect, ErrorInfo, ReactNode, Component } from 'react';
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
  const [statusMessage, setStatusMessage] = useState("Listo");
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newReports: ProcessedReport[] = files.map(f => ({
      id: generateId(), 
      filename: f.name,
      status: 'processing',
      confidenceScore: 0,
      data: { ...INITIAL_REPORT_DATA }
    }));
    setReports(prev => [...prev, ...newReports]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reportId = newReports[i].id;
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, originalImage: base64 } : r));
        setStatusMessage(`Analizando ${file.name}...`);
        
        const { data, score } = await processReportImage(base64, file.type, selectedModel);
        
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: 'completed', confidenceScore: score, data: data } : r
        ));
      } catch (error: any) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'error', errorMsg: error.message } : r));
      } finally {
        setProcessingCount(prev => prev + 1);
      }
    }
    setIsProcessing(false);
    setStatusMessage("Listo");
  };

  const handleUpdateReport = (id: string, field: keyof ReportData, value: any) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, data: { ...r.data, [field]: value } } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={DEFAULT_LOGO} alt="Iglumex" className="h-10 w-auto" />
          <h1 className="text-xl font-extrabold text-blue-900">Gestor de Reportes Mantenimiento</h1>
        </div>
        <div className="flex items-center gap-4">
           <select 
             value={selectedModel} 
             onChange={e => setSelectedModel(e.target.value)}
             className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 outline-none"
           >
             <option value="gemini-3-flash-preview">Cerebro Flash (Velocidad)</option>
             <option value="gemini-3-pro-preview">Cerebro Pro (Precisión)</option>
           </select>
           <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
             <button onClick={() => setViewMode('table')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Tabla</button>
             <button onClick={() => setViewMode('document')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'document' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Documento</button>
           </div>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <FileUpload onFilesSelected={handleFiles} disabled={isProcessing} />
        </div>

        {reports.length > 0 && (
          <div className="space-y-6">
            {viewMode === 'table' ? (
              <ResultsTable reports={reports} onUpdateReport={handleUpdateReport as any} onDeleteReport={id => setReports(p => p.filter(r => r.id !== id))} onViewImage={setViewingReport} />
            ) : (
              <div className="space-y-12">
                {reports.map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onUpdateReport={handleUpdateReport} 
                    onDeleteReport={id => setReports(p => p.filter(r => r.id !== id))} 
                    onViewImage={setViewingReport}
                    isActive={activeReportId === report.id}
                    onClick={() => setActiveReportId(report.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {isProcessing && (
        <div className="fixed bottom-8 right-8 bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold">{statusMessage} ({processingCount}/{reports.length})</span>
        </div>
      )}

      <ImageModal isOpen={!!viewingReport} imageUrl={viewingReport?.originalImage} title={viewingReport?.data.folio || 'Reporte'} onClose={() => setViewingReport(null)} />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
