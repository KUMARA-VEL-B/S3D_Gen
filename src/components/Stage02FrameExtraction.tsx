import React from 'react';
import { 
  Film, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Layers, 
  Clock, 
  Video,
  Eye
} from 'lucide-react';

interface Stage02FrameExtractionProps {
  isProcessing: boolean;
  isCompleted: boolean;
  progressPercent: number;
  onContinueToSelection: () => void;
  videoFileName?: string;
}

export const Stage02FrameExtraction: React.FC<Stage02FrameExtractionProps> = ({
  isProcessing,
  isCompleted,
  progressPercent,
  onContinueToSelection,
  videoFileName = 'Uploaded UAV Video',
}) => {
  // Representative frames (12 key representative frames sampled across the 63 frames)
  const representativeFrameIndices = [1, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 63];

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_12px_36px_rgba(50,90,125,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#ECFAFF] text-[#28BFEF] border border-[rgba(40,191,239,0.30)] text-xs font-mono font-medium">
              STAGE 02
            </span>
            <span className="text-xs font-mono text-[#60758A]">
              Uniform Temporal Sampling
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17324D] tracking-tight">
            Frame Extraction
          </h2>
          <p className="text-xs text-[#60758A]">
            Sequential high-resolution frames extracted from the single-pass UAV video stream for photogrammetric processing.
          </p>
        </div>

        {isCompleted && (
          <button
            onClick={onContinueToSelection}
            id="continue-to-selection-btn"
            className="btn-primary-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shrink-0"
          >
            <span>Advance to Frame Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_12px_36px_rgba(50,90,125,0.08)] min-h-[340px]">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF9EE] border border-[rgba(217,154,25,0.35)] flex items-center justify-center text-[#D99A19]">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-[#17324D]">
              Extracting Sequential Frames...
            </h3>
            <p className="text-xs text-[#60758A]">
              Decompressing 3840×2160 UHD stream from {videoFileName} at 0.5-second intervals.
            </p>
          </div>

          <div className="w-full max-w-md space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-[#60758A]">
              <span>Extracting frames</span>
              <span className="text-[#28BFEF] font-bold">{progressPercent}%</span>
            </div>
            {/* Progress bar: track #E2ECF4, fill #28BFEF, height 8-10px, rounded-full */}
            <div className="w-full h-2.5 bg-[#E2ECF4] rounded-full overflow-hidden border border-[#D8E4EF]">
              <div 
                className="h-full bg-[#28BFEF] transition-all duration-150 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div className="space-y-6">
          {/* Clean Translucent Information Panel */}
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-6 shadow-[0_8px_28px_rgba(50,90,125,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] border border-[rgba(34,181,115,0.3)] flex items-center justify-center text-[#22B573] shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold font-mono text-[#17324D]">
                    63 Frames Extracted
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E8F8F0] text-[#22B573] border border-[rgba(34,181,115,0.3)] font-semibold">
                    POOL READY
                  </span>
                </div>
                <p className="text-xs text-[#60758A] max-w-xl">
                  Sequential candidate pool sampled uniformly at 0.5-second intervals from the UAV flight pass. All frames are buffered at native 3840×2160 UHD resolution, ready for parallax baseline and feature correspondence analysis.
                </p>
              </div>
            </div>

            {/* Quick Metadata Spec Strip: background rgba(255,255,255,0.80), border #D8E4EF, labels #60758A, numbers #17324D */}
            <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-[#E2ECF4] pt-3 md:pt-0 md:pl-6 text-[#60758A] shrink-0">
              <div>
                <span className="text-[10px] text-[#8798A8] block uppercase">SAMPLING</span>
                <span className="text-[#28BFEF] font-bold">0.5s / 2.0 Hz</span>
              </div>
              <span className="text-[#D8E4EF]">|</span>
              <div>
                <span className="text-[10px] text-[#8798A8] block uppercase">RESOLUTION</span>
                <span className="text-[#17324D] font-bold">3840×2160 UHD</span>
              </div>
              <span className="text-[#D8E4EF]">|</span>
              <div>
                <span className="text-[10px] text-[#8798A8] block uppercase">COLOR BUFFER</span>
                <span className="text-[#17324D] font-bold">RGB 24-bit</span>
              </div>
            </div>
          </div>

          {/* Representative Extracted Frames Grid: Grid background #F8FAFC */}
          <div className="bg-[#F8FAFC] border border-[#D8E4EF] rounded-2xl p-5 space-y-4 shadow-[0_8px_28px_rgba(50,90,125,0.06)]">
            <div className="flex items-center justify-between border-b border-[#E2ECF4] pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#28BFEF]" />
                <span className="text-xs font-semibold text-[#17324D] font-mono uppercase tracking-wider">
                  Representative Extracted Frames
                </span>
              </div>
              <span className="text-xs font-mono text-[#60758A]">
                Showing 12 of 63 Extracted Frames
              </span>
            </div>

            {/* Frame Cards: background #FFFFFF, border #D8E4EF, rounded-12px, shadow 0 4px 12px rgba(50,90,125,0.06) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {representativeFrameIndices.map((frameNum) => {
                const filename = `frame_${String(frameNum).padStart(3, '0')}.jpg`;
                return (
                  <div
                    key={frameNum}
                    className="p-2.5 rounded-xl bg-white border border-[#D8E4EF] shadow-[0_4px_12px_rgba(50,90,125,0.06)] flex flex-col gap-2 group hover:border-[#28BFEF] hover:shadow-[0_8px_18px_rgba(50,90,125,0.12)] transition-all cursor-pointer"
                  >
                    {/* Frame thumbnail container: background #EEF5FB, border #E2ECF4, aspect-ratio 16:9 */}
                    <div className="w-full aspect-video rounded-lg bg-[#EEF5FB] border border-[#E2ECF4] flex flex-col items-center justify-center text-xs font-mono text-[#60758A] relative overflow-hidden group-hover:bg-[#E6F3FC] transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[10px] text-[#3287E8]">
                        UAV #01
                      </div>
                      <span className="text-xs font-bold text-[#17324D] relative z-10">
                        #{frameNum}
                      </span>
                    </div>
                    {/* Frame Labels: Frame number #17324D, Timestamp #60758A, font: monospace */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#60758A]">
                      <span className="truncate font-medium text-[#17324D]">{filename}</span>
                      <span className="text-[#8798A8]">0.5s</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.85)] border border-[#D8E4EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#60758A]">
              <span>Candidate pool of 63 frames extracted successfully. Next stage evaluates motion blur and angular overlap.</span>
              <button
                onClick={onContinueToSelection}
                className="btn-primary-cyan flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold self-end sm:self-auto shrink-0 shadow-sm"
              >
                <span>Advance to Frame Selection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
