
import { GoogleGenAI, Type } from "@google/genai";
import { Language, MaisokuData } from "../types";

// 快取機制：避免重複請求同一張圖
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

  // 使用最新且最穩定的 gemini-2.0-flash
  const MODEL_NAME = 'gemini-2.0-flash';
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `你是一個專業的不動產分析師。請分析這張日本不動產廣告(マイソク)，提取資訊並翻譯成${targetLang}。
  必須嚴格遵守以下 JSON 格式回傳，不要包含任何額外文字：
  {
     "propertyName": "物業名稱",
     "price": "價格(含幣值)",
     "location": "地址",
     "access": "交通資訊",
     "layout": "格局(如2LDK)",
     "size": "面積",
     "builtYear": "建築年份",
     "managementFee": "管理費",
     "repairFund": "修繕積立金",
     "features": ["特點1", "特點2", "特點3"],
     "description": "簡短的推廣描述"
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
        // 使用 JSON 模式確保回傳格式正確
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("EMPTY_RESPONSE: AI 回傳內容為空。");
    }

    try {
      const result = JSON.parse(responseText.trim()) as MaisokuData;
      processingCache.set(cacheKey, result);
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText);
      throw new Error("解析 AI 回傳格式失敗，請重試。");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const status = error.status || "";
    const message = error.message || "";

    // 處理 429 流量限制
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("【流量限制】您的 API Key 免費額度已達上限。請「等待 60-120 秒」再點擊。如果持續出現，建議換一個 Google 帳號申請 Key，或在 Google Cloud 啟動付費模式（每張圖約 $0.1 台幣）。");
    }
    
    // 處理 404 模型找不到
    if (message.includes("404") || message.includes("not found")) {
      throw new Error("【模型錯誤】模型 ID 'gemini-2.0-flash' 無法使用。這可能是因為您的 API Key 權限受限，請確認是否為 API Key 所在的專案已啟用 Gemini API。");
    }

    throw new Error(`分析失敗: ${message}`);
  }
};
