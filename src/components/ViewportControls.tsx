import React from 'react';
import { 
  Eye, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Camera, 
  Grid, 
  Radio, 
  Scan, 
  Activity,
  Box,
  Compass,
  Sliders,
  Play,
  FileText,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { ViewingMode, RenderShaderMode, DamageType, ComparisonMode, DisasterScenarioState } from '../types';

interface ViewportControlsProps {
  viewingMode: ViewingMode;
  onSelectViewingMode: (mode: ViewingMode) => void;
  renderMode: RenderShaderMode;
  onSelectRenderMode: (mode: RenderShaderMode) => void;
  selectedLevel: string;
  onSelectLevel: (lvl: string) => void;
  comparisonMode: ComparisonMode;
  onSelectComparisonMode: (mode: ComparisonMode) => void;
  comparisonSlider: number;
  onChangeComparisonSlider: (val: number) => void;
  damageType?: DamageType;
  onSelectDamageType?: (type: DamageType) => void;
  onTriggerDamageAnimation?: (type: DamageType) => void;
  showDronePath: boolean;
  onToggleDronePath: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onSelectCameraPreset: (preset: 'iso' | 'front' | 'rear' | 'left' | 'right' | 'top' | 'drone') => void;
  onTriggerLaserScan: () => void;
  onTriggerReconstructionAnimation?: () => void;
  onOpenReport?: () => void;
  disasterState?: DisasterScenarioState;
  onSelectDisasterState?: (state: DisasterScenarioState) => void;
  isDisasterActive?: boolean;
  onToggleDisasterActive?: (active: boolean) => void;
  highlightAffectedAreas?: boolean;
  onToggleHighlightAffected?: (highlight: boolean) => void;
  onTriggerDisasterSimulation?: () => void;
  onTriggerRecoveryAnimation?: () => void;
  onResetDisaster?: () => void;
  compareDisasterSplit?: number;
  onChangeCompareDisasterSplit?: (val: number) => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  viewingMode,
  onSelectViewingMode,
  renderMode,
  onSelectRenderMode,
  selectedLevel,
  onSelectLevel,
  comparisonMode,
  onSelectComparisonMode,
  comparisonSlider,
  onChangeComparisonSlider,
  damageType = 'none',
  onSelectDamageType,
  onTriggerDamageAnimation,
  showDronePath,
  onToggleDronePath,
  showGrid,
  onToggleGrid,
  onSelectCameraPreset,
  onTriggerLaserScan,
  onTriggerReconstructionAnimation,
  onOpenReport,
  disasterState = 'before',
  onSelectDisasterState,
  isDisasterActive = false,
  onToggleDisasterActive,
  highlightAffectedAreas = false,
  onToggleHighlightAffected,
  onTriggerDisasterSimulation,
  onTriggerRecoveryAnimation,
  onResetDisaster,
  compareDisasterSplit = 0,
  onChangeCompareDisasterSplit,
}) => {
  return (
    <div className="w-full bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border-t border-[#D8E4EF] p-4 space-y-4 shadow-[0_-8px_30px_rgba(50,90,125,0.06)]">
      {/* 1. Primary Viewing Mode Tabs & Elevation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#D8E4EF] rounded-xl shadow-xs">
          {[
            { id: 'exterior', label: 'Exterior 3D Model', icon: Box },
            { id: 'floors', label: 'Floor-by-Floor Slice', icon: Layers },
            { id: 'damage', label: 'Damage Scenarios', icon: AlertTriangle },
            { id: 'infrastructure', label: 'Infrastructure & BIM Skeleton', icon: Activity },
            { id: 'reconstruction', label: 'Disaster Demonstration', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = viewingMode === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-stage5-${tab.id}`}
                onClick={() => {
                  onSelectViewingMode(tab.id as ViewingMode);
                  if (tab.id === 'reconstruction') {
                    if (onToggleDisasterActive) onToggleDisasterActive(true);
                  } else {
                    if (onToggleDisasterActive) onToggleDisasterActive(false);
                    if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                  }
                  // Leaving the Damage Scenarios tab clears the active demonstration scenario
                  // so it doesn't silently keep deforming the model on other tabs.
                  if (tab.id !== 'damage' && onSelectDamageType) {
                    onSelectDamageType('none');
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#28BFEF] text-white shadow-sm font-bold'
                    : 'text-[#60758A] hover:text-[#17324D] hover:bg-[#ECFAFF]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#60758A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Camera Elevation Views Matching Photogrammetry Survey */}
        <div className="flex flex-wrap items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#D8E4EF] text-xs font-mono shadow-xs">
          <span className="text-[10px] text-[#8C9BA8] uppercase px-2 font-semibold">Elevations:</span>
          {[
            { id: 'iso', label: 'ISO' },
            { id: 'front', label: 'FRONT (28m)' },
            { id: 'rear', label: 'REAR (28m)' },
            { id: 'left', label: 'LEFT (12m)' },
            { id: 'right', label: 'RIGHT (12m)' },
            { id: 'top', label: 'ROOF' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectCameraPreset(preset.id as any)}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-[rgba(255,255,255,0.8)] hover:bg-[#ECFAFF] hover:border-[#28BFEF] text-[#243447] hover:text-[#28BFEF] transition-colors border border-[#D8E4EF]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sub-mode Specific Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#D8E4EF]">
        {/* Floor Level Selector */}
        {viewingMode === 'floors' && (
          <div className="col-span-full bg-[#FFFFFF] p-3 rounded-xl border border-[#D8E4EF] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#28BFEF]" />
              <span className="text-xs font-bold text-[#17324D] font-mono uppercase">
                Floor Slice Inspector:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {[
                { id: 'all', label: 'Full Structure (0 - 21.5m)' },
                { id: '0', label: 'Ground Floor (0.00 - 4.50m)' },
                { id: '1', label: 'Level 1 (7.00m)' },
                { id: '2', label: 'Level 2 (10.50m)' },
                { id: '3', label: 'Level 3 (14.00m)' },
                { id: 'roof', label: 'Roof Deck & Penthouse (21.50m)' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`px-3 py-1 rounded-lg border text-xs transition-all ${
                    selectedLevel === lvl.id
                      ? 'bg-[#ECFAFF] text-[#28BFEF] border-[#28BFEF] font-bold shadow-xs'
                      : 'bg-[rgba(255,255,255,0.8)] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#B8D5E8]'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Damage Scenarios: select one of 4 demonstration damage types + Before/Damaged/Restored compare */}
        {viewingMode === 'damage' && (
          <div className="col-span-full bg-[#FFFFFF] p-3 rounded-xl border border-[#D8E4EF] space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                <span className="text-xs font-bold text-[#17324D] tracking-wide uppercase">
                  Damage Scenario (Demonstration)
                </span>
              </div>

              {/* 4 Scenario Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {[
                  { id: 'disaster_earthquake', label: 'Earthquake' },
                  { id: 'facade_crack', label: 'Facade Crack' },
                  { id: 'column_shear', label: 'Column Shear' },
                  { id: 'roof_degradation', label: 'Roof Degradation' },
                ].map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    id={`btn-damage-${scenario.id}`}
                    onClick={() => {
                      if (onSelectDamageType) onSelectDamageType(scenario.id as DamageType);
                      if (onTriggerDamageAnimation) onTriggerDamageAnimation(scenario.id as DamageType);
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-bold transition-all ${
                      damageType === scenario.id
                        ? 'bg-[#EF4444] text-white border-[#EF4444] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#EF4444]'
                    }`}
                  >
                    {scenario.label}
                  </button>
                ))}

                <button
                  type="button"
                  id="btn-damage-reset"
                  onClick={() => {
                    if (onSelectDamageType) onSelectDamageType('none');
                    if (onSelectComparisonMode) onSelectComparisonMode('damaged');
                    if (onChangeComparisonSlider) onChangeComparisonSlider(0);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#D8E4EF] bg-[#FFFFFF] text-[#60758A] hover:text-[#17324D] hover:bg-[#F0F4F8] font-bold flex items-center gap-1.5 transition-all"
                  title="Clear Damage Scenario"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Before / Damaged / Restored Comparison */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D8E4EF]">
              <div className="flex items-center gap-1.5 p-1 bg-[#F5F9FD] border border-[#D8E4EF] rounded-xl">
                {[
                  { id: 'before', label: 'Before' },
                  { id: 'damaged', label: 'Damaged' },
                  { id: 'restored', label: 'Restored' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    id={`btn-compare-${mode.id}`}
                    onClick={() => onSelectComparisonMode(mode.id as ComparisonMode)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      comparisonMode === mode.id
                        ? 'bg-[#28BFEF] text-white shadow-sm'
                        : 'text-[#60758A] hover:text-[#17324D] hover:bg-[#ECFAFF]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs flex-1 max-w-sm">
                <span className="text-[10px] text-[#EF4444] font-semibold whitespace-nowrap">Damaged</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparisonSlider}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChangeComparisonSlider(val);
                    onSelectComparisonMode(val >= 95 ? 'restored' : 'damaged');
                  }}
                  className="w-full h-1.5 bg-[#E2ECF4] rounded-lg appearance-none cursor-pointer accent-[#28BFEF]"
                />
                <span className="text-[10px] text-[#22B573] font-semibold whitespace-nowrap">Restored</span>
              </div>
            </div>

            {damageType === 'none' ? (
              <p className="text-[11px] text-[#8C9BA8] pt-1">
                Select a scenario above to demonstrate structural damage visualization on the 3D model, or click a hazard marker in the viewport once active.
              </p>
            ) : (
              <p className="text-[11px] text-[#8C9BA8] pt-1">
                Demonstration/simulation only. Click the red hazard marker in the 3D viewport for diagnosis details.
              </p>
            )}
          </div>
        )}

        {/* Disaster Demonstration Mode: Direct 4-Step Visual Flow */}
        {viewingMode === 'reconstruction' && (
          <div className="col-span-full bg-[#FFFFFF] p-3 rounded-xl border border-[#D8E4EF] space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Header Label */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#17324D] tracking-wide uppercase">
                  Disaster Demonstration
                </span>
              </div>

              {/* 4 Primary Buttons + Reset */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {/* 1. Before */}
                <button
                  type="button"
                  id="btn-disaster-before"
                  onClick={() => {
                    if (onSelectDisasterState) onSelectDisasterState('before');
                    if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                    if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all ${
                    disasterState === 'before' && !highlightAffectedAreas
                      ? 'bg-[#28BFEF] text-white border-[#28BFEF] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#28BFEF]'
                  }`}
                >
                  Before
                </button>

                {/* 2. Show Disaster */}
                <button
                  type="button"
                  id="btn-disaster-show"
                  onClick={() => {
                    if (onSelectDisasterState) onSelectDisasterState('disaster');
                    if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                    if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(0);
                    if (onTriggerDisasterSimulation) onTriggerDisasterSimulation();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                    (disasterState === 'disaster' || disasterState === 'after' || disasterState === 'simulating') && !highlightAffectedAreas
                      ? 'bg-[#FF7350] text-white border-[#FF7350] shadow-xs'
                      : 'bg-[#FFF9F0] text-[#D97706] border-[#FCD34D] hover:bg-[#FF7350] hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Show Disaster</span>
                </button>

                {/* 3. Show Recovery */}
                <button
                  type="button"
                  id="btn-disaster-recovery"
                  onClick={() => {
                    if (onTriggerRecoveryAnimation) {
                      onTriggerRecoveryAnimation();
                    } else {
                      if (onSelectDisasterState) onSelectDisasterState('recovery');
                      if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                      if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(100);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all ${
                    disasterState === 'recovery' && !highlightAffectedAreas
                      ? 'bg-[#22B573] text-white border-[#22B573] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:border-[#22B573]'
                  }`}
                >
                  Show Recovery
                </button>

                {/* 4. Highlight Recovery */}
                <button
                  type="button"
                  id="btn-disaster-highlight"
                  onClick={() => {
                    const nextHighlight = !highlightAffectedAreas;
                    if (onToggleHighlightAffected) onToggleHighlightAffected(nextHighlight);
                    if (onSelectDisasterState) onSelectDisasterState(nextHighlight ? 'highlighted' : 'recovery');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                    highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight'
                      ? 'bg-gradient-to-r from-[#22B573] to-[#28BFEF] text-white border-transparent shadow-xs'
                      : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:bg-[#22B573] hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Highlight Recovery</span>
                </button>

                {/* 5. Reset */}
                <button
                  type="button"
                  id="btn-disaster-reset"
                  onClick={() => {
                    if (onResetDisaster) {
                      onResetDisaster();
                    } else {
                      if (onSelectDisasterState) onSelectDisasterState('before');
                      if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                      if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(0);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#D8E4EF] bg-[#FFFFFF] text-[#60758A] hover:text-[#17324D] hover:bg-[#F0F4F8] font-bold flex items-center gap-1.5 transition-all"
                  title="Reset Disaster Demonstration"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Comparison Slider: After Disaster ←→ Recovery */}
              <div className="flex items-center gap-2 text-xs flex-1 max-w-sm">
                <span className="text-[#60758A] text-[11px] font-semibold whitespace-nowrap">
                  After Disaster ←→ Recovery
                </span>
                <span className="text-[10px] text-[#FF7350] font-semibold">After Disaster</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compareDisasterSplit}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(val);
                    if (val < 50) {
                      if (onSelectDisasterState) onSelectDisasterState('disaster');
                      if (onToggleHighlightAffected) onToggleHighlightAffected(false);
                    } else {
                      if (onSelectDisasterState) onSelectDisasterState('recovery');
                    }
                  }}
                  className="w-full h-1.5 bg-[#E2ECF4] rounded-lg appearance-none cursor-pointer accent-[#28BFEF]"
                />
                <span className="text-[10px] text-[#22B573] font-semibold">Recovery</span>
              </div>

              {/* Current State Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F9FD] border border-[#D8E4EF] rounded-xl text-xs font-semibold">
                <span className="text-[#60758A]">Current:</span>
                <span className="text-[#17324D] font-bold">
                  {highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight'
                    ? 'Recovered Area'
                    : disasterState === 'recovery'
                    ? 'Recovery'
                    : (disasterState === 'disaster' || disasterState === 'after' || disasterState === 'simulating')
                    ? 'After Disaster'
                    : 'Before'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Render Shaders */}
        <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D8E4EF] space-y-1.5 shadow-xs">
          <div className="text-[11px] font-mono font-semibold text-[#60758A] uppercase flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#28BFEF]" />
            <span>Shader Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs font-mono">
            {[
              { id: 'pbr', label: 'Architectural PBR' },
              { id: 'epistemic', label: 'Epistemic 4-Class' },
              { id: 'pointcloud', label: 'Dense Point Cloud' },
              { id: 'wireframe', label: 'CAD Wireframe' },
              { id: 'lidar', label: 'LiDAR Normal Ramp' },
            ].map((sh) => (
              <button
                key={sh.id}
                onClick={() => onSelectRenderMode(sh.id as RenderShaderMode)}
                className={`px-2 py-1 rounded text-left transition-all border ${
                  renderMode === sh.id
                    ? 'bg-[#28BFEF] text-white font-bold border-[#28BFEF] shadow-xs'
                    : 'bg-[rgba(255,255,255,0.8)] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D] hover:bg-[#ECFAFF]'
                }`}
              >
                {sh.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spatial Reference Frame */}
        <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D8E4EF] space-y-1.5 shadow-xs">
          <div className="text-[11px] font-mono font-semibold text-[#28BFEF] uppercase flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-[#28BFEF]" />
            <span>Spatial Reference</span>
          </div>
          <div className="p-2 rounded-lg bg-[#F5F9FD] border border-[#D8E4EF] text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-[#17324D]">
              <span>Reference Frame:</span>
              <span className="text-[#22B573] font-bold">WGS84 / Local Grid</span>
            </div>
            <div className="flex items-center justify-between text-[#60758A] text-[10px]">
              <span>Scale:</span>
              <span>1:1 Metric Reference</span>
            </div>
          </div>
        </div>

        {/* 3D Visual Aids Toggles */}
        <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D8E4EF] space-y-1.5 shadow-xs">
          <div className="text-[11px] font-mono font-semibold text-[#60758A] uppercase flex items-center gap-1.5">
            <Scan className="w-3 h-3 text-[#28BFEF]" />
            <span>Inspection Tools</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={onTriggerLaserScan}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#ECFAFF] text-[#28BFEF] border border-[#28BFEF]/40 hover:bg-[#28BFEF] hover:text-white transition-colors flex items-center justify-center gap-1 font-semibold"
            >
              <Scan className="w-3 h-3" />
              <span>Section Scan</span>
            </button>
            <button
              onClick={onToggleDronePath}
              className={`flex-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                showDronePath
                  ? 'bg-[#ECFAFF] text-[#28BFEF] border-[#28BFEF] font-semibold'
                  : 'bg-[rgba(255,255,255,0.8)] text-[#60758A] border-[#D8E4EF] hover:text-[#17324D]'
              }`}
            >
              UAV Orbit
            </button>
          </div>
        </div>

        {/* Structural Inspection Report Quick Trigger */}
        <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D8E4EF] flex flex-col justify-between shadow-xs">
          <div className="text-[11px] font-mono font-semibold text-[#22B573] uppercase flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-[#22B573]" />
            <span>Inspection Dossier</span>
          </div>
          <button
            onClick={onOpenReport}
            id="viewport-generate-report-btn"
            className="btn-secondary-glass w-full mt-1.5 py-1.5 px-3 rounded-lg text-[#22B573] border-[#22B573]/30 hover:bg-[#E8F8F0] font-mono text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
