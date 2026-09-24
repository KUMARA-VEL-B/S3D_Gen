import React from 'react';
import logoImage from '../assets/images/s3dgen_logo_new.jpg';

interface S3DGenLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'vector' | 'image' | 'badge';
  withGlow?: boolean;
}

export const S3DGenLogo: React.FC<S3DGenLogoProps> = ({
  size = 36,
  className = '',
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative rounded-xl overflow-hidden shadow-md shrink-0 ${className}`}
    >
      <img
        src={logoImage}
        alt="S3DGen Logo"
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
};
