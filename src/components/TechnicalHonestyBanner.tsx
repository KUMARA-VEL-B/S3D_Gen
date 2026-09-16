import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

export const TechnicalHonestyBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-[rgba(255,255,255,0.82)] backdrop-blur-[14px] border-y border-[#D8E4EF] text-xs font-mono">
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 text-[#1B85AE] font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#1B85AE]" />
            <span>DATA & PROVENANCE STATUS:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ProvenanceBadge type="REAL" size="sm" />
            <span className="text-[#60758A] text-[11px] hidden sm:inline">Frames & JSON</span>
          </div>

          <div className="text-[#D8E4EF] hidden sm:inline">•</div>

          <div className="flex items-center gap-2 shrink-0">
            <ProvenanceBadge type="PROTECTED_REFERENCE" size="sm" />
            <span className="text-[#60758A] text-[11px] hidden sm:inline">Protected Reference</span>
          </div>

          <div className="text-[#D8E4EF] hidden sm:inline">•</div>

          <div className="flex items-center gap-2 shrink-0">
            <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
            <span className="text-[#60758A] text-[11px] hidden sm:inline">3D Mesh Prototype</span>
          </div>

          <div className="text-[#D8E4EF] hidden sm:inline">•</div>

          <div className="flex items-center gap-2 shrink-0">
            <ProvenanceBadge type="DEMO_METRIC_NOT_VALIDATED" size="sm" />
            <span className="text-[#60758A] text-[11px] hidden sm:inline">Reference-Assisted Math</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-[#1B85AE] hover:text-[#28BFEF] font-semibold px-2 py-1 rounded hover:bg-[#ECFAFF] transition-colors shrink-0"
        >
          <span>{isExpanded ? 'Hide Provenance Matrix' : 'Data & Provenance Matrix'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-[#D8E4EF] bg-[#F5F9FD] px-4 py-3">
          <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* Left: What the MVP Demonstrates */}
            <div className="p-3.5 rounded-xl bg-[#EAFBF3] border border-[#B9E8D2] space-y-2">
              <div className="flex items-center gap-2 text-[#1A9260] font-bold font-mono text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>WHAT THE CURRENT MVP DEMONSTRATES [REAL / DATA-DRIVEN]</span>
              </div>
              <ul className="space-y-1.5 text-[#36526A] text-xs list-disc pl-4">
                <li><strong className="text-[#17324D]">Real Input Data:</strong> Video stream ingestion and exact frame dataset from current uploaded <code className="text-[#1A9260] bg-[#D9F3E6] px-1 py-0.5 rounded font-mono">frame_analysis.json</code>.</li>
                <li><strong className="text-[#17324D]">AI-Assisted Frame Selection:</strong> Qualitative keyframe triage isolating redundant and blurred frames.</li>
                <li><strong className="text-[#17324D]">Protected Spatial Reference:</strong> Confidential spatial constraint anchoring without exposing sensitive blueprint/CAD files.</li>
                <li><strong className="text-[#17324D]">4-Class Epistemic Segmentation:</strong> Explicit categorization of Observed, Reference-Supported, Inferred, and Unknown regions in 3D.</li>
                <li><strong className="text-[#17324D]">Metric Error Formulations:</strong> Explicit absolute & relative mathematical formulas (<code className="text-[#1A9260] font-mono">|Reconstructed - Reference|</code>).</li>
              </ul>
            </div>

            {/* Right: Future Integrations */}
            <div className="p-3.5 rounded-xl bg-[#ECFAFF] border border-[#BFE8F5] space-y-2">
              <div className="flex items-center gap-2 text-[#1B85AE] font-bold font-mono text-xs">
                <Info className="w-4 h-4" />
                <span>FUTURE INTEGRATIONS [PLANNED / FUTURE]</span>
              </div>
              <ul className="space-y-1.5 text-[#36526A] text-xs list-disc pl-4">
                <li><strong className="text-[#17324D]">In-Flight Neural Triage:</strong> Edge optical-flow & parallax keyframe extraction on UAV companion hardware.</li>
                <li><strong className="text-[#17324D]">Integrated Dense Photogrammetry:</strong> Server-side multi-view SfM / MVS dense surface reconstruction pipeline.</li>
                <li><strong className="text-[#17324D]">RTK/GNSS-Assisted Georeferencing:</strong> Direct integration with multi-frequency GNSS base station ground control points.</li>
                <li><strong className="text-[#17324D]">GIS & BIM Integration:</strong> Export adapters to municipal GIS platforms and BIM reference environments.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
