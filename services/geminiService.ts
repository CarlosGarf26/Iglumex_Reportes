
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ReportData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Eres un experto en digitalización de reportes de mantenimiento de la empresa IGLÚMEX.
Tu tarea es realizar una transcripción COMPLETA, LITERAL y FIDEDIGNA del formulario de mantenimiento de aires acondicionados.

INSTRUCCIONES ESPECÍFICAS:
1. **Folio (N°)**: Extrae el número rojo en la esquina superior derecha (ej. IG-0000001) en 'folio'.
2. **Encabezado**: Extrae SITO, CLIENTE, N° ID, REGIÓN, TICKET y FECHA.
3. **Secciones de Texto**: Transcribe íntegramente PERSONAL TÉCNICO, FALLA, CONDICIONES ENCONTRADAS, TRABAJO REALIZADO y OBSERVACIONES ADICIONALES.
4. **Horario**: Extrae Horario Inicio y Fin.
5. **Checkboxes**: Identifica las marcas (X o check) en:
   - SERVICIO (Preventivo, Correctivo, Instalación, etc.)
   - CLASIFICACIÓN DE LA FALLA (Electrónica, Eléctrica, Mecánica, etc.)
   - ESTADO FINAL (Reparación Total, Parcial, Pendiente)
6. **Materiales**: Extrae la tabla de materiales (N°, Unidad, Nombre, Modelo) como una lista de objetos.

Si un campo está vacío o es ilegible, déjalo como cadena vacía o lista vacía.
`;

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    folio: { type: Type.STRING, description: "Número de folio IG-XXXXXXX" },
    fecha: { type: Type.STRING, description: "Fecha del reporte" },
    sito: { type: Type.STRING, description: "Ubicación o Sito" },
    cliente: { type: Type.STRING, description: "Nombre del cliente" },
    idNum: { type: Type.STRING, description: "Número de ID" },
    region: { type: Type.STRING, description: "Región" },
    ticket: { type: Type.STRING, description: "Número de Ticket" },
    tecnicos: { type: Type.STRING, description: "Personal técnico" },
    horarioInicio: { type: Type.STRING, description: "Hora de inicio" },
    horarioFin: { type: Type.STRING, description: "Hora de fin" },
    servicio: { type: Type.STRING, description: "Opciones marcadas en SERVICIO" },
    falla: { type: Type.STRING, description: "Descripción de la falla" },
    condiciones: { type: Type.STRING, description: "Condiciones encontradas" },
    trabajoRealizado: { type: Type.STRING, description: "Detalle del trabajo realizado" },
    materiales: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          no: { type: Type.STRING },
          unidad: { type: Type.STRING },
          nombre: { type: Type.STRING },
          modelo: { type: Type.STRING }
        }
      }
    },
    clasificacionFalla: { type: Type.STRING, description: "Opciones marcadas en CLASIFICACIÓN DE LA FALLA" },
    estadoFinal: { type: Type.STRING, description: "Opciones marcadas en ESTADO FINAL" },
    observaciones: { type: Type.STRING, description: "Observaciones adicionales" },
    confidenceScore: { type: Type.NUMBER, description: "Puntaje de legibilidad 1-10" }
  },
  required: ["folio", "sito", "trabajoRealizado", "confidenceScore"]
};

const extractJSON = (text: string): string => {
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

export async function processReportImage(base64Data: string, mimeType: string, requestedModel: string = 'gemini-3-flash-preview'): Promise<{ data: ReportData, score: number }> {
  const cleanBase64 = base64Data.split(',')[1] || base64Data;
  
  const response = await ai.models.generateContent({
    model: requestedModel,
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType, data: cleanBase64 } },
        { text: "Extrae los datos de este reporte de mantenimiento de IGLÚMEX en formato JSON." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: reportSchema,
      temperature: 0.1,
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("No se obtuvo respuesta del modelo.");

  const jsonStr = extractJSON(resultText);
  const parsed = JSON.parse(jsonStr);

  return {
    data: parsed as ReportData,
    score: parsed.confidenceScore || 5
  };
}
