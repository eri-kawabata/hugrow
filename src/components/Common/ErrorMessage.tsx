import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

type ErrorMessageProps = {
  title: string;
  message: string;
};

export const ErrorMessage = memo(({ title, message }: ErrorMessageProps) => (
  <div className="rounded-lg bg-red-50 p-6">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-6 w-6 text-red-600" />
      <h3 className="text-lg font-semibold text-red-800">{title}</h3>
    </div>
    <p className="mt-2 text-red-700">{message}</p>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage'; 