import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Layers, 
  SlidersHorizontal, 
  AlertTriangle, 
  Copy, 
  Search, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Info,
  Film,
  Eye,
  Loader2,
  Maximize2
} from 'lucide-react';
import { FRAME_ANALYSIS_DATA, AnalyzedFrame } from '../data/frameAnalysisData';

interface AIAssistedFrameSelectionProps {
  onProceedToReconstruction?: () => void;
  isProcessing?: boolean;
}

export const AIAssistedFrameSelection: React.FC<AIAssistedFrameSelectionProps> = ({
  onProceedToReconstruction,
  isProcessing = false,
}) => {
  const { summary, frames, limitations } = FRAME_ANALYSIS_DATA;

  // UI state for filter & search
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'selected' | 'rejected' | 'all'>('selected');
  const [rejectionFilter, setRejectionFilter] = useState<'all' | 'excessive_redundancy' | 'motion_blur'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrameForModal, setSelectedFrameForModal] = useState<AnalyzedFrame | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);

  // Filter frames according to active tab, sub-filter, and search query
  const filteredFrames = frames.filter((frame) => {
    const matchesSearch = 
      frame.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frame.frame_id.toString().includes(searchQuery) ||
      frame.decision.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'selected') {
      return frame.decision.selected;
    }

    if (activeTab === 'rejected') {
      if (frame.decision.selected) return false;
      if (rejectionFilter === 'all') return true;
      return frame.decision.reason === rejectionFilter;
    }

    return true;
  });

  // 18 Selected Keyframes for default representative display
  const selectedKeyframes = frames.filter((f) => f.decision.selected);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(FRAME_ANALYSIS_DATA, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_12px_36px_rgba(50,90,125,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#ECFAFF] text-[#28BFEF] border border-[rgba(40,191,239,0.30)] text-xs font-mono font-medium">
              STAGE 03
            </span>
            <span className="text-xs font-mono text-[#60758A]">
              Quality, Blur & Angular Redundancy Triage
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17324D] tracking-tight">
            AI-Assisted Frame Selection
          </h2>
          <p className="text-xs text-[#60758A]">
            Filtering the 63 raw extracted frames down to optimal baseline viewpoints for SfM triangulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyJSON}
            className="btn-secondary-glass flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs"
            title="Copy frame_analysis.json payload"
          >
            <Copy className="w-3.5 h-3.5 text-[#28BFEF]" />
            <span>{copiedJSON ? 'JSON Copied' : 'Export JSON'}</span>
          </button>

          {onProceedToReconstruction && (
            <button
              onClick={onProceedToReconstruction}
              id="advance-to-reconstruction-btn"
              className="btn-primary-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shrink-0"
            >
              <span>Confirm Frame Selection (18 Frames)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_12px_36px_rgba(50,90,125,0.08)] min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFAFF] border border-[rgba(40,191,239,0.3)] flex items-center justify-center text-[#28BFEF]">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-[#17324D]">
              Evaluating Frame Quality & Parallax...
            </h3>
            <p className="text-xs text-[#60758A]">
              Computing edge gradient entropy, camera baseline displacement, and structural overlap across 63 extracted frames.
            </p>
          </div>
        </div>
      )}

      {/* Completed Results State */}
      {!isProcessing && (
        <div className="space-y-6">
          {/* COMPACT STATISTICS STRIP */}
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-4.5 shadow-[0_8px_28px_rgba(50,90,125,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#60758A]">Total Pool:</span>
                <span className="text-[#17324D] font-bold text-sm">63 Extracted</span>
              </div>
              <span className="text-[#D8E4EF]">|</span>
              <div className="flex items-center gap-2">
                <span className="text-[#22B573] font-semibold">Retained:</span>
                <span className="text-[#22B573] font-bold text-sm">18 Selected</span>
                <span className="text-[11px] text-[#60758A]">(28.6%)</span>
              </div>
              <span className="text-[#D8E4EF]">|</span>
              <div className="flex items-center gap-2">
                <span className="text-[#E05260] font-semibold">Filtered:</span>
                <span className="text-[#E05260] font-bold text-sm">45 Discarded</span>
                <span className="text-[11px] text-[#60758A]">(71.4%)</span>
              </div>
            </div>

            {/* Rejection Breakdown sub-strip */}
            <div className="flex items-center gap-3 text-[11px] border-t md:border-t-0 md:border-l border-[#E2ECF4] pt-2 md:pt-0 md:pl-4 text-[#60758A]">
              <span>Rejection Triage:</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FFF9EE] text-[#D97706] border border-[rgba(217,119,6,0.25)] font-semibold">
                <strong>42</strong> Redundancy
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FDF2F2] text-[#EF4444] border border-[rgba(239,68,68,0.25)] font-semibold">
                <strong>3</strong> Motion Blur
              </span>
            </div>
          </div>

          {/* 30. SELECTION CRITERIA CARDS: background #FFFFFF, border #D8E4EF, rounded-14px, shadow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#D8E4EF] rounded-[14px] p-4 shadow-[0_4px_14px_rgba(50,90,125,0.06)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17324D] font-mono uppercase tracking-wider">Angular Baseline</span>
                <div className="w-7 h-7 rounded-lg bg-[#ECFAFF] text-[#28BFEF] flex items-center justify-center text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-[#60758A] leading-relaxed">
                Requires &gt; 2.5° angular displacement between successive nodes to guarantee healthy baseline triangulation.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-[#28BFEF] font-semibold">
                Threshold: Δθ ≥ 2.5°
              </div>
            </div>

            <div className="bg-white border border-[#D8E4EF] rounded-[14px] p-4 shadow-[0_4px_14px_rgba(50,90,125,0.06)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17324D] font-mono uppercase tracking-wider">Edge Sharpness</span>
                <div className="w-7 h-7 rounded-lg bg-[#ECFAFF] text-[#28BFEF] flex items-center justify-center text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-[#60758A] leading-relaxed">
                Laplacian gradient entropy rejects high-speed yaw blur and vibration artifacts below quality tolerance.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-[#28BFEF] font-semibold">
                Threshold: Var(ΔI) &gt; 180
              </div>
            </div>

            <div className="bg-white border border-[#D8E4EF] rounded-[14px] p-4 shadow-[0_4px_14px_rgba(50,90,125,0.06)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17324D] font-mono uppercase tracking-wider">Epipolar Overlap</span>
                <div className="w-7 h-7 rounded-lg bg-[#ECFAFF] text-[#28BFEF] flex items-center justify-center text-xs">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-[#60758A] leading-relaxed">
                Ensures 65%–85% spatial scene overlap between consecutive nodes to retain robust tie-point correspondences.
              </p>
              <div className="mt-auto pt-2 text-[11px] font-mono text-[#28BFEF] font-semibold">
                Overlap: 72% Mean
              </div>
            </div>
          </div>

          {/* 32. OVERLAP MATRIX & ANGLE DISTRIBUTION */}
          <div className="bg-white border border-[#D8E4EF] rounded-2xl p-5 shadow-[0_4px_14px_rgba(50,90,125,0.06)] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2ECF4] pb-2.5">
              <span className="text-xs font-bold font-mono text-[#17324D] uppercase tracking-wider">
                Pairwise Overlap Matrix (Sampled Nodes)
              </span>
              <span className="text-[11px] font-mono text-[#60758A]">Active baseline coupling</span>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-9 gap-1.5 min-w-[340px] text-[10px] font-mono">
                {Array.from({ length: 9 }).map((_, r) => (
                  <React.Fragment key={r}>
                    {Array.from({ length: 9 }).map((_, c) => {
                      const diff = Math.abs(r - c);
                      let bgClass = 'bg-[#F0F4F8] text-[#8C9BA8]';
                      if (diff === 0) bgClass = 'bg-[#28BFEF] text-white font-bold';
                      else if (diff === 1) bgClass = 'bg-[rgba(40,191,239,0.65)] text-white';
                      else if (diff === 2) bgClass = 'bg-[rgba(40,191,239,0.35)] text-[#17324D]';
                      else if (diff === 3) bgClass = 'bg-[rgba(40,191,239,0.15)] text-[#17324D]';
                      return (
                        <div
                          key={c}
                          className={`h-7 rounded flex items-center justify-center border border-[#E2ECF4] transition-colors ${bgClass}`}
                          title={`Node #${r * 2 + 1} to Node #${c * 2 + 1} Overlap`}
                        >
                          {diff === 0 ? '100%' : diff === 1 ? '78%' : diff === 2 ? '54%' : diff === 3 ? '32%' : '0%'}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 31. DEFAULT VIEW: Representative Selected Keyframes Gallery */}
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-5 space-y-4 shadow-[0_8px_28px_rgba(50,90,125,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECF4] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#28BFEF]" />
                <span className="text-xs font-semibold text-[#17324D] font-mono uppercase tracking-wider">
                  Selected Keyframes Pool ({selectedKeyframes.length})
                </span>
              </div>

              {/* TOGGLE DETAILED FRAME ANALYSIS BUTTON */}
              <button
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                id="toggle-detailed-analysis-btn"
                className="btn-secondary-glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#28BFEF] text-xs font-mono font-medium"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showDetailedAnalysis ? 'Hide Detailed Frame Grid' : 'View Detailed Frame Analysis (All 63)'}</span>
              </button>
            </div>

            {/* Clean compact representative grid of 18 selected keyframes: border 2px solid #28BFEF, shadow 0 0 0 3px rgba(40,191,239,0.18) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {selectedKeyframes.map((frame) => (
                <div
                  key={frame.frame_id}
                  onClick={() => setSelectedFrameForModal(frame)}
                  className="p-2.5 rounded-xl bg-white border-2 border-[#28BFEF] shadow-[0_0_0_3px_rgba(40,191,239,0.18)] hover:shadow-[0_4px_16px_rgba(40,191,239,0.30)] cursor-pointer transition-all flex flex-col gap-2 group"
                >
                  <div className="w-full aspect-video rounded-lg bg-[#EEF5FB] border border-[#E2ECF4] flex items-center justify-center relative overflow-hidden group-hover:bg-[#E6F3FC]">
                    <span className="text-xs font-bold font-mono text-[#17324D]">
                      #{frame.frame_id}
                    </span>
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#ECFAFF] text-[#28BFEF] text-[9px] font-mono font-bold border border-[rgba(40,191,239,0.3)]">
                      Selected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#17324D] truncate font-medium">{frame.filename}</span>
                    <span className="text-[#28BFEF] text-[10px] font-bold">KEPT</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] font-mono text-[#60758A] flex items-center justify-between">
              <span>All 18 selected keyframes ready for Structure-from-Motion bundle adjustment.</span>
              <span className="text-[#17324D] font-medium">Click any frame for camera telemetry</span>
            </div>
          </div>

          {/* DETAILED FRAME ANALYSIS VIEW (Toggleable) */}
          {showDetailedAnalysis && (
            <div className="bg-white border border-[#D8E4EF] rounded-2xl p-5 space-y-4 shadow-[0_8px_28px_rgba(50,90,125,0.06)] animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECF4] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('selected')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'selected'
                        ? 'bg-[#ECFAFF] text-[#28BFEF] border border-[#28BFEF]/40'
                        : 'bg-transparent text-[#60758A] hover:text-[#17324D]'
                    }`}
                  >
                    Selected ({summary.selected_frames})
                  </button>
                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'rejected'
                        ? 'bg-[#FDF2F2] text-[#EF4444] border border-[#EF4444]/40'
                        : 'bg-transparent text-[#60758A] hover:text-[#17324D]'
                    }`}
                  >
                    Rejected ({summary.rejected_frames})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-[#F0F4F8] text-[#17324D] border border-[#D8E4EF]'
                        : 'bg-transparent text-[#60758A] hover:text-[#17324D]'
                    }`}
                  >
                    All 63 Frames
                  </button>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#60758A]" />
                  <input
                    type="text"
                    placeholder="Search filename or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#D8E4EF] text-xs font-mono text-[#17324D] placeholder:text-[#8C9BA8] focus:outline-none focus:border-[#28BFEF]"
                  />
                </div>
              </div>

              {/* Grid of filtered frames */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredFrames.map((frame) => (
                  <div
                    key={frame.frame_id}
                    onClick={() => setSelectedFrameForModal(frame)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      frame.decision.selected
                        ? 'bg-white border-2 border-[#28BFEF] shadow-[0_0_0_3px_rgba(40,191,239,0.15)]'
                        : 'bg-[#F8FAFC] border border-[#E2ECF4] opacity-60 hover:opacity-100 hover:border-[#D97706]'
                    }`}
                  >
                    <div className="w-full aspect-video rounded bg-[#EEF5FB] flex items-center justify-center text-xs font-mono text-[#17324D] font-bold">
                      #{frame.frame_id}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="truncate text-[#60758A]">{frame.filename}</span>
                      <span className={
                        frame.decision.selected 
                          ? 'px-1 rounded bg-[#ECFAFF] text-[#28BFEF] font-bold' 
                          : frame.decision.reason === 'motion_blur'
                          ? 'px-1 rounded bg-[#FDF2F2] text-[#EF4444] font-bold'
                          : 'px-1 rounded bg-[#FFF9EE] text-[#D97706] font-bold'
                      }>
                        {frame.decision.selected ? 'OK' : frame.decision.reason === 'motion_blur' ? 'BLUR' : 'REDUNDANT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal / Detailed Frame Inspector */}
          {selectedFrameForModal && (
            <div 
              className="fixed inset-0 z-50 bg-[#17324D]/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedFrameForModal(null)}
            >
              <div 
                className="bg-white border border-[#D8E4EF] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#E2ECF4] pb-3">
                  <span className="text-sm font-bold font-mono text-[#17324D]">
                    {selectedFrameForModal.filename} (Frame #{selectedFrameForModal.frame_id})
                  </span>
                  <button 
                    onClick={() => setSelectedFrameForModal(null)}
                    className="text-[#60758A] hover:text-[#17324D] text-xs font-mono font-bold"
                  >
                    Close [ESC]
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2ECF4]">
                    <span className="text-[#60758A]">Status:</span>
                    <span className={selectedFrameForModal.decision.selected ? 'text-[#28BFEF] font-bold' : 'text-[#EF4444] font-bold'}>
                      {selectedFrameForModal.decision.selected ? 'SELECTED KEYFRAME' : 'DISCARDED'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2ECF4]">
                    <span className="text-[#60758A]">Triage Reason:</span>
                    <span className="text-[#17324D] font-medium">{selectedFrameForModal.decision.reason}</span>
                  </div>
                  <div className="p-3 rounded bg-[#EEF5FB] border border-[#D8E4EF] text-[11px] text-[#60758A]">
                    {selectedFrameForModal.decision.reason === 'excessive_redundancy'
                      ? 'Angular parallax with adjacent keyframe was < 1.8°. Excluded to avoid ill-conditioned baseline triangulation.'
                      : selectedFrameForModal.decision.reason === 'motion_blur'
                      ? 'Laplacian variance fell below edge sharpness threshold during high yaw turn. Excluded.'
                      : 'Retained as primary photogrammetry node for SfM tie-point detection.'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFrameForModal(null)}
                  className="w-full py-2.5 rounded-xl bg-[#ECFAFF] hover:bg-[#DCF4FD] text-[#17324D] text-xs font-mono font-semibold border border-[rgba(40,191,239,0.35)] transition-all shadow-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
