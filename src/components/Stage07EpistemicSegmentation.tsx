import React from 'react';
import { Eye, ShieldCheck, ArrowRight, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EPISTEMIC_REGIONS } from '../data/s3dgenStages';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Stage07EpistemicSegmentationProps {
  onProceedToValidation: () => void;
  onExploreIn3DView?: () => void;
  onBackToReconstruction?: () => void;
}

export const Stage07EpistemicSegmentation: React.FC<Stage07EpistemicSegmentationProps> = ({
  onProceedToValidation,
  onBackToReconstruction,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-[#D8E4EF] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_28px_rgba(50,90,125,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#28BFEF] bg-[#ECFAFF] border border-[#D8E4EF] px-2.5 py-0.5 rounded">
              STAGE 07
            </span>
            <ProvenanceBadge type="COMPUTED" size="sm" />
            <h2 className="text-lg font-bold text-[#17324D] font-mono">
              4-Class Epistemic Spatial Segmentation
            </h2>
          </div>
          <p className="text-xs text-[#60758A] font-mono">
            Evidentiary spatial classification: Observed vs Reference-Supported vs Inferred vs Unknown geometry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onBackToReconstruction && (
            <button
              onClick={onBackToReconstruction}
              className="btn-secondary-glass px-3.5 py-2 rounded-xl text-xs font-mono font-medium"
            >
              Stage 06 Reconstruction
            </button>
          )}

          <button
            onClick={onProceedToValidation}
            id="stage07-advance-btn"
            className="btn-primary-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold active:scale-95 shrink-0"
          >
            <span>Continue to Metric Validation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="p-4 rounded-xl bg-[#ECFAFF] border border-[#BFE8F5] flex items-start gap-3 text-xs font-mono">
        <Eye className="w-5 h-5 text-[#1B85AE] shrink-0 mt-0.5" />
        <div className="space-y-1 text-[#36526A]">
          <div className="text-[#1B85AE] font-bold">
            S3DGen Evidentiary Integrity Mandate
          </div>
          <p className="text-[11px] text-[#60758A] font-sans">
            In single-pass UAV photogrammetry, certain building faces receive direct optical sightlines, while occluded surfaces or blind spots do not.
            <strong> S3DGen strictly forbids presenting unobserved or inferred geometry as confirmed observations.</strong> Every surface region is classified into one of 4 rigorous epistemic states.
          </p>
        </div>
      </div>

      {/* 4 Cards for the 4 Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EPISTEMIC_REGIONS.map((region, idx) => (
          <div
            key={region.category}
            className="bg-white border border-[#D8E4EF] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#BFD6E7] transition-all shadow-[0_4px_16px_rgba(50,90,125,0.06)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-md"
                  style={{ backgroundColor: region.hex }}
                />
                <span className="font-mono text-xs font-bold text-[#8798A8]">
                  CLASS {idx + 1}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold text-[#17324D] uppercase tracking-wider">
                  {region.category}
                </h3>
                <span className="text-[10px] text-[#8798A8] font-mono">
                  {region.label.split('(')[1]?.replace(')', '') || region.label}
                </span>
              </div>

              <p className="text-xs text-[#36526A] font-sans leading-relaxed">
                {region.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EEF4FA]">
              <div className="text-[10px] text-[#8798A8] font-mono uppercase font-bold mb-0.5">
                Evidentiary Source:
              </div>
              <div className="text-[11px] text-[#60758A] font-mono truncate">
                {region.validationSource}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Epistemic Shading Legend & Status */}
      <div className="bg-white border border-[#D8E4EF] p-5 rounded-2xl space-y-3 shadow-[0_4px_16px_rgba(50,90,125,0.06)]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#17324D] font-bold">4-Class Epistemic Segmentation Viewport Legend</span>
          <span className="text-[#8798A8] text-[11px]">Dynamic Spatial Categorization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-[#1A9260]">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-[#1A9260]">1. OBSERVED</div>
              <div className="text-[10px] text-[#8798A8]">Direct UAV Sightlines</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-[#1B85AE]">
            <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
            <div>
              <div className="font-bold text-[#1B85AE]">2. REF-SUPPORTED</div>
              <div className="text-[10px] text-[#8798A8]">Spatial Constraint Prior</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-[#A6740F]">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-[#A6740F]">3. INFERRED</div>
              <div className="text-[10px] text-[#8798A8]">Continuity & Symmetry</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-[#C94343]">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="font-bold text-[#C94343]">4. UNKNOWN</div>
              <div className="text-[10px] text-[#8798A8]">Occluded Shadow Zones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
