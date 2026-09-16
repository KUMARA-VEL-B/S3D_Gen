import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  RotateCcw,
  Layers,
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { DisasterScenarioState } from '../types';

interface DisasterAnalysisPanelProps {
  disasterState: DisasterScenarioState;
  onSelectDisasterState: (state: DisasterScenarioState) => void;
  highlightAffectedAreas: boolean;
  onToggleHighlightAffected: (highlight: boolean) => void;
  onSimulateDisaster: () => void;
  compareMode: boolean;
  onToggleCompareMode: () => void;
  compareSplit: number;
  onChangeCompareSplit: (split: number) => void;
  onClose?: () => void;
}

export const DisasterAnalysisPanel: React.FC<DisasterAnalysisPanelProps> = ({
  disasterState,
  onSelectDisasterState,
  highlightAffectedAreas,
  onToggleHighlightAffected,
  onSimulateDisaster,
  compareMode,
  onToggleCompareMode,
  compareSplit,
  onChangeCompareSplit,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div 
      id="disaster-analysis-panel"
      className="absolute top-4 right-4 z-30 max-w-[340px] w-full bg-[rgba(255,255,255,0.96)] backdrop-blur-md border border-[#D8E4EF] rounded-2xl shadow-[0_12px_32px_rgba(50,90,125,0.14)] p-3.5 space-y-3 font-mono text-xs transition-all animate-fadeIn"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2ECF4]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FF7350]/10 border border-[#FF7350]/30 flex items-center justify-center text-[#FF7350]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-extrabold text-[#17324D] tracking-wide text-xs">
              DISASTER ANALYSIS
            </div>
            <div className="text-[10px] text-[#60758A]">
              Post-Scenario 3D Inspection
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-[#FFF4E5] text-[#D97706] border border-[#F59E0B]/30 text-[9px] font-bold tracking-wider uppercase">
            DEMO MODE
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-[#F0F4F8] text-[#60758A] hover:text-[#17324D] transition-colors"
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 1. Scenario Selector */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-[#60758A] flex items-center justify-between">
              <span>Scenario Stage:</span>
              <span className="text-[#28BFEF] font-semibold">
                {disasterState === 'before' && '1. Before Disaster'}
                {disasterState === 'simulating' && '2. Simulating Scenario'}
                {disasterState === 'after' && '3. After Disaster'}
                {disasterState === 'highlight' && '4. Highlight Active'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <button
                id="btn-disaster-normal"
                onClick={() => onSelectDisasterState('before')}
                className={`py-1.5 px-2 rounded-xl text-center transition-all border text-[11px] font-bold ${
                  disasterState === 'before' && !highlightAffectedAreas
                    ? 'bg-[#28BFEF] text-white border-[#28BFEF] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#28BFEF]/50'
                }`}
              >
                Normal
              </button>

              <button
                id="btn-disaster-simulate"
                onClick={onSimulateDisaster}
                className={`py-1.5 px-2 rounded-xl text-center transition-all border text-[11px] font-bold flex items-center justify-center gap-1 ${
                  disasterState === 'simulating'
                    ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs animate-pulse'
                    : 'bg-[#FFF9F0] text-[#D97706] border-[#FCD34D] hover:bg-[#F59E0B] hover:text-white'
                }`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Simulate</span>
              </button>

              <button
                id="btn-disaster-post"
                onClick={() => onSelectDisasterState('after')}
                className={`py-1.5 px-2 rounded-xl text-center transition-all border text-[11px] font-bold ${
                  disasterState === 'after' && !highlightAffectedAreas
                    ? 'bg-[#FF7350] text-white border-[#FF7350] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#FF7350]/50'
                }`}
              >
                Post-Disaster
              </button>
            </div>
          </div>

          {/* 2. Visualization Highlight Control (MAIN FEATURE PURPOSE) */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase font-bold text-[#60758A]">
              3D Surface Visualization:
            </div>
            <button
              id="btn-highlight-affected-areas"
              onClick={() => onToggleHighlightAffected(!highlightAffectedAreas)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition-all ${
                highlightAffectedAreas
                  ? 'bg-gradient-to-r from-[#FF7350] to-[#F59E0B] text-white border-transparent shadow-[0_4px_16px_rgba(255,115,80,0.3)] font-bold'
                  : 'bg-[#FFFFFF] text-[#17324D] border-[#D8E4EF] hover:border-[#FF7350] hover:bg-[#FFF5F2]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`w-3.5 h-3.5 ${highlightAffectedAreas ? 'text-white' : 'text-[#FF7350]'}`} />
                <span className="text-[11px]">Highlight Affected Areas</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                highlightAffectedAreas 
                  ? 'bg-white/20 text-white font-extrabold' 
                  : 'bg-[#F0F4F8] text-[#60758A]'
              }`}>
                {highlightAffectedAreas ? 'ACTIVE ON 3D' : 'OFF'}
              </span>
            </button>
          </div>

          {/* 3. Before / After Compare Slider */}
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF4] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#60758A]">
              <span className="font-bold uppercase flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#28BFEF]" />
                Before / After Blend:
              </span>
              <span className="font-bold text-[#17324D]">
                {compareSplit < 30 ? 'Pristine (Before)' : compareSplit > 70 ? 'Post-Disaster (After)' : `50/50 Split (${compareSplit}%)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#60758A]">Before</span>
              <input
                type="range"
                min="0"
                max="100"
                value={compareSplit}
                onChange={(e) => onChangeCompareSplit(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2ECF4] rounded-lg appearance-none cursor-pointer accent-[#28BFEF]"
              />
              <span className="text-[9px] text-[#FF7350]">After</span>
            </div>
          </div>

          {/* 4. Epistemic Classification Status Card */}
          <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8E4EF] space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#60758A]">Status:</span>
              <span className="font-bold text-[#D97706]">DISASTER SIMULATION</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#60758A]">Affected Regions:</span>
              <span className="font-bold text-[#FF7350]">
                {highlightAffectedAreas ? 'Highlighted on 3D' : 'Simulated (Bays 1-3)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#60758A]">Unobserved Regions:</span>
              <span className="font-bold text-[#64748B]">Unknown / Not Observable</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#60758A]">Mode:</span>
              <span className="font-semibold text-[#17324D]">Demonstration Only</span>
            </div>

            {/* Epistemic Legend */}
            <div className="pt-2 mt-1 border-t border-[#E2ECF4] grid grid-cols-2 gap-1 text-[9px] text-[#60758A]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Observed: Intact</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7350]" />
                <span>Affected: Highlighted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#28BFEF]" />
                <span>Datum / Reference</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                <span>Unknown (Occluded)</span>
              </div>
            </div>
          </div>

          {/* Technical Note / Non-claim boundary */}
          <div className="text-[9px] text-[#8C9BA8] leading-tight px-1 flex items-start gap-1">
            <HelpCircle className="w-3 h-3 text-[#8C9BA8] shrink-0 mt-0.5" />
            <span>
              Demonstration of 3D visual reconstruction inspection. Does not claim engineering certification or measured structural capacity.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
