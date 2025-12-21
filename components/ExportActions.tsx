
import React from 'react';
import { ProcessedReport } from '../types';

interface ExportActionsProps {
  reports: ProcessedReport[];
}

export const ExportActions: React.FC<ExportActionsProps> = ({ reports }) => {
  const downloadCSV = () => {
    const headers = ["Folio", "Fecha", "Sito", "Cliente", "ID Num", "Region", "Ticket", "Tecnicos", "Horario", "Servicio", "Trabajo Realizado", "Observaciones"];
    const rows = reports.map(r => [
      `"${r.data.folio}"`,
      `"${r.data.fecha}"`,
      `"${r.data.sito}"`,
      `"${r.data.cliente}"`,
      `"${r.data.idNum}"`,
      `"${r.data.region}"`,
      `"${r.data.ticket}"`,
      `"${r.data.tecnicos}"`,
      `"${r.data.horarioInicio} - ${r.data.horarioFin}"`,
      `"${r.data.servicio}"`,
      `"${r.data.trabajoRealizado.replace(/\n/g, ' ')}"`,
      `"${r.data.observaciones.replace(/\n/g, ' ')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reportes_iglumex_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
      Exportar Excel
    </button>
  );
};
