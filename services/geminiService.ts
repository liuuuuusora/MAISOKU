
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
  
  const prompt = `You are a professional real estate data analyst. 
  1. Analyze the Japanese property flyer (Maisoku).
  2. Extract all details and translate them perfectly into ${targetLang}.
  3. Visual Recognition: Focus on identifying the property photos (facade, rooms, floorplan) separately from text overlays.
  
  STRICT TRANSLATION RULES:
  - NO JAPANESE characters in the output JSON. 
  - Translate property terminology accurately (e.g., "RC" -> "Reinforced Concrete").
  - "restrictions": Fully translate Zoning laws (用途地域), Building coverage ratios, etc.
  - "facilities": List specific equipment like Auto-lock, System Kitchen, etc.

  Output MUST be valid JSON:
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
     "features": ["Key Feature 1", "Key Feature 2"],
     "description": "Professional real estate summary"
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
