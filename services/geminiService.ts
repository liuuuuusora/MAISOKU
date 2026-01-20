
import { GoogleGenAI, Type } from "@google/genai";
import { Language, MaisokuData } from "../types";

const processingCache = new Map<string, MaisokuData>();

export const extractAndTranslateMaisoku = async (
  base64Image: string, 
  targetLang: Language
): Promise<MaisokuData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: 找不到 API 金鑰。");
  }

  const cacheKey = `${base64Image.substring(0, 100)}_${targetLang}`;
  if (processingCache.has(cacheKey)) {
    return processingCache.get(cacheKey)!;
  }

  const MODEL_NAME = 'gemini-3-flash-preview';
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert Real Estate Consultant. Extract and Translate EVERYTHING from this Japanese property flyer (Maisoku) into ${targetLang}.

  CRITICAL IMAGE TASK:
  Your output JSON should include "extractedImage" as the SAME base64 data provided, BUT your internal logic should focus on understanding the visual context.
  
  STRICT TRANSLATION RULES:
  1. ABSOLUTELY NO JAPANESE characters in output. 
  2. "restrictions": Identify and translate zoning/building limits like "用途地域", "防火地域", "建蔽率/容積率" fully.
  3. "facilities": Translate all equipment terms into ${targetLang}.

  JSON structure:
  {
     "propertyName": "Property Name",
     "price": "Price with currency",
     "location": "Localized Address",
     "access": "Transport details",
     "layout": "Room layout",
     "size": "Area size",
     "builtYear": "Year/Month built",
     "managementFee": "Monthly fee",
     "repairFund": "Monthly fund",
     "coverageRatio": "Building Coverage %",
     "floorAreaRatio": "FAR %",
     "facilities": "Facilities list",
     "floor": "Floor level",
     "restrictions": "Zoning and Building Restrictions",
     "features": ["Feature 1", "Feature 2"],
     "description": "Short marketing summary"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("AI returned empty response.");

    const result = JSON.parse(responseText.trim()) as MaisokuData;
    processingCache.set(cacheKey, result);
    return result;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`分析失敗: ${error.message || "Unknown error"}`);
  }
};
