import React from 'react';
import { WorkflowStep } from '../types';
import { 
  ChevronDown, 
  Layers, 
  Box, 
  Ruler, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Eye
} from 'lucide-react';

interface DashboardOverviewCardsProps {
  currentStep: WorkflowStep;
  onSelectStep: (step: WorkflowStep) => void;
  onGenerate3D: () => void;
  is3DGenerated: boolean;
  isGenerating3D: boolean;
}

export const DashboardOverviewCards: React.FC<DashboardOverviewCardsProps> = ({
  currentStep,
  onSelectStep,
  onGenerate3D,
  is3DGenerated,
  isGenerating3D,
}) => {
  const getStageTitle = (step: WorkflowStep): { code: string; title: string } => {
    switch (step) {
      case 'video_input':
      case 'video':
        return { code: 'STAGE 01', title: 'Video Ingestion' };
      case 'frame_extraction':
        return { code: 'STAGE 02', title: 'Frame Extraction' };
      case 'frame_selection':
        return { code: 'STAGE 03', title: 'AI Frame Selection' };
      case 'camera_motion':
        return { code: 'STAGE 04', title: 'Camera Motion' };
      case 'spatial_reference':
        return { code: 'STAGE 05', title: 'Spatial Reference' };
      case 'reconstruction_3d':
      case 'synthesis':
        return { code: 'STAGE 06', title: '3D Reconstruction' };
      case 'epistemic_segmentation':
        return { code: 'STAGE 07', title: 'Epistemic Seg' };
      case 'metric_validation':
        return { code: 'STAGE 08', title: 'Metric Validation' };
      case 'final_model':
      case 'inspection':
        return { code: 'STAGE 09', title: '3D Model Explorer' };
      case 'potential_applications':
        return { code: 'STAGE 10', title: 'Applications' };
      default:
        return { code: 'STAGE 09', title: '3D Model Explorer' };
    }
  };

  const active = getStageTitle(currentStep);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
      {/* CARD 1: Pipeline Stage Status (Styled like "Balance" card in the mock) */}
      <div className="bg-[#181820] border border-[#272734] hover:border-[#353546] rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
        {/* Subtle orange accent glow behind */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FF7A00]" />
            <span className="font-semibold text-slate-300">Active Stage</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-[#22222d] border border-[#303040] px-2 py-0.5 rounded-lg text-slate-300">
            <span>{active.code}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        {/* Big Orbitron Value */}
        <div className="my-1.5">
          <div className="font-orbitron font-extrabold text-xl sm:text-2xl text-white tracking-wide truncate">
            {active.title}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Reconstruction Pipeline • High Precision Mode
          </div>
        </div>

        {/* Multi-colored chips like BTC / ETH / USDT in mock */}
        <div className="flex items-center gap-3 my-2 text-[11px] font-mono text-slate-300 border-t border-[#242432] pt-2.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
            <span>18 Keyframes</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>63 Raw</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>4 Classes</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <span className="text-slate-400">Reconstruction Fidelity</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
            +14.5% High
          </span>
        </div>
      </div>

      {/* CARD 2: Photogrammetry & Keyframes (Styled like "Bitcoin" card in mock with action buttons) */}
      <div className="bg-[#181820] border border-[#272734] hover:border-[#353546] rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-300">Keyframe Triage</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-[#22222d] border border-[#303040] px-2 py-0.5 rounded-lg text-slate-300">
            <span>Overlap 82%</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        {/* Big Orbitron Value */}
        <div className="my-1.5 flex items-baseline justify-between">
          <div>
            <div className="font-orbitron font-extrabold text-xl sm:text-2xl text-white tracking-wide">
              18 Keyframes
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              71.43% Redundancy Filtered Out
            </div>
          </div>
          <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-md">
            +5.0%
          </span>
        </div>

        {/* Action Buttons: Exact orange & dark pill buttons from the mock (Swap / Buy / Send) */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#242432]">
          <button
            onClick={() => onSelectStep('frame_selection')}
            className="py-1.5 px-2 rounded-xl bg-[#22222c] hover:bg-[#2c2c38] text-slate-200 hover:text-white text-xs font-orbitron font-semibold transition-all text-center border border-[#303040]"
          >
            Triage
          </button>
          <button
            onClick={() => {
              onSelectStep('reconstruction_3d');
              if (!is3DGenerated && !isGenerating3D) {
                onGenerate3D();
              }
            }}
            className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5000] hover:from-[#FF8C1A] hover:to-[#FF6014] text-white text-xs font-orbitron font-bold shadow-md shadow-orange-950/40 transition-all text-center"
          >
            Recon
          </button>
          <button
            onClick={() => onSelectStep('final_model')}
            className="py-1.5 px-2 rounded-xl bg-[#22222c] hover:bg-[#2c2c38] text-slate-200 hover:text-white text-xs font-orbitron font-semibold transition-all text-center border border-[#303040]"
          >
            3D CAD
          </button>
        </div>
      </div>

      {/* CARD 3: Spatial Truth Bounds (Styled like Ethereum/Card in mock) */}
      <div className="bg-[#181820] border border-[#272734] hover:border-[#353546] rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden md:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Ground Truth Datum</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg text-emerald-300 font-mono">
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Big Orbitron Value */}
        <div className="my-1.5 flex items-baseline justify-between">
          <div>
            <div className="font-orbitron font-extrabold text-xl sm:text-2xl text-white tracking-wide">
              28.0m × 12.0m
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Height: 21.5m • 5 Floors + Rooftop Parapet
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono">RMS TOLERANCE</div>
            <div className="font-orbitron font-bold text-xs text-emerald-400">11.8 mm</div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#242432]">
          <span className="text-xs font-mono text-slate-400">
            Relative Accuracy: &lt; 0.05%
          </span>
          <button
            onClick={() => onSelectStep('metric_validation')}
            className="py-1.5 px-3 rounded-xl bg-[#22222c] hover:bg-[#2c2c38] text-slate-200 hover:text-white text-xs font-orbitron font-semibold transition-all border border-[#303040] flex items-center gap-1"
          >
            <span>Metric Report</span>
            <ArrowRight className="w-3 h-3 text-[#FF7A00]" />
          </button>
        </div>
      </div>
    </div>
  );
};
