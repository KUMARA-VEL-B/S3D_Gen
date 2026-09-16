import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Maximize2, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Box, 
  Compass, 
  Video, 
  Filter, 
  Lock, 
  Eye, 
  Ruler, 
  Briefcase,
  Film
} from 'lucide-react';
import { S3DGEN_STAGES } from '../data/s3dgenStages';
import { ProvenanceBadge } from './ProvenanceBadge';
import { WorkflowStep } from '../types';
import { S3DGenLogo } from './S3DGenLogo';

interface PresentationModeViewProps {
  onExit?: () => void;
  onClose?: () => void;
  onJumpToStage: (step: WorkflowStep) => void;
  onOpenJudgeDefense: () => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  onExit,
  onClose,
  onJumpToStage,
  onOpenJudgeDefense,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const handleClose = onExit || onClose || (() => {});

  const stage = S3DGEN_STAGES[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(S3DGEN_STAGES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Render Visual Diagrams per stage
  const renderStageVisual = (step: WorkflowStep) => {
    switch (step) {
      case 'video_input':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-[#ECFAFF] border border-[#BFE8F5] flex items-center justify-center text-[#1B85AE] mb-4">
              <Video className="w-10 h-10" />
            </div>
            <div className="font-mono text-sm font-bold text-[#17324D] mb-1">
              DJI_UAV_Flight_Pass_01.mp4
            </div>
            <div className="text-xs text-[#60758A] font-mono flex items-center gap-2">
              <span>3840×2160 (4K UHD)</span>
              <span>•</span>
              <span>30 FPS</span>
              <span>•</span>
              <span>02:06 Duration</span>
            </div>
            <div className="mt-4 px-3 py-1 rounded-full bg-white border border-[#B9E8D2] text-[11px] text-[#1A9260] font-mono font-semibold">
              ✓ Single-Pass Continuous Flight Sequence
            </div>
          </div>
        );

      case 'frame_extraction':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-xl bg-white border border-[#D8E4EF] text-[#60758A] text-center font-mono">
                <Film className="w-8 h-8 mx-auto mb-1 text-[#8798A8]" />
                <span className="text-[10px]">Continuous Video</span>
              </div>
              <ArrowRight className="w-6 h-6 text-[#1B85AE]" />
              <div className="p-4 rounded-xl bg-[#F0F1FE] border border-[#C9CBF5] text-[#4C4FC4] text-center font-mono">
                <span className="text-2xl font-bold font-mono block">63</span>
                <span className="text-[10px]">Extracted Frames</span>
              </div>
            </div>
            <div className="text-xs text-[#60758A] font-mono text-center">
              Temporal sampling interval: 1 frame every 2.0 seconds
            </div>
          </div>
        );

      case 'frame_selection':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white border border-[#D8E4EF] text-center">
                <span className="text-xl font-bold text-[#17324D] font-mono block">63</span>
                <span className="text-[10px] text-[#60758A] uppercase font-mono">Total Frames</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EAFBF3] border border-[#B9E8D2] text-center">
                <span className="text-xl font-bold text-[#1A9260] font-mono block">18</span>
                <span className="text-[10px] text-[#1A9260] uppercase font-mono font-bold">18 Selected (28.57%)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FDF0EF] border border-[#F3C8C4] text-center">
                <span className="text-xl font-bold text-[#C94343] font-mono block">45</span>
                <span className="text-[10px] text-[#C94343] uppercase font-mono">45 Discarded (71.43%)</span>
              </div>
            </div>
            <div className="text-xs text-[#36526A] font-mono bg-white p-3 rounded-xl border border-[#D8E4EF] text-center">
              <span className="text-[#A6740F] font-semibold">42 Excessive Redundancy (93.3%)</span>
              <span className="mx-2 text-[#D8E4EF]">•</span>
              <span className="text-[#C94343] font-semibold">3 Motion Blur (6.7%)</span>
            </div>
          </div>
        );

      case 'camera_motion':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="w-full max-w-sm h-32 relative border border-[#D8E4EF] rounded-xl bg-white flex items-center justify-center mb-3">
              {/* Elliptical Flight Path Arc */}
              <div className="absolute inset-x-4 inset-y-4 border border-dashed border-[#28BFEF]/50 rounded-full" />
              <div className="absolute top-2 left-8 w-3 h-3 rounded-full bg-[#28BFEF]" />
              <div className="absolute top-2 right-8 w-3 h-3 rounded-full bg-[#28BFEF]" />
              <div className="absolute bottom-2 right-12 w-3 h-3 rounded-full bg-[#28BFEF]" />
              <div className="text-[11px] font-mono text-[#36526A] font-bold bg-white px-2 py-1 rounded border border-[#D8E4EF]">
                Camera Motion Trajectory [DEMO / SIMULATED]
              </div>
            </div>
            <div className="text-xs text-[#60758A] font-mono text-center">
              Epipolar geometry & feature correspondences across sequential keyframes
            </div>
          </div>
        );

      case 'spatial_reference':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center">
            <div className="p-4 rounded-xl bg-white border border-[#BFE8F5] text-center font-mono space-y-2 max-w-md w-full">
              <div className="flex items-center justify-center gap-2 text-[#1B85AE] font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>PROTECTED SPATIAL REFERENCE</span>
              </div>
              <div className="py-2 text-xs text-[#36526A] bg-[#F5F9FD] rounded-lg border border-[#D8E4EF] flex flex-col gap-1">
                <span>Current UAV Observation</span>
                <span className="text-[#1B85AE] font-bold text-sm">+</span>
                <span>Protected Spatial Reference</span>
                <span className="text-[#1B85AE] font-bold text-sm">↓</span>
                <span className="text-[#1A9260] font-semibold">Alignment / Constraint / Reference-Assisted Validation</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8798A8] font-mono mt-3">
              Confidential internal datum; blueprint internals strictly protected
            </div>
          </div>
        );

      case 'reconstruction_3d':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center">
            <div className="w-20 h-20 rounded-2xl bg-[#ECFAFF] border border-[#BFE8F5] flex items-center justify-center text-[#1B85AE] mb-3">
              <Layers className="w-10 h-10" />
            </div>
            <div className="font-mono text-sm font-bold text-[#17324D] mb-1">
              Multi-View Photogrammetric Mesh [DEMO / SIMULATED]
            </div>
            <div className="text-xs text-[#60758A] font-mono text-center max-w-sm">
              Point cloud densification, Poisson surface meshing, and UV texture projection
            </div>
          </div>
        );

      case 'epistemic_segmentation':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-2.5 rounded-lg bg-[#EAFBF3] border border-[#B9E8D2] text-[#1A9260] text-xs font-mono font-bold flex flex-col gap-0.5">
                <span>1. OBSERVED</span>
                <span className="text-[10px] text-[#1A9260] font-normal">Direct UAV Sightlines</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#ECFAFF] border border-[#BFE8F5] text-[#1B85AE] text-xs font-mono font-bold flex flex-col gap-0.5">
                <span>2. REF-SUPPORTED</span>
                <span className="text-[10px] text-[#1B85AE] font-normal">Spatial Constraint Prior</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FDF6E7] border border-[#F0DBA6] text-[#A6740F] text-xs font-mono font-bold flex flex-col gap-0.5">
                <span>3. INFERRED</span>
                <span className="text-[10px] text-[#A6740F] font-normal">Continuity & Symmetry</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FDF0EF] border border-[#F3C8C4] text-[#C94343] text-xs font-mono font-bold flex flex-col gap-0.5">
                <span>4. UNKNOWN</span>
                <span className="text-[10px] text-[#C94343] font-normal">Occluded Shadow Zones</span>
              </div>
            </div>
            <div className="text-xs text-[#60758A] font-mono text-center">
              Evidentiary classification ensures zero false geometric claims
            </div>
          </div>
        );

      case 'metric_validation':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center">
            <div className="p-3 bg-white border border-[#D8E4EF] rounded-xl mb-3 font-mono text-xs text-center space-y-1">
              <div className="text-[#1B85AE] font-bold">
                Absolute Error = |Reconstructed − Reference|
              </div>
              <div className="text-[#1A9260] font-semibold">
                Relative Error (%) = (|Reconstructed − Reference| / Reference) × 100
              </div>
            </div>
            <div className="p-2.5 bg-[#FDF6E7] border border-[#F0DBA6] rounded-xl text-center text-xs text-[#A6740F] font-mono">
              VISUAL QUALITY ≠ GEOMETRIC QUALITY ≠ METRIC ACCURACY
            </div>
          </div>
        );

      case 'final_model':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center items-center">
            <div className="w-20 h-20 rounded-2xl bg-[#EAFBF3] border border-[#B9E8D2] flex items-center justify-center text-[#1A9260] mb-3">
              <Box className="w-10 h-10" />
            </div>
            <div className="font-mono text-sm font-bold text-[#17324D] mb-1">
              3D Model — Prototype Output
            </div>
            <div className="text-xs text-[#60758A] font-mono text-center">
              PBR / Wireframe / Epistemic / Point Cloud Shaders & Spatial Inspection
            </div>
          </div>
        );

      case 'potential_applications':
        return (
          <div className="w-full h-full min-h-[280px] rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] p-6 flex flex-col justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-[11px] font-mono">
              <div className="p-2 rounded bg-white border border-[#D8E4EF] text-[#36526A] text-center">
                Infrastructure Inspection
              </div>
              <div className="p-2 rounded bg-white border border-[#D8E4EF] text-[#36526A] text-center">
                Disaster Assessment
              </div>
              <div className="p-2 rounded bg-white border border-[#D8E4EF] text-[#36526A] text-center">
                Digital Twin BIM
              </div>
              <div className="p-2 rounded bg-white border border-[#D8E4EF] text-[#36526A] text-center">
                Urban Planning
              </div>
              <div className="p-2 rounded bg-white border border-[#D8E4EF] text-[#36526A] text-center sm:col-span-2">
                Defense & Strategic Mapping
              </div>
            </div>
            <div className="text-xs text-[#6A5CD6] font-mono text-center">
              [PLANNED / FUTURE] Multi-sector deployment architecture
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 flex flex-col gap-4 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between glass-panel p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="btn-secondary-glass flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Presentation</span>
          </button>
          <div className="h-5 w-px bg-[#D8E4EF]" />
          <div className="flex items-center gap-2 text-xs font-mono text-[#36526A]">
            <S3DGenLogo size={22} variant="vector" />
            <span className="text-[#1B85AE] font-bold">S3DGen Presentation Mode</span> • Stage {stage.stageNumber} of 10
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenJudgeDefense}
            className="btn-secondary-glass flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[#1B85AE] text-xs font-mono font-bold"
          >
            <HelpCircle className="w-4 h-4 text-[#1B85AE]" />
            <span>Technical Defense Matrix (14 Q&A)</span>
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-[#D8E4EF] p-6 sm:p-8 rounded-3xl shadow-[0_12px_40px_rgba(50,90,125,0.10)] relative overflow-hidden">
        {/* Left Column: Visual Diagram */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {renderStageVisual(stage.step)}
        </div>

        {/* Right Column: Clear Story & Data Provenance */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#1B85AE] bg-[#ECFAFF] border border-[#BFE8F5] px-2.5 py-1 rounded-lg">
                {stage.stageCode}
              </span>
              <ProvenanceBadge type={stage.provenance} size="md" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#17324D] font-mono tracking-tight">
              {stage.title}
            </h2>

            <p className="text-sm text-[#60758A] font-mono">
              {stage.subtitle}
            </p>

            {/* 1 Short Explanation */}
            <div className="p-4 rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#1B85AE] font-bold">
                Concept & Functionality:
              </div>
              <p className="text-sm text-[#243447] leading-relaxed font-sans font-medium">
                {stage.oneLineExplanation}
              </p>
            </div>

            {/* 1 Key Output */}
            <div className="p-4 rounded-2xl bg-[#F5F9FD] border border-[#D8E4EF] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#1A9260] font-bold">
                Key Output Generated:
              </div>
              <div className="text-xs text-[#1A9260] font-mono font-semibold">
                {stage.keyOutput}
              </div>
            </div>

            {/* Technical Reality */}
            <div className="p-3 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-xs font-mono text-[#60758A]">
              <span className="text-[#243447] font-semibold">Technical Reality: </span>
              {stage.technicalReality}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EEF4FA]">
            <button
              onClick={() => onJumpToStage(stage.step)}
              className="btn-primary-cyan flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold"
            >
              <span>Explore Interactive Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono text-[#8798A8]">
              Use ← → arrow keys to navigate
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Stepper Dots & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel px-6 py-4">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="btn-secondary-glass flex items-center gap-1.5 px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Stage</span>
        </button>

        {/* 10 Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {S3DGEN_STAGES.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                idx === currentSlideIndex
                  ? 'bg-gradient-to-br from-[#28BFEF] to-[#3287E8] text-white shadow-md'
                  : 'bg-[#F0F8FF] text-[#8798A8] border border-[#D8E4EF] hover:bg-[#ECFAFF] hover:text-[#17324D]'
              }`}
              title={s.title}
            >
              {s.stageNumber}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(S3DGEN_STAGES.length - 1, prev + 1))}
          disabled={currentSlideIndex === S3DGEN_STAGES.length - 1}
          className="btn-primary-cyan flex items-center gap-1.5 px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-semibold"
        >
          <span>Next Stage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
