/**
 * 日付をフォーマットする関数
 * @param dateString - フォーマットする日付文字列またはDate型
 * @param locale - 使用するロケール（デフォルトは日本語）
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString: string | Date, locale: string = 'ja-JP'): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // 無効な日付の場合は空文字を返す
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error);
    return '';
  }
}; 