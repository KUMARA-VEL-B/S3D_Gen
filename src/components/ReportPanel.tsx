import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Video, 
  Eye, 
  EyeOff,
  Ruler, 
  AlertTriangle,
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EPISTEMIC_REGIONS, METRIC_VALIDATION_DATA } from '../data/s3dgenStages';

interface ReportPanelProps {
  onExportPDF: () => void;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  onExportPDF,
}) => {
  const [showSection1, setShowSection1] = useState<boolean>(false);
  const [showSection2, setShowSection2] = useState<boolean>(false);
  const [showSection3, setShowSection3] = useState<boolean>(false);

  const allVisible = showSection1 && showSection2 && showSection3;
  const toggleAll = () => {
    const nextState = !allVisible;
    setShowSection1(nextState);
    setShowSection2(nextState);
    setShowSection3(nextState);
  };

  return (
    <div className="w-full bg-[rgba(16,21,29,0.72)] backdrop-blur-md border border-[rgba(85,214,255,0.15)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col font-sans">
      {/* Panel Header */}
      <div className="px-5 py-3.5 bg-[rgba(11,14,20,0.75)] border-b border-[rgba(148,163,184,0.14)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[rgba(18,59,90,0.85)] text-[#55D6FF] border border-[#55D6FF]/40">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E8EEF5] font-mono uppercase tracking-wide">
                S3DGen PIPELINE AUDIT & PROVENANCE DOSSIER
              </h3>
              <ProvenanceBadge type="COMPUTED" size="sm" />
            </div>
            <p className="text-xs text-[#94A3B8]">
              Photogrammetry Triage, 4-Class Epistemic Audit & Ground-Truth Metric Validation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="btn-secondary-glass flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium"
            title={allVisible ? 'Hide all sections' : 'Show all sections'}
          >
            {allVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{allVisible ? 'Hide All' : 'Show All'}</span>
          </button>

          <button
            onClick={onExportPDF}
            id="export-pdf-action-btn"
            className="btn-primary-cyan flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Audit Dossier</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto max-h-[680px]">
        {/* 1. Real Video & Frame Triage Telemetry */}
        <div className="p-4 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#55D6FF]" />
              <span className="text-[#55D6FF] font-bold uppercase tracking-wide">
                1. Video Ingestion & Triage Telemetry
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[rgba(26,44,36,0.85)] text-[#39D98A] border border-[rgba(57,217,138,0.4)]">
                [REAL DATA — SINGLE SOURCE OF TRUTH]
              </span>
              <button
                onClick={() => setShowSection1(!showSection1)}
                className="btn-secondary-glass flex items-center gap-1 px-2 py-1 rounded-md text-[11px]"
                title={showSection1 ? 'Hide Section 1' : 'Show Section 1'}
              >
                {showSection1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSection1 ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>

          {showSection1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1 animate-fadeIn">
              <div className="p-2.5 rounded-lg bg-[rgba(16,21,29,0.6)] border border-[rgba(148,163,184,0.12)]">
                <div className="text-[10px] text-[#94A3B8] uppercase">Total Extracted</div>
                <div className="text-xl font-bold text-[#E8EEF5] mt-0.5">63</div>
                <div className="text-[9px] text-[#64748B]">100.0% Input Stream</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(26,44,36,0.5)] border border-[rgba(57,217,138,0.3)]">
                <div className="text-[10px] text-[#39D98A] uppercase font-bold">Selected Keyframes</div>
                <div className="text-xl font-bold text-[#39D98A] mt-0.5">18</div>
                <div className="text-[9px] text-[#39D98A]">28.57% Selection Rate</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(45,30,15,0.5)] border border-[rgba(255,159,67,0.3)]">
                <div className="text-[10px] text-[#FF9F43] uppercase">Redundancy Discarded</div>
                <div className="text-xl font-bold text-[#FF9F43] mt-0.5">42</div>
                <div className="text-[9px] text-[#FF9F43]">93.3% of Discards</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(50,20,25,0.5)] border border-[rgba(255,77,77,0.3)]">
                <div className="text-[10px] text-[#FF4D4D] uppercase">Motion Blur Discarded</div>
                <div className="text-xl font-bold text-[#FF4D4D] mt-0.5">3</div>
                <div className="text-[9px] text-[#FF4D4D]">6.7% of Discards</div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowSection1(true)}
              className="p-2.5 rounded-lg bg-[rgba(16,21,29,0.5)] border border-[rgba(148,163,184,0.12)] flex items-center justify-between text-[#94A3B8] hover:text-[#55D6FF] hover:border-[#55D6FF]/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#55D6FF]" />
                <span className="text-[11px]">Video ingestion & triage telemetry hidden</span>
              </div>
              <span className="text-[10px] text-[#55D6FF] font-bold underline">Click eye to view</span>
            </div>
          )}
        </div>

        {/* 2. 4-Class Epistemic Surface Audit */}
        <div className="p-4 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-[#A78BFA] font-bold uppercase tracking-wide">
                2. 4-Class Epistemic Surface Partitioning
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ProvenanceBadge type="COMPUTED" size="sm" />
              <button
                onClick={() => setShowSection2(!showSection2)}
                className="btn-secondary-glass flex items-center gap-1 px-2 py-1 rounded-md text-[11px]"
                title={showSection2 ? 'Hide Section 2' : 'Show Section 2'}
              >
                {showSection2 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSection2 ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>

          {showSection2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 animate-fadeIn">
              {EPISTEMIC_REGIONS.map((region) => (
                <div
                  key={region.category}
                  className="p-3 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: `${region.hex}15`,
                    borderColor: `${region.hex}45`,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#E8EEF5] mb-1">
                      <span>{region.label}</span>
                      <span className="text-base font-extrabold" style={{ color: region.hex }}>
                        {region.percentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[#CBD5E1] leading-relaxed font-sans">
                      {region.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.12)] text-[9px] text-[#94A3B8]">
                    Basis: <span className="font-semibold text-[#E8EEF5]">{region.validationSource}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => setShowSection2(true)}
              className="p-2.5 rounded-lg bg-[rgba(16,21,29,0.5)] border border-[rgba(148,163,184,0.12)] flex items-center justify-between text-[#94A3B8] hover:text-[#A78BFA] hover:border-[#A78BFA]/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="text-[11px]">4-Class epistemic partitioning hidden</span>
              </div>
              <span className="text-[10px] text-[#A78BFA] font-bold underline">Click eye to view</span>
            </div>
          )}
        </div>

        {/* 3. Reference-Assisted Benchmark */}
        <div className="p-4 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#55D6FF]" />
              <span className="text-[#55D6FF] font-bold uppercase tracking-wide">
                3. Reference-Assisted Dimensional & Geometric Validation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ProvenanceBadge type="DEMO_METRIC_NOT_VALIDATED" size="sm" />
              <button
                onClick={() => setShowSection3(!showSection3)}
                className="btn-secondary-glass flex items-center gap-1 px-2 py-1 rounded-md text-[11px]"
                title={showSection3 ? 'Hide Section 3' : 'Show Section 3'}
              >
                {showSection3 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSection3 ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>

          {showSection3 ? (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="border border-[rgba(148,163,184,0.14)] rounded-xl overflow-hidden">
                <div className="bg-[rgba(16,21,29,0.75)] px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.12)] text-[11px] font-bold text-[#CBD5E1] flex items-center justify-between">
                  <span>Reference-Assisted Datum vs Reconstructed Model</span>
                  <span className="text-[10px] text-[#FF9F43]">[REFERENCE-ASSISTED BENCHMARK]</span>
                </div>

                <div className="divide-y divide-[rgba(148,163,184,0.1)] text-[11px]">
                  {METRIC_VALIDATION_DATA.map((item) => (
                    <div key={item.id} className="p-2.5 bg-[rgba(11,14,20,0.5)] hover:bg-[rgba(21,28,38,0.6)] grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4 text-[#E8EEF5] font-medium">
                        {item.dimensionName}
                      </div>
                      <div className="col-span-3 text-[#94A3B8]">
                        Ref: <strong className="text-[#E8EEF5]">{item.referenceValue}m</strong>
                      </div>
                      <div className="col-span-3 text-[#94A3B8]">
                        Recon: <strong className="text-[#55D6FF]">{item.reconstructedValue}m</strong>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-[10px] text-[#39D98A] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(26,44,36,0.6)] border border-[rgba(57,217,138,0.4)]">
                          {item.status} ({item.absoluteErrorMeters}m Δ)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(45,30,15,0.4)] border border-[rgba(255,159,67,0.3)] text-[10px] text-[#FF9F43] flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FF9F43] mt-0.5" />
                <span>
                  <strong>Technical Honesty Disclaimer:</strong> Ground truth metrics are benchmarked against the synthetic reference model. Live bundle adjustment on arbitrary consumer videos remains an active engineering milestone.
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowSection3(true)}
              className="p-2.5 rounded-lg bg-[rgba(16,21,29,0.5)] border border-[rgba(148,163,184,0.12)] flex items-center justify-between text-[#94A3B8] hover:text-[#55D6FF] hover:border-[#55D6FF]/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#55D6FF]" />
                <span className="text-[11px]">Dimensional & geometric benchmark validation hidden</span>
              </div>
              <span className="text-[10px] text-[#55D6FF] font-bold underline">Click eye to view</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
