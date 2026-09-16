export type StageStatus = 'LOCKED' | 'AVAILABLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type WorkflowStep = 
  | 'video_input'             // Stage 01: Drone Video Input
  | 'frame_extraction'        // Stage 02: Frame Extraction
  | 'frame_selection'         // Stage 03: AI-Assisted Frame Selection
  | 'camera_motion'           // Stage 04: Camera Motion / Spatial Estimation
  | 'spatial_reference'       // Stage 05: Protected Spatial Reference
  | 'reconstruction_3d'       // Stage 06: 3D Reconstruction Pipeline
  | 'epistemic_segmentation'  // Stage 07: Observed / Ref-Supported / Inferred / Unknown
  | 'metric_validation'       // Stage 08: Metric + Georeferencing Validation
  | 'final_model'             // Stage 09: Georeferenced, Measurable 3D Model
  | 'potential_applications'  // Stage 10: Potential Applications
  // Backward compatibility aliases
  | 'video'
  | 'synthesis'
  | 'inspection';

export type ViewingMode = 'exterior' | 'floors' | 'damage' | 'reconstruction' | 'infrastructure';

export type RenderShaderMode = 'pbr' | 'wireframe' | 'pointcloud' | 'lidar' | 'epistemic' | 'stress' | 'xray_bim';

export type DamageType = 'none' | 'disaster_earthquake' | 'facade_crack' | 'column_shear' | 'roof_degradation';

export type ComparisonMode = 'before' | 'damaged' | 'restored';

export type DisasterScenarioState = 
  | 'before' 
  | 'disaster' 
  | 'recovery' 
  | 'highlighted'
  // Backward compatibility aliases
  | 'simulating' 
  | 'after' 
  | 'highlight';

export interface DisasterAnalysisConfig {
  active: boolean;
  state: DisasterScenarioState;
  showAffectedHighlight: boolean;
  compareMode: boolean;
  compareSplit: number;
}

export type DataProvenance = 
  | 'REAL' 
  | 'COMPUTED' 
  | 'FROM_INPUT' 
  | 'DEMO_SIMULATED' 
  | 'PLANNED_FUTURE' 
  | 'PROTECTED_REFERENCE'
  | 'DEMO_METRIC_NOT_VALIDATED';

export type EpistemicClass = 
  | 'OBSERVED'              // Direct evidence from current UAV imagery
  | 'REFERENCE_SUPPORTED'   // Supported by protected GIS/BIM spatial reference
  | 'INFERRED'              // Derived from spatial constraints / continuity
  | 'UNKNOWN';              // Insufficient evidence / unobserved occlusions

export interface EpistemicRegionInfo {
  category: EpistemicClass;
  label: string;
  color: string;
  hex: string;
  percentage?: number;
  description: string;
  validationSource: string;
}

export interface MetricValidationItem {
  id: string;
  dimensionName: string;
  category: 'Linear Distance' | 'Floor-to-Floor Height' | 'Column Bay Span' | 'Global Footprint' | 'Georeferencing';
  reconstructedValue?: number | null;
  referenceValue?: number | null; // Protected / internal
  absoluteErrorMeters?: number | null;
  relativeErrorPercent?: number | null;
  toleranceMeters: number;
  status: 'NOT_YET_MEASURED' | 'NOT_VALIDATED' | 'PASS' | 'WARN';
  notes: string;
}

export interface JudgeDefenseQA {
  id: number;
  question: string;
  shortAnswer: string;
  detailedDefense: string;
  stageReference: string;
  statusTag: DataProvenance;
  limitationsAcknowledged: string;
}

export interface GroundTruthBuilding {
  id: string;
  name: string;
  type: string;
  lengthX: number; // 28.00m
  widthZ: number;  // 12.00m
  heightY: number; // 21.50m total (ground 4.5m + 3 levels @ 3.5m + roof 0.6m + penthouse 3.0m)
  groundFloorHeight: number; // 4.50m or 3.50m as per spec
  officeFloorHeight: number; // 3.50m
  penthouseHeight: number;   // 3.00m
  parapetHeight: number;     // 0.60m
  gridModule: number;        // 4.00m
  baysLongFacade: number;    // 7 bays
  baysShortFacade: number;   // 3 bays
  gpsLat: number;            // 13.0827
  gpsLon: number;            // 80.2707
  baseAlt: number;           // 18.50m
  pilasterFrontProj: number; // 0.60m
  pilasterSideProj: number;  // 0.40m
  windowWidth: number;       // 1.20m
  windowHeight: number;      // 1.20m
  windowsPerBay: number;     // 2
}

export interface WhatToDoStep {
  stepNumber: number;
  phase: 'Immediate Emergency' | 'Structural Stabilization' | 'Permanent Repair' | 'Monitoring & Sign-off';
  title: string;
  action: string;
  specStandard: string;
  estimatedHours: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DamageHazardMarker {
  id: string;
  title: string;
  damageType: DamageType;
  level: number | string;
  locationDescription: string;
  gpsCoords: {
    lat: number;
    lon: number;
    alt: number;
  };
  position3D: [number, number, number]; // [x, y, z] in Three.js coordinates
  severityIndex: number; // percentage 0-100
  riskCategory: 'Low' | 'Moderate' | 'Critical' | 'Severe' | 'Disaster Level';
  crackLengthMeters: number;
  crackWidthMm: number;
  spallVolumeM3: number;
  rebarExposed: boolean;
  whatIsTheDamage: string;
  rootCause: string;
  structuralFailureMode: string;
  whatToDoSteps: WhatToDoStep[];
  repairMaterial: {
    concretePatchM3: number;
    carbonFiberWrapM2: number;
    epoxyInjectionLiters: number;
    glassPanes: number;
    estimatedCostUSD: number;
    repairDays: number;
  };
}

export interface SubmittedWorkOrder {
  orderId: string;
  submittedAt: string;
  inspectorName: string;
  peLicenseNumber: string;
  contractorFirm: string;
  priorityLevel: 'Standard' | 'Urgent' | 'Emergency Priority 1';
  totalBudgetUSD: number;
  status: 'DISPATCHED' | 'IN_PROGRESS' | 'RECONSTRUCTED';
  notes: string;
}

export interface PhotogrammetryProgress {
  isProcessing: boolean;
  phase: 'idle' | 'extracting' | 'matching' | 'bundle_adjustment' | 'pointcloud' | 'meshing' | 'texturing' | 'complete';
  progressPercent: number;
  currentMessage: string;
  reprojectionErrorPx: number;
  pointsGenerated: number;
  trianglesCount: number;
  scaleAccuracyPercent: number;
}
