import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export const AccessibleCard = forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="region"
        aria-label={title}
        tabIndex={0}
        {...props}
      >
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {children}
      </div>
    );
  }
); 