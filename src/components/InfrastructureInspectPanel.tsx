import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Eye,
  EyeOff,
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface InfrastructureInspectPanelProps {
  selectedLevel: string;
}

export const InfrastructureInspectPanel: React.FC<InfrastructureInspectPanelProps> = ({
  selectedLevel,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  return (
    <div className="w-full bg-[rgba(16,21,29,0.72)] backdrop-blur-md border border-[rgba(85,214,255,0.15)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[rgba(11,14,20,0.75)] border-b border-[rgba(148,163,184,0.14)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[rgba(18,59,90,0.85)] text-[#55D6FF] border border-[#55D6FF]/40">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E8EEF5] font-mono uppercase tracking-wide">
                SECONDARY REFERENCE: INFRASTRUCTURE & BIM SKELETON
              </h3>
              <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-[#94A3B8]">
              Secondary Reference Tool • Reinforced Concrete Framing Grid • 4.0m Modular Bays • 1:1 Metric Anchor
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-secondary-glass flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium"
          title={showDetails ? 'Hide Infrastructure Details' : 'Show Infrastructure Details'}
        >
          {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-5 space-y-4 font-mono text-xs">
        {showDetails ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Structural Framing Specifications */}
            <div className="p-4 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#E8EEF5]">
                <span className="text-[#55D6FF] uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Framing Matrix & Grid Layout [DEMO]
                </span>
                <span className="text-[#39D98A] text-[11px]">7 × 3 Modular Bays</span>
              </div>
              <p className="text-[#CBD5E1] text-[11px] leading-relaxed font-sans">
                The target structure follows a standard 4.0m × 4.0m modular post-and-beam system. Vertical loads are distributed through 32 structural columns across 5 operational elevation planes into continuous reinforced footings.
              </p>
            </div>

            {/* Framing Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-1">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Columns & Pilasters</div>
                <div className="text-base font-bold text-[#E8EEF5]">32 Column Shafts</div>
                <div className="text-[10px] text-[#64748B]">750mm × 650mm C40 Concrete</div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-1">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Primary Floor Girders</div>
                <div className="text-base font-bold text-[#55D6FF]">28 Spans @ 4.0m</div>
                <div className="text-[10px] text-[#64748B]">450mm × 700mm Post-Tensioned</div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-1">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Floor Slabs</div>
                <div className="text-base font-bold text-[#39D98A]">350mm Solid RC</div>
                <div className="text-[10px] text-[#64748B]">5 Elevation Levels (0 - 21.5m)</div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(11,14,20,0.7)] border border-[rgba(148,163,184,0.14)] space-y-1">
                <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Spatial Reference</div>
                <div className="text-base font-bold text-[#A78BFA]">Anchored 1:1</div>
                <div className="text-[10px] text-[#64748B]">Zero Geometry Leakage</div>
              </div>
            </div>

            {/* Selected Elevation Slice Status */}
            <div className="p-3.5 rounded-xl bg-[rgba(11,14,20,0.6)] border border-[rgba(148,163,184,0.14)] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#94A3B8] uppercase font-semibold">Active Elevation Filter:</span>
                <span className="text-[#55D6FF] font-bold px-2 py-0.5 rounded-lg bg-[rgba(18,59,90,0.6)] border border-[#55D6FF]/30">
                  {selectedLevel === 'all' ? 'Full Structure (0.00 - 21.50m)' :
                   selectedLevel === '0' ? 'Ground Floor (0.00 - 4.50m)' :
                   selectedLevel === '1' ? 'Level 1 (7.00m)' :
                   selectedLevel === '2' ? 'Level 2 (10.50m)' :
                   selectedLevel === '3' ? 'Level 3 (14.00m)' : 'Roof Deck (21.50m)'}
                </span>
              </div>
              <div className="text-[10px] text-[#94A3B8] font-sans">
                Floor-by-floor slice isolation enables cross-sectional verification between photogrammetric outer mesh and internal structural BIM layout.
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowDetails(true)}
            className="p-3.5 rounded-xl bg-[rgba(11,14,20,0.6)] border border-[rgba(148,163,184,0.14)] flex items-center justify-between text-[#94A3B8] hover:text-[#55D6FF] hover:border-[#55D6FF]/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#55D6FF]" />
              <span className="text-[11px]">Infrastructure & BIM skeleton telemetry hidden</span>
            </div>
            <span className="text-[10px] text-[#55D6FF] font-bold underline">Click eye to inspect</span>
          </div>
        )}
      </div>
    </div>
  );
};
