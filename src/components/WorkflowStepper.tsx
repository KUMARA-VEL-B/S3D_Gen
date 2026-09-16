import React from 'react';
import { 
  Video, 
  Film,
  Filter, 
  Lock, 
  Layers,
  Box,
  Briefcase,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { WorkflowStep, StageStatus } from '../types';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  onSelectStep: (step: WorkflowStep) => void;
  stageStatuses: Record<WorkflowStep, StageStatus>;
}

interface VisibleWorkflowStage {
  step: WorkflowStep;
  stageNumber: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VISIBLE_STAGES: VisibleWorkflowStage[] = [
  {
    step: 'video_input',
    stageNumber: '01',
    title: 'Input Video',
    shortTitle: 'Input Video',
    icon: Video,
  },
  {
    step: 'frame_extraction',
    stageNumber: '02',
    title: 'Frame Extraction',
    shortTitle: 'Frame Extraction',
    icon: Film,
  },
  {
    step: 'frame_selection',
    stageNumber: '03',
    title: 'Frame Selection',
    shortTitle: 'Frame Selection',
    icon: Filter,
  },
  {
    step: 'reconstruction_3d',
    stageNumber: '04',
    title: '3D Reconstruction',
    shortTitle: '3D Reconstruction',
    icon: Layers,
  },
  {
    step: 'final_model',
    stageNumber: '05',
    title: 'Final 3D Model',
    shortTitle: 'Final 3D Model',
    icon: Box,
  },
  {
    step: 'potential_applications',
    stageNumber: '06',
    title: 'Applications',
    shortTitle: 'Applications',
    icon: Briefcase,
  },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onSelectStep,
  stageStatuses,
}) => {
  // Normalize internal / alias steps to the 6 visible stage keys
  const getActiveVisibleStep = (step: WorkflowStep): WorkflowStep => {
    if (step === 'video') return 'video_input';
    if (step === 'camera_motion' || step === 'spatial_reference' || step === 'synthesis') {
      return 'reconstruction_3d';
    }
    if (step === 'epistemic_segmentation' || step === 'metric_validation' || step === 'inspection') {
      return 'final_model';
    }
    return step;
  };

  const activeKey = getActiveVisibleStep(currentStep);

  return (
    <div className="w-full bg-[rgba(255,255,255,0.78)] backdrop-blur-[14px] border-b border-[#D8E4EF] px-4 py-2 text-xs font-mono shadow-[0_4px_16px_rgba(50,90,125,0.06)] z-20 relative">
      <div className="max-w-[1920px] mx-auto">
        {/* Visible 6 Pipeline Stages Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {VISIBLE_STAGES.map((s) => {
            const Icon = s.icon;
            const isSelected = activeKey === s.step;
            const status = stageStatuses[s.step] || 'LOCKED';
            const isLocked = status === 'LOCKED';
            const isProcessing = status === 'PROCESSING';
            const isCompleted = status === 'COMPLETED';
            const isAvailable = status === 'AVAILABLE';
            const canNavigate = !isLocked && !isProcessing;

            return (
              <div
                key={s.step}
                onClick={() => {
                  if (canNavigate) {
                    onSelectStep(s.step);
                  }
                }}
                id={`stage-step-${s.step}`}
                title={
                  isLocked 
                    ? `Stage ${s.stageNumber} is locked. Complete previous stages first.` 
                    : isProcessing
                    ? `Stage ${s.stageNumber} is currently processing.`
                    : `Click to view Stage ${s.stageNumber}`
                }
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all select-none shrink-0 min-w-[170px] ${
                  isSelected
                    ? 'bg-[#ECFAFF] border-[#28BFEF] shadow-[0_3px_12px_rgba(40,191,239,0.18)] ring-1 ring-[#28BFEF]/40'
                    : isCompleted
                    ? 'bg-white border-[rgba(34,181,115,0.40)] hover:border-[#22B573] cursor-pointer shadow-sm'
                    : isAvailable
                    ? 'bg-[rgba(255,255,255,0.85)] border-[#D8E4EF] hover:border-[#28BFEF] cursor-pointer shadow-sm'
                    : isProcessing
                    ? 'bg-[#FFF9EE] border-[#D99A19] cursor-wait shadow-sm'
                    : 'bg-[rgba(255,255,255,0.45)] border-[#E2ECF4] text-[#8798A8] opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#28BFEF] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#E8F8F0] text-[#22B573] border border-[rgba(34,181,115,0.3)]'
                      : isProcessing
                      ? 'bg-[#FEF3D6] text-[#D99A19] border border-[rgba(217,154,25,0.4)]'
                      : isAvailable
                      ? 'bg-[#F0F8FF] text-[#3287E8] border border-[rgba(50,135,232,0.2)]'
                      : 'bg-[#F2F6FA] text-[#8798A8] border border-[#E2ECF4]'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D99A19]" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22B573]" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-[#8798A8]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold ${
                      isSelected 
                        ? 'text-[#28BFEF]' 
                        : isCompleted 
                        ? 'text-[#22B573]' 
                        : isAvailable
                        ? 'text-[#60758A]' 
                        : 'text-[#8798A8]'
                    }`}>
                      {s.stageNumber}
                    </span>
                    <span className={`text-xs font-medium truncate ${
                      isSelected 
                        ? 'text-[#17324D] font-bold' 
                        : isCompleted 
                        ? 'text-[#17324D]' 
                        : isAvailable
                        ? 'text-[#243447]'
                        : 'text-[#8798A8]'
                    }`}>
                      {s.shortTitle}
                    </span>
                  </div>

                  <div className="mt-0.5 text-[9px] font-mono flex items-center gap-1">
                    {isCompleted && (
                      <span className="text-[#22B573] font-semibold">COMPLETE</span>
                    )}
                    {isProcessing && (
                      <span className="text-[#D99A19] font-semibold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#D99A19] animate-ping" />
                        RUNNING
                      </span>
                    )}
                    {isAvailable && !isSelected && (
                      <span className="text-[#28BFEF]">READY</span>
                    )}
                    {isSelected && (
                      <span className="text-[#28BFEF] font-semibold">ACTIVE</span>
                    )}
                    {isLocked && (
                      <span className="text-[#8798A8]">LOCKED</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
