import React from 'react';
import { ApplicationError } from '../types/error';
import { ErrorState } from '../../components/Report/ErrorState';
import { captureException } from '@sentry/react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: ApplicationError }>;
}

interface State {
  error: ApplicationError | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      error: {
        code: error.name,
        message: error.message,
        retry: true
      }
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, { extra: info });
  }

  render() {
    const { error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (error) {
      if (Fallback) {
        return <Fallback error={error} />;
      }
      return <ErrorState error={error} />;
    }

    return children;
  }
} 