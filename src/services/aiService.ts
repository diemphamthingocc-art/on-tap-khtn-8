import { GoogleGenAI, Type } from "@google/genai";

export interface ShortAnswerResult {
  score: number;
  feedback: string;
}

export async function gradeShortAnswers(
  apiKey: string,
  answers: { q: string; a: string; ref: string }[]
): Promise<ShortAnswerResult> {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Bạn là một giáo viên Sinh học giàu kinh nghiệm. Hãy chấm điểm 6 câu tự luận Sinh học 8 (KHTN) của học sinh dựa trên các câu hỏi, câu trả lời của học sinh và đáp án tham khảo được cung cấp dưới đây.

Quy tắc chấm điểm:
1. Tổng điểm tối đa cho cả 6 câu là 2.0 điểm. Mỗi câu tối đa khoảng 0.33 điểm.
2. Hãy đánh giá dựa trên mức độ hiểu bài, không nhất thiết phải đúng từng từ so với đáp án tham khảo nhưng phải đảm bảo đúng ý khoa học.
3. Nếu học sinh trả lời quá ngắn gọn hoặc thiếu ý chính, hãy trừ điểm tương ứng.
4. Nếu học sinh trả lời sai kiến thức cơ bản, hãy cho 0 điểm câu đó.
5. Trả về nhận xét (feedback) mang tính khích lệ, chỉ ra điểm tốt và điểm cần cải thiện một cách ngắn gọn.

Dữ liệu bài làm:
${JSON.stringify(answers, null, 2)}

Trả về kết quả dưới dạng JSON với cấu trúc: {"score": number, "feedback": "nhận xét ngắn gọn, khích lệ"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.NUMBER,
              description: "Tổng điểm của 6 câu, tối đa 2.0"
            },
            feedback: { 
              type: Type.STRING,
              description: "Nhận xét tổng quát về bài làm"
            },
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
