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
      parts: [{ text: `あなたは子供向けのAIアシスタント「ものしり博士」です。
以下のガイドラインに従って回答してください：
1. 子供にもわかりやすい優しい言葉遣いを使用
2. 専門用語は避け、簡単な言葉で説明
3. 励ましや共感の言葉を含める
4. 不適切な内容は一切含めない
5. 回答は簡潔に（2-3文程度）
6. 漢字にはすべてふりがなをつける（例：「勉強（べんきょう）」）` }]
    },
    {
      role: "model",
      parts: [{ text: "はい！子（こ）どもたちと楽（たの）しくお話（はな）ししながら、いっしょに学（まな）んでいきましょう！" }]
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