import React from 'react';
import { 
  Compass, 
  Layers, 
  Radio, 
  FileText, 
  MapPin, 
  Cpu, 
  RotateCcw,
  Sparkles,
  Maximize2,
  Sliders,
  CheckCircle2,
  Box,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { GROUND_TRUTH_BUILDING } from '../data/groundTruth';

interface HeaderProps {
  onOpenReport: () => void;
  onReset: () => void;
  onOpenPresentationMode?: () => void;
  onOpenJudgeDefense?: () => void;
  is3DGenerated: boolean;
  activeMode: string;
  damageType?: string;
  comparisonSlider?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReport,
  onReset,
  onOpenPresentationMode,
  onOpenJudgeDefense,
  is3DGenerated,
  activeMode,
  damageType = 'none',
  comparisonSlider = 0,
}) => {
  const isDamaged = (activeMode === 'damage' || (activeMode === 'reconstruction' && (comparisonSlider ?? 0) < 100)) && damageType !== 'none';
  const isReconstructed = activeMode === 'reconstruction' && comparisonSlider === 100;

  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Project Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Box className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                S3DGen
              </h1>
              <span className="text-xs text-slate-300 hidden md:inline font-mono">
                | Single-Pass UAV Video to Accurate 3D Model Generation
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {onOpenPresentationMode && (
            <button
              onClick={onOpenPresentationMode}
              id="header-walkthrough-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Walkthrough</span>
            </button>
          )}

          {onOpenJudgeDefense && (
            <button
              onClick={onOpenJudgeDefense}
              id="header-defense-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Methodology</span>
            </button>
          )}

          <button
            onClick={onOpenReport}
            id="header-report-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Audit Dossier</span>
          </button>

          <button
            onClick={onReset}
            id="header-reset-btn"
            title="Reset Workflow"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-[#FF9F43] hover:text-[#ffb168] border border-[#FF9F43]/40 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
};
