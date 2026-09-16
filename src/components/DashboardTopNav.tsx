import React from 'react';
import { 
  FileText, 
  RotateCcw, 
  Sliders, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { WorkflowStep } from '../types';
import { S3DGenLogo } from './S3DGenLogo';

interface DashboardTopNavProps {
  onOpenReport: () => void;
  onReset: () => void;
  onSelectStep: (step: WorkflowStep) => void;
  currentStep: WorkflowStep;
  onOpenPresentationMode?: () => void;
  onOpenJudgeDefense?: () => void;
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  onOpenReport,
  onReset,
  onSelectStep,
  currentStep,
  onOpenPresentationMode,
  onOpenJudgeDefense,
}) => {
  const getStageTitle = (step: WorkflowStep): { stage: string; name: string } => {
    switch (step) {
      case 'video_input':
      case 'video':
        return { stage: 'Stage 01', name: 'Input Video' };
      case 'frame_extraction':
        return { stage: 'Stage 02', name: 'Frame Extraction' };
      case 'frame_selection':
        return { stage: 'Stage 03', name: 'Frame Selection' };
      case 'camera_motion':
      case 'spatial_reference':
      case 'reconstruction_3d':
      case 'synthesis':
        return { stage: 'Stage 04', name: '3D Reconstruction' };
      case 'epistemic_segmentation':
      case 'metric_validation':
      case 'final_model':
      case 'inspection':
        return { stage: 'Stage 05', name: 'Final 3D Model' };
      case 'potential_applications':
        return { stage: 'Stage 06', name: 'Applications' };
      default:
        return { stage: 'Stage 01', name: 'Input Video' };
    }
  };

  const activeStage = getStageTitle(currentStep);

  return (
    <header className="h-14 bg-[rgba(255,255,255,0.82)] backdrop-blur-[18px] border-b border-[#D8E4EF] px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0 shadow-[0_4px_18px_rgba(50,90,125,0.05)] relative">
      {/* Brand Identity */}
      <div 
        onClick={() => onSelectStep('video_input')}
        className="flex items-center gap-3 shrink-0 cursor-pointer group"
      >
        <S3DGenLogo 
          size={34} 
          variant="badge" 
          className="transition-transform group-hover:scale-105 duration-200" 
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-brand text-lg bg-gradient-to-r from-[#28BFEF] via-[#3287E8] to-[#7567E8] bg-clip-text text-transparent tracking-wide">
              S3DGen
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#ECFAFF] text-[#17324D] border border-[rgba(40,191,239,0.35)] font-semibold">
              UAV 3D
            </span>
          </div>
          <span className="text-[10px] text-[#60758A] font-sans -mt-0.5">
            Single-Pass Reconstruction
          </span>
        </div>
      </div>

      {/* Active Stage Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[rgba(255,255,255,0.78)] border border-[#D8E4EF] shadow-sm">
        <Layers className="w-3.5 h-3.5 text-[#28BFEF]" />
        <span className="text-xs font-mono font-bold text-[#28BFEF]">{activeStage.stage}</span>
        <span className="text-xs text-[#8798A8]">/</span>
        <span className="text-xs font-medium text-[#17324D]">{activeStage.name}</span>
      </div>

      {/* Actions: Presentation, Audit Report, Defense, and Global RESET */}
      <div className="flex items-center gap-2 ml-auto">
        {onOpenPresentationMode && (
          <button
            onClick={onOpenPresentationMode}
            title="Overview Walkthrough"
            className="btn-secondary-glass flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[#28BFEF]" />
            <span className="hidden lg:inline">Walkthrough</span>
          </button>
        )}

        {onOpenJudgeDefense && (
          <button
            onClick={onOpenJudgeDefense}
            title="Technical Methodology & Defense"
            className="btn-secondary-glass flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#22B573]" />
            <span className="hidden lg:inline">Methodology</span>
          </button>
        )}

        <button
          onClick={onOpenReport}
          title="Inspection & Validation Dossier"
          className="btn-secondary-glass flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          <FileText className="w-3.5 h-3.5 text-[#28BFEF]" />
          <span className="hidden sm:inline">Audit Dossier</span>
        </button>

        {/* STRICT RESET ACTION - Restrained light danger style */}
        <button
          onClick={onReset}
          id="global-reset-btn"
          title="Reset application to initial state (Stage 01)"
          className="btn-reset flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>
    </header>
  );
};
