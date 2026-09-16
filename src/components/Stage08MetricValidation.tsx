import React from 'react';
import { Ruler, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Calculator, FileText } from 'lucide-react';
import { METRIC_VALIDATION_DATA } from '../data/s3dgenStages';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Stage08MetricValidationProps {
  onProceedToNext: () => void;
  onOpenReport: () => void;
}

export const Stage08MetricValidation: React.FC<Stage08MetricValidationProps> = ({
  onProceedToNext,
  onOpenReport,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-[#D8E4EF] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_28px_rgba(50,90,125,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#1B85AE] bg-[#ECFAFF] border border-[#BFE8F5] px-2.5 py-0.5 rounded">
              STAGE 08
            </span>
            <ProvenanceBadge type="DEMO_METRIC_NOT_VALIDATED" size="sm" />
            <h2 className="text-lg font-bold text-[#17324D] font-mono">
              Reference-Assisted Validation & Metrology
            </h2>
          </div>
          <p className="text-xs text-[#60758A] font-mono">
            Reference-assisted error formulations against protected spatial reference benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReport}
            className="btn-secondary-glass flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold"
          >
            <FileText className="w-4 h-4" />
            <span>Export Prototype Report</span>
          </button>

          <button
            onClick={onProceedToNext}
            id="stage08-advance-btn"
            className="btn-primary-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold active:scale-95 shrink-0"
          >
            <span>Explore Final 3D Model</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accuracy Terminology Distinction Banner */}
      <div className="p-4 rounded-xl bg-[#FDF6E7] border border-[#F0DBA6] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#A6740F] font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL METROLOGY PRINCIPLE:</span>
          </div>
          <span className="text-[10px] text-[#8798A8]">Scientifically Defensible Photogrammetry</span>
        </div>
        <div className="p-3 bg-white rounded-lg text-center font-mono text-xs text-[#A6740F] font-bold tracking-wide border border-[#F0DBA6]">
          VISUAL QUALITY &nbsp;≠&nbsp; GEOMETRIC QUALITY &nbsp;≠&nbsp; METRIC ACCURACY &nbsp;≠&nbsp; GEOREFERENCING ACCURACY
        </div>
        <p className="text-[11px] text-[#60758A] font-sans leading-relaxed">
          A visually impressive 3D model is <strong>not</strong> proof of metric accuracy. S3DGen structures explicit mathematical error formulas against protected benchmarks rather than presenting fabricated accuracy percentages.
        </p>
      </div>

      {/* Validation Architecture Flow */}
      <div className="p-4 bg-white border border-[#D8E4EF] rounded-2xl space-y-3 font-mono text-xs shadow-[0_4px_16px_rgba(50,90,125,0.06)]">
        <div className="flex items-center gap-2 text-[#1B85AE] font-bold">
          <Ruler className="w-4 h-4" />
          <span>REFERENCE-ASSISTED VALIDATION FLOW</span>
        </div>
        <div className="p-3 bg-[#F5F9FD] rounded-xl border border-[#D8E4EF] flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center text-[#36526A]">
          <span className="px-2.5 py-1 rounded bg-white border border-[#D8E4EF] text-[#17324D] font-semibold">Reconstructed Model</span>
          <span className="text-[#1B85AE] font-bold">+</span>
          <span className="px-2.5 py-1 rounded bg-white border border-[#D8E4EF] text-[#17324D] font-semibold">Protected Spatial Reference</span>
          <span className="text-[#1B85AE] font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-white border border-[#D8E4EF] text-[#1B85AE] font-semibold">Measurement</span>
          <span className="text-[#1B85AE] font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-white border border-[#D8E4EF] text-[#1B85AE] font-semibold">Error Calculation</span>
          <span className="text-[#1B85AE] font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-[#FDF6E7] border border-[#F0DBA6] text-[#A6740F] font-semibold">Validation Result</span>
        </div>
        <p className="text-[11px] text-[#60758A] font-sans">
          <strong>Methodology Note:</strong> Because the protected spatial reference assists in reconstruction scale and boundary constraints, downstream comparison against that reference is classified as <em>Reference-Assisted Validation</em> rather than uncoupled independent validation.
        </p>
      </div>

      {/* Explicit Math Formulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-[#D8E4EF] rounded-2xl space-y-2 shadow-[0_4px_16px_rgba(50,90,125,0.06)]">
          <div className="flex items-center gap-2 text-[#1B85AE] font-mono text-xs font-bold">
            <Calculator className="w-4 h-4" />
            <span>Absolute Dimensional Error Formula</span>
          </div>
          <div className="p-3 bg-[#F5F9FD] rounded-xl text-center font-mono text-sm text-[#1B85AE] font-bold border border-[#D8E4EF]">
            Absolute Error (m) = |Reconstructed − Reference|
          </div>
          <p className="text-[11px] text-[#60758A] font-sans">
            Measures the raw spatial discrepancy between the reconstructed feature vertices and the anchored reference benchmark.
          </p>
        </div>

        <div className="p-4 bg-white border border-[#D8E4EF] rounded-2xl space-y-2 shadow-[0_4px_16px_rgba(50,90,125,0.06)]">
          <div className="flex items-center gap-2 text-[#1A9260] font-mono text-xs font-bold">
            <Calculator className="w-4 h-4" />
            <span>Relative Percentage Error Formula</span>
          </div>
          <div className="p-3 bg-[#F5F9FD] rounded-xl text-center font-mono text-sm text-[#1A9260] font-bold border border-[#D8E4EF]">
            Relative Error (%) = (|Reconstructed − Reference| / Reference) × 100
          </div>
          <p className="text-[11px] text-[#60758A] font-sans">
            Normalizes the error relative to the total dimension scale to evaluate structural fidelity across diverse spans.
          </p>
        </div>
      </div>

      {/* Metric Validation Table */}
      <div className="bg-white border border-[#D8E4EF] rounded-2xl overflow-hidden shadow-[0_8px_28px_rgba(50,90,125,0.08)]">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D8E4EF] flex items-center justify-between">
          <div className="font-mono text-xs font-bold text-[#17324D] flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#1B85AE]" />
            <span>Reference-Assisted Validation Matrix [PROTOTYPE / NOT VALIDATED]</span>
          </div>
          <span className="text-[10px] font-mono text-[#A6740F] bg-[#FDF6E7] px-2 py-0.5 rounded border border-[#F0DBA6]">
            Validation Status: NOT YET MEASURED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F5F9FD] text-[#8798A8] text-[11px] border-b border-[#D8E4EF]">
              <tr>
                <th className="p-3">Checkpoint ID</th>
                <th className="p-3">Dimension Parameter</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Reconstructed</th>
                <th className="p-3 text-right">Absolute Error</th>
                <th className="p-3 text-right">Relative Error</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF4FA] text-[#36526A]">
              {METRIC_VALIDATION_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F9FD] transition-colors">
                  <td className="p-3 font-bold text-[#1B85AE]">{item.id}</td>
                  <td className="p-3 font-sans font-medium text-[#243447]">
                    <div>{item.dimensionName}</div>
                    <div className="text-[10px] text-[#8798A8] font-mono mt-0.5">{item.notes}</div>
                  </td>
                  <td className="p-3 text-[#60758A]">{item.category}</td>
                  <td className="p-3 text-right text-[#60758A]">
                    {item.reconstructedValue !== null && item.reconstructedValue !== undefined
                      ? `${item.reconstructedValue.toFixed(2)}m`
                      : 'NOT YET MEASURED'}
                  </td>
                  <td className="p-3 text-right text-[#60758A]">
                    {item.absoluteErrorMeters !== null && item.absoluteErrorMeters !== undefined
                      ? `${item.absoluteErrorMeters.toFixed(3)}m`
                      : 'NOT YET MEASURED'}
                  </td>
                  <td className="p-3 text-right text-[#60758A]">
                    {item.relativeErrorPercent !== null && item.relativeErrorPercent !== undefined
                      ? `${item.relativeErrorPercent.toFixed(2)}%`
                      : 'NOT YET MEASURED'}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF6E7] text-[#A6740F] border border-[#F0DBA6]">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
