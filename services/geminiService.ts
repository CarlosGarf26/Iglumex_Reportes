
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

const SYSTEM_INSTRUCTION = `
Eres un experto en digitalización de reportes técnicos manuscritos de la empresa IGLÚMEX.
Tu objetivo es realizar una transcripción 100% fiel del formulario de mantenimiento.

REGLAS DE EXTRACCIÓN:
1. **Letra Manuscrita**: Haz tu mejor esfuerzo por descifrar la letra cursiva o poco legible en las secciones de 'TRABAJO REALIZADO', 'FALLA' y 'OBSERVACIONES'.
2. **Folio**: El folio suele estar en color rojo intenso en la esquina superior derecha (Ej: IG-123456).
3. **Casillas de Verificación (Checkboxes)**: Analiza visualmente las marcas (X, V, o tachaduras) en las secciones de 'SERVICIO', 'CLASIFICACIÓN' y 'ESTADO FINAL'. Selecciona el texto de la opción marcada.
4. **Tabla de Materiales**: Extrae cada fila de la tabla. Si no hay materiales, devuelve una lista vacía.
5. **Formato de Salida**: Debes responder EXCLUSIVAMENTE con un objeto JSON válido que siga el esquema proporcionado.

No inventes datos. Si un campo es totalmente ilegible, coloca "Ilegible".
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
    confidenceScore: { type: Type.NUMBER, description: "Calidad de la imagen del 1 al 10" }
  },
  required: ["folio", "cliente", "trabajoRealizado", "confidenceScore"]
};

export async function processReportImage(base64Data: string, mimeType: string, requestedModel: string = 'gemini-3-flash-preview'): Promise<{ data: ReportData, score: number }> {
  // Inicialización dentro de la función para asegurar el uso de la API Key actual
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const cleanBase64 = base64Data.split(',')[1] || base64Data;
  
  // Configuración de presupuesto de pensamiento si es el modelo Pro
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
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: "Digitaliza este reporte de mantenimiento de IGLÚMEX. Pon especial atención a la letra manuscrita y los campos marcados." }
        ]
      },
      config: config
    });

    const resultText = response.text;
    if (!resultText) throw new Error("El modelo no devolvió texto.");

    // Intentar limpiar posibles bloques de código si el modelo los incluyó a pesar del mimeType
    let cleanJson = resultText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    return {
      data: parsed as ReportData,
      score: parsed.confidenceScore || 5
    };
  } catch (err) {
    console.error("Error en processReportImage:", err);
    throw new Error("No se pudo procesar la imagen. Verifica la calidad o la conexión.");
  }
}
