export function handleNavigationError(error: Error, retry?: () => Promise<void>) {
  if (error.name === 'AuthenticationError') {
    return {
      message: '認証エラーが発生しました',
      action: () => navigate('/login')
    };
  }
  
  if (error.name === 'NetworkError') {
    return {
      message: '通信エラーが発生しました',
      action: retry
    };
  }
  
  return {
    message: '予期せぬエラーが発生しました',
    action: retry
  };
} 