
import { GoogleGenAI, Type } from "@google/genai";
import { Language, MaisokuData } from "../types";

// Simple in-memory cache to prevent re-processing identical images in the same session
const processingCache = new Map<string, MaisokuData>();

export const extractAndTranslateMaisoku = async (
  base64Image: string, 
  targetLang: Language
): Promise<MaisokuData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: 請檢查環境變數中的 API_KEY 設定。");
  }

  // Check cache first
  const cacheKey = `${base64Image.substring(0, 100)}_${targetLang}`;
  if (processingCache.has(cacheKey)) {
    return processingCache.get(cacheKey)!;
  }

  // Switching to 'gemini-1.5-flash-latest' as it often has a more reliable free-tier capacity for vision tasks
  const MODEL_NAME = 'gemini-1.5-flash-latest';
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this Japanese real estate flyer (Maisoku). 
    Extract key details and translate into ${targetLang}.
    Return JSON ONLY:
    {
       "propertyName": "string",
       "price": "string",
       "location": "string",
       "access": "string",
       "layout": "string",
       "size": "string",
       "builtYear": "string",
       "managementFee": "string",
       "repairFund": "string",
       "features": ["string"],
       "description": "string"
    }
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
        temperature: 0.1, // Lower temperature for more stable JSON output
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

    const text = response.text;
    if (!text) {
      throw new Error("AI 回傳了空的結果。圖片可能太模糊或包含受限內容。");
    }

    const result = JSON.parse(text.trim()) as MaisokuData;
    
    // Store in cache
    processingCache.set(cacheKey, result);
    
    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Improved error messages for the user
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCES_EXHAUSTED")) {
      throw new Error("【額度已滿】Google 免費版 API 每分鐘僅支援少量圖片辨識。請務必「等待 2 分鐘」不要操作後再試一次，或更換一個 Google 帳號重新申請 Key。");
    }
    
    if (errorMsg.includes("404")) {
      throw new Error("【模型錯誤】找不到 AI 模型。請確認您的 API Key 是否支援 Gemini 1.5 系列。");
    }

    if (errorMsg.includes("400")) {
      throw new Error("【請求錯誤】圖片數據過大或格式不正確。請嘗試截圖較小的區域上傳。");
    }

    throw new Error(`分析失敗: ${errorMsg}`);
  }
};
