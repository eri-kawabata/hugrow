export type ApplicationError = {
  code: string;
  message: string;
  retry?: boolean;
  redirect?: string;
};

export type ErrorHandlerProps = {
  error: ApplicationError;
  onRetry?: () => Promise<void>;
  onRedirect?: (path: string) => void;
}; 