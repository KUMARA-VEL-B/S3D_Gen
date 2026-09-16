import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Layers, 
  Box, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  Compass, 
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { FRAME_ANALYSIS_DATA } from '../data/frameAnalysisData';
import { GROUND_TRUTH_BUILDING } from '../data/groundTruth';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Stage06ReconstructionViewProps {
  onProceedToFinalModel?: () => void;
  onProceedToEpistemic?: () => void;
  onExploreInStage09?: () => void;
  onReconstructionCompleted?: () => void;
}

interface PhaseDefinition {
  id: number;
  code: string;
  name: string;
  shortLabel: string;
  targetPercent: number;
  heightCutoff: number; // in meters
  description: string;
  techDetail: string;
}

const PHASES: PhaseDefinition[] = [
  {
    id: 1,
    code: '01 Ground',
    name: 'Phase 1: Ground / Foundation',
    shortLabel: 'Ground',
    targetPercent: 16,
    heightCutoff: 1.0,
    description: 'Ground footprint extraction & reinforced foundation footing bounding datum.',
    techDetail: 'Boundary spatial anchoring & sub-grade datum registration.',
  },
  {
    id: 2,
    code: '02 Structure',
    name: 'Phase 2: Lower Structural Columns',
    shortLabel: 'Structure',
    targetPercent: 34,
    heightCutoff: 4.5,
    description: '32 vertical structural columns & primary post-and-beam grid rising from footprint.',
    techDetail: '7×3 modular column grid alignment along orthogonal axes.',
  },
  {
    id: 3,
    code: '03 Lower Walls',
    name: 'Phase 3: Ground-Floor Walls & Slab 1',
    shortLabel: 'Lower Walls',
    targetPercent: 52,
    heightCutoff: 8.0,
    description: 'First floor level slab and ground-level exterior walls and entrance portal.',
    techDetail: 'Photogrammetric surface mesh triangulation on lower facades.',
  },
  {
    id: 4,
    code: '04 Upper Levels',
    name: 'Phase 4: Upper Floors & Spandrel Geometry',
    shortLabel: 'Upper Levels',
    targetPercent: 72,
    heightCutoff: 15.0,
    description: 'Levels 2, 3, and 4 floor slabs, pilaster vertical shafts, and facade window openings.',
    techDetail: 'Multi-view feature correspondence matching across oblique frames.',
  },
  {
    id: 5,
    code: '05 Roof',
    name: 'Phase 5: Roof Terrace & Parapet',
    shortLabel: 'Roof',
    targetPercent: 88,
    heightCutoff: 21.5,
    description: 'Roof deck capping slab, safety parapets, and mechanical penthouse elevator bulkhead.',
    techDetail: 'Top-plane nadir/oblique closure & elevation bounding check.',
  },
  {
    id: 6,
    code: '06 Surface Completion',
    name: 'Phase 6: Surface & Mesh Completion',
    shortLabel: 'Surface Completion',
    targetPercent: 100,
    heightCutoff: 23.0,
    description: 'Final multi-view surface mesh consolidation, texture shading, and spatial verification.',
    techDetail: 'Full spatial scene assembly ready for epistemic confidence audit.',
  },
];

export const Stage06ReconstructionView: React.FC<Stage06ReconstructionViewProps> = ({
  onProceedToFinalModel,
  onProceedToEpistemic,
  onExploreInStage09,
  onReconstructionCompleted,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback & Timeline State
  const [progress, setProgress] = useState<number>(38); // start with partial reconstruction active
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<number | null>(null);
  const [showLaserPlane, setShowLaserPlane] = useState<boolean>(true);
  const [showKeyframeRays, setShowKeyframeRays] = useState<boolean>(true);
  const [showPointCloud, setShowPointCloud] = useState<boolean>(true);
  const [showBoundingVolume, setShowBoundingVolume] = useState<boolean>(true);

  // Notify parent on completion
  useEffect(() => {
    if (progress >= 100 && onReconstructionCompleted) {
      onReconstructionCompleted();
    }
  }, [progress, onReconstructionCompleted]);

  // Three.js Instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clipPlaneRef = useRef<THREE.Plane | null>(null);
  const laserPlaneMeshRef = useRef<THREE.Mesh | null>(null);
  const laserGridLinesRef = useRef<THREE.LineSegments | null>(null);
  const pointCloudMeshRef = useRef<THREE.Points | null>(null);
  const keyframeCamerasGroupRef = useRef<THREE.Group | null>(null);
  const keyframeRaysGroupRef = useRef<THREE.Group | null>(null);
  const buildingMeshGroupRef = useRef<THREE.Group | null>(null);
  const boundingBoxHelperRef = useRef<THREE.LineSegments | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit State
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 46, theta: Math.PI / 4.2, phi: Math.PI / 3.4 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 9.5, 0));

  // Extract the 18 selected keyframes from dataset
  const selectedKeyframes = useMemo(() => {
    return FRAME_ANALYSIS_DATA.frames.filter((f) => f.decision.selected);
  }, []);

  // Compute current active phase based on progress (0 - 100)
  const currentPhase = useMemo(() => {
    if (progress <= 16) return PHASES[0];
    if (progress <= 34) return PHASES[1];
    if (progress <= 52) return PHASES[2];
    if (progress <= 72) return PHASES[3];
    if (progress <= 88) return PHASES[4];
    return PHASES[5];
  }, [progress]);

  // Current reconstruction height in meters based on progress
  const currentHeightMeters = useMemo(() => {
    return Math.max(0.2, Math.min(22.0, (progress / 100) * 22.0));
  }, [progress]);

  // Step Controls
  const handleStepPrev = () => {
    setIsPlaying(false);
    const currentIndex = PHASES.findIndex((p) => p.id === currentPhase.id);
    const prevIndex = Math.max(0, currentIndex - 1);
    setProgress(PHASES[prevIndex].targetPercent);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    const currentIndex = PHASES.findIndex((p) => p.id === currentPhase.id);
    const nextIndex = Math.min(PHASES.length - 1, currentIndex + 1);
    setProgress(PHASES[nextIndex].targetPercent);
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EEF4FA');
    scene.fog = new THREE.FogExp2('#EEF4FA', 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer with clipping planes enabled for progressive height slice
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    // 4. Clipping Plane (Cuts off building above current reconstruction height)
    // Normal is (0, -1, 0) pointing down, constant is currentHeight
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), currentHeightMeters);
    clipPlaneRef.current = clipPlane;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight('#ffffff', 1.8);
    dirLight1.position.set(30, 45, 25);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#38bdf8', 0.65);
    dirLight2.position.set(-30, 20, -25);
    scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 0.6);
    scene.add(hemiLight);

    // 6. Ground Grid & Datum
    const groundGrid = new THREE.GridHelper(70, 70, 0x28BFEF, 0xC8D8E8);
    groundGrid.position.y = 0;
    scene.add(groundGrid);

    // Subtle Ground Plane
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xE2ECF4,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 7. Bounding Volume Box (28m x 22m x 12m)
    const bboxGeo = new THREE.BoxGeometry(28.4, 21.6, 12.4);
    const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
    const bboxMat = new THREE.LineBasicMaterial({
      color: 0x28BFEF,
      transparent: true,
      opacity: 0.45,
    });
    const bboxHelper = new THREE.LineSegments(bboxEdges, bboxMat);
    bboxHelper.position.set(0, 10.8, 0);
    scene.add(bboxHelper);
    boundingBoxHelperRef.current = bboxHelper;

    // 8. Progressive Building Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingMeshGroupRef.current = buildingGroup;

    // Construct the building geometry with the clipping plane attached to materials
    buildReconstructionGeometry(buildingGroup, clipPlane);

    // 9. Dense Point Cloud (simulating photogrammetric feature accumulation)
    const pointCloud = createReconstructionPointCloud(clipPlane);
    scene.add(pointCloud);
    pointCloudMeshRef.current = pointCloud;

    // 10. Horizontal Laser / Photogrammetric Scanning Plane
    const laserGroup = createLaserScanningPlane();
    scene.add(laserGroup.plane);
    scene.add(laserGroup.gridLines);
    laserPlaneMeshRef.current = laserGroup.plane;
    laserGridLinesRef.current = laserGroup.gridLines;

    // 11. Keyframe Cameras & Projection Rays Group
    const camerasGroup = new THREE.Group();
    const raysGroup = new THREE.Group();
    scene.add(camerasGroup);
    scene.add(raysGroup);
    keyframeCamerasGroupRef.current = camerasGroup;
    keyframeRaysGroupRef.current = raysGroup;

    populateKeyframeCameras(camerasGroup, raysGroup, selectedKeyframes);

    // Camera Orbit Init
    updateCameraOrbit();

    // Mouse Listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isRightDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current && !isRightDraggingRef.current) return;
      const deltaX = e.clientX - mousePosRef.current.x;
      const deltaY = e.clientY - mousePosRef.current.y;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        sphericalRef.current.theta -= deltaX * 0.007;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.007));
        updateCameraOrbit();
      } else if (isRightDraggingRef.current) {
        targetLookAtRef.current.y += deltaY * 0.03;
        targetLookAtRef.current.y = Math.max(0, Math.min(22, targetLookAtRef.current.y));
        updateCameraOrbit();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(16, Math.min(95, sphericalRef.current.radius + e.deltaY * 0.04));
      updateCameraOrbit();
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Render Loop
    let clock = new THREE.Clock();
    const renderLoop = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Subtle pulse on laser scan plane
      if (laserPlaneMeshRef.current && laserGridLinesRef.current) {
        const pulse = Math.sin(elapsed * 4) * 0.15 + 0.85;
        (laserPlaneMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * pulse;
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [selectedKeyframes]);

  // Update Camera Orbit Helper
  const updateCameraOrbit = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = targetLookAtRef.current;

    cameraRef.current.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(target);
  };

  // Progressive Height Sync Effect
  useEffect(() => {
    const height = currentHeightMeters;

    // 1. Update Clipping Plane
    if (clipPlaneRef.current) {
      clipPlaneRef.current.constant = height;
    }

    // 2. Update Laser Scan Plane Position
    if (laserPlaneMeshRef.current && laserGridLinesRef.current) {
      laserPlaneMeshRef.current.position.y = height;
      laserGridLinesRef.current.position.y = height + 0.02;
      laserPlaneMeshRef.current.visible = showLaserPlane && progress < 99.5;
      laserGridLinesRef.current.visible = showLaserPlane && progress < 99.5;
    }

    // 3. Update Keyframe Rays targeting the active build height
    if (keyframeRaysGroupRef.current) {
      keyframeRaysGroupRef.current.visible = showKeyframeRays;
      keyframeRaysGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          const positions = (child.geometry as THREE.BufferGeometry).attributes.position;
          // Target point is at (x, currentHeight, z)
          positions.setY(1, height);
          positions.needsUpdate = true;
        }
      });
    }

    // 4. Update Point Cloud Visibility & Height
    if (pointCloudMeshRef.current) {
      pointCloudMeshRef.current.visible = showPointCloud;
    }

    // 5. Update Bounding Volume
    if (boundingBoxHelperRef.current) {
      boundingBoxHelperRef.current.visible = showBoundingVolume;
    }
  }, [currentHeightMeters, progress, showLaserPlane, showKeyframeRays, showPointCloud, showBoundingVolume]);

  // Animation Playback Timer Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.45 * playSpeed;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);

  // If progress reaches 100%, pause playback
  useEffect(() => {
    if (progress >= 100 && isPlaying) {
      setIsPlaying(false);
    }
  }, [progress, isPlaying]);

  // Preset Views
  const setCameraPreset = (preset: 'iso' | 'front' | 'side' | 'top') => {
    if (preset === 'iso') {
      sphericalRef.current = { radius: 46, theta: Math.PI / 4.2, phi: Math.PI / 3.4 };
      targetLookAtRef.current.set(0, 9.5, 0);
    } else if (preset === 'front') {
      sphericalRef.current = { radius: 44, theta: 0, phi: Math.PI / 2.3 };
      targetLookAtRef.current.set(0, 9.5, 0);
    } else if (preset === 'side') {
      sphericalRef.current = { radius: 38, theta: Math.PI / 2, phi: Math.PI / 2.3 };
      targetLookAtRef.current.set(0, 9.5, 0);
    } else if (preset === 'top') {
      sphericalRef.current = { radius: 48, theta: 0, phi: 0.08 };
      targetLookAtRef.current.set(0, 5, 0);
    }
    updateCameraOrbit();
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs font-mono text-[#60758A]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[#28BFEF] font-bold text-sm tracking-wide">
              STAGE 04: 3D RECONSTRUCTION
            </span>
            <ProvenanceBadge type="DEMO_SIMULATED" size="sm" />
          </div>
          <span className="hidden md:inline text-[#D8E4EF]">|</span>
          <span className="hidden lg:inline text-[#60758A]">
            Progressive bottom-up reconstruction from selected UAV observations
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#60758A] bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#D8E4EF] shadow-xs">
            <span>Points: <strong className="text-[#28BFEF]">148,200</strong></span>
            <span>•</span>
            <span>Mesh Faces: <strong className="text-[#3287E8]">42,850</strong></span>
            <span>•</span>
            <span>Time: <strong className="text-[#22B573]">3.4s</strong></span>
          </div>

          <button
            onClick={onProceedToFinalModel || onProceedToEpistemic}
            id="stage04-proceed-btn"
            className="btn-primary-cyan px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5"
          >
            <span>Continue to Final 3D Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Workbench: 3D Progressive Viewport (Dominant) + Keyframe Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Central 3D Reconstruction Viewport */}
        <div className="lg:col-span-8 flex flex-col bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(50,90,125,0.08)] relative min-h-[580px]">
          {/* Viewport Top Overlay Bar - Subtle floating glass pill */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Phase Status Chip */}
            <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.85)] backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D8E4EF] shadow-[0_4px_16px_rgba(50,90,125,0.08)] pointer-events-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22B573] animate-pulse" />
              <div className="text-xs font-mono">
                <span className="text-[#60758A] font-medium">Phase: </span>
                <strong className="text-[#28BFEF] font-bold">{currentPhase.name}</strong>
              </div>
              <span className="text-[10px] bg-[#F5F9FD] text-[#17324D] px-1.5 py-0.5 rounded border border-[#D8E4EF] font-mono font-semibold">
                {Math.round(progress)}% Processed
              </span>
            </div>

            {/* Viewport Camera Presets */}
            <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.85)] backdrop-blur-md p-1 rounded-xl border border-[#D8E4EF] shadow-[0_4px_16px_rgba(50,90,125,0.08)] pointer-events-auto font-mono text-[11px]">
              <button
                onClick={() => setCameraPreset('iso')}
                className="px-2 py-1 rounded-lg hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#28BFEF] transition-colors"
                title="Isometric View"
              >
                ISO
              </button>
              <button
                onClick={() => setCameraPreset('front')}
                className="px-2 py-1 rounded-lg hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#28BFEF] transition-colors"
                title="Front Facade"
              >
                FRONT
              </button>
              <button
                onClick={() => setCameraPreset('side')}
                className="px-2 py-1 rounded-lg hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#28BFEF] transition-colors"
                title="Side Facade"
              >
                SIDE
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className="px-2 py-1 rounded-lg hover:bg-[#ECFAFF] text-[#60758A] hover:text-[#28BFEF] transition-colors"
                title="Top Nadir"
              >
                TOP
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div ref={containerRef} className="flex-1 w-full h-full min-h-[440px] relative bg-[#EEF4FA]">
            <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            {/* In-Viewport Bottom Left Telemetry HUD */}
            <div className="absolute bottom-3 left-3 z-10 bg-[rgba(255,255,255,0.85)] backdrop-blur-md p-2.5 rounded-xl border border-[#D8E4EF] text-[11px] font-mono text-[#17324D] space-y-1 pointer-events-none max-w-xs shadow-[0_4px_16px_rgba(50,90,125,0.08)]">
              <div className="flex items-center justify-between gap-3 text-[#60758A]">
                <span>Active Elevation Cutoff:</span>
                <strong className="text-[#22B573]">+{currentHeightMeters.toFixed(2)}m</strong>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#60758A]">
                <span>Observed Keyframes:</span>
                <strong className="text-[#28BFEF]">18 Frames Active</strong>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#60758A]">
                <span>Assembly:</span>
                <strong className="text-[#3287E8]">Progressive Upward Triangulation</strong>
              </div>
            </div>

            {/* In-Viewport Layer Toggles (Bottom Right) */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-[rgba(255,255,255,0.85)] backdrop-blur-md p-1.5 rounded-xl border border-[#D8E4EF] text-[10px] font-mono shadow-[0_4px_16px_rgba(50,90,125,0.08)]">
              <button
                onClick={() => setShowLaserPlane(!showLaserPlane)}
                className={`px-2 py-1 rounded-lg border transition-colors ${
                  showLaserPlane
                    ? 'bg-[#E8F8F0] border-[#22B573]/50 text-[#22B573] font-bold'
                    : 'bg-[#FFFFFF] border-[#D8E4EF] text-[#60758A]'
                }`}
                title="Toggle Scan Plane"
              >
                Scan Plane
              </button>
              <button
                onClick={() => setShowKeyframeRays(!showKeyframeRays)}
                className={`px-2 py-1 rounded-lg border transition-colors ${
                  showKeyframeRays
                    ? 'bg-[#ECFAFF] border-[#28BFEF]/50 text-[#28BFEF] font-bold'
                    : 'bg-[#FFFFFF] border-[#D8E4EF] text-[#60758A]'
                }`}
                title="Toggle Keyframe Raycasts"
              >
                Raycasts
              </button>
              <button
                onClick={() => setShowPointCloud(!showPointCloud)}
                className={`px-2 py-1 rounded-lg border transition-colors ${
                  showPointCloud
                    ? 'bg-[#F0EEFF] border-[#6366F1]/50 text-[#6366F1] font-bold'
                    : 'bg-[#FFFFFF] border-[#D8E4EF] text-[#60758A]'
                }`}
                title="Toggle Feature Point Cloud"
              >
                Points
              </button>
            </div>
          </div>

          {/* 3. Integrated Reconstruction Player & Scrubber Timeline */}
          <div className="p-3 bg-[rgba(255,255,255,0.85)] backdrop-blur-md border-t border-[#D8E4EF] space-y-2.5 font-mono text-xs">
            {/* Phase Tabs Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              {PHASES.map((phase) => {
                const isActive = currentPhase.id === phase.id;
                const isPassed = progress >= phase.targetPercent;

                return (
                  <button
                    key={phase.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setProgress(phase.targetPercent);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden select-none ${
                      isActive
                        ? 'bg-[#ECFAFF] border-[#28BFEF] ring-1 ring-[#28BFEF]/50 text-[#17324D] shadow-xs'
                        : isPassed
                        ? 'bg-[#FFFFFF] border-[#22B573]/40 text-[#17324D] hover:bg-[#F5F9FD]'
                        : 'bg-[#F5F9FD] border-[#D8E4EF] text-[#8C9BA8] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isActive ? 'text-[#28BFEF]' : isPassed ? 'text-[#22B573]' : 'text-[#8C9BA8]'}>
                        {phase.code}
                      </span>
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-[#22B573] shrink-0" />}
                    </div>
                    <div className="text-[11px] font-semibold truncate mt-0.5">
                      {phase.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Playback Controls & Progress Scrubber Bar */}
            <div className="flex items-center gap-3 pt-1">
              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-xl font-bold transition-all shadow-xs flex items-center justify-center shrink-0 ${
                  isPlaying
                    ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                    : 'bg-[#22B573] hover:bg-[#1DA366] text-white'
                }`}
                title={isPlaying ? 'Pause Animation' : 'Play Reconstruction'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Step Controls */}
              <button
                onClick={handleStepPrev}
                className="btn-secondary-glass p-2 rounded-xl shrink-0"
                title="Previous Phase"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepNext}
                className="btn-secondary-glass p-2 rounded-xl shrink-0"
                title="Next Phase"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRestart}
                className="btn-secondary-glass p-2 rounded-xl shrink-0"
                title="Restart From Ground (0%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Interactive Range Scrubber */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={progress}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setProgress(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-[#E2ECF4] rounded-lg appearance-none cursor-pointer accent-[#28BFEF]"
                />
                <span className="text-xs font-bold text-[#28BFEF] w-12 text-right">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#D8E4EF] shrink-0 text-[10px] shadow-xs">
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaySpeed(spd)}
                    className={`px-1.5 py-0.5 rounded ${
                      playSpeed === spd
                        ? 'bg-[#28BFEF] text-white font-bold'
                        : 'text-[#60758A] hover:text-[#17324D]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reconstruction Telemetry & Keyframe Feed Panel */}
        <div className="lg:col-span-4 space-y-3 flex flex-col font-sans">
          {/* 1. Spatial Assembly Pipeline Card */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8E4EF] space-y-3 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#17324D]">
              <span className="flex items-center gap-1.5 text-[#28BFEF] uppercase">
                <Activity className="w-4 h-4 text-[#28BFEF]" />
                Spatial Triangulation
              </span>
              <span className="text-[10px] text-[#22B573] font-bold bg-[#E8F8F0] px-2 py-0.5 rounded-md border border-[#22B573]/30">
                ACTIVE
              </span>
            </div>

            {/* Pipeline Flow Steps */}
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-semibold">
              <div className="p-1.5 rounded-lg bg-[#ECFAFF] border border-[#28BFEF]/40 text-[#28BFEF]">
                18 FRAMES
              </div>
              <div className="p-1.5 rounded-lg bg-[#F5F9FD] border border-[#D8E4EF] text-[#60758A]">
                RAYCASTS
              </div>
              <div className="p-1.5 rounded-lg bg-[#F5F9FD] border border-[#D8E4EF] text-[#60758A]">
                ACCUMULATE
              </div>
              <div className="p-1.5 rounded-lg bg-[#F5F9FD] border border-[#D8E4EF] text-[#60758A]">
                MESH
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-[11px] text-[#60758A] leading-relaxed font-sans">
              <strong>Bottom-Up Spatial Assembly:</strong> Selected UAV viewpoints cast spatial ray intersections, progressively triangulating building volume from the 0.00m foundation datum to the 21.50m rooftop terrace.
            </div>
          </div>

          {/* 2. Conceptual State Inspector Panel */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8E4EF] space-y-3 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#17324D]">
              <span className="flex items-center gap-1.5 text-[#3287E8] uppercase">
                <Box className="w-4 h-4 text-[#3287E8]" />
                Geometry Telemetry
              </span>
              <span className="text-[10px] text-[#60758A] font-normal">
                {currentPhase.code}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#F5F9FD] flex items-center justify-between border border-[#D8E4EF]">
                <span className="text-[#60758A]">Current Phase:</span>
                <strong className="text-[#17324D]">{currentPhase.shortLabel}</strong>
              </div>

              <div className="p-2 rounded-lg bg-[#F5F9FD] flex items-center justify-between border border-[#D8E4EF]">
                <span className="text-[#60758A]">Reconstruction Height:</span>
                <strong className="text-[#22B573]">+{currentHeightMeters.toFixed(2)}m / 22.00m</strong>
              </div>

              <div className="p-2 rounded-lg bg-[#F5F9FD] flex items-center justify-between border border-[#D8E4EF]">
                <span className="text-[#60758A]">Active Observations:</span>
                <strong className="text-[#28BFEF]">18 Selected Keyframes</strong>
              </div>

              <div className="p-2 rounded-lg bg-[#F5F9FD] flex items-center justify-between border border-[#D8E4EF]">
                <span className="text-[#60758A]">Output Geometry:</span>
                <strong className="text-[#3287E8]">
                  {progress < 99 ? 'Partial 3D Mesh' : 'Complete 3D Model'}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. 18 Selected Keyframes Feeding Ribbon */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8E4EF] space-y-2.5 font-mono text-xs shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-[#17324D]">
              <span className="flex items-center gap-1.5 text-[#28BFEF] uppercase">
                <Camera className="w-4 h-4 text-[#28BFEF]" />
                18 Observation Keyframes
              </span>
              <span className="text-[10px] text-[#22B573] font-bold bg-[#E8F8F0] px-2 py-0.5 rounded-md border border-[#22B573]/30">
                STREAM READY
              </span>
            </div>

            <p className="text-[11px] text-[#60758A] font-sans">
              Observation viewpoints driving multi-view epipolar triangulation:
            </p>

            {/* Scrollable Keyframe List */}
            <div className="grid grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {selectedKeyframes.map((kf) => {
                const isSelected = selectedKeyframeId === kf.frame_id;
                return (
                  <div
                    key={kf.frame_id}
                    onClick={() => setSelectedKeyframeId(isSelected ? null : kf.frame_id)}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#ECFAFF] border-[#28BFEF] text-[#17324D] shadow-xs'
                        : 'bg-[#F5F9FD] border-[#D8E4EF] hover:border-[#28BFEF]/40 text-[#60758A]'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#28BFEF]">
                      Frame #{kf.frame_id.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-[#8C9BA8] uppercase mt-0.5 truncate">
                      {kf.viewpoint.category}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// THREE.JS GEOMETRY & HELPER GENERATORS
// ============================================================================

/**
 * Builds the modular post-and-beam building geometry with local clipping planes
 * attached to materials so that rendering is strictly clipped to active height.
 */
function buildReconstructionGeometry(group: THREE.Group, clipPlane: THREE.Plane) {
  // Material Palette with clipping enabled
  const slabMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.2,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });

  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.6,
    metalness: 0.3,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.1,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.65,
    clippingPlanes: [clipPlane],
  });

  const parapetMaterial = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.7,
    clippingPlanes: [clipPlane],
  });

  // 1. Foundation Ground Slab (0.00m to 0.40m)
  const groundSlabGeo = new THREE.BoxGeometry(28.0, 0.4, 12.0);
  const groundSlab = new THREE.Mesh(groundSlabGeo, slabMaterial);
  groundSlab.position.set(0, 0.2, 0);
  groundSlab.receiveShadow = true;
  group.add(groundSlab);

  // 2. 32 Structural Columns (Rising from Ground to Roof 21.5m)
  const colGeo = new THREE.BoxGeometry(0.75, 21.5, 0.65);
  // Grid layout: 8 columns along X (-14m to +14m @ 4m), 4 columns along Z (-6m to +6m @ 4m)
  for (let i = 0; i <= 7; i++) {
    const xPos = -14 + i * 4.0;
    for (let j = 0; j <= 3; j++) {
      const zPos = -6 + j * 4.0;
      const column = new THREE.Mesh(colGeo, columnMaterial);
      column.position.set(xPos, 10.75, zPos);
      column.castShadow = true;
      column.receiveShadow = true;
      group.add(column);
    }
  }

  // 3. Intermediate Floor Slabs (Levels 1, 2, 3, 4, Roof)
  const floorHeights = [4.5, 8.0, 11.5, 15.0, 18.5, 21.5];
  floorHeights.forEach((h) => {
    const slabGeo = new THREE.BoxGeometry(28.2, 0.35, 12.2);
    const slab = new THREE.Mesh(slabGeo, slabMaterial);
    slab.position.set(0, h, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
  });

  // 4. Exterior Facade Walls & Window Glazing
  // Long North Facade (Z = +6.0)
  for (let i = 0; i < 7; i++) {
    const xBay = -12.0 + i * 4.0;
    for (let f = 0; f < 5; f++) {
      const floorBaseY = floorHeights[f];
      const nextFloorY = floorHeights[f + 1] || 21.5;
      const bayHeight = nextFloorY - floorBaseY;

      // Spandrel Wall
      const wallGeo = new THREE.BoxGeometry(3.2, bayHeight * 0.45, 0.25);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(xBay, floorBaseY + bayHeight * 0.25, 6.0);
      group.add(wallMesh);

      // Window Glazing
      const winGeo = new THREE.BoxGeometry(2.8, bayHeight * 0.45, 0.08);
      const winMesh = new THREE.Mesh(winGeo, windowMaterial);
      winMesh.position.set(xBay, floorBaseY + bayHeight * 0.65, 6.0);
      group.add(winMesh);
    }
  }

  // Long South Facade (Z = -6.0)
  for (let i = 0; i < 7; i++) {
    const xBay = -12.0 + i * 4.0;
    for (let f = 0; f < 5; f++) {
      const floorBaseY = floorHeights[f];
      const nextFloorY = floorHeights[f + 1] || 21.5;
      const bayHeight = nextFloorY - floorBaseY;

      const wallGeo = new THREE.BoxGeometry(3.2, bayHeight * 0.45, 0.25);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(xBay, floorBaseY + bayHeight * 0.25, -6.0);
      group.add(wallMesh);

      const winGeo = new THREE.BoxGeometry(2.8, bayHeight * 0.45, 0.08);
      const winMesh = new THREE.Mesh(winGeo, windowMaterial);
      winMesh.position.set(xBay, floorBaseY + bayHeight * 0.65, -6.0);
      group.add(winMesh);
    }
  }

  // 5. Roof Terrace Bulkhead & Parapets (21.5m to 24.5m)
  const parapetLongGeo = new THREE.BoxGeometry(28.4, 0.7, 0.3);
  const parapet1 = new THREE.Mesh(parapetLongGeo, parapetMaterial);
  parapet1.position.set(0, 21.85, 6.0);
  const parapet2 = new THREE.Mesh(parapetLongGeo, parapetMaterial);
  parapet2.position.set(0, 21.85, -6.0);
  group.add(parapet1);
  group.add(parapet2);

  // Rooftop Elevator Penthouse
  const penthouseGeo = new THREE.BoxGeometry(6.0, 3.0, 4.5);
  const penthouse = new THREE.Mesh(penthouseGeo, wallMaterial);
  penthouse.position.set(-8.0, 23.0, 0);
  group.add(penthouse);
}

/**
 * Creates structured feature point clouds simulating photogrammetry keypoints.
 */
function createReconstructionPointCloud(clipPlane: THREE.Plane): THREE.Points {
  const pointCount = 1200;
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  const col1 = new THREE.Color(0x38bdf8);
  const col2 = new THREE.Color(0x34d399);
  const col3 = new THREE.Color(0xa855f7);

  for (let i = 0; i < pointCount; i++) {
    // Generate points distributed across building surface boundary
    const x = (Math.random() - 0.5) * 28.5;
    const y = Math.random() * 22.0;
    const z = (Math.random() - 0.5) * 12.5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const chosenCol = Math.random() > 0.6 ? col1 : Math.random() > 0.5 ? col2 : col3;
    colors[i * 3] = chosenCol.r;
    colors[i * 3 + 1] = chosenCol.g;
    colors[i * 3 + 2] = chosenCol.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    clippingPlanes: [clipPlane],
  });

  return new THREE.Points(geometry, material);
}

/**
 * Creates a glowing horizontal laser scan plane indicating active elevation reconstruction.
 */
function createLaserScanningPlane() {
  const planeGeo = new THREE.PlaneGeometry(36, 20);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = 1.0;

  // Grid Lines overlay on laser plane
  const gridLinesGeo = new THREE.PlaneGeometry(36, 20, 18, 10);
  const gridEdges = new THREE.EdgesGeometry(gridLinesGeo);
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
  });
  const gridLines = new THREE.LineSegments(gridEdges, gridMat);
  gridLines.rotation.x = Math.PI / 2;
  gridLines.position.y = 1.02;

  return { plane, gridLines };
}

/**
 * Populates 18 drone camera frustums & sightline triangulation rays.
 */
function populateKeyframeCameras(
  camerasGroup: THREE.Group,
  raysGroup: THREE.Group,
  keyframes: typeof FRAME_ANALYSIS_DATA.frames
) {
  const camMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
  const rayMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
  });

  keyframes.forEach((kf, idx) => {
    // Distribute 18 camera poses along an orbital sweep around the structure
    const angle = (idx / keyframes.length) * Math.PI * 2;
    const radiusX = 26.0;
    const radiusZ = 18.0;
    const camY = 16.0 + Math.sin(idx * 0.8) * 6.0;

    const camPos = new THREE.Vector3(
      Math.cos(angle) * radiusX,
      camY,
      Math.sin(angle) * radiusZ
    );

    // Camera Frustum Pyramid
    const frustumGeo = new THREE.ConeGeometry(0.7, 1.2, 4);
    const frustumMesh = new THREE.Mesh(frustumGeo, camMat);
    frustumMesh.position.copy(camPos);
    frustumMesh.lookAt(new THREE.Vector3(0, 10, 0));
    frustumMesh.rotateX(Math.PI / 2);
    camerasGroup.add(frustumMesh);

    // Dynamic Sightline Ray from Camera to Active Target
    const rayGeo = new THREE.BufferGeometry().setFromPoints([
      camPos,
      new THREE.Vector3(0, 1.0, 0), // Target position dynamically updated in effect
    ]);
    const rayLine = new THREE.Line(rayGeo, rayMat);
    raysGroup.add(rayLine);
  });
}
