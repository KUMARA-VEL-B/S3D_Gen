import React from 'react';
import { Lock, ShieldCheck, ArrowRight, Layers, CheckCircle2, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Stage05SpatialReferenceProps {
  onProceedToNext: () => void;
}

export const Stage05SpatialReference: React.FC<Stage05SpatialReferenceProps> = ({ onProceedToNext }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 border border-sky-800/80 px-2.5 py-0.5 rounded">
              STAGE 05
            </span>
            <ProvenanceBadge type="PROTECTED_REFERENCE" size="sm" />
            <h2 className="text-lg font-bold text-white font-mono">
              Protected Spatial Reference Alignment
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Confidential spatial prior anchoring scale, vertical datum, and structural boundary constraints.
          </p>
        </div>

        <button
          onClick={onProceedToNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold transition-all shadow-md shrink-0"
        >
          <span>Advance to 3D Reconstruction Pipeline</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confidentiality Callout Box */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-600/40 flex items-start gap-3 text-xs font-mono">
        <Lock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <div className="text-sky-300 font-bold flex items-center gap-2">
            <span>CONFIDENTIAL INTERNAL SPATIAL REFERENCE</span>
            <span className="text-[10px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded border border-sky-800">
              Zero-Exposure Architecture
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            The S3DGen prototype uses an internal authorized spatial reference representing GIS/BIM constraints. 
            <strong> The reference source is strictly confidential.</strong> Raw blueprints, sensitive geometry, and source files are never transmitted to or rendered in the user-facing client interface.
          </p>
        </div>
      </div>

      {/* Conceptual Role Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conceptual Architectural Diagram */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Conceptual Role of the Protected Spatial Reference</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-center">
            {/* Box 1 */}
            <div className="w-full max-w-md p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold shadow-md">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Input 01</span>
              Current UAV Observation (18 Keyframes)
            </div>

            <div className="text-sky-400 font-extrabold text-lg">+</div>

            {/* Box 2 */}
            <div className="w-full max-w-md p-3.5 rounded-xl bg-sky-950/80 border border-sky-600/70 text-sky-200 font-bold shadow-lg">
              <span className="text-[10px] text-sky-400 uppercase font-mono block">Input 02 [Protected]</span>
              Protected Spatial Reference (GIS / BIM / Structural Prior)
            </div>

            <div className="text-emerald-400 font-extrabold text-lg">↓</div>

            {/* Box 3 Result */}
            <div className="w-full max-w-md p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 font-bold shadow-xl">
              <span className="text-[10px] text-emerald-400 uppercase font-mono block">Pipeline Outcome</span>
              Spatial Alignment / Scale Constraint / Reference-Assisted Validation
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Scale Ambiguity</span>
              <span className="text-emerald-400 font-bold">Resolved (1:1 Metric)</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Elevation Datum</span>
              <span className="text-sky-400 font-bold">Anchored to Ground</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Source Exposure</span>
              <span className="text-slate-200 font-bold">0% (Encrypted)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Three Pillars of Constraint */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operational Constraints Enforced</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Metric Scale Normalization</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Single-pass SfM suffers from projective scale factor drift. The protected reference fixes the absolute meter distance baseline without needing physical ground scale bars.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Vertical Datum Alignment</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Eliminates z-axis warp and rotational tilt by anchoring the horizontal plane and structural elevation benchmarks.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Reference-Assisted Metric Validation</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Enables downstream Stage 08 to compute reference-assisted mathematical error residuals (|Reconstructed − Reference|) without revealing reference blueprint files to untrusted clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
