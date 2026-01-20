
import { GoogleGenAI, Type } from "@google/genai";
import { Language, MaisokuData } from "../types";

export const extractAndTranslateMaisoku = async (
  base64Image: string, 
  targetLang: Language
): Promise<MaisokuData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: APIキーが設定されていません。環境変数を確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this Japanese real estate flyer (Maisoku). 
    1. Extract all key property details accurately.
    2. Translate all information into ${targetLang}.
    3. Return ONLY a valid JSON object with the following schema:
       propertyName: The main name of the building or project.
       price: The selling price or rent.
       location: Address.
       access: Nearest station and walking distance.
       layout: Floor plan type (e.g., 2LDK).
       size: Area in square meters (m2).
       builtYear: Construction date.
       managementFee: Monthly fees.
       repairFund: Repair reserve fund.
       features: List of top 5 features (e.g., Balcony, South-facing).
       description: A short marketing summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using a stable flash model version for reliability
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            propertyName: { type: Type.STRING },
            price: { type: Type.STRING },
            location: { type: Type.STRING },
            access: { type: Type.STRING },
            layout: { type: Type.STRING },
            size: { type: Type.STRING },
            builtYear: { type: Type.STRING },
            managementFee: { type: Type.STRING },
            repairFund: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
          },
          required: ["propertyName", "price", "location"]
        }
      }
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE: AIからの応答が空です。画像の解像度を上げてください。");
    }

    return JSON.parse(response.text.trim()) as MaisokuData;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("INVALID_KEY: APIキーが無効です。");
    }
    throw error;
  }
};
