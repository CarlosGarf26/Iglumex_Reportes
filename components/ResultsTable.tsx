
import React from 'react';
import { ProcessedReport, ReportData } from '../types';

interface ResultsTableProps {
  reports: ProcessedReport[];
  onUpdateReport: (id: string, field: keyof ReportData, value: string) => void;
  onDeleteReport: (id: string) => void;
  onViewImage: (report: ProcessedReport) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ reports, onUpdateReport, onDeleteReport, onViewImage }) => {
  if (reports.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 min-w-[50px]">Conf.</th>
              <th className="px-4 py-3 min-w-[120px]">Cliente / Sito</th>
              <th className="px-4 py-3 min-w-[100px]">Folio / Ticket</th>
              <th className="px-4 py-3 min-w-[150px]">Trabajo Realizado</th>
              <th className="px-4 py-3 min-w-[100px]">Servicio</th>
              <th className="px-4 py-3 min-w-[100px]">Estado Final</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-4 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${report.confidenceScore >= 8 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {report.confidenceScore}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold">{report.data.cliente}</div>
                  <div className="text-xs text-slate-400">{report.data.sito}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-red-600 font-bold">{report.data.folio}</div>
                  <div className="text-xs text-slate-500">TK: {report.data.ticket}</div>
                </td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 text-xs">{report.data.trabajoRealizado}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{report.data.servicio}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">{report.data.estadoFinal}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onViewImage(report)} className="text-blue-500 hover:text-blue-700">Ver</button>
                    <button onClick={() => onDeleteReport(report.id)} className="text-red-400 hover:text-red-600">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
