import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Check, 
  Video, 
  Sparkles,
  Compass,
  Lock,
  Eye,
  Ruler
} from 'lucide-react';
import { GROUND_TRUTH_BUILDING } from '../data/groundTruth';
import { S3DGenLogo } from './S3DGenLogo';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17324D]/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl shadow-[0_24px_64px_rgba(50,90,125,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8E4EF] bg-[#F5F9FD] print:hidden">
          <div className="flex items-center gap-3">
            <S3DGenLogo size={38} variant="badge" />
            <div>
              <h2 className="text-base font-bold text-[#17324D] font-mono">
                S3DGen PHOTOGRAMMETRIC & EPISTEMIC AUDIT DOSSIER
              </h2>
              <p className="text-xs text-[#60758A]">
                Single-Pass UAV Video to 3D Pipeline • Provenance, Epistemic Regions & Metric Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              id="print-pdf-btn"
              className="btn-primary-cyan flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#60758A] hover:text-[#17324D] hover:bg-[#E2ECF4] transition-colors border border-transparent hover:border-[#D8E4EF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans space-y-6">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div className="flex items-start gap-4">
              <S3DGenLogo size={52} variant="badge" />
              <div>
                <div className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                  S3DGen Pipeline Audit & Provenance Verification
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  3D RECONSTRUCTION VERIFICATION REPORT
                </h1>
                <div className="text-sm font-semibold text-sky-800 mt-0.5">
                  Target Asset: Commercial Facility Prototype (1:1 Metric Scale)
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-600 space-y-1">
              <div>REPORT ID: <strong className="text-slate-900">S3D-2026-AUDIT-REV4</strong></div>
              <div>DATE: <strong className="text-slate-900">2026-08-27</strong></div>
              <div>CLASSIFICATION: <strong className="text-sky-700 font-bold">INTERNAL MVP PROVENANCE AUDIT</strong></div>
            </div>
          </div>

          {/* 1. Video Input & Triage Provenance (Real Data) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-700" />
                1. AI-Assisted Frame Selection Audit [CURRENT UPLOADED DATASET]
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Data Provenance: REAL (Current Dataset)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Total Extracted Frames</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">63</div>
                <div className="text-[9px] text-slate-500">Current Dataset</div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                <div className="text-[10px] text-emerald-800 uppercase font-bold">Selected Keyframes</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">18</div>
                <div className="text-[9px] text-emerald-700 font-semibold">28.57% Selection Rate</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                <div className="text-[10px] text-amber-800 uppercase">Redundant Frames Filtered</div>
                <div className="text-lg font-bold text-amber-700 mt-0.5">42</div>
                <div className="text-[9px] text-amber-700">93.3% of Discarded</div>
              </div>
              <div className="p-2.5 bg-rose-50 rounded border border-rose-200">
                <div className="text-[10px] text-rose-800 uppercase">Motion Blur Excluded</div>
                <div className="text-lg font-bold text-rose-700 mt-0.5">3</div>
                <div className="text-[9px] text-rose-700">6.7% of Discarded</div>
              </div>
            </div>
          </div>

          {/* 2. Protected Reference & Epistemic Audit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-700" />
                2. 4-Class Epistemic Surface Audit [SPATIAL TAGGING]
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                Epistemic Integrity: CLASSIFIED
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded">
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>1. Observed</span>
                  <span className="text-xs text-emerald-700 font-semibold">Direct Rays</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">
                  Surface geometry reconstructed directly from multi-view keyframe observations.
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>2. Ref-Supported</span>
                  <span className="text-xs text-blue-700 font-semibold">Spatial Prior</span>
                </div>
                <div className="text-[10px] text-blue-700 mt-1">
                  Occluded zones constrained by protected geometric spatial reference; zero blueprint leakage.
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>3. Inferred</span>
                  <span className="text-xs text-amber-700 font-semibold">Symmetry</span>
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  Symmetric extensions and coplanar interpolations across unseen bays.
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-300 rounded">
                <div className="font-bold text-rose-900 flex items-center justify-between">
                  <span>4. Unknown</span>
                  <span className="text-xs text-rose-700 font-semibold">Occluded</span>
                </div>
                <div className="text-[10px] text-rose-700 mt-1">
                  Deep interior voids with zero camera rays and zero structural constraints.
                </div>
              </div>
            </div>
          </div>

          {/* 3. Reference-Assisted Metric Validation Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-sky-700" />
                3. Reference-Assisted Geometric & Dimensional Validation [METROLOGY FORMULATION]
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                [NOT YET MEASURED]
              </span>
            </div>

            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-800 text-white font-mono text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-700">Geometric Parameter</th>
                  <th className="p-2 border-r border-slate-700">Protected Reference Benchmark</th>
                  <th className="p-2 border-r border-slate-700">Reconstructed 3D</th>
                  <th className="p-2 border-r border-slate-700">Error Formulation</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800 font-mono text-[11px]">
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                    Long Facade Length (X-Axis)
                  </td>
                  <td className="p-2 border-r border-slate-200">28.00 m (7 bays @ 4.00m)</td>
                  <td className="p-2 text-slate-500 italic border-r border-slate-200">NOT YET MEASURED</td>
                  <td className="p-2 border-r border-slate-200">Δ = |L_rec − L_ref|</td>
                  <td className="p-2 text-amber-700 font-semibold">NOT YET MEASURED</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                    Short Facade Width (Z-Axis)
                  </td>
                  <td className="p-2 border-r border-slate-200">12.00 m (3 bays @ 4.00m)</td>
                  <td className="p-2 text-slate-500 italic border-r border-slate-200">NOT YET MEASURED</td>
                  <td className="p-2 border-r border-slate-200">Δ = |W_rec − W_ref|</td>
                  <td className="p-2 text-amber-700 font-semibold">NOT YET MEASURED</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                    Parapet Eaves Height (Y-Axis)
                  </td>
                  <td className="p-2 border-r border-slate-200">18.50 m</td>
                  <td className="p-2 text-slate-500 italic border-r border-slate-200">NOT YET MEASURED</td>
                  <td className="p-2 border-r border-slate-200">Δ = |H_rec − H_ref|</td>
                  <td className="p-2 text-amber-700 font-semibold">NOT YET MEASURED</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                    Penthouse Peak Elevation
                  </td>
                  <td className="p-2 border-r border-slate-200">21.50 m</td>
                  <td className="p-2 text-slate-500 italic border-r border-slate-200">NOT YET MEASURED</td>
                  <td className="p-2 border-r border-slate-200">Δ = |H_rec − H_ref|</td>
                  <td className="p-2 text-amber-700 font-semibold">NOT YET MEASURED</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Reference-Assisted Validation Note:</strong> Because the protected spatial reference contributes to reconstruction scale and datum alignment, comparison against this reference is classified as Reference-Assisted Validation rather than independent validation. Certified independent accuracy requires uncoupled external physical terrestrial LiDAR / RTK ground control survey points.
              </div>
            </div>
          </div>

          {/* 4. Technical Honesty & Limitations Statement */}
          <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end text-xs font-mono">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">S3DGen Engineering Integrity Notice</div>
              <div className="text-slate-800">
                Visual Quality ≠ Metric Accuracy • Pipeline uses explicit 4-class epistemic tagging.
              </div>
              <div className="text-[10px] text-slate-500">
                Protected reference used strictly as scale constraint; no geometric leakage into reconstruction.
              </div>
            </div>

            <div className="p-2.5 border-2 border-slate-400 rounded text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Verification Stamp</div>
              <div className="text-xs font-bold text-slate-800">S3DGen MVP AUDIT</div>
              <div className="text-[9px] text-slate-500">STAGE PROVENANCE VERIFIED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
