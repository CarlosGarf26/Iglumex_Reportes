
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

const SYSTEM_INSTRUCTION = `
Eres un sistema experto en OCR y procesamiento de lenguaje natural especializado en formularios técnicos de IGLÚMEX.
Tu tarea es convertir la imagen o PDF de un reporte de mantenimiento en un objeto JSON estructurado.

REGLAS CRÍTICAS:
1. **Transcripción Manuscrita**: El reporte está lleno a mano. Debes descifrar la caligrafía. Si una palabra es dudosa, usa el contexto técnico (aire acondicionado, voltajes, presiones, limpieza).
2. **Campos de Texto**: Transcribe EXACTAMENTE lo que dice el técnico en 'TRABAJO REALIZADO', 'FALLA' y 'OBSERVACIONES'. No resumas.
3. **Casillas de Verificación**: Identifica qué opción tiene una 'X', una marca de cotejo o un círculo. Devuelve el texto de la opción seleccionada.
4. **Tabla de Materiales**: Procesa todas las filas escritas. Cada fila debe tener 'no', 'unidad', 'nombre' y 'modelo'.
5. **Formato**: Responde ÚNICAMENTE con el JSON, sin texto explicativo.
`;

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    folio: { type: Type.STRING },
    fecha: { type: Type.STRING },
    sito: { type: Type.STRING },
    cliente: { type: Type.STRING },
    idNum: { type: Type.STRING },
    region: { type: Type.STRING },
    ticket: { type: Type.STRING },
    tecnicos: { type: Type.STRING },
    horarioInicio: { type: Type.STRING },
    horarioFin: { type: Type.STRING },
    servicio: { type: Type.STRING },
    falla: { type: Type.STRING },
    condiciones: { type: Type.STRING },
    trabajoRealizado: { type: Type.STRING },
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
    clasificacionFalla: { type: Type.STRING },
    estadoFinal: { type: Type.STRING },
    observaciones: { type: Type.STRING },
    confidenceScore: { type: Type.NUMBER }
  },
  required: ["folio", "cliente", "trabajoRealizado", "confidenceScore"]
};

export async function processReportImage(base64Data: string, mimeType: string, requestedModel: string = 'gemini-3-flash-preview'): Promise<{ data: ReportData, score: number }> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key no configurada.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Limpiar el prefijo data:image/...;base64, si existe
  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    responseSchema: reportSchema,
    temperature: 0.1,
  };

  if (requestedModel.includes('pro')) {
    config.thinkingConfig = { thinkingBudget: 2048 };
  }

  try {
    const response = await ai.models.generateContent({
      model: requestedModel,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Content } },
          { text: "Analiza este documento de IGLÚMEX y extrae toda la información escrita a mano y las casillas marcadas." }
        ]
      },
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("El modelo devolvió una respuesta vacía.");

    // Limpieza de seguridad por si el modelo ignora el responseMimeType
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }

    const parsedData = JSON.parse(cleanJson);
    
    // Asegurar que materiales sea un array
    if (!Array.isArray(parsedData.materiales)) {
      parsedData.materiales = [];
    }

    return {
      data: parsedData as ReportData,
      score: parsedData.confidenceScore || 5
    };
  } catch (err: any) {
    console.error("Error en Gemini Service:", err);
    throw new Error(`Error en transcripción: ${err.message || 'Error desconocido'}`);
  }
}
