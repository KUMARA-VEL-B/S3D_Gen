import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Eye, 
  Layers, 
  Activity, 
  Camera, 
  FileText,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { AnalyzedFrame } from '../data/frameAnalysisData';

interface FrameDetailModalProps {
  frame: AnalyzedFrame | null;
  onClose: () => void;
}

export const FrameDetailModal: React.FC<FrameDetailModalProps> = ({ frame, onClose }) => {
  if (!frame) return null;

  const isSelected = frame.decision.selected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[rgba(16,21,29,0.95)] backdrop-blur-xl border border-[rgba(85,214,255,0.2)] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[rgba(11,14,20,0.85)] border-b border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isSelected 
                ? 'bg-[rgba(26,44,36,0.85)] text-[#39D98A] border-[rgba(57,217,138,0.4)]' 
                : 'bg-[rgba(50,20,25,0.85)] text-[#FF4D4D] border-[rgba(255,77,77,0.4)]'
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF5] font-mono">{frame.filename}</h3>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isSelected
                    ? 'bg-[rgba(26,44,36,0.85)] text-[#39D98A] border-[rgba(57,217,138,0.4)]'
                    : 'bg-[rgba(50,20,25,0.85)] text-[#FF4D4D] border-[rgba(255,77,77,0.4)]'
                }`}>
                  {isSelected ? 'SELECTED KEYFRAME' : 'REJECTED FRAME'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">Frame Index: #{frame.frame_id.toString().padStart(3, '0')} / 063</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E8EEF5] hover:bg-[rgba(30,41,56,0.6)] transition-colors"
            title="Close Frame Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Frame Sensor Telemetry Card */}
          <div className="relative aspect-[16/9] w-full rounded-xl bg-[rgba(11,14,20,0.8)] border border-[rgba(148,163,184,0.15)] p-4 flex flex-col justify-between overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #55D6FF 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />

            {/* Top Bar of Sensor Card */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-[#55D6FF] animate-pulse" />
                <span>OPTICAL SENSOR ANALYSIS</span>
              </div>
              <span className="text-[#64748B]">{frame.filename}</span>
            </div>

            {/* Center Reticle Graphic */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4 text-center">
              <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-2 ${
                isSelected ? 'border-[#39D98A]/60 bg-[rgba(26,44,36,0.5)]' : 'border-[#FF4D4D]/60 bg-[rgba(50,20,25,0.5)]'
              }`}>
                {isSelected ? (
                  <CheckCircle2 className="w-8 h-8 text-[#39D98A]" />
                ) : (
                  <XCircle className="w-8 h-8 text-[#FF4D4D]" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-[#E8EEF5]">{frame.filename}</div>
              <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
                {isSelected ? 'Anchored for Downstream Photogrammetry' : `Filtered: ${frame.decision.reason}`}
              </div>
            </div>

            {/* Bottom Status Tags */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono pt-2 border-t border-[rgba(148,163,184,0.12)]">
              <span className="text-[#94A3B8]">Quality: <strong className="text-[#E8EEF5] uppercase">{frame.quality.visual_quality}</strong></span>
              <span className="text-[#94A3B8]">Redundancy: <strong className="text-[#E8EEF5] uppercase">{frame.redundancy.assessment}</strong></span>
              <span className="text-[#94A3B8]">Viewpoint: <strong className="text-[#E8EEF5] uppercase">{frame.viewpoint.category}</strong></span>
              <span className="text-[#94A3B8]">Reconstruction: <strong className="text-[#E8EEF5] uppercase">{frame.reconstruction_usefulness}</strong></span>
            </div>
          </div>

          {/* Section 1: Decision & Reason */}
          <div className={`p-4 rounded-xl border ${
            isSelected 
              ? 'bg-[rgba(26,44,36,0.35)] border-[rgba(57,217,138,0.4)]' 
              : 'bg-[rgba(50,20,25,0.35)] border-[rgba(255,77,77,0.4)]'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase mb-1">
              {isSelected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#39D98A]" />
                  <span className="text-[#39D98A]">Selection Decision: Retained Keyframe</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-[#FF4D4D]" />
                  <span className="text-[#FF4D4D]">Selection Decision: Discarded ({frame.decision.reason})</span>
                </>
              )}
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-mono">
              {frame.decision.reason}
            </p>
          </div>

          {/* Section 2: Detailed Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quality Breakdown */}
            <div className="p-3.5 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#55D6FF] font-mono">
                <Eye className="w-4 h-4" />
                <span>VISUAL QUALITY METRICS</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Sharpness:</span>
                  <span className={`font-bold uppercase ${
                    frame.quality.sharpness === 'high' ? 'text-[#39D98A]' : 'text-[#FF9F43]'
                  }`}>{frame.quality.sharpness}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Motion Blur:</span>
                  <span className={`font-bold uppercase ${
                    frame.quality.blur === 'none' ? 'text-[#39D98A]' : 'text-[#FF4D4D]'
                  }`}>{frame.quality.blur}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Visual Quality:</span>
                  <span className="font-bold text-[#E8EEF5] uppercase">{frame.quality.visual_quality}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#94A3B8]">Exposure Issue:</span>
                  <span className="text-[#CBD5E1] font-bold">{frame.quality.exposure_issue ? 'YES' : 'NONE'}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#94A3B8] italic pt-1 border-t border-[rgba(148,163,184,0.1)]">
                "{frame.quality.notes}"
              </p>
            </div>

            {/* Redundancy & Viewpoint */}
            <div className="p-3.5 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#55D6FF] font-mono">
                <Layers className="w-4 h-4" />
                <span>SPATIAL & VIEWPOINT DIVERSITY</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Redundancy Assessment:</span>
                  <span className={`font-bold uppercase ${
                    frame.redundancy.assessment === 'low' ? 'text-[#39D98A]' : 'text-[#FF9F43]'
                  }`}>{frame.redundancy.assessment}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Viewpoint Category:</span>
                  <span className="font-bold text-[#E8EEF5] uppercase">{frame.viewpoint.category}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[rgba(148,163,184,0.1)]">
                  <span className="text-[#94A3B8]">Viewpoint Usefulness:</span>
                  <span className={`font-bold uppercase ${
                    frame.viewpoint.usefulness === 'high' ? 'text-[#39D98A]' : 'text-[#CBD5E1]'
                  }`}>{frame.viewpoint.usefulness}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#94A3B8]">Reconstruction Value:</span>
                  <span className={`font-bold uppercase ${
                    frame.reconstruction_usefulness === 'high' ? 'text-[#39D98A]' : 'text-[#FF9F43]'
                  }`}>{frame.reconstruction_usefulness}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#94A3B8] italic pt-1 border-t border-[rgba(148,163,184,0.1)]">
                "{frame.viewpoint.notes}"
              </p>
            </div>
          </div>

          {/* Technical Note Footer */}
          <div className="p-3 rounded-lg bg-[rgba(11,14,20,0.6)] border border-[rgba(148,163,184,0.14)] flex items-start gap-2.5 text-[#94A3B8] text-xs font-mono">
            <Info className="w-4 h-4 text-[#55D6FF] shrink-0 mt-0.5" />
            <span>
              Metadata recorded in frame_analysis.json. Frame usefulness is evaluated qualitatively from visual quality, structural visibility, redundancy, and viewpoint diversity.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[rgba(11,14,20,0.85)] border-t border-[rgba(148,163,184,0.15)] flex items-center justify-between">
          <span className="text-xs text-[#64748B] font-mono">S3DGen Frame Metadata Inspector</span>
          <button
            onClick={onClose}
            className="btn-secondary-glass px-4 py-1.5 rounded-xl text-xs font-mono font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
