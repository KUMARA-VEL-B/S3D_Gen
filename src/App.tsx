/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  WorkflowStep,
  StageStatus,
  ViewingMode,
  RenderShaderMode,
  DamageType,
  ComparisonMode,
  DisasterScenarioState,
  DamageHazardMarker
} from './types';
import { HAZARD_MARKERS } from './data/groundTruth';
import { WorkflowStepper } from './components/WorkflowStepper';
import { JudgeDefenseModal } from './components/JudgeDefenseModal';
import { PresentationModeView } from './components/PresentationModeView';
import { DashboardTopNav } from './components/DashboardTopNav';

// Stage Views
import { DroneVideoViewer, UploadedVideoData } from './components/DroneVideoViewer';
import { Stage02FrameExtraction } from './components/Stage02FrameExtraction';
import { AIAssistedFrameSelection } from './components/AIAssistedFrameSelection';
import { Stage06ReconstructionView } from './components/Stage06ReconstructionView';
import { Stage07EpistemicSegmentation } from './components/Stage07EpistemicSegmentation';
import { Stage08MetricValidation } from './components/Stage08MetricValidation';
import { Stage10PotentialApplications } from './components/Stage10PotentialApplications';

// 3D Viewport & Inspection Panels
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { ViewportControls } from './components/ViewportControls';
import { PDFReportModal } from './components/PDFReportModal';
import { ProvenanceBadge } from './components/ProvenanceBadge';

import { 
  ArrowRight,
  Eye,
  CheckCircle2,
  Cpu,
  X,
  FileText
} from 'lucide-react';

const INITIAL_STAGE_STATUSES: Record<WorkflowStep, StageStatus> = {
  video_input: 'AVAILABLE',
  frame_extraction: 'LOCKED',
  frame_selection: 'LOCKED',
  camera_motion: 'LOCKED',
  spatial_reference: 'LOCKED',
  reconstruction_3d: 'LOCKED',
  epistemic_segmentation: 'LOCKED',
  metric_validation: 'LOCKED',
  final_model: 'LOCKED',
  potential_applications: 'LOCKED',
  // Backward compatibility aliases
  video: 'AVAILABLE',
  synthesis: 'LOCKED',
  inspection: 'LOCKED',
};

export default function App() {
  // Strict sequential state-driven pipeline
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('video_input');
  const [stageStatuses, setStageStatuses] = useState<Record<WorkflowStep, StageStatus>>(INITIAL_STAGE_STATUSES);

  // Stage 01 state — Starts completely empty
  const [videoUploaded, setVideoUploaded] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<string | null>(null);
  const [videoEncoding, setVideoEncoding] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    width?: number;
    height?: number;
    sizeBytes?: number;
  } | null>(null);

  // Stage 02 extraction state — Starts unperformed
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionCompleted, setExtractionCompleted] = useState<boolean>(false);

  // Stage 03 analysis state — Starts unperformed
  const [isSelectionProcessing, setIsSelectionProcessing] = useState<boolean>(false);

  // Secondary Deep-Dive Modals for Stages 07 & 08
  const [isEpistemicModalOpen, setIsEpistemicModalOpen] = useState<boolean>(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);

  // Presentation & Defense Modal States
  const [isPresentationModeOpen, setIsPresentationModeOpen] = useState<boolean>(false);
  const [isJudgeDefenseOpen, setIsJudgeDefenseOpen] = useState<boolean>(false);

  // Viewport Configuration States for Stage 09 3D model — Starts ungenerated
  const [viewingMode, setViewingMode] = useState<ViewingMode>('exterior');
  const [renderMode, setRenderMode] = useState<RenderShaderMode>('pbr');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [damageType, setDamageType] = useState<DamageType>('none');
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('damaged');
  const [comparisonSlider, setComparisonSlider] = useState<number>(0);
  const [showDronePath, setShowDronePath] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isGenerating3D, setIsGenerating3D] = useState<boolean>(false);
  const [is3DGenerated, setIs3DGenerated] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Disaster Analysis States
  const [disasterState, setDisasterState] = useState<DisasterScenarioState>('before');
  const [isDisasterActive, setIsDisasterActive] = useState<boolean>(false);
  const [highlightAffectedAreas, setHighlightAffectedAreas] = useState<boolean>(false);
  const [compareDisasterSplit, setCompareDisasterSplit] = useState<number>(0);

  // Damage Scenario Selection & Hazard Marker Inspection (Demonstration/Simulation only)
  const [selectedHazard, setSelectedHazard] = useState<DamageHazardMarker | null>(null);

  // PDF Modal
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // 3D Viewport Reference
  const viewport3DRef = useRef<Viewport3DHandle | null>(null);

  // Handler: Video upload from Stage 01 (derived strictly from browser File object)
  const handleVideoUploaded = (data: UploadedVideoData) => {
    setVideoUploaded(true);
    setVideoFile(data.file);
    setVideoURL(data.url);
    setVideoName(data.name);
    setVideoDuration(data.duration);
    setVideoFormat(data.format);
    setVideoEncoding(data.encoding);
    setVideoMetadata(data.metadata);

    // Unlocks only Stage 02
    setStageStatuses((prev) => ({
      ...prev,
      video_input: 'COMPLETED',
      video: 'COMPLETED',
      frame_extraction: 'AVAILABLE',
    }));
  };

  // Handler: Replace Video from Stage 01
  const handleVideoReset = () => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    setVideoUploaded(false);
    setVideoFile(null);
    setVideoURL(null);
    setVideoName(null);
    setVideoDuration(null);
    setVideoFormat(null);
    setVideoEncoding(null);
    setVideoMetadata(null);

    setStageStatuses((prev) => ({
      ...prev,
      video_input: 'AVAILABLE',
      video: 'AVAILABLE',
      frame_extraction: 'LOCKED',
    }));
  };

  // Handler: Start Frame Extraction (Stage 01 -> Stage 02)
  const handleStartExtraction = () => {
    setStageStatuses((prev) => ({
      ...prev,
      video_input: 'COMPLETED',
      video: 'COMPLETED',
      frame_extraction: 'PROCESSING',
    }));
    setCurrentStep('frame_extraction');
    setIsExtracting(true);
    setExtractionProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        clearInterval(interval);
        setExtractionProgress(100);
        setIsExtracting(false);
        setExtractionCompleted(true);
        setStageStatuses((prev) => ({
          ...prev,
          frame_extraction: 'COMPLETED',
          frame_selection: 'AVAILABLE',
        }));
      } else {
        setExtractionProgress(current);
      }
    }, 90);
  };

  // Handler: Continue from Stage 02 to Stage 03
  const handleContinueToSelection = () => {
    setCurrentStep('frame_selection');
    if (stageStatuses.frame_selection !== 'COMPLETED') {
      setIsSelectionProcessing(true);
      setStageStatuses((prev) => ({
        ...prev,
        frame_selection: 'PROCESSING',
      }));
      setTimeout(() => {
        setIsSelectionProcessing(false);
        setStageStatuses((prev) => ({
          ...prev,
          frame_selection: 'COMPLETED',
        }));
      }, 700);
    }
  };

  // Handler: Advance from Stage 03 to Stage 04 (3D Reconstruction)
  // Executes internal dependencies: Frame Selection -> Camera Motion -> Spatial Reference -> 3D Reconstruction
  const handleProceedToReconstruction = () => {
    setStageStatuses((prev) => ({
      ...prev,
      frame_selection: 'COMPLETED',
      camera_motion: 'PROCESSING',
    }));

    setTimeout(() => {
      setStageStatuses((prev) => ({
        ...prev,
        camera_motion: 'COMPLETED',
        spatial_reference: 'PROCESSING',
      }));

      setTimeout(() => {
        setStageStatuses((prev) => ({
          ...prev,
          spatial_reference: 'COMPLETED',
          reconstruction_3d: 'AVAILABLE',
          synthesis: 'AVAILABLE',
        }));
        setCurrentStep('reconstruction_3d');
      }, 250);
    }, 250);
  };

  // Handler: Stage 04 Reconstruction completes -> Unlocks Stage 05 (Final 3D Model)
  // Executes internal dependencies: Reconstruction COMPLETED -> Evidence processing -> Metric validation -> Final Model
  const handleReconstructionComplete = () => {
    setIs3DGenerated(true);
    setGenerationProgress(100);
    setStageStatuses((prev) => ({
      ...prev,
      reconstruction_3d: 'COMPLETED',
      synthesis: 'COMPLETED',
      epistemic_segmentation: 'PROCESSING',
    }));

    setTimeout(() => {
      setStageStatuses((prev) => ({
        ...prev,
        epistemic_segmentation: 'COMPLETED',
        metric_validation: 'PROCESSING',
      }));

      setTimeout(() => {
        setStageStatuses((prev) => ({
          ...prev,
          metric_validation: 'COMPLETED',
          final_model: 'AVAILABLE',
          inspection: 'AVAILABLE',
        }));
      }, 200);
    }, 200);
  };

  // Handler: Advance directly from Stage 04 to Stage 05 (Final 3D Model)
  const handleProceedToFinalModel = () => {
    setStageStatuses((prev) => ({
      ...prev,
      reconstruction_3d: 'COMPLETED',
      synthesis: 'COMPLETED',
      epistemic_segmentation: 'COMPLETED',
      metric_validation: 'COMPLETED',
      final_model: 'AVAILABLE',
      inspection: 'AVAILABLE',
    }));
    setCurrentStep('final_model');
  };

  // Handler: Advance from Stage 05 to Stage 06 (Applications)
  const handleProceedToPotentialApplications = () => {
    setStageStatuses((prev) => ({
      ...prev,
      final_model: 'COMPLETED',
      inspection: 'COMPLETED',
      potential_applications: 'AVAILABLE',
    }));
    setCurrentStep('potential_applications');
  };

  // Reset Pipeline to pristine initial state
  const handleReset = () => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    setStageStatuses(INITIAL_STAGE_STATUSES);
    setCurrentStep('video_input');
    setVideoUploaded(false);
    setVideoFile(null);
    setVideoURL(null);
    setVideoName(null);
    setVideoDuration(null);
    setVideoFormat(null);
    setVideoEncoding(null);
    setVideoMetadata(null);

    // Reset downstream states
    setIsExtracting(false);
    setExtractionProgress(0);
    setExtractionCompleted(false);
    setIsSelectionProcessing(false);
    setIs3DGenerated(false);
    setGenerationProgress(0);
    setIsGenerating3D(false);
    setIsEpistemicModalOpen(false);
    setIsValidationModalOpen(false);
    setIsPresentationModeOpen(false);
    setIsJudgeDefenseOpen(false);
    setIsReportOpen(false);
    setViewingMode('exterior');
    setRenderMode('pbr');
    setSelectedLevel('all');
    setDamageType('none');
    setComparisonSlider(0);
    setComparisonMode('damaged');
    setDisasterState('before');
    setIsDisasterActive(false);
    setHighlightAffectedAreas(false);
    setCompareDisasterSplit(0);
    setSelectedHazard(null);
  };

  // Handler: Select a Damage Demonstration Scenario (Earthquake / Facade Crack / Column Shear / Roof Degradation)
  // Selecting 'none' clears the active scenario (used when leaving the Damage Scenarios tab).
  const handleSelectDamageScenario = (type: DamageType) => {
    setDamageType(type);
    if (type !== 'none') {
      setViewingMode('damage');
      setComparisonMode('damaged');
      setComparisonSlider(0);
      setSelectedHazard(HAZARD_MARKERS[type] || null);
    } else {
      setSelectedHazard(null);
    }
  };

  // Handler: Trigger the existing 3D damage animation sequence for a chosen scenario
  const handleTriggerDamageAnimation = (type: DamageType) => {
    if (viewport3DRef.current && type !== 'none') {
      viewport3DRef.current.triggerDamageAnimation(type);
    }
  };

  // Manual Step Selection via Stepper (respecting unlocked stages)
  const handleSelectStep = (step: WorkflowStep) => {
    // Normalization to visible 6-stage keys
    let normalized = step;
    if (step === 'video') normalized = 'video_input';
    if (step === 'synthesis') normalized = 'reconstruction_3d';
    if (step === 'inspection') normalized = 'final_model';

    // Route internal background stages to parent visible stage
    if (normalized === 'camera_motion' || normalized === 'spatial_reference') {
      normalized = 'reconstruction_3d';
    }
    if (normalized === 'epistemic_segmentation' || normalized === 'metric_validation') {
      normalized = 'final_model';
    }

    const status = stageStatuses[normalized] || 'LOCKED';
    if (status !== 'LOCKED') {
      setCurrentStep(normalized);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FD] text-[#17324D] flex flex-col selection:bg-[#28BFEF] selection:text-white font-sans">
      {/* Top Navigation Bar with S3DGen Branding, Reset, Presentation Mode, Defense Q&A, and Prototype Export */}
      <DashboardTopNav
        onOpenReport={() => setIsReportOpen(true)}
        onReset={handleReset}
        onSelectStep={handleSelectStep}
        currentStep={currentStep}
        onOpenPresentationMode={() => setIsPresentationModeOpen(true)}
        onOpenJudgeDefense={() => setIsJudgeDefenseOpen(true)}
      />

      {/* Sequential 6-Stage User Workflow Stepper */}
      <WorkflowStepper
        currentStep={currentStep}
        stageStatuses={stageStatuses}
        onSelectStep={handleSelectStep}
      />

      {/* Main Operational Screen */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* STAGE 01: Single-Pass Video Input & Ingestion */}
        {(currentStep === 'video_input' || currentStep === 'video') && (
          <DroneVideoViewer
            onStartExtraction={handleStartExtraction}
            videoUploaded={videoUploaded}
            videoFile={videoFile}
            videoURL={videoURL}
            videoName={videoName}
            videoDuration={videoDuration}
            videoFormat={videoFormat}
            videoEncoding={videoEncoding}
            videoMetadata={videoMetadata}
            onVideoUploaded={handleVideoUploaded}
            onVideoReset={handleVideoReset}
          />
        )}

        {/* STAGE 02: Frame Extraction */}
        {currentStep === 'frame_extraction' && (
          <Stage02FrameExtraction
            isProcessing={isExtracting}
            isCompleted={extractionCompleted}
            progressPercent={extractionProgress}
            onContinueToSelection={handleContinueToSelection}
            videoFileName={videoName || 'Uploaded UAV Video'}
          />
        )}

        {/* STAGE 03: AI-Assisted Frame Selection */}
        {currentStep === 'frame_selection' && (
          <AIAssistedFrameSelection
            onProceedToReconstruction={handleProceedToReconstruction}
            isProcessing={isSelectionProcessing}
          />
        )}

        {/* STAGE 04: 3D Progressive Reconstruction */}
        {(currentStep === 'reconstruction_3d' || currentStep === 'synthesis') && (
          <Stage06ReconstructionView
            onProceedToFinalModel={handleProceedToFinalModel}
            onProceedToEpistemic={handleProceedToFinalModel}
            onReconstructionCompleted={handleReconstructionComplete}
          />
        )}

        {/* STAGE 05: Final 3D Model Explorer & Inspection Workbench */}
        {(currentStep === 'final_model' || currentStep === 'inspection') && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Return / Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs font-mono text-[#60758A]">
              <div className="flex items-center gap-2">
                <span className="text-[#28BFEF] font-bold">
                  STAGE 05: FINAL 3D MODEL
                </span>
                <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
                <span className="hidden md:inline text-[#D8E4EF]">•</span>
                <span className="hidden md:inline text-[#60758A]">
                  3D Viewport & Disaster Demonstration
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEpistemicModalOpen(true)}
                  id="final-model-epistemic-btn"
                  className="btn-secondary-glass px-3.5 py-1.5 rounded-xl text-[#28BFEF] flex items-center gap-1.5 font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Evidence Classification</span>
                </button>

                <button
                  onClick={() => setIsValidationModalOpen(true)}
                  id="final-model-validation-btn"
                  className="btn-secondary-glass px-3.5 py-1.5 rounded-xl text-[#28BFEF] flex items-center gap-1.5 font-bold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Validation Metrics</span>
                </button>

                <button
                  onClick={handleProceedToPotentialApplications}
                  id="stage05-advance-btn"
                  className="btn-primary-cyan px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold"
                >
                  <span>Stage 06: Applications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Full-width 3D Viewport Canvas and HUD Controls */}
            <div className="w-full flex flex-col gap-4 flex-1">
              <div className="flex flex-col bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(50,90,125,0.08)]">
                <div className="relative w-full aspect-[16/9] min-h-[540px]">
                  <Viewport3D
                    ref={viewport3DRef}
                    viewingMode={viewingMode}
                    renderMode={renderMode}
                    selectedLevel={selectedLevel}
                    damageType={damageType}
                    comparisonMode={comparisonMode}
                    comparisonSlider={comparisonSlider}
                    showDronePath={showDronePath}
                    showGrid={showGrid}
                    isGenerating3D={isGenerating3D}
                    generationProgress={generationProgress}
                    is3DGenerated={is3DGenerated}
                    onSelectHazard={(hazard) => setSelectedHazard(hazard)}
                    onProgressReconstruction={() => {}}
                    disasterState={disasterState}
                    onSelectDisasterState={setDisasterState}
                    isDisasterActive={isDisasterActive}
                    onToggleDisasterActive={setIsDisasterActive}
                    highlightAffectedAreas={highlightAffectedAreas}
                    onToggleHighlightAffected={setHighlightAffectedAreas}
                    compareDisasterSplit={compareDisasterSplit}
                    onChangeCompareDisasterSplit={setCompareDisasterSplit}
                  />

                  {/* Hazard Marker Inspection Readout (Demonstration/Simulation only) */}
                  {selectedHazard && (
                    <div className="absolute bottom-4 right-4 z-40 w-full max-w-sm bg-[rgba(255,255,255,0.95)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl shadow-[0_16px_40px_rgba(50,90,125,0.15)] p-4 space-y-2.5 text-xs animate-fadeIn">
                      <div className="flex items-start justify-between gap-2">
                        <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
                        <button
                          onClick={() => setSelectedHazard(null)}
                          className="p-1 rounded-md hover:bg-[#F0F4F8] text-[#60758A] hover:text-[#17324D] transition-colors"
                          aria-label="Close hazard details"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-[#17324D] leading-snug">{selectedHazard.title}</h4>
                      <p className="text-[#60758A] leading-relaxed">{selectedHazard.whatIsTheDamage}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-[#D8E4EF] font-mono">
                        <span className="text-[#8C9BA8]">Risk Category</span>
                        <span className="text-right font-bold text-[#EF4444]">{selectedHazard.riskCategory}</span>
                        <span className="text-[#8C9BA8]">Severity Index</span>
                        <span className="text-right font-bold text-[#D97706]">{selectedHazard.severityIndex}%</span>
                        <span className="text-[#8C9BA8]">Location</span>
                        <span className="text-right text-[#17324D]">{selectedHazard.locationDescription}</span>
                      </div>
                      <div className="pt-2 border-t border-[#D8E4EF]">
                        <div className="text-[10px] uppercase font-semibold text-[#8C9BA8]">Root Cause</div>
                        <p className="text-[#17324D] mt-0.5">{selectedHazard.rootCause}</p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-[#8C9BA8]">Structural Failure Mode</div>
                        <p className="text-[#17324D] mt-0.5">{selectedHazard.structuralFailureMode}</p>
                      </div>
                      <div className="text-[9px] text-[#8C9BA8] italic pt-2 border-t border-[#D8E4EF]">
                        Demonstration visualization only — not a certified structural inspection, real-world diagnosis or measurement.
                      </div>
                    </div>
                  )}
                </div>

                {/* Viewport HUD Controls */}
                <ViewportControls
                  viewingMode={viewingMode}
                  onSelectViewingMode={setViewingMode}
                  renderMode={renderMode}
                  onSelectRenderMode={setRenderMode}
                  selectedLevel={selectedLevel}
                  onSelectLevel={setSelectedLevel}
                  comparisonMode={comparisonMode}
                  onSelectComparisonMode={setComparisonMode}
                  comparisonSlider={comparisonSlider}
                  onChangeComparisonSlider={setComparisonSlider}
                  damageType={damageType}
                  onSelectDamageType={handleSelectDamageScenario}
                  onTriggerDamageAnimation={handleTriggerDamageAnimation}
                  showDronePath={showDronePath}
                  onToggleDronePath={() => setShowDronePath(!showDronePath)}
                  showGrid={showGrid}
                  onToggleGrid={() => setShowGrid(!showGrid)}
                  onSelectCameraPreset={(preset) => {
                    if (viewport3DRef.current) {
                      viewport3DRef.current.setCameraPreset(preset);
                    }
                  }}
                  onTriggerLaserScan={() => {
                    if (viewport3DRef.current) {
                      viewport3DRef.current.triggerLaserScan();
                    }
                  }}
                  onTriggerReconstructionAnimation={() => {
                    setViewingMode('reconstruction');
                    if (viewport3DRef.current) {
                      viewport3DRef.current.triggerReconstructionAnimation();
                    }
                  }}
                  onOpenReport={() => setIsReportOpen(true)}
                  disasterState={disasterState}
                  onSelectDisasterState={setDisasterState}
                  isDisasterActive={isDisasterActive}
                  onToggleDisasterActive={setIsDisasterActive}
                  highlightAffectedAreas={highlightAffectedAreas}
                  onToggleHighlightAffected={setHighlightAffectedAreas}
                  compareDisasterSplit={compareDisasterSplit}
                  onChangeCompareDisasterSplit={setCompareDisasterSplit}
                  onTriggerDisasterSimulation={() => {
                    if (viewport3DRef.current) {
                      viewport3DRef.current.triggerDisasterSimulation();
                    }
                  }}
                  onTriggerRecoveryAnimation={() => {
                    if (viewport3DRef.current) {
                      viewport3DRef.current.triggerRecoveryAnimation();
                    }
                  }}
                  onResetDisaster={() => {
                    setDisasterState('before');
                    setIsDisasterActive(false);
                    setHighlightAffectedAreas(false);
                    setCompareDisasterSplit(0);
                    if (viewport3DRef.current) {
                      viewport3DRef.current.setCameraPreset('iso');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STAGE 06: Applications */}
        {currentStep === 'potential_applications' && (
          <Stage10PotentialApplications
            onRestartWorkflow={handleReset}
            onExplore3DModel={() => setCurrentStep('final_model')}
            onLaunchDisasterSimulation={() => {
              setIsDisasterActive(true);
              setDisasterState('after');
              setCompareDisasterSplit(100);
              setCurrentStep('final_model');
            }}
          />
        )}
      </main>

      {/* Secondary Inspection Modal: 4-Class Epistemic Segmentation */}
      {isEpistemicModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17324D]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-[#17324D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E4EF]">
              <span className="text-xs font-mono font-bold text-[#28BFEF] uppercase">
                Secondary Technical Inspection: Evidence Classification
              </span>
              <button
                onClick={() => setIsEpistemicModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#F5F9FD] hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#17324D] transition-colors border border-[#D8E4EF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Stage07EpistemicSegmentation
              onProceedToValidation={() => {
                setIsEpistemicModalOpen(false);
                setIsValidationModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Secondary Inspection Modal: Metric & Georeferencing Validation */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17324D]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-[#17324D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E4EF]">
              <span className="text-xs font-mono font-bold text-[#28BFEF] uppercase">
                Secondary Technical Inspection: Metric Validation
              </span>
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#F5F9FD] hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#17324D] transition-colors border border-[#D8E4EF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Stage08MetricValidation
              onProceedToNext={() => setIsValidationModalOpen(false)}
              onOpenReport={() => setIsReportOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Slide-Based Presentation Mode Modal */}
      {isPresentationModeOpen && (
        <PresentationModeView
          onClose={() => setIsPresentationModeOpen(false)}
          onJumpToStage={(step) => {
            handleSelectStep(step);
            setIsPresentationModeOpen(false);
          }}
          onOpenJudgeDefense={() => {
            setIsPresentationModeOpen(false);
            setIsJudgeDefenseOpen(true);
          }}
        />
      )}

      {/* 14 Technical Defense Q&As Matrix Modal */}
      {isJudgeDefenseOpen && (
        <JudgeDefenseModal
          isOpen={isJudgeDefenseOpen}
          onClose={() => setIsJudgeDefenseOpen(false)}
        />
      )}

      {/* PDF Inspection Dossier Modal */}
      {isReportOpen && (
        <PDFReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
