// 不適切な単語やフレーズのリスト
const inappropriateWords = [
  // 暴力的な言葉
  '殺す', '殴る', '叩く', '蹴る', '戦う', '喧嘩',
  // 差別的な言葉
  '差別', '偏見', '人種', '性別',
  // 不適切な性的な言葉
  'セックス', 'エッチ', 'キス', 'デート',
  // その他の不適切な言葉
  '死ね', 'バカ', 'アホ', 'クソ', '糞', 'うんこ',
];

// 不適切な内容をチェックする関数
export const checkInappropriateContent = (text: string): boolean => {
  const normalizedText = text.toLowerCase();
  return inappropriateWords.some(word => normalizedText.includes(word.toLowerCase()));
};

// テキストを安全な形式に変換する関数
export const sanitizeText = (text: string): string => {
  let sanitized = text;
  
  // 不適切な単語を置換
  inappropriateWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '***');
  });

  return sanitized;
};

// メッセージの安全性をチェックする関数
export const validateMessage = (message: string): { isValid: boolean; sanitizedText?: string } => {
  if (checkInappropriateContent(message)) {
    return {
      isValid: false,
      sanitizedText: sanitizeText(message)
    };
  }
  return { isValid: true };
}; 