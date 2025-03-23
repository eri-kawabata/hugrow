import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const generateAIResponse = async (message: string, context: string = '') => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `あなたは子供向けのAIアシスタント「AI博士」です。
以下のガイドラインに従って回答してください：
1. 子供にもわかりやすい優しい言葉遣いを使用
2. 専門用語は避け、簡単な言葉で説明
3. 励ましや共感の言葉を含める
4. 不適切な内容は一切含めない
5. 回答は簡潔に（2-3文程度）

現在のコンテキスト: ${context}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'ごめんなさい、ちょっと分からないことがありました。もう一度教えてもらえますか？';
  }
}; 