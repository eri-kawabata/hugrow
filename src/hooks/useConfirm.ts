import { useState, useContext } from 'react';
import { ConfirmContext } from '../App';

/**
 * 確認ダイアログを表示するためのカスタムフック
 * @returns confirm関数と確認ダイアログの状態
 */
export const useConfirm = () => {
  // グローバルなコンテキストがある場合はそれを使用
  const globalConfirm = useContext(ConfirmContext);
  if (globalConfirm) return globalConfirm;
  
  // ローカルな状態管理（コンテキストがない場合）
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [resolveRef, setResolveRef] = useState<(value: boolean) => void>(() => () => {});

  /**
   * 確認ダイアログを表示する
   * @param title ダイアログのタイトル
   * @param message ダイアログのメッセージ
   * @returns Promiseオブジェクト（ユーザーの選択結果を返す）
   */
  const confirm = (title: string, message: string): Promise<boolean> => {
    setTitle(title);
    setMessage(message);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  };

  /**
   * 確認ダイアログを閉じる
   * @param result ユーザーの選択結果（true: 確認、false: キャンセル）
   */
  const handleClose = (result: boolean) => {
    setIsOpen(false);
    resolveRef(result);
  };

  return {
    confirm,
    isOpen,
    title,
    message,
    onConfirm: () => handleClose(true),
    onCancel: () => handleClose(false),
  };
}; 