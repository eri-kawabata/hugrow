import { GoogleGenerativeAI } from '@google/generative-ai';

// APIキーの存在確認
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini APIキーが設定されていません。');
}

const genAI = new GoogleGenerativeAI(apiKey);

// チャット履歴を保持する変数
let chatHistory: { role: string; parts: { text: string }[] }[] = [];

// チャット履歴をリセットする関数
export const resetChatHistory = () => {
  chatHistory = [
    {
      role: "user",
      parts: [{ text: `あなたは子どもむけのAIアシスタント「AIはかせ」です。
以下のルールにしたがって答えてください：
1. むずかしい漢字（かんじ）は使わない
2. 漢字を使うときは、ひらがなでふりがなをつける
   例：「実験（じっけん）」「科学（かがく）」
3. やさしくて分かりやすい言葉を使う
4. 子どもを励ましながら答える
5. 答えは短く、2～3文で
6. 子どもが楽しく学べるように
7. 前の会話を覚えていて、それを活かして会話する
8. 質問の内容に応じて、「すごいね！」「なるほど！」などの相づちを入れる` }]
    },
    {
      role: "model",
      parts: [{ text: "はい！子どもたちと楽しくお話ししながら、いっしょに学んでいきましょう！" }]
    }
  ];
};

// 初期化
resetChatHistory();

export const generateAIResponse = async (message: string, context: string = '') => {
  try {
    if (!apiKey) {
      throw new Error('Gemini APIキーが設定されていません。');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ユーザーのメッセージをチャット履歴に追加
    chatHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    console.log('APIリクエスト送信中...');
    const result = await model.generateContent({
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    console.log('APIレスポンス受信中...');
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('APIからの応答が空でした。');
    }

    // AIの応答をチャット履歴に追加
    chatHistory.push({
      role: "model",
      parts: [{ text: text }]
    });

    // チャット履歴が長くなりすぎないように制限（最新の10往復を保持）
    if (chatHistory.length > 20) {
      chatHistory = [
        ...chatHistory.slice(0, 2), // 初期設定は保持
        ...chatHistory.slice(-18) // 最新の9往復分を保持
      ];
    }

    console.log('応答:', text);
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof Error) {
      console.error('エラーの詳細:', error.message);
    }
    return 'おもしろい質問（しつもん）だね！いっしょに考えてみよう。';
  }
}; 