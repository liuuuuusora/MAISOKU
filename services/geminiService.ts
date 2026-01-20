
import { GoogleGenAI, Type } from "@google/genai";
import { Language, MaisokuData } from "../types";

export const extractAndTranslateMaisoku = async (
  base64Image: string, 
  targetLang: Language
): Promise<MaisokuData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: 找不到 API 金鑰。請在設定中添加 API_KEY 環境變數。");
  }

  // Use 'gemini-2.0-flash' which is the current stable reference for the latest flash model
  // This avoids the 404 error and provides the best performance for OCR/Translation
  const MODEL_NAME = 'gemini-2.0-flash';
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
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      ],
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
      throw new Error("EMPTY_RESPONSE: AI 傳回內容為空。請嘗試上傳更清晰的圖片。");
    }

    return JSON.parse(response.text.trim()) as MaisokuData;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    // Handle model not found or other API versioning issues
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("MODEL_NOT_FOUND: 無法連線到指定的 AI 模型。這通常是 API 版本更新導致，請聯絡開發者更新模型名稱。");
    }
    
    // Detailed check for 429 quota error
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("QUOTA_EXHAUSTED: 免費額度暫時用完。請「等待 60 秒」後再重試。這不是程式錯誤，而是 Google 的免費流量限制。");
    }
    
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
      throw new Error("INVALID_KEY: API 金鑰無效。請確認您的 API Key 是否正確且已啟用。");
    }
    
    throw new Error(error.message || "解析失敗。請確認圖片清晰度或稍後再試。");
  }
};
