interface ErrorDetails {
  componentName: string;
  operation: string;
  error: Error;
  timestamp: number;
  userId?: string;
}

class ErrorTracker {
  private static errors: ErrorDetails[] = [];
  private static readonly MAX_ERRORS = 50;

  static trackError(
    componentName: string,
    operation: string,
    error: Error,
    userId?: string
  ) {
    const errorDetails: ErrorDetails = {
      componentName,
      operation,
      error,
      timestamp: Date.now(),
      userId
    };

    this.errors.push(errorDetails);
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift();
    }

    // エラーをサーバーに送信（実装は省略）
    this.sendErrorToServer(errorDetails);
  }

  private static async sendErrorToServer(error: ErrorDetails) {
    // 実装は省略
  }

  static getErrors() {
    return this.errors;
  }
}

export const errorTracker = new ErrorTracker(); 