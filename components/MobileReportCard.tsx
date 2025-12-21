
import React, { useState } from 'react';
import { ProcessedReport, ReportData } from '../types';

interface MobileReportCardProps {
  report: ProcessedReport;
  onUpdateReport: (id: string, field: keyof ReportData, value: any) => void;
  onDeleteReport: (id: string) => void;
  onViewImage: (report: ProcessedReport) => void;
}

export const MobileReportCard: React.FC<MobileReportCardProps> = ({ report, onUpdateReport, onDeleteReport, onViewImage }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${report.confidenceScore >= 8 ? 'bg-green-500' : 'bg-yellow-500'}`} 
          />
          <h3 className="font-semibold text-slate-800 truncate max-w-[150px]">
            {report.data.cliente || report.data.sito || 'Sin Nombre'}
          </h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onViewImage(report)}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 p-1 rounded"
            title="Ver Original"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          <button 
            onClick={() => onDeleteReport(report.id)}
            className="text-slate-400 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
           <div>
             <label className="text-[10px] font-bold text-blue-600 block uppercase">Fecha</label>
             <input 
                type="text" 
                value={report.data.fecha || ''}
                onChange={(e) => onUpdateReport(report.id, 'fecha', e.target.value)}
                className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-red-600 block uppercase">Folio</label>
             <input 
                type="text" 
                value={report.data.folio || ''}
                onChange={(e) => onUpdateReport(report.id, 'folio', e.target.value)}
                className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1 font-bold text-red-600"
             />
           </div>
        </div>

        <div>
           <label className="text-[10px] font-bold text-blue-600 block uppercase">Trabajo Realizado</label>
           <textarea 
              value={report.data.trabajoRealizado || ''}
              onChange={(e) => onUpdateReport(report.id, 'trabajoRealizado', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded p-2 mt-1 focus:border-blue-500 outline-none"
              rows={3}
           />
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
             <div>
                <label className="text-[10px] font-bold text-blue-600 block uppercase">Falla</label>
                <textarea 
                  value={report.data.falla || ''}
                  onChange={(e) => onUpdateReport(report.id, 'falla', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded p-2 mt-1 focus:border-blue-500 outline-none"
                  rows={2}
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-blue-600 block uppercase">Condiciones</label>
                <textarea 
                  value={report.data.condiciones || ''}
                  onChange={(e) => onUpdateReport(report.id, 'condiciones', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded p-2 mt-1 focus:border-blue-500 outline-none"
                  rows={2}
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-blue-600 block uppercase">Materiales ({report.data.materiales?.length || 0})</label>
                <div className="text-[10px] text-slate-500 italic">
                  {report.data.materiales?.map((m, i) => (
                    <div key={i} className="border-b border-slate-50 py-1">
                      {m.no} {m.unidad} - {m.nombre} ({m.modelo})
                    </div>
                  ))}
                  {(!report.data.materiales || report.data.materiales.length === 0) && "Sin materiales registrados"}
                </div>
             </div>
             
             <div>
                <label className="text-[10px] font-bold text-blue-600 block uppercase">Sito / Ubicación</label>
                <input 
                  type="text" 
                  value={report.data.sito || ''}
                  onChange={(e) => onUpdateReport(report.id, 'sito', e.target.value)}
                  className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
                />
             </div>

             <div>
                <label className="text-[10px] font-bold text-blue-600 block uppercase">Técnicos</label>
                <input 
                  type="text" 
                  value={report.data.tecnicos || ''}
                  onChange={(e) => onUpdateReport(report.id, 'tecnicos', e.target.value)}
                  className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
                />
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="text-[10px] font-bold text-blue-600 block uppercase">Hr Inicio</label>
                   <input 
                      type="text" 
                      value={report.data.horarioInicio || ''}
                      onChange={(e) => onUpdateReport(report.id, 'horarioInicio', e.target.value)}
                      className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-blue-600 block uppercase">Hr Fin</label>
                   <input 
                      type="text" 
                      value={report.data.horarioFin || ''}
                      onChange={(e) => onUpdateReport(report.id, 'horarioFin', e.target.value)}
                      className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
                   />
                </div>
             </div>
          </div>
        )}

        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-xs text-blue-600 font-bold py-2 hover:bg-slate-50 rounded border border-blue-100"
        >
          {expanded ? 'Ver menos' : 'Ver más detalles'}
        </button>
      </div>
    </div>
  );
};
