import React from 'react';
import logoImage from '../assets/images/s3dgen_logo_1788841492173.jpg';

interface S3DGenLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'vector' | 'image' | 'badge';
  withGlow?: boolean;
}

export const S3DGenLogo: React.FC<S3DGenLogoProps> = ({
  size = 36,
  className = '',
  variant = 'badge',
  withGlow = true,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'image') {
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
  }

  return (
    <div 
      style={{ width: dimension, height: dimension }}
      className={`relative shrink-0 flex items-center justify-center ${withGlow ? 'group' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none"
      >
        <defs>
          {/* Subtle background gradient */}
          <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c2c34" />
            <stop offset="50%" stopColor="#1e1e24" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>

          {/* Orange gradient for 3D cube */}
          <linearGradient id="orangeCube" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>

          {/* Glowing laser scanning cone */}
          <linearGradient id="scanLaser" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FF9500" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF5000" stopOpacity="0.05" />
          </linearGradient>

          {/* Drone body metallic finish */}
          <linearGradient id="droneBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2c36" />
            <stop offset="100%" stopColor="#101014" />
          </linearGradient>
        </defs>

        {/* Badge Rounded Frame (matching the uploaded image badge) */}
        {variant === 'badge' && (
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="22"
            fill="url(#badgeBg)"
            stroke="#3a3a46"
            strokeWidth="1.5"
          />
        )}

        {/* Laser Scanning Projection Lines from Drone Gimbal to 3D Cube */}
        <polygon
          points="50,45 36,58 64,58"
          fill="url(#scanLaser)"
          className="animate-pulse opacity-75"
        />
        <line x1="50" y1="45" x2="36" y2="58" stroke="#FF7A00" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />
        <line x1="50" y1="45" x2="50" y2="52" stroke="#FFAE00" strokeWidth="1" strokeOpacity="0.9" />
        <line x1="50" y1="45" x2="64" y2="58" stroke="#FF7A00" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />

        {/* ========================================================
            3D ISOMETRIC MESH CUBE (Reconstructed Geometric Model)
           ======================================================== */}
        <g id="s3dgen-cube">
          {/* Left Face - Solid Vibrant Orange */}
          <polygon
            points="36,58 50,66 50,85 36,77"
            fill="url(#orangeCube)"
            stroke="#FF5000"
            strokeWidth="0.8"
          />

          {/* Top Face - Dark with Neural Wireframe Triangulation Mesh */}
          <polygon
            points="50,49 64,58 50,66 36,58"
            fill="#181820"
            stroke="#FF7A00"
            strokeWidth="1.2"
          />
          {/* Wireframe edges inside top face */}
          <line x1="50" y1="49" x2="50" y2="66" stroke="#FF9500" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="36" y1="58" x2="64" y2="58" stroke="#FF9500" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="43" y1="53.5" x2="57" y2="62" stroke="#FFAE00" strokeWidth="0.6" strokeOpacity="0.7" />
          <line x1="43" y1="62" x2="57" y2="53.5" stroke="#FFAE00" strokeWidth="0.6" strokeOpacity="0.7" />
          {/* Vertices dots on top face */}
          <circle cx="50" cy="57.5" r="1.2" fill="#FFAE00" />
          <circle cx="43" cy="53.5" r="0.8" fill="#FF7A00" />
          <circle cx="57" cy="53.5" r="0.8" fill="#FF7A00" />

          {/* Right Face - Dark with Orthogonal BIM / Coordinate Grid */}
          <polygon
            points="50,66 64,58 64,77 50,85"
            fill="#121218"
            stroke="#FF7A00"
            strokeWidth="1"
          />
          {/* Vertical grid lines on right face */}
          <line x1="54.6" y1="63.3" x2="54.6" y2="82.3" stroke="#FF7A00" strokeWidth="0.7" strokeOpacity="0.7" />
          <line x1="59.3" y1="60.6" x2="59.3" y2="79.6" stroke="#FF7A00" strokeWidth="0.7" strokeOpacity="0.7" />
          {/* Horizontal grid lines on right face */}
          <line x1="50" y1="72.3" x2="64" y2="64.3" stroke="#FF7A00" strokeWidth="0.7" strokeOpacity="0.7" />
          <line x1="50" y1="78.6" x2="64" y2="70.6" stroke="#FF7A00" strokeWidth="0.7" strokeOpacity="0.7" />
        </g>

        {/* ========================================================
            DRONE (UAV Aerial Photogrammetry Sensor Platform)
           ======================================================== */}
        <g id="s3dgen-drone">
          {/* Left Landing Skid (Curved Leg) */}
          <path
            d="M 43 37 C 37 42 35 48 37 54"
            stroke="#1c1c22"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 43 37 C 37 42 35 48 37 54"
            stroke="#0a0a0d"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Landing Skid (Curved Leg) */}
          <path
            d="M 57 37 C 63 42 65 48 63 54"
            stroke="#1c1c22"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 57 37 C 63 42 65 48 63 54"
            stroke="#0a0a0d"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Main Drone Aerodynamic Fuselage */}
          <path
            d="M 33 34 C 33 31 38 29 50 29 C 62 29 67 31 67 34 C 67 37 61 40 50 40 C 39 40 33 37 33 34 Z"
            fill="url(#droneBody)"
            stroke="#0d0d10"
            strokeWidth="1.2"
          />

          {/* Left Rotor Arm & Motor Mount */}
          <path
            d="M 34 33 L 26 31 L 24 33 L 34 35 Z"
            fill="#15151a"
          />
          <rect x="23" y="30" width="4" height="6" rx="1.5" fill="#24242c" stroke="#0a0a0d" strokeWidth="0.8" />
          {/* Left Propellers (Twin aerodynamic blades) */}
          <ellipse cx="25" cy="30" rx="9" ry="1.5" fill="#0d0d12" />
          <circle cx="25" cy="30" r="1.5" fill="#FF7A00" />

          {/* Right Rotor Arm & Motor Mount */}
          <path
            d="M 66 33 L 74 31 L 76 33 L 66 35 Z"
            fill="#15151a"
          />
          <rect x="73" y="30" width="4" height="6" rx="1.5" fill="#24242c" stroke="#0a0a0d" strokeWidth="0.8" />
          {/* Right Propellers (Twin aerodynamic blades) */}
          <ellipse cx="75" cy="30" rx="9" ry="1.5" fill="#0d0d12" />
          <circle cx="75" cy="30" r="1.5" fill="#FF7A00" />

          {/* Spherical Optical Gimbal Camera */}
          <circle cx="50" cy="43" r="4.2" fill="#141418" stroke="#000000" strokeWidth="1" />
          {/* Glowing Orange Optical Sensor Eye */}
          <circle cx="50" cy="43.5" r="2.4" fill="#FF5000" />
          <circle cx="50" cy="43.5" r="1.3" fill="#FFAE00" />
          <circle cx="49.2" cy="42.7" r="0.6" fill="#FFFFFF" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
};
