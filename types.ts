
export interface Material {
  no: string;
  unidad: string;
  nombre: string;
  modelo: string;
}

export interface ProcessedReport {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  confidenceScore: number; // 1-10
  data: ReportData;
  originalImage?: string; // Base64
  errorMsg?: string;
}

export interface ReportData {
  folio: string;
  fecha: string;
  sito: string;
  cliente: string;
  idNum: string;
  region: string;
  ticket: string;
  tecnicos: string;
  horarioInicio: string;
  horarioFin: string;
  servicio: string; // Casillas de Servicio
  falla: string;
  condiciones: string;
  trabajoRealizado: string;
  materiales: Material[];
  clasificacionFalla: string; // Casillas de Clasificación
  estadoFinal: string; // Casillas de Estado Final
  observaciones: string;
}

export const INITIAL_REPORT_DATA: ReportData = {
  folio: '',
  fecha: '',
  sito: '',
  cliente: '',
  idNum: '',
  region: '',
  ticket: '',
  tecnicos: '',
  horarioInicio: '',
  horarioFin: '',
  servicio: '',
  falla: '',
  condiciones: '',
  trabajoRealizado: '',
  materiales: [],
  clasificacionFalla: '',
  estadoFinal: '',
  observaciones: ''
};

// Logo IGLÚMEX Simplificado
export const DEFAULT_LOGO = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%2080%22%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2240%22%20height%3D%2240%22%20rx%3D%228%22%20fill%3D%22%232563eb%22%2F%3E%3Cpath%20d%3D%22M25%2020l10%2010-10%2010%22%20stroke%3D%22white%22%20stroke-width%3D%224%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%2260%22%20y%3D%2245%22%20font-family%3D%22sans-serif%22%20font-size%3D%2232%22%20font-weight%3D%22900%22%20fill%3D%22%232563eb%22%3EIGL%C3%9AMEX%3C%2Ftext%3E%3C%2Fsvg%3E";
