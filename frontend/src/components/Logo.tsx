import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'light' }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Icon Badge */}
      <div className="relative flex items-center justify-center">
        <div className="p-2.5 rounded-xl bg-[#112240] text-white shadow-md group-hover:bg-[#1E3A8A] transition-colors flex items-center justify-center border border-[#3B82F6]/30">
          <ShieldCheck className={`${iconSizes[size]} text-[#F59E0B]`} />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#F59E0B] text-[#0A192F] p-0.5 rounded-full shadow-sm">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight font-display ${textSizes[size]} text-white`}
        >
          E-Cert<span className="text-[#38BDF8]">Verifier</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] font-bold text-[#F59E0B] tracking-widest uppercase -mt-0.5 font-sans">
            Academic Credential Portal
          </span>
        )}
      </div>
    </div>
  );
};
