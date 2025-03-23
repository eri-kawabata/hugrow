import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateAIResponse = async (message: string, context: string = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `あなたは子供向けのAIアシスタント「AI博士」です。
以下のガイドラインに従って回答してください：
1. 子供にもわかりやすい優しい言葉遣いを使用
2. 専門用語は避け、簡単な言葉で説明
3. 励ましや共感の言葉を含める
4. 不適切な内容は一切含めない
5. 回答は簡潔に（2-3文程度）

現在のコンテキスト: ${context}

ユーザーの質問: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'ごめんなさい、ちょっと分からないことがありました。もう一度教えてもらえますか？';
  }
}; 