import React, { useState } from 'react';
import { Compass, Eye, EyeOff, Move3d, Play, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { FRAME_ANALYSIS_DATA } from '../data/frameAnalysisData';

interface Stage04CameraMotionProps {
  onProceedToNext: () => void;
}

export const Stage04CameraMotion: React.FC<Stage04CameraMotionProps> = ({ onProceedToNext }) => {
  const [showEquation, setShowEquation] = useState<boolean>(false);
  const selectedFrames = FRAME_ANALYSIS_DATA.frames.filter((f) => f.decision.selected);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 border border-sky-800/80 px-2.5 py-0.5 rounded">
              STAGE 04
            </span>
            <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
            <h2 className="text-lg font-bold text-white font-mono">
              Camera Motion / Spatial Estimation
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Multi-view epipolar geometry, relative 6-DoF pose recovery, and flight arc estimation across the 18 keyframes.
          </p>
        </div>

        <button
          onClick={onProceedToNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold transition-all shadow-md shrink-0"
        >
          <span>Advance to Protected Spatial Reference</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Warning / Honesty Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3 text-xs font-mono">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <div className="text-amber-300 font-bold">
            PROTOTYPE STAGE — Camera motion estimation pending real implementation
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Trajectory coordinates and camera station frustums below are visualized for algorithmic workflow presentation. GPS, altitude, velocity, and 6-DoF absolute camera poses are not derived from raw imagery in this prototype stage without hardware flight log sync.
          </p>
        </div>
      </div>

      {/* Main Grid: Epipolar & Camera Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Orbital Trajectory Arc Visualization */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Simulated Orbital Flight Arc & 18 Camera Stations</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Single-Pass Orbit: 120° Azimuth Arc
            </span>
          </div>

          {/* Graphical Representation */}
          <div className="relative w-full aspect-[16/9] min-h-[280px] bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Simulated 3D Building Target Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-20 rounded-lg bg-slate-800/80 border border-sky-500/40 flex flex-col items-center justify-center text-center p-2 shadow-2xl">
              <span className="text-[9px] font-mono uppercase text-sky-400 font-bold">TARGET ASSET</span>
              <span className="text-[10px] font-mono text-slate-200 font-bold">5-Storey Complex</span>
            </div>

            {/* Flight Path Curve & 18 Nodes */}
            <div className="relative w-full h-full">
              <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 400 200">
                <path
                  d="M 30 170 Q 200 20 370 170"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {selectedFrames.map((f, i) => {
                  const t = i / (selectedFrames.length - 1);
                  const x = 30 + t * 340;
                  const y = 170 - Math.sin(t * Math.PI) * 150;
                  return (
                    <g key={f.frame_id}>
                      <line
                        x1={x}
                        y1={y}
                        x2={200}
                        y2={100}
                        stroke="#38bdf8"
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#38bdf8"
                        stroke="#0369a1"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
              <span>Start Station (frame_001.jpg)</span>
              <span className="text-sky-400 font-bold">18 Multi-View Stations</span>
              <span>End Station (frame_063.jpg)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Parallax Baseline</span>
              <span className="text-slate-200 font-bold">Continuous Arc</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Average Angular Shift</span>
              <span className="text-emerald-400 font-bold">6.67° / keyframe</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Overlap Ratio</span>
              <span className="text-sky-400 font-bold">&gt; 65% multi-view</span>
            </div>
          </div>
        </div>

        {/* Right Column: Epipolar Geometry Formulation */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-white font-bold">
            <div className="flex items-center gap-2">
              <Move3d className="w-4 h-4 text-sky-400" />
              <span>Epipolar Mathematical Formulation</span>
            </div>
            <button
              onClick={() => setShowEquation(!showEquation)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-[11px] font-mono border border-slate-700 transition-colors"
              title={showEquation ? 'Hide Mathematical Formulation' : 'Show Mathematical Formulation'}
            >
              {showEquation ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Equation</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Equation</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {showEquation ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-sky-400 uppercase font-bold">Epipolar Constraint Equation:</span>
                  <button
                    onClick={() => setShowEquation(false)}
                    className="text-slate-400 hover:text-sky-300 p-0.5 rounded hover:bg-slate-800"
                    title="Hide formulation"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center text-sky-300 font-bold">
                  x'<sup>T</sup> · E · x = 0
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Where <strong>E = [t]<sub>×</sub> R</strong> is the Essential Matrix combining relative rotation <em>R</em> and translation baseline <em>t</em>.
                </p>
              </div>
            ) : (
              <div
                onClick={() => setShowEquation(true)}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-slate-400 hover:text-sky-300 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span className="text-[11px]">Epipolar constraint equation hidden</span>
                </div>
                <span className="text-[10px] text-sky-400 font-bold underline">Click eye to view</span>
              </div>
            )}

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Feature Matching & Robust RANSAC:</span>
              <ul className="space-y-1 text-[11px] text-slate-300 font-sans list-disc pl-4">
                <li>Extract SIFT/ORB keypoints across paired frame stations.</li>
                <li>Calculate 5-point relative pose with RANSAC outlier rejection.</li>
                <li>Bundle adjustment refines 3D point cloud & camera parameters.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Downstream Handoff:</span>
              <span className="text-slate-200 font-sans text-xs">
                Camera poses pass into Stage 05 (Protected Spatial Reference) to resolve scale ambiguity before dense 3D reconstruction.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
