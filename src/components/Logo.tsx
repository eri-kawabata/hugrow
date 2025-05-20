import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  width = 'auto',
  height = 'auto',
  alt = 'HuGrow Logo'
}) => {
  return (
    <img 
      src="/images/logo.png" 
      alt={alt} 
      width={width} 
      height={height}
      className={`max-w-full h-auto ${className}`}
    />
  );
};

export default Logo; 