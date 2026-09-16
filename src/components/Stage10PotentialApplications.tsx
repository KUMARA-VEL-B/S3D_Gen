import React from 'react';
import { Building2, Flame, Map, HardHat, ArrowRight, RotateCcw, CheckCircle2, Box } from 'lucide-react';

interface Stage10PotentialApplicationsProps {
  onRestartWorkflow: () => void;
  onExplore3DModel: () => void;
  onLaunchDisasterSimulation?: () => void;
}

export const Stage10PotentialApplications: React.FC<Stage10PotentialApplicationsProps> = ({
  onRestartWorkflow,
  onExplore3DModel,
  onLaunchDisasterSimulation,
}) => {
  const applications = [
    {
      id: 'app-infrastructure',
      title: 'Infrastructure Inspection',
      category: 'Civil & Structural Engineering',
      icon: Building2,
      description: 'Single-pass inspection of bridges, industrial facades, towers, and heritage structures to detect cracks, spalling, and surface deformations.',
      keyBenefit: '80% faster turnaround with zero worker elevation hazard.',
      status: 'Field Ready',
    },
    {
      id: 'app-urban',
      title: 'Urban Mapping',
      category: 'Municipal GIS & Planning',
      icon: Map,
      description: 'City-scale building footprint and elevation contour generation for flood modeling, solar potential analysis, and zoning verification.',
      keyBenefit: 'Direct georeferenced spatial alignment from single UAV trajectories.',
      status: 'Field Ready',
    },
    {
      id: 'app-construction',
      title: 'Construction Monitoring',
      category: 'Project Control & Earthworks',
      icon: HardHat,
      description: 'Periodic drone passes track volumetric earthworks, concrete pour schedules, and structural framing progress against design intent.',
      keyBenefit: 'Measurable metric verification without manual site surveys.',
      status: 'Deployment Ready',
    },
    {
      id: 'app-disaster',
      title: 'Disaster Assessment',
      category: 'Emergency Reconnaissance',
      icon: Flame,
      description: 'Rapid post-earthquake, storm, or flood reconnaissance. Rapid 3D geometric triage identifies structural collapse hazards and safe access corridors.',
      keyBenefit: 'Immediate spatial triage without risky ground team entry.',
      status: 'Deployment Ready',
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#28BFEF] bg-[#ECFAFF] border border-[#28BFEF]/20 px-2.5 py-0.5 rounded-lg">
              STAGE 06
            </span>
            <h2 className="text-lg font-bold text-[#17324D] font-mono">
              Downstream Applications
            </h2>
          </div>
          <p className="text-xs text-[#60758A] font-mono">
            Downstream industry deployment domains for single-pass UAV 3D reconstruction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExplore3DModel}
            id="applications-return-model-btn"
            className="btn-primary-cyan flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Return to 3D Model</span>
          </button>

          <button
            onClick={onRestartWorkflow}
            id="applications-reset-btn"
            className="btn-secondary-glass flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#F59E0B] hover:text-[#D97706] hover:bg-[#FFFBEB] text-xs font-mono font-bold border-[#F59E0B]/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Pipeline Completion Summary Banner */}
      <div className="p-4 rounded-xl bg-[#E8F8F0] border border-[#22B573]/30 flex items-center justify-between flex-wrap gap-3 font-mono text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#22B573]/40 flex items-center justify-center text-[#22B573] shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#22B573] font-bold flex items-center gap-1.5">
              <span>S3DGen Workflow Complete</span>
              <span className="text-[10px] bg-[#FFFFFF] text-[#17324D] px-2 py-0.5 rounded border border-[#22B573]/20 font-semibold shadow-2xs">
                6/6 VISIBLE STAGES
              </span>
            </div>
            <p className="text-[11px] text-[#243447] font-sans mt-0.5">
              Full single-pass reconstruction pipeline executed from UAV video ingestion through photogrammetric synthesis and downstream validation.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Clean Application Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#28BFEF] transition-all shadow-xs hover:shadow-[0_8px_30px_rgba(40,191,239,0.08)] group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#ECFAFF] border border-[#28BFEF]/20 text-[#28BFEF] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#22B573] bg-[#E8F8F0] border border-[#22B573]/30 px-2.5 py-0.5 rounded-full">
                    {app.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#17324D] font-mono group-hover:text-[#28BFEF] transition-colors">
                    {app.title}
                  </h3>
                  <span className="text-[11px] text-[#60758A] font-mono">
                    {app.category}
                  </span>
                </div>

                <p className="text-xs text-[#60758A] font-sans leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D8E4EF] flex flex-col gap-2">
                <span className="text-[11px] text-[#22B573] font-mono font-semibold block">
                  ✓ Impact: {app.keyBenefit}
                </span>
                {app.id === 'app-disaster' && onLaunchDisasterSimulation && (
                  <button
                    onClick={onLaunchDisasterSimulation}
                    className="mt-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FDBA74] text-[#C2410C] font-mono text-xs font-bold transition-all shadow-xs group/btn"
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Launch 3D Disaster Simulation</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
