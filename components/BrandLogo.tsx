import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'dark' | 'light' | 'emerald';
}

export const BrandLogo: React.FC<LogoProps> = ({ className = "", size = 40, variant = 'dark' }) => {
  const colors = {
    dark: '#0f172a',    // slate-900
    light: '#f8fafc',   // slate-50
    emerald: '#10b981', // emerald-500
  };

  const color = variant === 'emerald' ? colors.emerald : (variant === 'light' ? colors.light : colors.dark);
  const accent = colors.emerald;

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Elegant Solar Disk with Solid Base */}
          <circle cx="50" cy="50" r="44" fill="#f1f5f9" />
          <circle cx="50" cy="50" r="44" stroke={accent} strokeWidth="1" opacity="0.6" />
          <circle cx="50" cy="50" r="40" stroke={accent} strokeWidth="0.5" opacity="0.2" />
          
          {/* Organic Sunspots with Technical Bounding Boxes */}
          <g className="detection-refined">
            {/* Primary Deformed Group */}
            <path 
              d="M38 42C35 38 40 35 44 38C48 40 46 47 42 48C38 49 39 45 38 42Z" 
              fill={color} 
              opacity="0.85" 
            />
            <rect x="32" y="34" width="18" height="20" stroke={accent} strokeWidth="1" rx="2" className="animate-pulse" />
            
            {/* Secondary Deformed Group */}
            <path 
              d="M62 58C60 55 64 53 67 56C69 58 67 63 64 63C61 63 63 60 62 58Z" 
              fill={color} 
              opacity="0.6" 
            />
            <rect x="58" y="52" width="14" height="14" stroke={accent} strokeWidth="1" rx="2" opacity="0.6" />

            {/* Minor Activity Point */}
            <path 
              d="M55 25C54 23 57 22 58 24C59 26 56 27 55 25Z" 
              fill={color} 
              opacity="0.4" 
            />
            <rect x="52" y="21" width="8" height="8" stroke={accent} strokeWidth="0.5" rx="1" opacity="0.3" />
          </g>

          {/* Minimalist Alignment Accents */}
          <line x1="50" y1="2" x2="50" y2="8" stroke={accent} strokeWidth="1" opacity="0.3" />
          <line x1="50" y1="92" x2="50" y2="98" stroke={accent} strokeWidth="1" opacity="0.3" />
          <line x1="2" y1="50" x2="8" y2="50" stroke={accent} strokeWidth="1" opacity="0.3" />
          <line x1="92" y1="50" x2="98" y2="50" stroke={accent} strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      <div className="flex flex-col -space-y-1.5 text-left pl-4" style={{ borderLeft: '2px solid rgba(16, 185, 129, 0.1)' }}>
        <span 
          className="font-black tracking-[-0.04em] text-2xl uppercase leading-none"
          style={{ color: variant === 'light' ? '#ffffff' : '#020617' }}
        >
          Sun<span style={{ color: '#10b981' }}>Spot</span>
        </span>
        <span 
          className="text-[10px] font-black uppercase tracking-[0.35em] opacity-90"
          style={{ color: '#94a3b8' }}
        >
          Monitoreo Solar
        </span>
      </div>
    </div>
  );
};
