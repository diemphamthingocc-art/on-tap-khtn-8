import { GoogleGenAI, Type } from "@google/genai";

export interface ShortAnswerResult {
  score: number;
  feedback: string;
}

export async function gradeShortAnswers(
  apiKey: string,
  answers: { q: string; a: string }[]
): Promise<ShortAnswerResult> {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Bạn là một giáo viên Sinh học. Hãy chấm điểm 6 câu tự luận Sinh học 8 (KHTN) sau đây. 
  Tổng điểm tối đa cho phần này là 2.0 điểm. 
  Hãy phân tích ý hiểu của học sinh so với kiến thức chuẩn.
  Trả về kết quả dưới dạng JSON với cấu trúc: {"score": number, "feedback": "nhận xét ngắn gọn, khích lệ"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + JSON.stringify(answers),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
          required: ["score", "feedback"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ShortAnswerResult;
  } catch (error) {
    console.error("AI Grading Error:", error);
    return {
      score: 0,
      feedback: "Không thể kết nối với AI để chấm điểm tự luận. Vui lòng kiểm tra lại kết nối.",
    };
  }
}
