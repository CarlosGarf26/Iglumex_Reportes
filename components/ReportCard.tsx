
import React, { useState } from 'react';
import { ProcessedReport, ReportData, DEFAULT_LOGO } from '../types';

interface ReportCardProps {
  report: ProcessedReport;
  onUpdateReport: (id: string, field: keyof ReportData, value: any) => void;
  onDeleteReport: (id: string) => void;
  onViewImage: (report: ProcessedReport) => void;
  isActive?: boolean;
  onClick?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onUpdateReport, onDeleteReport, onViewImage, isActive, onClick }) => {
  const [bgMode, setBgMode] = useState<'watermark' | 'original'>('watermark');

  const toggleCheckbox = (field: keyof ReportData, value: string) => {
    const current = (report.data[field] as string) || '';
    if (current.includes(value)) {
      onUpdateReport(report.id, field, current.replace(value, '').replace(/\s+/g, ' ').trim());
    } else {
      onUpdateReport(report.id, field, `${current} ${value}`.trim());
    }
  };

  const isChecked = (field: keyof ReportData, value: string) => {
    return ((report.data[field] as string) || '').toLowerCase().includes(value.toLowerCase());
  };

  const inputBgClass = bgMode === 'original' ? 'bg-white/40 focus:bg-white/90' : 'bg-white';
  const labelColor = "text-blue-600 font-bold text-[10px]";

  return (
    <div 
      className={`relative w-full max-w-4xl mx-auto mb-8 font-sans border rounded-lg overflow-hidden transition-all duration-300 bg-white ${isActive ? 'ring-2 ring-blue-500 shadow-2xl' : 'border-slate-300 shadow-md'}`}
      onClick={onClick}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-10">
        {bgMode === 'watermark' ? (
          <img src={DEFAULT_LOGO} alt="bg" className="w-1/2" />
        ) : (
          report.originalImage && <img src={report.originalImage} alt="bg" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Header Info Bar */}
      <div className="relative z-20 bg-slate-50 border-b border-slate-200 p-2 flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${report.confidenceScore > 7 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm font-bold text-slate-700 uppercase">{report.data.cliente || 'Nuevo Reporte Iglúmex'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBgMode(prev => prev === 'watermark' ? 'original' : 'watermark')} className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">Cambiar Fondo</button>
          <button onClick={() => onViewImage(report)} className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Ver Original</button>
          <button onClick={() => onDeleteReport(report.id)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">Eliminar</button>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="relative z-10 p-6 space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <img src={DEFAULT_LOGO} alt="logo" className="h-12 w-auto object-contain" />
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-bold text-center">
              Reparación y mantenimiento de aires acondicionados
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
               <span className="text-red-600 font-bold">N°</span>
               <input 
                 value={report.data.folio} 
                 onChange={e => onUpdateReport(report.id, 'folio', e.target.value)}
                 className="border-b border-blue-200 text-red-600 font-bold text-lg outline-none w-32 text-right"
               />
            </div>
            <div className="flex items-center gap-2">
               <span className={labelColor}>FECHA</span>
               <input value={report.data.fecha} onChange={e => onUpdateReport(report.id, 'fecha', e.target.value)} className="border-b border-blue-200 outline-none w-40 px-2" />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {[
            { label: 'SITO', field: 'sito' },
            { label: 'CLIENTE', field: 'cliente' },
            { label: 'N° ID', field: 'idNum' },
            { label: 'REGIÓN', field: 'region' },
            { label: 'TICKET', field: 'ticket' }
          ].map(item => (
            <div key={item.field} className="flex items-center gap-2">
              <label className={`${labelColor} w-16`}>{item.label}</label>
              <input 
                value={(report.data as any)[item.field]} 
                onChange={e => onUpdateReport(report.id, item.field as any, e.target.value)}
                className={`flex-grow border border-blue-100 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 ${inputBgClass}`}
              />
            </div>
          ))}
        </div>

        {/* Technical & Service */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 space-y-2">
            <label className={labelColor}>PERSONAL TÉCNICO</label>
            <textarea 
              value={report.data.tecnicos}
              onChange={e => onUpdateReport(report.id, 'tecnicos', e.target.value)}
              className={`w-full h-24 border border-blue-100 rounded p-2 text-xs outline-none ${inputBgClass}`}
            />
          </div>
          <div className="col-span-3 flex flex-col items-center justify-center gap-4">
             <label className={labelColor}>HORARIO (INICIO / FIN)</label>
             <div className="flex gap-2">
               <input value={report.data.horarioInicio} onChange={e => onUpdateReport(report.id, 'horarioInicio', e.target.value)} className="w-16 border border-blue-100 rounded px-1 py-1 text-center text-xs" />
               <input value={report.data.horarioFin} onChange={e => onUpdateReport(report.id, 'horarioFin', e.target.value)} className="w-16 border border-blue-100 rounded px-1 py-1 text-center text-xs" />
             </div>
          </div>
          <div className="col-span-5 border border-blue-100 rounded p-2">
             <label className={`${labelColor} block mb-2`}>SERVICIO</label>
             <div className="grid grid-cols-2 gap-x-2 gap-y-1">
               {['PREVENTIVO', 'CORRECTIVO', 'INSTALACIÓN', 'ADICIONAL', 'GARANTÍA', 'OTRO'].map(opt => (
                 <div key={opt} className="flex items-center gap-1 cursor-pointer" onClick={() => toggleCheckbox('servicio', opt)}>
                   <div className={`w-4 h-4 border border-blue-300 flex items-center justify-center rounded-sm ${isChecked('servicio', opt) ? 'bg-blue-600' : 'bg-white'}`}>
                     {isChecked('servicio', opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                   </div>
                   <span className="text-[9px] font-medium">{opt}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Text Sections */}
        {['FALLA', 'CONDICIONES ENCONTRADAS', 'TRABAJO REALIZADO'].map(section => {
          const field = section === 'FALLA' ? 'falla' : section === 'CONDICIONES ENCONTRADAS' ? 'condiciones' : 'trabajoRealizado';
          return (
            <div key={section} className="space-y-1">
              <label className={labelColor}>{section}</label>
              <textarea 
                value={(report.data as any)[field]}
                onChange={e => onUpdateReport(report.id, field as any, e.target.value)}
                className={`w-full border border-blue-100 rounded p-2 text-xs outline-none ${inputBgClass} ${field === 'trabajoRealizado' ? 'h-32' : 'h-16'}`}
              />
            </div>
          )
        })}

        {/* Materials Table & Bottom Checkboxes */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 border border-blue-100 rounded overflow-hidden">
            <div className="bg-blue-600 text-white text-[9px] font-bold p-1 text-center">MATERIALES / REFACCIONES UTILIZADAS</div>
            <table className="w-full text-[9px]">
              <thead>
                <tr className="bg-blue-50 text-blue-800 border-b border-blue-100">
                  <th className="p-1 w-8">N°</th>
                  <th className="p-1 w-16">UNIDAD</th>
                  <th className="p-1">NOMBRE</th>
                  <th className="p-1 w-24">MODELO</th>
                </tr>
              </thead>
              <tbody>
                {(report.data.materiales?.length > 0 ? report.data.materiales : Array(4).fill({no:'', unidad:'', nombre:'', modelo:''})).map((m, i) => (
                  <tr key={i} className="border-b border-blue-50">
                    <td className="p-1"><input value={m.no} className="w-full bg-transparent outline-none text-center" /></td>
                    <td className="p-1"><input value={m.unidad} className="w-full bg-transparent outline-none text-center" /></td>
                    <td className="p-1"><input value={m.nombre} className="w-full bg-transparent outline-none" /></td>
                    <td className="p-1"><input value={m.modelo} className="w-full bg-transparent outline-none" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-span-4 space-y-4">
             <div className="border border-blue-100 rounded p-2">
                <label className={`${labelColor} block mb-1`}>CLASIFICACIÓN DE LA FALLA</label>
                <div className="grid grid-cols-2 gap-1">
                  {['ELECTRÓNICA', 'ELÉCTRICA', 'MECÁNICA', 'OPERATIVA', 'INEXISTENTE', 'OTRO'].map(opt => (
                    <div key={opt} className="flex items-center gap-1 cursor-pointer" onClick={() => toggleCheckbox('clasificacionFalla', opt)}>
                      <div className={`w-3 h-3 border border-blue-300 flex items-center justify-center ${isChecked('clasificacionFalla', opt) ? 'bg-blue-600' : 'bg-white'}`}>
                        {isChecked('clasificacionFalla', opt) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[8px]">{opt}</span>
                    </div>
                  ))}
                </div>
             </div>
             <div className="border border-blue-100 rounded p-2">
                <label className={`${labelColor} block mb-1`}>ESTADO FINAL</label>
                <div className="flex flex-col gap-1">
                  {['REPARACIÓN TOTAL', 'REPARACIÓN PARCIAL', 'PENDIENTE'].map(opt => (
                    <div key={opt} className="flex items-center gap-1 cursor-pointer" onClick={() => toggleCheckbox('estadoFinal', opt)}>
                      <div className={`w-3 h-3 border border-blue-300 flex items-center justify-center ${isChecked('estadoFinal', opt) ? 'bg-blue-600' : 'bg-white'}`}>
                        {isChecked('estadoFinal', opt) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[8px]">{opt}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-1">
          <label className={labelColor}>OBSERVACIONES ADICIONALES</label>
          <textarea 
            value={report.data.observaciones}
            onChange={e => onUpdateReport(report.id, 'observaciones', e.target.value)}
            className={`w-full h-16 border border-blue-100 rounded p-2 text-xs outline-none ${inputBgClass}`}
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-8">
           <div className="flex flex-col items-center">
              <div className="w-full h-16 border-b border-blue-300" />
              <span className="text-[10px] font-bold text-blue-800 mt-2">FIRMA DEL TÉCNICO</span>
           </div>
           <div className="flex flex-col items-center">
              <div className="w-full h-16 border-b border-blue-300" />
              <span className="text-[10px] font-bold text-blue-800 mt-2 uppercase">Firma del encargado que recibe</span>
           </div>
        </div>
      </div>
    </div>
  );
};
