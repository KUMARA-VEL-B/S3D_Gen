import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { 
  ViewingMode, 
  RenderShaderMode, 
  DamageType, 
  ComparisonMode,
  DamageHazardMarker,
  DisasterScenarioState
} from '../types';
import { GROUND_TRUTH_BUILDING, HAZARD_MARKERS } from '../data/groundTruth';

export interface Viewport3DHandle {
  setCameraPreset: (preset: 'iso' | 'front' | 'rear' | 'left' | 'right' | 'top' | 'drone') => void;
  triggerLaserScan: () => void;
  triggerDamageAnimation: (damageKey?: DamageType) => void;
  triggerReconstructionAnimation: () => void;
  triggerDisasterSimulation: () => void;
  triggerRecoveryAnimation: () => void;
  captureSnapshot: () => string;
}

interface Viewport3DProps {
  viewingMode: ViewingMode;
  renderMode: RenderShaderMode;
  selectedLevel: string; // 'all' | '0' | '1' | '2' | '3' | 'roof'
  damageType: DamageType;
  comparisonMode: ComparisonMode;
  comparisonSlider: number; // 0 to 100
  showDronePath: boolean;
  showGrid: boolean;
  isGenerating3D: boolean;
  generationProgress: number;
  is3DGenerated: boolean;
  onSelectHazard: (hazard: DamageHazardMarker) => void;
  onDamageAnimComplete?: () => void;
  onReconstructionAnimComplete?: () => void;
  onProgressReconstruction?: (progress: number) => void;
  disasterState?: DisasterScenarioState;
  onSelectDisasterState?: (state: DisasterScenarioState) => void;
  isDisasterActive?: boolean;
  onToggleDisasterActive?: (active: boolean) => void;
  highlightAffectedAreas?: boolean;
  onToggleHighlightAffected?: (highlight: boolean) => void;
  compareDisasterSplit?: number;
  onChangeCompareDisasterSplit?: (split: number) => void;
}

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({
  viewingMode,
  renderMode,
  selectedLevel,
  damageType,
  comparisonMode,
  comparisonSlider,
  showDronePath,
  showGrid,
  isGenerating3D,
  generationProgress,
  is3DGenerated,
  onSelectHazard,
  onDamageAnimComplete,
  onReconstructionAnimComplete,
  onProgressReconstruction,
  disasterState = 'before',
  onSelectDisasterState,
  isDisasterActive = false,
  onToggleDisasterActive,
  highlightAffectedAreas = false,
  onToggleHighlightAffected,
  compareDisasterSplit = 0,
  onChangeCompareDisasterSplit,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js Core Instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const dronePathLineRef = useRef<THREE.Line | null>(null);
  const laserPlaneRef = useRef<THREE.Mesh | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const hazardMarkersGroupRef = useRef<THREE.Group | null>(null);
  const reconstructionGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Animation States
  const [activeElevationTitle, setActiveElevationTitle] = useState<string>('ISOMETRIC OVERVIEW');
  const [isDamageAnimating, setIsDamageAnimating] = useState<boolean>(false);
  const [isReconstructingAnimating, setIsReconstructingAnimating] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [activeDamageLiveMetrics, setActiveDamageLiveMetrics] = useState<{
    crackWidth: number;
    stressStrain: number;
    integrity: number;
  }>({ crackWidth: 0, stressStrain: 120, integrity: 98 });

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseDownAtRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const sphericalRef = useRef({ radius: 46, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 8.5, 0));
  const targetSphericalRef = useRef({ radius: 46, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetLookAtFinalRef = useRef(new THREE.Vector3(0, 8.5, 0));

  // Telemetry HUD state
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 0, z: 0, zoom: 1 });

  // Particle systems
  const debrisParticlesRef = useRef<{ mesh: THREE.Points; velocities: Float32Array; active: boolean } | null>(null);
  const epoxyParticlesRef = useRef<{ mesh: THREE.Points; velocities: Float32Array; active: boolean } | null>(null);

  // Expose camera presets and animation triggers
  useImperativeHandle(ref, () => ({
    setCameraPreset: (preset) => {
      if (!cameraRef.current) return;
      switch (preset) {
        case 'iso':
          targetSphericalRef.current = { radius: 46, theta: Math.PI / 4, phi: Math.PI / 3.2 };
          targetLookAtFinalRef.current.set(0, 8.5, 0);
          setActiveElevationTitle('ISOMETRIC ORBITAL VIEW');
          break;
        case 'front':
          targetSphericalRef.current = { radius: 40, theta: 0, phi: Math.PI / 2.05 };
          targetLookAtFinalRef.current.set(0, 8.5, 0);
          setActiveElevationTitle('FRONT ELEVATION — 28.00m (7 BAYS | 4 STOREYS)');
          break;
        case 'rear':
          targetSphericalRef.current = { radius: 40, theta: Math.PI, phi: Math.PI / 2.05 };
          targetLookAtFinalRef.current.set(0, 8.5, 0);
          setActiveElevationTitle('REAR ELEVATION — 28.00m (7 BAYS)');
          break;
        case 'left':
          targetSphericalRef.current = { radius: 34, theta: -Math.PI / 2, phi: Math.PI / 2.05 };
          targetLookAtFinalRef.current.set(0, 8.5, 0);
          setActiveElevationTitle('LEFT ELEVATION — 12.00m (3 BAYS)');
          break;
        case 'right':
          targetSphericalRef.current = { radius: 34, theta: Math.PI / 2, phi: Math.PI / 2.05 };
          targetLookAtFinalRef.current.set(0, 8.5, 0);
          setActiveElevationTitle('RIGHT ELEVATION — 12.00m (3 BAYS + PENTHOUSE)');
          break;
        case 'top':
          targetSphericalRef.current = { radius: 46, theta: 0, phi: 0.05 };
          targetLookAtFinalRef.current.set(0, 10, 0);
          setActiveElevationTitle('ROOF DECK PLAN & PENTHOUSE ELEVATION');
          break;
        case 'drone':
          targetSphericalRef.current = { radius: 36, theta: Math.PI / 3.2, phi: Math.PI / 3.6 };
          targetLookAtFinalRef.current.set(2, 11, 0);
          setActiveElevationTitle('UAV FLIGHT INSPECTION POV');
          break;
      }
    },
    triggerLaserScan: () => {
      if (laserPlaneRef.current) {
        laserPlaneRef.current.position.y = -1;
        laserPlaneRef.current.visible = true;
      }
    },
    triggerDamageAnimation: (key = damageType) => {
      startDamageAnimation(key !== 'none' ? key : 'facade_crack');
    },
    triggerReconstructionAnimation: () => {
      startReconstructionAnimation();
    },
    triggerDisasterSimulation: () => {
      startDisasterSimulation();
    },
    triggerRecoveryAnimation: () => {
      startRecoveryAnimation();
    },
    captureSnapshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      }
      return '';
    },
  }));

  // Trigger Disaster Simulation Scenario
  const startDisasterSimulation = () => {
    if (onSelectDisasterState) onSelectDisasterState('simulating');
    if (onToggleDisasterActive) onToggleDisasterActive(true);
    startDamageAnimation('disaster_earthquake', true);
  };

  // Trigger Damage / Disaster Simulation 3D Animation
  const startDamageAnimation = (selectedDamage: DamageType, isDisasterDemonstration: boolean = false) => {
    setIsDamageAnimating(true);
    setIsReconstructingAnimating(false);
    setAnimationProgress(0);

    const hazard = HAZARD_MARKERS[selectedDamage] || HAZARD_MARKERS.disaster_earthquake;

    // Smoothly focus camera onto the defect coordinate
    targetLookAtFinalRef.current.set(hazard.position3D[0], hazard.position3D[1], hazard.position3D[2]);
    if (selectedDamage === 'disaster_earthquake') {
      targetSphericalRef.current = { radius: 24, theta: 0.15, phi: Math.PI / 2.15 };
      setActiveElevationTitle('DISASTER SIMULATION • CONTROLLED DEMONSTRATION (BAYS 1-3)');
    } else if (selectedDamage === 'facade_crack') {
      targetSphericalRef.current = { radius: 18, theta: 0.1, phi: Math.PI / 2.1 };
      setActiveElevationTitle('DEFECT FOCUS: FACADE CRACK (BAYS 3-4)');
    } else if (selectedDamage === 'column_shear') {
      targetSphericalRef.current = { radius: 15, theta: -Math.PI / 3, phi: Math.PI / 2.2 };
      setActiveElevationTitle('DEFECT FOCUS: CORNER PILASTER SHEAR (P1)');
    } else {
      targetSphericalRef.current = { radius: 18, theta: Math.PI / 1.8, phi: Math.PI / 2.8 };
      setActiveElevationTitle('DEFECT FOCUS: ROOFTOP PENTHOUSE JOINT');
    }

    // Activate Debris Particles
    if (debrisParticlesRef.current) {
      debrisParticlesRef.current.active = true;
      debrisParticlesRef.current.mesh.position.set(...hazard.position3D);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 3;
      setAnimationProgress(Math.min(100, progress));

      // Visual demonstration tremor on building
      if (buildingGroupRef.current && progress < 85) {
        const shake = Math.sin(progress * 0.4) * (1 - progress / 100) * 0.08;
        buildingGroupRef.current.position.x = shake;
        buildingGroupRef.current.position.z = shake * 0.4;
      } else if (buildingGroupRef.current) {
        buildingGroupRef.current.position.x = 0;
        buildingGroupRef.current.position.z = 0;
      }

      // Live metrics for demonstration display
      const maxCrack = hazard.crackWidthMm;
      const curCrack = (progress / 100) * maxCrack;
      const curStress = 120 + (progress / 100) * (selectedDamage === 'disaster_earthquake' ? 1200 : 800);

      setActiveDamageLiveMetrics({
        crackWidth: Number(curCrack.toFixed(1)),
        stressStrain: Math.round(curStress),
        integrity: Math.max(0, 100 - Math.round(progress * 0.5)),
      });

      if (progress >= 100) {
        clearInterval(interval);
        setIsDamageAnimating(false);
        if (buildingGroupRef.current) {
          buildingGroupRef.current.position.x = 0;
          buildingGroupRef.current.position.z = 0;
        }
        if (debrisParticlesRef.current) debrisParticlesRef.current.active = false;
        if (isDisasterDemonstration || selectedDamage === 'disaster_earthquake') {
          if (onSelectDisasterState) onSelectDisasterState('after');
          if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(0);
          setActiveElevationTitle('DISASTER DEMONSTRATION • AFTER DISASTER');
        }
        if (onDamageAnimComplete) onDamageAnimComplete();
      }
    }, 45);
  };

  // Trigger Smooth 3D Recovery Transition for Disaster Demonstration
  const startRecoveryAnimation = () => {
    setIsReconstructingAnimating(true);
    setIsDamageAnimating(false);
    setAnimationProgress(0);

    // Gently frame the affected bays for clear recovery observation
    targetLookAtFinalRef.current.set(-2, 4, 14);
    targetSphericalRef.current = { radius: 22, theta: 0.12, phi: Math.PI / 2.15 };
    setActiveElevationTitle('DISASTER DEMONSTRATION • RECOVERY IN PROGRESS');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      const curVal = Math.min(100, progress);
      setAnimationProgress(curVal);
      if (onChangeCompareDisasterSplit) {
        onChangeCompareDisasterSplit(curVal);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsReconstructingAnimating(false);
        if (onSelectDisasterState) onSelectDisasterState('recovery');
        if (onChangeCompareDisasterSplit) onChangeCompareDisasterSplit(100);
        setActiveElevationTitle('DISASTER DEMONSTRATION • RECOVERY');
      }
    }, 40);
  };

  // Trigger 3D Reconstruction Animation
  const startReconstructionAnimation = () => {
    setIsReconstructingAnimating(true);
    setIsDamageAnimating(false);
    setAnimationProgress(0);

    const hazard = HAZARD_MARKERS[damageType !== 'none' ? damageType : 'disaster_earthquake'];

    targetLookAtFinalRef.current.set(hazard.position3D[0], hazard.position3D[1], hazard.position3D[2]);
    targetSphericalRef.current = { radius: 18, theta: 0.08, phi: Math.PI / 2.1 };
    setActiveElevationTitle('3D RECONSTRUCTION: GEOMETRIC RESTORATION');

    if (laserPlaneRef.current) {
      laserPlaneRef.current.position.y = hazard.position3D[1] - 3;
      laserPlaneRef.current.visible = true;
    }

    if (epoxyParticlesRef.current) {
      epoxyParticlesRef.current.active = true;
      epoxyParticlesRef.current.mesh.position.set(...hazard.position3D);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAnimationProgress(progress);
      if (onProgressReconstruction) {
        onProgressReconstruction(progress);
      }

      const maxCrack = hazard.crackWidthMm;
      const curCrack = Math.max(0, maxCrack * (1 - progress / 100));
      const curStress = Math.max(120, 1440 - (progress / 100) * 1320);
      const curIntegrity = Math.min(100, 42.6 + (progress / 100) * 57.4);

      setActiveDamageLiveMetrics({
        crackWidth: Number(curCrack.toFixed(2)),
        stressStrain: Math.round(curStress),
        integrity: Number(curIntegrity.toFixed(1)),
      });

      if (progress >= 100) {
        clearInterval(interval);
        setIsReconstructingAnimating(false);
        if (epoxyParticlesRef.current) epoxyParticlesRef.current.active = false;
        if (laserPlaneRef.current) laserPlaneRef.current.visible = false;
        if (onReconstructionAnimComplete) onReconstructionAnimComplete();
      }
    }, 40);
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEEF4FA);
    scene.fog = new THREE.FogExp2(0xEEF4FA, 0.005);
    sceneRef.current = scene;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Grid Floor with subtle cyan/slate-blue lines
    const gridHelper = new THREE.GridHelper(80, 80, 0x28BFEF, 0xC8D8E8);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Lighting (Warm Architectural Sun + Skylight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-25, 20, -25);
    scene.add(fillLight);

    // Building Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // Laser Scan Mesh
    const laserGeo = new THREE.PlaneGeometry(40, 24);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const laserPlane = new THREE.Mesh(laserGeo, laserMat);
    laserPlane.rotation.x = Math.PI / 2;
    laserPlane.position.y = 0;
    laserPlane.visible = false;
    scene.add(laserPlane);
    laserPlaneRef.current = laserPlane;

    // Particles Group for Debris and Epoxy Injection
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    // Create Debris Particles
    const debrisCount = 120;
    const debrisGeo = new THREE.BufferGeometry();
    const debrisPositions = new Float32Array(debrisCount * 3);
    const debrisVelocities = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      debrisPositions[i * 3] = (Math.random() - 0.5) * 2;
      debrisPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      debrisPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      debrisVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
      debrisVelocities[i * 3 + 1] = -Math.random() * 0.08 - 0.02;
      debrisVelocities[i * 3 + 2] = Math.random() * 0.05;
    }
    debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
    const debrisMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.22, transparent: true, opacity: 0.9 });
    const debrisPoints = new THREE.Points(debrisGeo, debrisMat);
    particlesGroup.add(debrisPoints);
    debrisParticlesRef.current = { mesh: debrisPoints, velocities: debrisVelocities, active: false };

    // Create Epoxy Resin Injection Particles
    const epoxyCount = 150;
    const epoxyGeo = new THREE.BufferGeometry();
    const epoxyPositions = new Float32Array(epoxyCount * 3);
    const epoxyVelocities = new Float32Array(epoxyCount * 3);
    for (let i = 0; i < epoxyCount; i++) {
      epoxyPositions[i * 3] = (Math.random() - 0.5) * 2.5;
      epoxyPositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      epoxyPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      epoxyVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      epoxyVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      epoxyVelocities[i * 3 + 2] = 0.03;
    }
    epoxyGeo.setAttribute('position', new THREE.BufferAttribute(epoxyPositions, 3));
    const epoxyMat = new THREE.PointsMaterial({ color: 0x10b981, size: 0.25, transparent: true, opacity: 0.95 });
    const epoxyPoints = new THREE.Points(epoxyGeo, epoxyMat);
    particlesGroup.add(epoxyPoints);
    epoxyParticlesRef.current = { mesh: epoxyPoints, velocities: epoxyVelocities, active: false };

    // Drone Group & Spline Path
    const droneGroup = new THREE.Group();
    scene.add(droneGroup);
    droneGroupRef.current = droneGroup;

    const droneBodyGeo = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const droneBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const droneBody = new THREE.Mesh(droneBodyGeo, droneBodyMat);
    droneGroup.add(droneBody);

    const gimbalGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const gimbalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const gimbalMesh = new THREE.Mesh(gimbalGeo, gimbalMat);
    gimbalMesh.position.y = -0.3;
    droneGroup.add(gimbalMesh);

    const coneGeo = new THREE.ConeGeometry(4, 12, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const frustumCone = new THREE.Mesh(coneGeo, coneMat);
    frustumCone.rotation.x = Math.PI;
    frustumCone.position.y = -6;
    droneGroup.add(frustumCone);

    const dronePoints: THREE.Vector3[] = [];
    for (let t = 0; t <= Math.PI * 2; t += Math.PI / 12) {
      dronePoints.push(new THREE.Vector3(
        Math.cos(t) * 24,
        15 + Math.sin(t * 2) * 5,
        Math.sin(t) * 16
      ));
    }
    const droneCurve = new THREE.CatmullRomCurve3(dronePoints, true);
    const splineGeo = new THREE.BufferGeometry().setFromPoints(droneCurve.getPoints(100));
    const splineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 1,
      gapSize: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const dronePathLine = new THREE.Line(splineGeo, splineMat);
    dronePathLine.computeLineDistances();
    scene.add(dronePathLine);
    dronePathLineRef.current = dronePathLine;

    // Hazard Group & Reconstruction Group
    const hazardGroup = new THREE.Group();
    scene.add(hazardGroup);
    hazardMarkersGroupRef.current = hazardGroup;

    const recontructGroup = new THREE.Group();
    scene.add(recontructGroup);
    reconstructionGroupRef.current = recontructGroup;

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationId: number;
    let droneT = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth camera interpolation toward target
      const lerpFactor = 0.08;
      sphericalRef.current.radius += (targetSphericalRef.current.radius - sphericalRef.current.radius) * lerpFactor;
      sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * lerpFactor;
      sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * lerpFactor;

      targetLookAtRef.current.lerp(targetLookAtFinalRef.current, lerpFactor);

      const { radius, theta, phi } = sphericalRef.current;
      camera.position.x = targetLookAtRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = targetLookAtRef.current.y + radius * Math.cos(phi);
      camera.position.z = targetLookAtRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(targetLookAtRef.current);

      // Animate Drone
      if (showDronePath && droneGroupRef.current) {
        droneT = (droneT + 0.0012) % 1;
        const pt = droneCurve.getPoint(droneT);
        droneGroupRef.current.position.copy(pt);
        const tangent = droneCurve.getTangent(droneT);
        droneGroupRef.current.lookAt(pt.clone().add(tangent));
      }

      // Animate Laser Scan
      if (laserPlaneRef.current && laserPlaneRef.current.visible) {
        laserPlaneRef.current.position.y += 0.18;
        if (laserPlaneRef.current.position.y > 23) {
          laserPlaneRef.current.position.y = 0;
        }
      }

      // Animate Debris Particle Physics
      if (debrisParticlesRef.current && debrisParticlesRef.current.active) {
        const positions = debrisParticlesRef.current.mesh.geometry.attributes.position.array as Float32Array;
        const vels = debrisParticlesRef.current.velocities;
        for (let i = 0; i < debrisCount; i++) {
          positions[i * 3] += vels[i * 3];
          positions[i * 3 + 1] += vels[i * 3 + 1];
          positions[i * 3 + 2] += vels[i * 3 + 2];

          if (positions[i * 3 + 1] < -4) {
            positions[i * 3] = (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 1] = 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
          }
        }
        debrisParticlesRef.current.mesh.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Epoxy Particle Swarm
      if (epoxyParticlesRef.current && epoxyParticlesRef.current.active) {
        const positions = epoxyParticlesRef.current.mesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < epoxyCount; i++) {
          positions[i * 3] += (Math.random() - 0.5) * 0.04;
          positions[i * 3 + 1] += (Math.random() - 0.5) * 0.04;
          positions[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
        }
        epoxyParticlesRef.current.mesh.geometry.attributes.position.needsUpdate = true;
      }

      // Pulsate Hazard Beacons
      if (hazardMarkersGroupRef.current) {
        hazardMarkersGroupRef.current.children.forEach((child) => {
          const ring = child.getObjectByName('beaconRing');
          if (ring) {
            ring.scale.x = 1 + Math.sin(Date.now() * 0.007) * 0.3;
            ring.scale.y = 1 + Math.sin(Date.now() * 0.007) * 0.3;
          }
        });
      }

      renderer.render(scene, camera);

      // Telemetry
      setCameraCoords({
        x: Math.round(camera.position.x * 10) / 10,
        y: Math.round(camera.position.y * 10) / 10,
        z: Math.round(camera.position.z * 10) / 10,
        zoom: Math.round((46 / radius) * 10) / 10,
      });
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Build the 3D Building Components strictly matching Photogrammetric Survey & Video
  useEffect(() => {
    const group = buildingGroupRef.current;
    const scene = sceneRef.current;
    if (!group || !scene) return;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (pointCloudRef.current) {
      scene.remove(pointCloudRef.current);
      pointCloudRef.current = null;
    }

    const isFullyReconstructed = comparisonSlider >= 95 || comparisonMode === 'restored';
    // "Before" comparison mode always shows the pristine, undamaged geometry regardless of the
    // selected damage scenario, so the user can inspect Before / Damaged / Restored states.
    let isDamagedActive = (damageType !== 'none' || viewingMode === 'damage') && !isFullyReconstructed && comparisonMode !== 'before';

    // Handle Disaster Demonstration State overrides
    const isDisasterDemoActive = Boolean(isDisasterActive || viewingMode === 'reconstruction');
    if (isDisasterDemoActive) {
      if (disasterState === 'before') {
        isDamagedActive = false; // Pristine before disaster
      } else if (disasterState === 'disaster' || disasterState === 'after' || disasterState === 'simulating') {
        isDamagedActive = true; // Controlled disaster deformation
      } else if (disasterState === 'recovery' || disasterState === 'highlighted' || disasterState === 'highlight') {
        isDamagedActive = false; // Reconstructed/recovered condition
      }
    }

    const isHighlightActive = Boolean(
      isDisasterDemoActive && (highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight')
    );

    // Subtle, clean recovery highlight material fitting the light theme (Requirement 16)
    const highlightSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.28,
      roughness: 0.35,
    });
    const highlightPilasterMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x047857,
      emissiveIntensity: 0.28,
      roughness: 0.4,
    });
    const unknownOccludedMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      transparent: true,
      opacity: 0.72,
    });

    // Material Library
    let concreteMat: THREE.Material;
    let pilasterMat: THREE.Material;
    let entablatureMat: THREE.Material;
    let glassMat: THREE.Material;
    let brokenGlassMat: THREE.Material;
    let doorGlassMat: THREE.Material;
    let frameMat: THREE.Material;
    let slabMat: THREE.Material;
    let interiorMat: THREE.Material;
    let rebarMat: THREE.Material;
    let cfrpMat: THREE.Material;
    let canopyMat: THREE.Material;
    let doorHandleMat: THREE.Material;
    let sidewalkMat: THREE.Material;
    let redCurbMat: THREE.Material;
    let asphaltMat: THREE.Material;
    let sconceMat: THREE.Material;
    let tunnelInteriorMat: THREE.Material;

    if (renderMode === 'wireframe') {
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
      concreteMat = wireMat;
      pilasterMat = wireMat;
      entablatureMat = wireMat;
      glassMat = wireMat;
      brokenGlassMat = wireMat;
      doorGlassMat = wireMat;
      frameMat = wireMat;
      slabMat = wireMat;
      interiorMat = wireMat;
      rebarMat = wireMat;
      cfrpMat = wireMat;
      canopyMat = wireMat;
      doorHandleMat = wireMat;
      sidewalkMat = wireMat;
      redCurbMat = wireMat;
      asphaltMat = wireMat;
      sconceMat = wireMat;
      tunnelInteriorMat = wireMat;
    } else if (renderMode === 'lidar') {
      concreteMat = new THREE.MeshNormalMaterial();
      pilasterMat = new THREE.MeshNormalMaterial();
      entablatureMat = new THREE.MeshNormalMaterial();
      glassMat = new THREE.MeshNormalMaterial({ wireframe: true });
      brokenGlassMat = new THREE.MeshNormalMaterial({ wireframe: true });
      doorGlassMat = new THREE.MeshNormalMaterial();
      frameMat = new THREE.MeshNormalMaterial();
      slabMat = new THREE.MeshNormalMaterial();
      interiorMat = new THREE.MeshNormalMaterial();
      rebarMat = new THREE.MeshNormalMaterial();
      cfrpMat = new THREE.MeshNormalMaterial();
      canopyMat = new THREE.MeshNormalMaterial();
      doorHandleMat = new THREE.MeshNormalMaterial();
      sidewalkMat = new THREE.MeshNormalMaterial();
      redCurbMat = new THREE.MeshNormalMaterial();
      asphaltMat = new THREE.MeshNormalMaterial();
      sconceMat = new THREE.MeshNormalMaterial();
      tunnelInteriorMat = new THREE.MeshNormalMaterial();
    } else if (renderMode === 'epistemic') {
      // 4-CLASS EPISTEMIC SEGMENTATION SHADER MODE:
      // 1. Observed (Emerald #10b981): Front facade, visible entrance, direct sightline
      // 2. Reference-Supported (Sky #0284c7): Ground slab, structural datum, base framework
      // 3. Inferred (Amber #f59e0b): Side pilasters, symmetrical bays, coplanar parapets
      // 4. Unknown (Rose #ef4444): Hidden interior, deep rear shadows
      concreteMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, metalness: 0.1 });
      pilasterMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.2 });
      entablatureMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      glassMat = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });
      brokenGlassMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 });
      doorGlassMat = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });
      frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      slabMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
      interiorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 });
      rebarMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      cfrpMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
      canopyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
      doorHandleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 });
      redCurbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      sconceMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
      tunnelInteriorMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    } else if (viewingMode === 'infrastructure') {
      // INFRASTRUCTURE MODE: Translucent architectural envelope with glowing RC structural skeleton
      concreteMat = new THREE.MeshPhysicalMaterial({
        color: 0x0369a1,
        transparent: true,
        opacity: 0.35,
        roughness: 0.2,
        transmission: 0.7,
      });
      pilasterMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        wireframe: false,
        roughness: 0.3,
      });
      entablatureMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.45,
      });
      glassMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.25,
        wireframe: true,
      });
      brokenGlassMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.8,
      });
      doorGlassMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.3,
      });
      frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      slabMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.55,
      });
      interiorMat = new THREE.MeshStandardMaterial({
        color: 0x082f49,
        transparent: true,
        opacity: 0.2,
      });
      rebarMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        roughness: 0.3,
      });
      cfrpMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
      });
      canopyMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, transparent: true, opacity: 0.5 });
      doorHandleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x0c4a6e, transparent: true, opacity: 0.4 });
      redCurbMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      asphaltMat = new THREE.MeshStandardMaterial({ color: 0x032b43, transparent: true, opacity: 0.4 });
      sconceMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      tunnelInteriorMat = new THREE.MeshStandardMaterial({ color: 0x041f31, transparent: true, opacity: 0.4 });
    } else if (renderMode === 'stress') {
      concreteMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      pilasterMat = new THREE.MeshStandardMaterial({ color: isDamagedActive ? 0xef4444 : 0x059669, roughness: 0.35 });
      entablatureMat = new THREE.MeshStandardMaterial({ color: 0x0369a1 });
      glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
      brokenGlassMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 });
      doorGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
      frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      slabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      interiorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      rebarMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      cfrpMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
      canopyMat = new THREE.MeshStandardMaterial({ color: 0x0369a1 });
      doorHandleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      redCurbMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      sconceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      tunnelInteriorMat = new THREE.MeshStandardMaterial({ color: 0x082f49 });
    } else {
      // Architectural Sandstone & Crisp Glazed Windows matching Spatial Survey & Drone Video
      concreteMat = new THREE.MeshStandardMaterial({
        color: 0xdfd7cb, // Sandstone limestone facade
        roughness: 0.82,
        metalness: 0.05,
      });
      pilasterMat = new THREE.MeshStandardMaterial({
        color: 0xeae2d7, // Fluted classical pilaster columns
        roughness: 0.75,
        metalness: 0.05,
      });
      entablatureMat = new THREE.MeshStandardMaterial({
        color: 0xcfbeaa, // Molded horizontal cornices and window sill ledges
        roughness: 0.8,
        metalness: 0.08,
      });
      glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e40af, // Deep reflective architectural sapphire/azure solar glazing
        roughness: 0.05,
        metalness: 0.2,
        transmission: 0.65,
        transparent: true,
        opacity: 0.88,
        reflectivity: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
      brokenGlassMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c, // Fractured damaged glass with red stress dispersion
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.9,
      });
      doorGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f3460, // Clear commercial storefront glazing with subtle reflection
        roughness: 0.04,
        transmission: 0.82,
        transparent: true,
        opacity: 0.75,
        reflectivity: 0.9,
        clearcoat: 1.0,
      });
      frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark charcoal anodized aluminum frames & mullions
        roughness: 0.35,
        metalness: 0.8,
      });
      slabMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.9,
      });
      interiorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Dark recessed interior floor volume
        roughness: 0.95,
      });
      rebarMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Exposed rusted reinforcement steel rebar
        roughness: 0.6,
        metalness: 0.6,
      });
      cfrpMat = new THREE.MeshPhysicalMaterial({
        color: 0x059669, // Glossy cured carbon fiber composite CFRP wrap
        roughness: 0.1,
        metalness: 0.3,
        clearcoat: 1.0,
      });
      canopyMat = new THREE.MeshStandardMaterial({
        color: 0x64748b, // Industrial steel awning/canopy marquee shelf
        roughness: 0.35,
        metalness: 0.65,
      });
      doorHandleMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0, // Anodized silver/aluminum commercial door handle
        roughness: 0.15,
        metalness: 0.95,
      });
      sidewalkMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc, // Concrete sidewalk apron paving
        roughness: 0.88,
        metalness: 0.02,
      });
      redCurbMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Bright municipal safety red painted curb (fire lane)
        roughness: 0.45,
        metalness: 0.05,
      });
      asphaltMat = new THREE.MeshStandardMaterial({
        color: 0x27272a, // Dark asphalt roadway / parking lot pavement
        roughness: 0.95,
        metalness: 0.02,
      });
      sconceMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark metal wall sconce casing
        roughness: 0.4,
        metalness: 0.7,
      });
      tunnelInteriorMat = new THREE.MeshStandardMaterial({
        color: 0x111827, // Deep shadow interior tunnel concrete
        roughness: 0.95,
      });
    }

    // DIMENSIONS: 28.0m (L) x 12.0m (W) x 21.5m (H), 7 bays long x 3 bays short @ 4.0m
    const L = GROUND_TRUTH_BUILDING.lengthX; // 28.0m
    const W = GROUND_TRUTH_BUILDING.widthZ;  // 12.0m
    const groundH = GROUND_TRUTH_BUILDING.groundFloorHeight; // 4.5m
    const officeH = GROUND_TRUTH_BUILDING.officeFloorHeight; // 3.5m

    const levelsData = [
      { id: '0', name: 'Ground Floor', yBottom: 0, yTop: groundH, isGround: true },
      { id: '1', name: 'Level 1', yBottom: groundH, yTop: groundH + officeH, isGround: false },
      { id: '2', name: 'Level 2', yBottom: groundH + officeH, yTop: groundH + officeH * 2, isGround: false },
      { id: '3', name: 'Level 3', yBottom: groundH + officeH * 2, yTop: groundH + officeH * 3, isGround: false },
      { id: 'roof', name: 'Roof Deck & Penthouse', yBottom: groundH + officeH * 3, yTop: GROUND_TRUTH_BUILDING.heightY, isRoof: true },
    ];

    levelsData.forEach((lvl) => {
      if (selectedLevel !== 'all' && selectedLevel !== lvl.id) return;

      const levelGroup = new THREE.Group();
      levelGroup.name = `Level_${lvl.id}`;

      // Floor Slab
      const slabThick = 0.35;
      const slabGeo = new THREE.BoxGeometry(L + 0.3, slabThick, W + 0.3);
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, lvl.yBottom + slabThick / 2, 0);
      slabMesh.receiveShadow = true;
      levelGroup.add(slabMesh);

      // Interior Core Box (gives realistic depth behind windows)
      if (!lvl.isRoof) {
        const floorClearHeight = lvl.yTop - lvl.yBottom - slabThick;
        const interiorGeo = new THREE.BoxGeometry(L - 1.2, floorClearHeight - 0.1, W - 1.2);
        const interiorMesh = new THREE.Mesh(interiorGeo, interiorMat);
        interiorMesh.position.set(0, lvl.yBottom + slabThick + floorClearHeight / 2, 0);
        levelGroup.add(interiorMesh);
      }

      const bayHeight = lvl.yTop - lvl.yBottom - slabThick;

      if (!lvl.isRoof) {
        // Continuous Horizontal Cornice / Entablature Frieze above every level
        const friezeGeo = new THREE.BoxGeometry(L + 0.5, 0.45, W + 0.5);
        const friezeMesh = new THREE.Mesh(friezeGeo, entablatureMat);
        friezeMesh.position.set(0, lvl.yTop - 0.22, 0);
        friezeMesh.castShadow = true;
        levelGroup.add(friezeMesh);

        // Ground Floor Sidewalk Apron, Red Painted Curb, and Roadway (Exact to Drone Screenshot)
        if (lvl.isGround) {
          // 1. Concrete Sidewalk Apron
          const sidewalkW = L + 3.0; // 31.0m
          const sidewalkD = 3.6;     // 3.6m wide walkway
          const sidewalkH = 0.22;
          const sidewalkGeo = new THREE.BoxGeometry(sidewalkW, sidewalkH, sidewalkD);
          const sidewalkMesh = new THREE.Mesh(sidewalkGeo, sidewalkMat);
          sidewalkMesh.position.set(0, lvl.yBottom + sidewalkH / 2, W / 2 + sidewalkD / 2);
          sidewalkMesh.receiveShadow = true;
          levelGroup.add(sidewalkMesh);

          // Sidewalk expansion score grooves
          for (let sx = -L / 2 - 1.0; sx <= L / 2 + 1.0; sx += 4.0) {
            const grooveGeo = new THREE.BoxGeometry(0.04, 0.02, sidewalkD);
            const grooveMesh = new THREE.Mesh(grooveGeo, frameMat);
            grooveMesh.position.set(sx, lvl.yBottom + sidewalkH + 0.01, W / 2 + sidewalkD / 2);
            levelGroup.add(grooveMesh);
          }

          // 2. Red Painted Curb Strip (Fire Lane along sidewalk edge in front of Bays 2-3)
          const redCurbL = 9.2;
          const redCurbGeo = new THREE.BoxGeometry(redCurbL, sidewalkH + 0.04, 0.22);
          const redCurbMesh = new THREE.Mesh(redCurbGeo, redCurbMat);
          redCurbMesh.position.set(-2.8, lvl.yBottom + sidewalkH / 2, W / 2 + sidewalkD + 0.05);
          levelGroup.add(redCurbMesh);

          // 3. Asphalt Roadway / Parking Apron
          const roadW = L + 20.0;
          const roadD = 16.0;
          const roadH = 0.08;
          const roadGeo = new THREE.BoxGeometry(roadW, roadH, roadD);
          const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
          roadMesh.position.set(0, lvl.yBottom + roadH / 2, W / 2 + sidewalkD + roadD / 2);
          roadMesh.receiveShadow = true;
          levelGroup.add(roadMesh);
        }

        // =========================================================================
        // 1. FRONT (Z = +W/2) & REAR (Z = -W/2) ELEVATIONS (7 BAYS @ 4.0m GRID)
        // =========================================================================
        for (let b = 0; b < 7; b++) {
          const bayCenterX = -L / 2 + 2.0 + b * 4.0;

          // Specific damage check for Bays
          const isFacadeCrackBay = isDamagedActive && (lvl.id === '0' || lvl.id === '1') && (b === 2 || b === 3) && damageType === 'facade_crack';
          const isDisasterBay = isDamagedActive && (lvl.id === '0' || lvl.id === '1' || lvl.id === '2') && (b === 1 || b === 2 || b === 3) && (damageType === 'disaster_earthquake' || isDisasterActive);
          const isDamagedFrontBay = isFacadeCrackBay || isDisasterBay;
          const isAffectedZone = (lvl.id === '0' || lvl.id === '1' || lvl.id === '2') && (b === 1 || b === 2 || b === 3);

          // Helper to generate a single modular bay facade (Front or Rear)
          const createBayFacade = (zPos: number, isFront: boolean) => {
            const zDir = isFront ? 1 : -1;
            const baySubGroup = new THREE.Group();

            // Select contextual surface material: only recovered areas receive highlight
            const bayConcreteMat = (isHighlightActive && isFront && isAffectedZone)
              ? highlightSurfaceMat
              : concreteMat;

            // Add 3D Bounding Contour Wireframe directly on Reconstructed 3D Geometry
            if (isHighlightActive && isFront && isAffectedZone) {
              const bayBBoxGeo = new THREE.BoxGeometry(3.8, bayHeight - 0.08, 0.45);
              const bayBBoxEdges = new THREE.EdgesGeometry(bayBBoxGeo);
              const bayBBoxLineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
              const bayBBoxMesh = new THREE.LineSegments(bayBBoxEdges, bayBBoxLineMat);
              bayBBoxMesh.position.set(bayCenterX, lvl.yBottom + slabThick + bayHeight / 2, zPos + zDir * 0.18);
              baySubGroup.add(bayBBoxMesh);
            }

            if (lvl.isGround && isFront) {
              // ===================================================================
              // GROUND FLOOR FRONT ELEVATION (EXACT MATCH TO DRONE SCREENSHOT)
              // ===================================================================
              
              // 1. Cantilevered Steel Awning / Marquee Shelf over each storefront
              const canopyGeo = new THREE.BoxGeometry(3.55, 0.16, 0.75);
              const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
              canopyMesh.position.set(bayCenterX, lvl.yTop - 0.38, zPos + 0.38);
              canopyMesh.castShadow = true;
              baySubGroup.add(canopyMesh);

              // Awning bracket supports underneath
              [-1.5, 1.5].forEach((bOffset) => {
                const bracketGeo = new THREE.BoxGeometry(0.06, 0.25, 0.55);
                const bracketMesh = new THREE.Mesh(bracketGeo, frameMat);
                bracketMesh.position.set(bayCenterX + bOffset, lvl.yTop - 0.52, zPos + 0.28);
                baySubGroup.add(bracketMesh);
              });

              if (b === 6) {
                // --- BAY 6: OPEN VEHICULAR DRIVE-THROUGH TUNNEL / BREEZEWAY ---
                // Heavy concrete lintel header supporting upper floors
                const lintelH = 0.85;
                const lintelGeo = new THREE.BoxGeometry(3.6, lintelH, 0.45);
                const lintelMesh = new THREE.Mesh(lintelGeo, concreteMat);
                lintelMesh.position.set(bayCenterX, lvl.yTop - lintelH / 2, zPos);
                lintelMesh.castShadow = true;
                baySubGroup.add(lintelMesh);

                // Tunnel Left Wall
                const tWallGeo = new THREE.BoxGeometry(0.35, bayHeight, W);
                const tWallL = new THREE.Mesh(tWallGeo, concreteMat);
                tWallL.position.set(bayCenterX - 1.75, lvl.yBottom + slabThick + bayHeight / 2, 0);
                tWallL.castShadow = true;
                baySubGroup.add(tWallL);

                // Tunnel Right Wall
                const tWallR = new THREE.Mesh(tWallGeo, concreteMat);
                tWallR.position.set(bayCenterX + 1.75, lvl.yBottom + slabThick + bayHeight / 2, 0);
                tWallR.castShadow = true;
                baySubGroup.add(tWallR);

                // Tunnel Ceiling
                const tCeilGeo = new THREE.BoxGeometry(3.5, 0.25, W);
                const tCeil = new THREE.Mesh(tCeilGeo, tunnelInteriorMat);
                tCeil.position.set(bayCenterX, lvl.yTop - 0.45, 0);
                baySubGroup.add(tCeil);

                // Roadway Drive-Through Floor Passing Through
                const tFloorGeo = new THREE.BoxGeometry(3.5, 0.12, W + 4.0);
                const tFloor = new THREE.Mesh(tFloorGeo, asphaltMat);
                tFloor.position.set(bayCenterX, lvl.yBottom + slabThick + 0.06, 0);
                tFloor.receiveShadow = true;
                baySubGroup.add(tFloor);

              } else if (b === 3 || b === 4) {
                // --- BAYS 3 & 4: COMMERCIAL DOUBLE GLASS DOOR ENTRANCES ---
                const doorBayW = 3.35;
                const doorHeaderH = 0.45;
                const baseSillH = 0.12;
                const totalOpenH = bayHeight - doorHeaderH - baseSillH;

                // Base sill kickplate
                const sillGeo = new THREE.BoxGeometry(doorBayW, baseSillH, 0.22);
                const sillMesh = new THREE.Mesh(sillGeo, concreteMat);
                sillMesh.position.set(bayCenterX, lvl.yBottom + slabThick + baseSillH / 2, zPos);
                baySubGroup.add(sillMesh);

                // Header wall lintel
                const headerGeo = new THREE.BoxGeometry(doorBayW, doorHeaderH, 0.22);
                const headerMesh = new THREE.Mesh(headerGeo, concreteMat);
                headerMesh.position.set(bayCenterX, lvl.yTop - doorHeaderH / 2, zPos);
                baySubGroup.add(headerMesh);

                // Outer perimeter frame
                const pFrameGeo = new THREE.BoxGeometry(doorBayW, totalOpenH, 0.12);
                const pFrame = new THREE.Mesh(pFrameGeo, frameMat);
                pFrame.position.set(bayCenterX, lvl.yBottom + slabThick + baseSillH + totalOpenH / 2, zPos);
                baySubGroup.add(pFrame);

                // Transom Bar & Transom Glass (Upper 0.75m)
                const transomH = 0.75;
                const transomY = lvl.yBottom + slabThick + baseSillH + totalOpenH - transomH / 2;
                
                // Transom Glass (4 panes)
                const transomGlassGeo = new THREE.BoxGeometry(doorBayW - 0.1, transomH - 0.08, 0.05);
                const transomGlass = new THREE.Mesh(transomGlassGeo, doorGlassMat);
                transomGlass.position.set(bayCenterX, transomY, zPos + 0.02);
                baySubGroup.add(transomGlass);

                // Transom vertical dividers
                [-0.85, 0, 0.85].forEach((tx) => {
                  const tMullGeo = new THREE.BoxGeometry(0.04, transomH - 0.08, 0.08);
                  const tMull = new THREE.Mesh(tMullGeo, frameMat);
                  tMull.position.set(bayCenterX + tx, transomY, zPos + 0.03);
                  baySubGroup.add(tMull);
                });

                // Horizontal Transom Lintel Bar
                const tBarGeo = new THREE.BoxGeometry(doorBayW - 0.08, 0.06, 0.1);
                const tBar = new THREE.Mesh(tBarGeo, frameMat);
                tBar.position.set(bayCenterX, lvl.yBottom + slabThick + baseSillH + totalOpenH - transomH, zPos + 0.02);
                baySubGroup.add(tBar);

                // Lower section: Central Double Door + Side-Light Panels
                const lowerH = totalOpenH - transomH;
                const lowerCenterY = lvl.yBottom + slabThick + baseSillH + lowerH / 2;

                // Central Double Glass Doors (Offset -0.5m & +0.5m, each door 0.95m wide)
                const singleDoorW = 0.95;
                const singleDoorH = lowerH - 0.06;

                [-0.49, 0.49].forEach((dOff) => {
                  // Door Frame
                  const dFrameGeo = new THREE.BoxGeometry(singleDoorW, singleDoorH, 0.08);
                  const dFrame = new THREE.Mesh(dFrameGeo, frameMat);
                  dFrame.position.set(bayCenterX + dOff, lowerCenterY, zPos + 0.02);
                  baySubGroup.add(dFrame);

                  // Door Glass
                  const dGlassGeo = new THREE.BoxGeometry(singleDoorW - 0.12, singleDoorH - 0.12, 0.04);
                  const dGlass = new THREE.Mesh(dGlassGeo, doorGlassMat);
                  dGlass.position.set(bayCenterX + dOff, lowerCenterY, zPos + 0.03);
                  baySubGroup.add(dGlass);

                  // Silver Vertical Pull-Handle Hardware
                  const handleGeo = new THREE.BoxGeometry(0.03, 0.55, 0.07);
                  const handleMesh = new THREE.Mesh(handleGeo, doorHandleMat);
                  const hOffset = dOff < 0 ? 0.38 : -0.38;
                  handleMesh.position.set(bayCenterX + dOff + hOffset, lowerCenterY, zPos + 0.08);
                  baySubGroup.add(handleMesh);
                });

                // Left and Right Fixed Storefront Side-Lights
                const sideLightW = 0.65;
                [-1.32, 1.32].forEach((sOff) => {
                  const sGlassGeo = new THREE.BoxGeometry(sideLightW - 0.08, lowerH - 0.08, 0.04);
                  const sGlass = new THREE.Mesh(sGlassGeo, doorGlassMat);
                  sGlass.position.set(bayCenterX + sOff, lowerCenterY, zPos + 0.02);
                  baySubGroup.add(sGlass);
                });

              } else {
                // --- BAYS 0, 1, 2, 5: FULL-HEIGHT 3-PANE COMMERCIAL STOREFRONT SHOWROOMS ---
                const sfBayW = 3.35;
                const sfHeaderH = 0.45;
                const sfBaseSillH = 0.12;
                const sfOpenH = bayHeight - sfHeaderH - sfBaseSillH;

                // Base sill kickplate
                const sillGeo = new THREE.BoxGeometry(sfBayW, sfBaseSillH, 0.22);
                const sillMesh = new THREE.Mesh(sillGeo, concreteMat);
                sillMesh.position.set(bayCenterX, lvl.yBottom + slabThick + sfBaseSillH / 2, zPos);
                baySubGroup.add(sillMesh);

                // Header wall lintel
                const headerGeo = new THREE.BoxGeometry(sfBayW, sfHeaderH, 0.22);
                const headerMesh = new THREE.Mesh(headerGeo, concreteMat);
                headerMesh.position.set(bayCenterX, lvl.yTop - sfHeaderH / 2, zPos);
                baySubGroup.add(headerMesh);

                // Outer perimeter frame
                const sfFrameGeo = new THREE.BoxGeometry(sfBayW, sfOpenH, 0.12);
                const sfFrame = new THREE.Mesh(sfFrameGeo, frameMat);
                sfFrame.position.set(bayCenterX, lvl.yBottom + slabThick + sfBaseSillH + sfOpenH / 2, zPos);
                baySubGroup.add(sfFrame);

                // Upper Transom Bar & 3 Transom Lights
                const transomH = 0.75;
                const transomY = lvl.yBottom + slabThick + sfBaseSillH + sfOpenH - transomH / 2;
                const lowerH = sfOpenH - transomH;
                const lowerY = lvl.yBottom + slabThick + sfBaseSillH + lowerH / 2;

                // Transom horizontal dividing mullion
                const tBarGeo = new THREE.BoxGeometry(sfBayW - 0.08, 0.06, 0.1);
                const tBar = new THREE.Mesh(tBarGeo, frameMat);
                tBar.position.set(bayCenterX, lvl.yBottom + slabThick + sfBaseSillH + lowerH, zPos + 0.02);
                baySubGroup.add(tBar);

                // 3 Vertical Glass Bays (Left, Center, Right)
                const paneW = (sfBayW - 0.2) / 3;
                [-paneW, 0, paneW].forEach((pOff, pIdx) => {
                  const isThisPaneDamaged = isDamagedFrontBay && b === 2 && pIdx === 1;
                  const curGlassMat = isThisPaneDamaged ? brokenGlassMat : doorGlassMat;

                  // Lower Showroom Glass Pane
                  const lowerGlassGeo = new THREE.BoxGeometry(paneW - 0.08, lowerH - 0.08, 0.04);
                  const lowerGlass = new THREE.Mesh(lowerGlassGeo, curGlassMat);
                  lowerGlass.position.set(bayCenterX + pOff, lowerY, zPos + 0.02);
                  baySubGroup.add(lowerGlass);

                  // Upper Transom Glass Pane
                  const upperGlassGeo = new THREE.BoxGeometry(paneW - 0.08, transomH - 0.08, 0.04);
                  const upperGlass = new THREE.Mesh(upperGlassGeo, curGlassMat);
                  upperGlass.position.set(bayCenterX + pOff, transomY, zPos + 0.02);
                  baySubGroup.add(upperGlass);

                  // Vertical aluminum mullions
                  if (pIdx < 2) {
                    const vMullGeo = new THREE.BoxGeometry(0.04, sfOpenH - 0.08, 0.08);
                    const vMull = new THREE.Mesh(vMullGeo, frameMat);
                    vMull.position.set(bayCenterX + pOff + paneW / 2, lvl.yBottom + slabThick + sfBaseSillH + sfOpenH / 2, zPos + 0.03);
                    baySubGroup.add(vMull);
                  }
                });
              }

            } else {
              // ===================================================================
              // UPPER FLOORS (OR REAR ELEVATION): 2-WINDOW ARCHITECTURAL BAYS
              // ===================================================================
              const winW = 1.30;
              const winH = lvl.isGround ? 2.8 : 2.0;
              const sillH = lvl.isGround ? 0.45 : 0.85;
              const headerH = bayHeight - sillH - winH;
              const pierW = 0.22;
              const centerPierW = 0.36;

              // 1. Spandrel Wall (Sill Base Panel below windows)
              if (isDamagedFrontBay && isFront) {
                // Damaged spandrel with spall cavity cutout & exposed rebar
                const spandrelHalfGeo = new THREE.BoxGeometry(1.6, sillH, 0.22);
                const spandrelR = new THREE.Mesh(spandrelHalfGeo, bayConcreteMat);
                spandrelR.position.set(bayCenterX + 0.8, lvl.yBottom + slabThick + sillH / 2, zPos);
                baySubGroup.add(spandrelR);

                // Spalled concrete hole with exposed rebar
                const cavityGeo = new THREE.BoxGeometry(1.5, sillH * 0.75, 0.18);
                const cavityMesh = new THREE.Mesh(cavityGeo, rebarMat);
                cavityMesh.position.set(bayCenterX - 0.8, lvl.yBottom + slabThick + sillH / 2, zPos);
                baySubGroup.add(cavityMesh);
              } else {
                const spandrelGeo = new THREE.BoxGeometry(3.25, sillH, 0.22);
                const spandrelMesh = new THREE.Mesh(spandrelGeo, bayConcreteMat);
                spandrelMesh.position.set(bayCenterX, lvl.yBottom + slabThick + sillH / 2, zPos);
                spandrelMesh.castShadow = true;
                baySubGroup.add(spandrelMesh);
              }

              // 2. Header Wall (Lintel Panel above windows)
              const headerGeo = new THREE.BoxGeometry(3.25, headerH, 0.22);
              const headerMesh = new THREE.Mesh(headerGeo, bayConcreteMat);
              headerMesh.position.set(bayCenterX, lvl.yTop - headerH / 2, zPos);
              headerMesh.castShadow = true;
              baySubGroup.add(headerMesh);

              // 3. Left & Right Jamb Piers
              const jambGeo = new THREE.BoxGeometry(pierW, winH, 0.22);
              const jambL = new THREE.Mesh(jambGeo, bayConcreteMat);
              jambL.position.set(bayCenterX - 1.625 + pierW / 2, lvl.yBottom + slabThick + sillH + winH / 2, zPos);
              baySubGroup.add(jambL);

              const jambR = new THREE.Mesh(jambGeo, bayConcreteMat);
              jambR.position.set(bayCenterX + 1.625 - pierW / 2, lvl.yBottom + slabThick + sillH + winH / 2, zPos);
              baySubGroup.add(jambR);

              // 4. Center Mullion Pier between the 2 windows
              const centerPierGeo = new THREE.BoxGeometry(centerPierW, winH, 0.22);
              const centerPier = new THREE.Mesh(centerPierGeo, bayConcreteMat);
              centerPier.position.set(bayCenterX, lvl.yBottom + slabThick + sillH + winH / 2, zPos);
              baySubGroup.add(centerPier);

              // 5. Dual Window Units (Left & Right @ offsets -0.78m and +0.78m)
              const winOffsets = [-0.78, 0.78];
              const winCenterY = lvl.yBottom + slabThick + sillH + winH / 2;

              winOffsets.forEach((wOffset) => {
                const isThisWindowBroken = isDamagedFrontBay && isFront && (b === 2 || (isDisasterBay && b === 1));

                // Decorative Protruding Window Sill Ledge
                const sillLedgeGeo = new THREE.BoxGeometry(winW + 0.12, 0.12, 0.35);
                const sillLedge = new THREE.Mesh(sillLedgeGeo, entablatureMat);
                sillLedge.position.set(bayCenterX + wOffset, lvl.yBottom + slabThick + sillH - 0.06, zPos + zDir * 0.06);
                sillLedge.castShadow = true;
                baySubGroup.add(sillLedge);

                // Dark Outer Window Frame
                const frameGeo = new THREE.BoxGeometry(winW, winH, 0.14);
                const frameMesh = new THREE.Mesh(frameGeo, frameMat);
                frameMesh.position.set(bayCenterX + wOffset, winCenterY, zPos);
                baySubGroup.add(frameMesh);

                // Azure Glass Pane (or Broken Glass if damaged)
                const currentGlassMat = isThisWindowBroken ? brokenGlassMat : glassMat;
                const glassGeo = new THREE.BoxGeometry(winW - 0.1, winH - 0.1, 0.05);
                const glassMesh = new THREE.Mesh(glassGeo, currentGlassMat);
                glassMesh.position.set(bayCenterX + wOffset, winCenterY, zPos + zDir * 0.02);
                baySubGroup.add(glassMesh);

                // Window Muntin Grid (Cross Dividers creating 4 panes)
                const hMuntinGeo = new THREE.BoxGeometry(winW - 0.1, 0.035, 0.07);
                const hMuntin = new THREE.Mesh(hMuntinGeo, frameMat);
                hMuntin.position.set(bayCenterX + wOffset, winCenterY, zPos + zDir * 0.03);
                baySubGroup.add(hMuntin);

                const vMuntinGeo = new THREE.BoxGeometry(0.035, winH - 0.1, 0.07);
                const vMuntin = new THREE.Mesh(vMuntinGeo, frameMat);
                vMuntin.position.set(bayCenterX + wOffset, winCenterY, zPos + zDir * 0.03);
                baySubGroup.add(vMuntin);
              });
            }

            return baySubGroup;
          };

          // Add Front & Rear Bays to Level
          levelGroup.add(createBayFacade(W / 2, true));
          levelGroup.add(createBayFacade(-W / 2, false));
        }

        // Rubble blocks on the Ground Floor apron during Disaster Earthquake
        if (lvl.isGround && isDamagedActive && (damageType === 'disaster_earthquake' || isDisasterActive)) {
          const rubbleCoords = [
            [-5.5, 0.25, W / 2 + 0.8],
            [-3.8, 0.35, W / 2 + 1.2],
            [-2.2, 0.2, W / 2 + 0.9],
            [-6.8, 0.3, W / 2 + 1.5],
            [-0.5, 0.25, W / 2 + 0.7],
          ];
          const curRubbleMat = isHighlightActive ? highlightSurfaceMat : concreteMat;
          rubbleCoords.forEach(([rx, ry, rz], rIdx) => {
            const rubbleGeo = new THREE.DodecahedronGeometry(0.35 + (rIdx % 3) * 0.15);
            const rubbleMesh = new THREE.Mesh(rubbleGeo, curRubbleMat);
            rubbleMesh.position.set(rx, ry, rz);
            rubbleMesh.rotation.set(rIdx * 0.5, rIdx * 0.8, rIdx);
            rubbleMesh.castShadow = true;
            levelGroup.add(rubbleMesh);
          });
        }

        // =========================================================================
        // 2. FLUTED CLASSICAL PILASTERS (Columns P1 to P8 on Grid Lines)
        // =========================================================================
        for (let p = 0; p <= 7; p++) {
          const colX = -L / 2 + p * 4.0;
          const isCornerDamaged = isDamagedActive && p === 0 && damageType === 'column_shear' && lvl.id === '1';
          const isAffectedPilaster = (lvl.id === '0' || lvl.id === '1' || lvl.id === '2') && p >= 1 && p <= 4;

          // Column Shaft
          const colW = 0.75;
          const colD = 0.65;
          const colGeo = new THREE.BoxGeometry(colW, bayHeight, colD);
          const activePilasterMat = isCornerDamaged 
            ? rebarMat 
            : (isHighlightActive && isAffectedPilaster)
              ? highlightPilasterMat
              : pilasterMat;
          
          // Front Pilaster
          const colFront = new THREE.Mesh(colGeo, activePilasterMat);
          colFront.position.set(colX, lvl.yBottom + slabThick + bayHeight / 2, W / 2 + 0.18);
          colFront.castShadow = true;
          colFront.receiveShadow = true;
          levelGroup.add(colFront);

          // Capital Moulding
          const capGeo = new THREE.BoxGeometry(colW + 0.18, 0.35, colD + 0.15);
          const capFront = new THREE.Mesh(capGeo, entablatureMat);
          capFront.position.set(colX, lvl.yTop - 0.42, W / 2 + 0.2);
          levelGroup.add(capFront);

          // Base Plinth Moulding
          const baseGeo = new THREE.BoxGeometry(colW + 0.18, 0.35, colD + 0.15);
          const baseFront = new THREE.Mesh(baseGeo, entablatureMat);
          baseFront.position.set(colX, lvl.yBottom + slabThick + 0.18, W / 2 + 0.2);
          levelGroup.add(baseFront);

          // Wall Sconce Lamps on Front Pilasters (Ground Floor under canopy)
          if (lvl.isGround) {
            const sconceGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8);
            const sconceMesh = new THREE.Mesh(sconceGeo, sconceMat);
            sconceMesh.position.set(colX, lvl.yTop - 0.75, W / 2 + 0.52);
            levelGroup.add(sconceMesh);
          }

          // Rear Pilasters (Tagged as Unknown/Occluded during Epistemic Highlight)
          const rearPilasterMat = isHighlightActive ? unknownOccludedMat : pilasterMat;
          const colRear = new THREE.Mesh(colGeo, rearPilasterMat);
          colRear.position.set(colX, lvl.yBottom + slabThick + bayHeight / 2, -W / 2 - 0.18);
          colRear.castShadow = true;
          levelGroup.add(colRear);
        }

        // =========================================================================
        // 3. LEFT & RIGHT SHORT ELEVATIONS (12.0m WIDTH, 3 BAYS @ 4.0m)
        // =========================================================================
        for (let s = 0; s < 3; s++) {
          const bayCenterZ = -W / 2 + 2.0 + s * 4.0;
          const sideWinW = 1.30;
          const sideWinH = lvl.isGround ? 2.6 : 1.9;
          const sideSillH = lvl.isGround ? 0.5 : 0.9;
          const sideHeaderH = bayHeight - sideSillH - sideWinH;
          const sideCenterY = lvl.yBottom + slabThick + sideSillH + sideWinH / 2;

          const createSideBay = (xPos: number, isLeft: boolean) => {
            const xDir = isLeft ? -1 : 1;
            const sideBayGroup = new THREE.Group();

            // Check if this is the ground floor drive-through tunnel on the right side
            const isRightGroundTunnel = !isLeft && lvl.isGround && s === 2;

            if (isRightGroundTunnel) {
              // Open vehicular tunnel portal on right side
              const tHeaderH = 0.85;
              const tHeaderGeo = new THREE.BoxGeometry(0.35, tHeaderH, 3.6);
              const tHeader = new THREE.Mesh(tHeaderGeo, concreteMat);
              tHeader.position.set(xPos, lvl.yTop - tHeaderH / 2, bayCenterZ);
              tHeader.castShadow = true;
              sideBayGroup.add(tHeader);

              return sideBayGroup;
            }

            // Spandrel Wall below windows
            const spandrelGeo = new THREE.BoxGeometry(0.22, sideSillH, 3.25);
            const spandrel = new THREE.Mesh(spandrelGeo, concreteMat);
            spandrel.position.set(xPos, lvl.yBottom + slabThick + sideSillH / 2, bayCenterZ);
            sideBayGroup.add(spandrel);

            // Header Wall above windows
            const headerGeo = new THREE.BoxGeometry(0.22, sideHeaderH, 3.25);
            const header = new THREE.Mesh(headerGeo, concreteMat);
            header.position.set(xPos, lvl.yTop - sideHeaderH / 2, bayCenterZ);
            sideBayGroup.add(header);

            // Left & Right Piers on Side Bay
            const pierGeo = new THREE.BoxGeometry(0.22, sideWinH, 0.22);
            const pier1 = new THREE.Mesh(pierGeo, concreteMat);
            pier1.position.set(xPos, sideCenterY, bayCenterZ - 1.625 + 0.11);
            sideBayGroup.add(pier1);

            const pier2 = new THREE.Mesh(pierGeo, concreteMat);
            pier2.position.set(xPos, sideCenterY, bayCenterZ + 1.625 - 0.11);
            sideBayGroup.add(pier2);

            // Center Mullion Pier
            const centerPierGeo = new THREE.BoxGeometry(0.22, sideWinH, 0.36);
            const centerPier = new THREE.Mesh(centerPierGeo, concreteMat);
            centerPier.position.set(xPos, sideCenterY, bayCenterZ);
            sideBayGroup.add(centerPier);

            // Dual Window Openings
            [-0.78, 0.78].forEach((zOff) => {
              // Side Sill Ledge
              const sillGeo = new THREE.BoxGeometry(0.35, 0.12, sideWinW + 0.12);
              const sill = new THREE.Mesh(sillGeo, entablatureMat);
              sill.position.set(xPos + xDir * 0.06, lvl.yBottom + slabThick + sideSillH - 0.06, bayCenterZ + zOff);
              sideBayGroup.add(sill);

              // Side Window Frame
              const frameGeo = new THREE.BoxGeometry(0.14, sideWinH, sideWinW);
              const frame = new THREE.Mesh(frameGeo, frameMat);
              frame.position.set(xPos, sideCenterY, bayCenterZ + zOff);
              sideBayGroup.add(frame);

              // Side Azure Glass Pane
              const glassGeo = new THREE.BoxGeometry(0.05, sideWinH - 0.1, sideWinW - 0.1);
              const glass = new THREE.Mesh(glassGeo, glassMat);
              glass.position.set(xPos + xDir * 0.02, sideCenterY, bayCenterZ + zOff);
              sideBayGroup.add(glass);

              // Side Window Muntin Divider
              const vMuntinGeo = new THREE.BoxGeometry(0.07, 0.035, sideWinW - 0.1);
              const vMuntin = new THREE.Mesh(vMuntinGeo, frameMat);
              vMuntin.position.set(xPos + xDir * 0.03, sideCenterY, bayCenterZ + zOff);
              sideBayGroup.add(vMuntin);
            });

            return sideBayGroup;
          };

          levelGroup.add(createSideBay(-L / 2, true));
          levelGroup.add(createSideBay(L / 2, false));
        }

        // Side Pilasters on Left & Right Grid Lines
        for (let sp = 0; sp <= 3; sp++) {
          const colZ = -W / 2 + sp * 4.0;
          const sideColGeo = new THREE.BoxGeometry(0.65, bayHeight, 0.75);

          const leftCol = new THREE.Mesh(sideColGeo, pilasterMat);
          leftCol.position.set(-L / 2 - 0.18, lvl.yBottom + slabThick + bayHeight / 2, colZ);
          levelGroup.add(leftCol);

          const rightCol = new THREE.Mesh(sideColGeo, pilasterMat);
          rightCol.position.set(L / 2 + 0.18, lvl.yBottom + slabThick + bayHeight / 2, colZ);
          levelGroup.add(rightCol);
        }
      } else {
        // =========================================================================
        // 4. ROOF DECK, PARAPET CORNICE & PENTHOUSE TOWER
        // =========================================================================
        const parapetH = GROUND_TRUTH_BUILDING.parapetHeight; // 0.60m
        const parFrontGeo = new THREE.BoxGeometry(L + 0.6, parapetH, 0.35);
        const parFront = new THREE.Mesh(parFrontGeo, entablatureMat);
        parFront.position.set(0, lvl.yBottom + parapetH / 2, W / 2);
        levelGroup.add(parFront);

        const parRear = new THREE.Mesh(parFrontGeo, entablatureMat);
        parRear.position.set(0, lvl.yBottom + parapetH / 2, -W / 2);
        levelGroup.add(parRear);

        const parSideGeo = new THREE.BoxGeometry(0.35, parapetH, W + 0.6);
        const parLeft = new THREE.Mesh(parSideGeo, entablatureMat);
        parLeft.position.set(-L / 2, lvl.yBottom + parapetH / 2, 0);
        levelGroup.add(parLeft);

        const parRight = new THREE.Mesh(parSideGeo, entablatureMat);
        parRight.position.set(L / 2, lvl.yBottom + parapetH / 2, 0);
        levelGroup.add(parRight);

        // Penthouse Tower on Top Rear-Right Corner (Bay 6-7: 5.6m x 4.2m x 3.6m H)
        const pentW = 5.2;
        const pentD = 4.2;
        const pentH = 3.6;
        const pentX = L / 2 - pentW / 2 - 0.4;
        const pentZ = -W / 2 + pentD / 2 + 0.4;
        const pentY = lvl.yBottom + pentH / 2;

        // Penthouse Wall
        const pentGeo = new THREE.BoxGeometry(pentW, pentH, pentD);
        const isPentDamaged = isDamagedActive && damageType === 'roof_degradation';
        const pentMesh = new THREE.Mesh(pentGeo, isPentDamaged ? rebarMat : concreteMat);
        pentMesh.position.set(pentX, pentY, pentZ);
        pentMesh.castShadow = true;
        levelGroup.add(pentMesh);

        // Penthouse Roof Slab with overhanging cornice
        const pentRoofGeo = new THREE.BoxGeometry(pentW + 0.6, 0.35, pentD + 0.6);
        const pentRoof = new THREE.Mesh(pentRoofGeo, entablatureMat);
        pentRoof.position.set(pentX, lvl.yBottom + pentH + 0.175, pentZ);
        levelGroup.add(pentRoof);

        // 1. Penthouse Panoramic Glazed Windows (Front facing)
        const pentWinGeo = new THREE.BoxGeometry(3.2, 1.8, 0.12);
        const pentWinFrame = new THREE.Mesh(pentWinGeo, frameMat);
        pentWinFrame.position.set(pentX, pentY + 0.2, pentZ + pentD / 2 + 0.02);
        levelGroup.add(pentWinFrame);

        const pentGlassGeo = new THREE.BoxGeometry(3.0, 1.6, 0.05);
        const pentGlass = new THREE.Mesh(pentGlassGeo, glassMat);
        pentGlass.position.set(pentX, pentY + 0.2, pentZ + pentD / 2 + 0.05);
        levelGroup.add(pentGlass);

        // Front window vertical mullion
        const pMullGeo = new THREE.BoxGeometry(0.04, 1.6, 0.08);
        const pMull = new THREE.Mesh(pMullGeo, frameMat);
        pMull.position.set(pentX, pentY + 0.2, pentZ + pentD / 2 + 0.06);
        levelGroup.add(pMull);

        // 2. Penthouse Side Panoramic Glazed Windows (Right Side facing East)
        const pentSideWinGeo = new THREE.BoxGeometry(0.12, 1.8, 2.6);
        const pentSideWinFrame = new THREE.Mesh(pentSideWinGeo, frameMat);
        pentSideWinFrame.position.set(pentX + pentW / 2 + 0.02, pentY + 0.2, pentZ);
        levelGroup.add(pentSideWinFrame);

        const pentSideGlassGeo = new THREE.BoxGeometry(0.05, 1.6, 2.4);
        const pentSideGlass = new THREE.Mesh(pentSideGlassGeo, glassMat);
        pentSideGlass.position.set(pentX + pentW / 2 + 0.05, pentY + 0.2, pentZ);
        levelGroup.add(pentSideGlass);

        // Side window vertical mullion
        const pSideMullGeo = new THREE.BoxGeometry(0.08, 1.6, 0.04);
        const pSideMull = new THREE.Mesh(pSideMullGeo, frameMat);
        pSideMull.position.set(pentX + pentW / 2 + 0.06, pentY + 0.2, pentZ);
        levelGroup.add(pSideMull);

        // 3. Penthouse Corner Parapet Joint Crack Spall (When damaged)
        if (isPentDamaged) {
          const crackSpallGeo = new THREE.BoxGeometry(1.6, 1.2, 0.8);
          const crackSpall = new THREE.Mesh(crackSpallGeo, rebarMat);
          crackSpall.position.set(pentX + pentW / 2 - 0.2, lvl.yBottom + 0.6, pentZ + pentD / 2 - 0.2);
          levelGroup.add(crackSpall);
        }
      }

      // CFRP Reinforcement Patch (Shown when 100% Reconstructed)
      if (isFullyReconstructed && (lvl.id === '1' || lvl.id === '2')) {
        const cfrpPatchGeo = new THREE.BoxGeometry(6.4, 2.8, 0.08);
        const cfrpPatch = new THREE.Mesh(cfrpPatchGeo, cfrpMat);
        cfrpPatch.position.set(-L / 2 + 10.0, lvl.yBottom + 2.0, W / 2 + 0.18);
        levelGroup.add(cfrpPatch);
      }

      // INFRASTRUCTURE BIM SKELETON: Internal Columns, Girders & Pile Caps
      if (viewingMode === 'infrastructure' && !lvl.isRoof) {
        const infraSkeletonGroup = new THREE.Group();
        const gridZCoords = [-W / 2 + 0.35, -W / 6, W / 6, W / 2 - 0.35]; // 4 rows: Grids A, B, C, D

        for (let colIdx = 0; colIdx <= 7; colIdx++) {
          const colX = -L / 2 + 0.35 + colIdx * 3.9;
          
          gridZCoords.forEach((colZ, zIdx) => {
            // Reinforced Concrete Column Pillar
            const colGeo = new THREE.BoxGeometry(0.55, bayHeight, 0.55);
            const isCompromisedCol = (colIdx === 2 || colIdx === 3) && (lvl.id === '1' || lvl.id === '2');
            const colMaterial = isCompromisedCol ? rebarMat : pilasterMat;
            const colMesh = new THREE.Mesh(colGeo, colMaterial);
            colMesh.position.set(colX, lvl.yBottom + slabThick + bayHeight / 2, colZ);
            infraSkeletonGroup.add(colMesh);

            // Foundation Pile Cap Footings on Ground Level
            if (lvl.isGround) {
              const footingGeo = new THREE.BoxGeometry(1.2, 0.6, 1.2);
              const footingMesh = new THREE.Mesh(footingGeo, entablatureMat);
              footingMesh.position.set(colX, -0.3, colZ);
              infraSkeletonGroup.add(footingMesh);
            }

            // Glowing Stress Tensor Node on Damaged Columns
            if (isCompromisedCol) {
              const nodeGeo = new THREE.SphereGeometry(0.28, 12, 12);
              const nodeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
              const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
              nodeMesh.position.set(colX, lvl.yBottom + slabThick + bayHeight / 2, colZ);
              infraSkeletonGroup.add(nodeMesh);
            }
          });
        }

        // Longitudinal Primary Girders
        gridZCoords.forEach((gZ) => {
          const girderGeo = new THREE.BoxGeometry(L - 0.7, 0.45, 0.35);
          const girderMesh = new THREE.Mesh(girderGeo, entablatureMat);
          girderMesh.position.set(0, lvl.yTop - 0.22, gZ);
          infraSkeletonGroup.add(girderMesh);
        });

        levelGroup.add(infraSkeletonGroup);
      }

      group.add(levelGroup);
    });

    // POINT CLOUD MODE (if selected)
    if (renderMode === 'pointcloud') {
      const pointCount = 75000;
      const pointGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(pointCount * 3);
      const colors = new Float32Array(pointCount * 3);

      for (let i = 0; i < pointCount; i++) {
        const randFace = Math.random();
        let px = 0, py = 0, pz = 0;

        if (randFace < 0.35) {
          px = (Math.random() - 0.5) * L;
          py = Math.random() * (GROUND_TRUTH_BUILDING.heightY - 3);
          pz = W / 2 + (Math.random() - 0.5) * 0.3;
        } else if (randFace < 0.6) {
          px = (Math.random() - 0.5) * L;
          py = Math.random() * (GROUND_TRUTH_BUILDING.heightY - 3);
          pz = -W / 2 + (Math.random() - 0.5) * 0.3;
        } else if (randFace < 0.8) {
          px = (Math.random() < 0.5 ? -L / 2 : L / 2) + (Math.random() - 0.5) * 0.3;
          py = Math.random() * (GROUND_TRUTH_BUILDING.heightY - 3);
          pz = (Math.random() - 0.5) * W;
        } else {
          px = (Math.random() - 0.5) * L;
          py = 15.0 + (Math.random() - 0.5) * 0.2;
          pz = (Math.random() - 0.5) * W;
        }

        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = pz;

        const tH = py / 21.5;
        colors[i * 3] = 0.1 + tH * 0.8;
        colors[i * 3 + 1] = 0.8 - tH * 0.3;
        colors[i * 3 + 2] = 0.9;
      }

      pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const pointMat = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });

      const points = new THREE.Points(pointGeo, pointMat);
      scene.add(points);
      pointCloudRef.current = points;
    }
  }, [renderMode, selectedLevel, is3DGenerated, damageType, viewingMode, comparisonSlider, comparisonMode, isDisasterActive, disasterState, highlightAffectedAreas, compareDisasterSplit]);

  // Handle Damage Markers & Animated Dynamic 3D Cracks
  useEffect(() => {
    const hazardGroup = hazardMarkersGroupRef.current;
    if (!hazardGroup) return;

    while (hazardGroup.children.length > 0) {
      hazardGroup.remove(hazardGroup.children[0]);
    }

    // Suppress game-like floating pins, billboards, radar rings, and fake indicators in Disaster Demonstration
    if (isDisasterActive || viewingMode === 'reconstruction') return;

    if (damageType === 'none' && viewingMode !== 'damage') return;

    const activeHazardKey = isDisasterActive ? 'disaster_earthquake' : (damageType !== 'none' ? damageType : 'facade_crack');
    const hazard = HAZARD_MARKERS[activeHazardKey];
    if (!hazard) return;

    const pinGroup = new THREE.Group();
    pinGroup.position.set(...hazard.position3D);
    // Tag the pin with its hazard key so click-to-inspect raycasting (see pickHazardAtPoint)
    // can resolve which HAZARD_MARKERS entry was selected.
    pinGroup.userData.hazardKey = activeHazardKey;

    // Glowing Sphere
    const sphereGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    pinGroup.add(sphere);

    // Pulsating Radar Ring
    const ringGeo = new THREE.RingGeometry(0.6, 1.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'beaconRing';
    ring.rotation.x = Math.PI / 2;
    pinGroup.add(ring);

    // Animated 3D Crack Growth Line Mesh
    const crackPoints = activeHazardKey === 'roof_degradation' ? [
      new THREE.Vector3(-1.2, 0.8, 0.1),
      new THREE.Vector3(-0.4, 0.2, 0.1),
      new THREE.Vector3(0, 0, 0.1),
      new THREE.Vector3(0.6, -0.4, 0.1),
      new THREE.Vector3(1.2, -0.9, 0.1),
    ] : [
      new THREE.Vector3(-1.8, 1.2, 0.15),
      new THREE.Vector3(-0.8, 0.4, 0.15),
      new THREE.Vector3(0, 0, 0.15),
      new THREE.Vector3(0.9, -0.6, 0.15),
      new THREE.Vector3(1.7, -1.3, 0.15),
    ];
    const crackCurve = new THREE.CatmullRomCurve3(crackPoints);
    const crackGeo = new THREE.TubeGeometry(crackCurve, 20, 0.08, 8, false);
    const crackMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0x990011,
      roughness: 0.3,
    });
    const crackMesh = new THREE.Mesh(crackGeo, crackMat);
    pinGroup.add(crackMesh);

    // FEA Stress Tensor Strain Rings
    const stressGeo = new THREE.RingGeometry(1.2, 2.6, 24);
    const stressMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const stressRing = new THREE.Mesh(stressGeo, stressMat);
    stressRing.position.set(0, 0, 0.1);
    pinGroup.add(stressRing);

    // 3D AI Bounding Box Wireframe (matching Drone CV Detection)
    const boxW = activeHazardKey === 'roof_degradation' ? 4.5 : activeHazardKey === 'disaster_earthquake' ? 8.5 : 4.8;
    const boxH = activeHazardKey === 'roof_degradation' ? 3.8 : activeHazardKey === 'disaster_earthquake' ? 4.5 : 3.4;
    const boxD = 2.4;
    const bboxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
    const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
    const bboxLineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const bboxMesh = new THREE.LineSegments(bboxEdges, bboxLineMat);
    pinGroup.add(bboxMesh);

    // 3D HUD Detection Tag Sprite (matching exact red AI badge in Screenshot)
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 256;
    const bCtx = badgeCanvas.getContext('2d');
    if (bCtx) {
      // Red AI Detection Box
      bCtx.fillStyle = '#dc2626';
      bCtx.fillRect(0, 0, 512, 256);
      bCtx.strokeStyle = '#f87171';
      bCtx.lineWidth = 8;
      bCtx.strokeRect(4, 4, 504, 248);

      // Text Header
      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 44px "Courier New", monospace';
      
      if (activeHazardKey === 'roof_degradation') {
        bCtx.fillText('WALL CRACK:', 28, 70);
        bCtx.fillText('Penthouse Joint', 28, 140);
        bCtx.fillStyle = '#fef08a';
        bCtx.fillText('(91%)', 360, 140);
        bCtx.fillStyle = '#ffffff';
        bCtx.font = '30px "Courier New", monospace';
        bCtx.fillText('Cold Joint Delamination', 28, 205);
      } else if (activeHazardKey === 'disaster_earthquake') {
        bCtx.fillText('DISASTER SIMULATION:', 28, 70);
        bCtx.fillText('Bays 1-3 Visual Impact', 28, 140);
        bCtx.fillStyle = '#fef08a';
        bCtx.fillText('[DEMO]', 350, 140);
        bCtx.fillStyle = '#ffffff';
        bCtx.font = '28px "Courier New", monospace';
        bCtx.fillText('Multi-Bay Visual Impact Zone', 28, 205);
      } else if (activeHazardKey === 'column_shear') {
        bCtx.fillText('COLUMN SHEAR:', 28, 70);
        bCtx.fillText('Pilaster P1 Base', 28, 140);
        bCtx.fillStyle = '#fef08a';
        bCtx.fillText('(88%)', 360, 140);
        bCtx.fillStyle = '#ffffff';
        bCtx.font = '30px "Courier New", monospace';
        bCtx.fillText('Plastic Hinge Failure', 28, 205);
      } else {
        bCtx.fillText('FACADE CRACK:', 28, 70);
        bCtx.fillText('Level 2 Spandrel', 28, 140);
        bCtx.fillStyle = '#fef08a';
        bCtx.fillText('(94%)', 360, 140);
        bCtx.fillStyle = '#ffffff';
        bCtx.font = '30px "Courier New", monospace';
        bCtx.fillText('Diagonal Shear Spall', 28, 205);
      }

      const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
      const spriteMat = new THREE.SpriteMaterial({ map: badgeTexture, transparent: true });
      const badgeSprite = new THREE.Sprite(spriteMat);
      badgeSprite.scale.set(4.2, 2.1, 1);
      badgeSprite.position.set(0, boxH / 2 + 1.2, 0);
      pinGroup.add(badgeSprite);
    }

    hazardGroup.add(pinGroup);

    // Add Epistemic 3D World Markers when Highlight Affected Areas is enabled
    if (isDisasterActive && (highlightAffectedAreas || disasterState === 'highlight')) {
      const createClassificationPin = (
        title: string,
        subtitle: string,
        category: 'AFFECTED' | 'UNAFFECTED' | 'UNKNOWN',
        pos: [number, number, number],
        bgColor: string
      ) => {
        const cPinGroup = new THREE.Group();
        cPinGroup.position.set(...pos);

        // Marker pin sphere
        const pSphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const pSphereMat = new THREE.MeshBasicMaterial({ color: bgColor });
        cPinGroup.add(new THREE.Mesh(pSphereGeo, pSphereMat));

        // 3D Canvas Label Sprite
        const cCanvas = document.createElement('canvas');
        cCanvas.width = 512;
        cCanvas.height = 256;
        const ctx = cCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, 512, 256);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.strokeRect(4, 4, 504, 248);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 36px monospace';
          ctx.fillText(`[ ${category} ]`, 28, 60);

          ctx.font = 'bold 30px monospace';
          ctx.fillText(title, 28, 120);

          ctx.font = '22px monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(subtitle, 28, 175);

          ctx.font = 'italic 18px monospace';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText('Demonstration Mode • S3DGen 3D Model', 28, 220);

          const tex = new THREE.CanvasTexture(cCanvas);
          const sMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          const sprite = new THREE.Sprite(sMat);
          sprite.scale.set(4.4, 2.2, 1);
          sprite.position.set(0, 2.0, 0);
          cPinGroup.add(sprite);
        }
        return cPinGroup;
      };

      // 1. Affected Region (Front Facade Bays 1-3)
      hazardGroup.add(createClassificationPin(
        'Bays 1-3 Facade & Apron',
        'Surface Displacement & Debris Highlight',
        'AFFECTED',
        [-3.0, 8.2, GROUND_TRUTH_BUILDING.widthZ / 2 + 1.2],
        '#ea580c'
      ));

      // 2. Unaffected Region (Front Facade Bay 5)
      hazardGroup.add(createClassificationPin(
        'Bay 5 Intact Structure',
        '3D Geometry Aligned With Datum',
        'UNAFFECTED',
        [7.0, 8.2, GROUND_TRUTH_BUILDING.widthZ / 2 + 1.2],
        '#059669'
      ));

      // 3. Unknown / Not Observable (Rear Facade)
      hazardGroup.add(createClassificationPin(
        'Rear Elevation Surfaces',
        'Single-Pass Flight Limitation',
        'UNKNOWN',
        [0.0, 8.2, -GROUND_TRUTH_BUILDING.widthZ / 2 - 1.2],
        '#475569'
      ));
    }
  }, [damageType, viewingMode, isDisasterActive, highlightAffectedAreas, disasterState]);

  // Handle Reconstruction Hologram & CFRP Wrap Layering
  useEffect(() => {
    const recontructGroup = reconstructionGroupRef.current;
    if (!recontructGroup) return;

    while (recontructGroup.children.length > 0) {
      recontructGroup.remove(recontructGroup.children[0]);
    }

    if (!isDisasterActive && viewingMode !== 'reconstruction' && (comparisonMode === 'restored' || isReconstructingAnimating)) {
      const activeHazardKey = damageType !== 'none' ? damageType : 'facade_crack';
      const hazard = HAZARD_MARKERS[activeHazardKey];
      if (hazard) {
        // Holographic Emerald CFRP Composite Patch
        const patchGeo = new THREE.BoxGeometry(4.4, 3.4, 0.35);
        const patchMat = new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: comparisonSlider / 100 * 0.8 + 0.2,
          roughness: 0.15,
          wireframe: comparisonSlider < 40,
        });
        const patchMesh = new THREE.Mesh(patchGeo, patchMat);
        patchMesh.position.set(...hazard.position3D);
        recontructGroup.add(patchMesh);
      }
    }
  }, [viewingMode, comparisonMode, comparisonSlider, damageType, isReconstructingAnimating]);

  // Update Grid and Drone Path
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    if (dronePathLineRef.current) dronePathLineRef.current.visible = showDronePath;
    if (droneGroupRef.current) droneGroupRef.current.visible = showDronePath;
  }, [showGrid, showDronePath]);

  // Mouse / Touch Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      isRightDraggingRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    mouseDownAtRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && !isRightDraggingRef.current) return;

    const deltaX = e.clientX - mousePosRef.current.x;
    const deltaY = e.clientY - mousePosRef.current.y;
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      targetSphericalRef.current.theta -= deltaX * 0.008;
      targetSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, targetSphericalRef.current.phi - deltaY * 0.008)
      );
    } else if (isRightDraggingRef.current) {
      targetLookAtFinalRef.current.y += deltaY * 0.04;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const wasOrbiting = isDraggingRef.current;
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;

    // Only treat this as a "click" (not a camera-orbit drag) when the pointer barely moved.
    const dx = e.clientX - mouseDownAtRef.current.x;
    const dy = e.clientY - mouseDownAtRef.current.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    if (wasOrbiting && dragDistance < 6 && e.button !== 2) {
      pickHazardAtPoint(e.clientX, e.clientY);
    }
  };

  // Raycast from a screen-space click into the hazard markers group so a user can click a
  // hazard pin in the 3D view to inspect it (calls onSelectHazard with the matching
  // HAZARD_MARKERS entry). This is a demonstration/simulation interaction only.
  const pickHazardAtPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const hazardGroup = hazardMarkersGroupRef.current;
    if (!canvas || !camera || !hazardGroup || hazardGroup.children.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(ndc, camera);
    const intersects = raycasterRef.current.intersectObjects(hazardGroup.children, true);
    if (intersects.length === 0) return;

    let obj: THREE.Object3D | null = intersects[0].object;
    while (obj && !obj.userData.hazardKey && obj.parent && obj.parent !== hazardGroup) {
      obj = obj.parent;
    }
    const hazardKey = obj?.userData?.hazardKey as DamageType | undefined;
    if (hazardKey && HAZARD_MARKERS[hazardKey]) {
      onSelectHazard(HAZARD_MARKERS[hazardKey]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetSphericalRef.current.radius = Math.max(
      8,
      Math.min(90, targetSphericalRef.current.radius + e.deltaY * 0.035)
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full min-h-[480px] bg-[#EEF4FA] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 3D Synthesis Laser Scan Loading Screen */}
      {isGenerating3D && (
        <div className="absolute inset-0 bg-[#EEF4FA]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
          <div className="bg-[rgba(255,255,255,0.92)] backdrop-blur-[20px] border border-[#D8E4EF] rounded-[18px] p-8 shadow-[0_16px_40px_rgba(50,90,125,0.12)] flex flex-col items-center max-w-md w-full">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="#E2ECF4"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="#28BFEF"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="188.4"
                  strokeDashoffset={188.4 - (188.4 * generationProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[#28BFEF] font-bold font-mono text-sm">
                {generationProgress}%
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#17324D] font-mono tracking-wider">
              SYNTHESIZING 3D STRUCTURAL MODEL
            </h2>
            <p className="text-xs text-[#60758A] mt-1.5 max-w-sm">
              Bundle adjustment triangulation & Poisson surface reconstruction from 18 selected UAV keyframes.
            </p>

            <div className="w-full bg-[#E2ECF4] rounded-full h-2.5 overflow-hidden border border-[#D8E4EF] mt-5">
              <div
                className="bg-gradient-to-r from-[#28BFEF] via-[#3287E8] to-[#22B573] h-full transition-all duration-150 rounded-full"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3D Damage / Disaster Animation In-Flight HUD Alert */}
      {isDamageAnimating && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.92)] border border-[#EF4444]/60 backdrop-blur-md p-3.5 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(239,68,68,0.12)] space-y-1.5 max-w-xs">
          <div className="text-[#EF4444] font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
            <span>{isDisasterActive || viewingMode === 'reconstruction' ? 'SHOWING DISASTER' : 'CRITICAL DEFECT DETECTED'}</span>
          </div>
          <div className="text-[#17324D]">
            {(isDisasterActive || viewingMode === 'reconstruction') ? 'Demonstration Progress:' : 'Crack Width Growth:'} <strong className={(isDisasterActive || viewingMode === 'reconstruction') ? 'text-[#D97706]' : 'text-[#EF4444]'}>{(isDisasterActive || viewingMode === 'reconstruction') ? `${animationProgress}%` : `${activeDamageLiveMetrics.crackWidth} mm`}</strong>
          </div>
          <div className="w-full bg-[#F0F4F8] rounded-full h-1.5 overflow-hidden mt-1">
            <div className="bg-[#EF4444] h-full transition-all" style={{ width: `${animationProgress}%` }} />
          </div>
        </div>
      )}

      {/* 3D Recovery In-Flight HUD Alert */}
      {isReconstructingAnimating && (isDisasterActive || viewingMode === 'reconstruction') && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.92)] border border-[#22B573]/60 backdrop-blur-md p-3.5 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(34,181,115,0.12)] space-y-1.5 max-w-xs">
          <div className="text-[#22B573] font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22B573] animate-ping" />
            <span>SHOWING RECOVERY</span>
          </div>
          <div className="text-[#17324D]">
            Recovery Progress: <strong className="text-[#22B573]">{animationProgress}%</strong>
          </div>
          <div className="w-full bg-[#F0F4F8] rounded-full h-1.5 overflow-hidden mt-1">
            <div className="bg-[#22B573] h-full transition-all" style={{ width: `${animationProgress}%` }} />
          </div>
        </div>
      )}

      {/* 3D Reconstruction Animation In-Flight HUD Alert (Defect Mode) */}
      {isReconstructingAnimating && viewingMode !== 'reconstruction' && !isDisasterActive && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.90)] border border-[#22B573]/60 backdrop-blur-md p-4 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(34,181,115,0.12)] space-y-1.5 max-w-xs">
          <div className="text-[#22B573] font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22B573] animate-ping" />
            <span>RECONSTRUCTION ACTIVE</span>
          </div>
          <div className="w-full bg-[#F0F4F8] rounded-full h-1.5 overflow-hidden mt-1">
            <div className="bg-[#22B573] h-full transition-all" style={{ width: `${animationProgress}%` }} />
          </div>
        </div>
      )}

      {/* Current Elevation Title Badge (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none bg-[rgba(255,255,255,0.85)] backdrop-blur-md px-4 py-1.5 rounded-xl border border-[#D8E4EF] text-xs font-mono text-[#17324D] z-20 shadow-[0_4px_16px_rgba(50,90,125,0.08)] flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isDisasterActive || viewingMode === 'reconstruction' ? 'bg-[#22B573]' : 'bg-[#28BFEF]'}`} />
        <span className="font-bold tracking-wide">
          {(isDisasterActive || viewingMode === 'reconstruction')
            ? `DISASTER DEMONSTRATION • Current: ${
                highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight'
                  ? 'Recovered Area'
                  : disasterState === 'recovery'
                  ? 'Recovery'
                  : (disasterState === 'disaster' || disasterState === 'after' || disasterState === 'simulating')
                  ? 'After Disaster'
                  : 'Before'
              }`
            : activeElevationTitle}
        </span>
      </div>

      {/* Disaster Demonstration Mode Active Badge (Top Right when disaster is active and not animating) */}
      {(isDisasterActive || viewingMode === 'reconstruction') && !isDamageAnimating && !isReconstructingAnimating && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.94)] border border-[#D8E4EF] backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(50,90,125,0.08)] space-y-1 max-w-xs">
          <div className="text-[#17324D] font-extrabold flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight'
                  ? 'bg-[#22B573]'
                  : disasterState === 'recovery'
                  ? 'bg-[#22B573]'
                  : disasterState === 'disaster' || disasterState === 'after'
                  ? 'bg-[#FF7350]'
                  : 'bg-[#28BFEF]'
              }`} />
              <span className="tracking-wider">DISASTER DEMONSTRATION</span>
            </span>
          </div>
          <div className="text-[#17324D] text-[11px] flex justify-between">
            <span className="text-[#60758A]">Current:</span>
            <strong className="text-[#17324D]">
              {highlightAffectedAreas || disasterState === 'highlighted' || disasterState === 'highlight'
                ? 'Recovered Area'
                : disasterState === 'recovery'
                ? 'Recovery'
                : (disasterState === 'disaster' || disasterState === 'after' || disasterState === 'simulating')
                ? 'After Disaster'
                : 'Before'}
            </strong>
          </div>
          <div className="text-[#60758A] text-[10px] leading-tight">
            Visual demonstration of disaster and recovery on the 3D model.
          </div>
        </div>
      )}

      {/* 100% Reconstructed Persistent Certification Badge (Top Right when 100% restored and not in disaster mode) */}
      {!isDisasterActive && viewingMode !== 'reconstruction' && (comparisonSlider >= 95 || comparisonMode === 'restored') && !isDamageAnimating && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.92)] border border-[#22B573]/50 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(34,181,115,0.12)] space-y-1 animate-in fade-in duration-300">
          <div className="text-[#22B573] font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22B573] animate-pulse" />
            <span className="tracking-wider">100% RECONSTRUCTED</span>
          </div>
        </div>
      )}

      {/* Active Damaged State Badge (Top Right when damage is active and not disaster mode and not 100% restored) */}
      {!isDisasterActive && viewingMode !== 'reconstruction' && (damageType !== 'none' || viewingMode === 'damage') && comparisonSlider < 95 && comparisonMode !== 'restored' && comparisonMode !== 'before' && !isDamageAnimating && !isReconstructingAnimating && (
        <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.92)] border border-[#EF4444]/40 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-mono z-30 shadow-[0_8px_30px_rgba(239,68,68,0.10)] space-y-1">
          <div className="text-[#EF4444] font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="tracking-wider">STRUCTURAL DEFECT DETECTED</span>
          </div>
          <div className="text-[#17324D] text-[11px]">
            Defect: <strong className="text-[#EF4444]">{HAZARD_MARKERS[damageType !== 'none' ? damageType : 'facade_crack']?.title || 'Facade Shear Crack'}</strong>
          </div>
          <div className="text-[#60758A] text-[11px]">
            Integrity: <strong className="text-[#D97706]">58.4%</strong> • Crack: <strong className="text-[#EF4444]">14.2 mm</strong>
          </div>
        </div>
      )}

      {/* Spatial Telemetry & Coordinate Overlay (Top Left) */}
      <div className="absolute top-4 left-4 pointer-events-none bg-[rgba(255,255,255,0.85)] backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D8E4EF] text-xs font-mono space-y-1 z-20 shadow-[0_4px_16px_rgba(50,90,125,0.08)]">
        <div className="text-[#28BFEF] font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#28BFEF] animate-pulse" />
          <span>SPATIAL VIEWPORT TELEMETRY</span>
        </div>
        <div className="text-[#60758A]">
          POS: X:<span className="text-[#17324D] font-bold">{cameraCoords.x}m</span> Y:<span className="text-[#17324D] font-bold">{cameraCoords.y}m</span> Z:<span className="text-[#17324D] font-bold">{cameraCoords.z}m</span>
        </div>
        <div className="text-[#60758A]">
          ZOOM: <span className="text-[#17324D] font-bold">{cameraCoords.zoom}x</span> • ELEVATION: <span className="text-[#22B573] font-bold">{(cameraCoords.y + GROUND_TRUTH_BUILDING.baseAlt).toFixed(1)}m MSL</span>
        </div>
      </div>

      {/* Bottom Floating Mode Notification Badge */}
      <div className="absolute bottom-4 left-4 pointer-events-none bg-[rgba(255,255,255,0.85)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#D8E4EF] text-xs font-mono text-[#60758A] z-20 flex flex-wrap items-center gap-2 shadow-[0_4px_16px_rgba(50,90,125,0.08)]">
        <span className={`w-2 h-2 rounded-full ${comparisonSlider >= 95 ? 'bg-[#22B573]' : damageType !== 'none' ? 'bg-[#EF4444]' : 'bg-[#28BFEF]'}`} />
        <span>Status: <strong className={comparisonSlider >= 95 ? 'text-[#22B573]' : damageType !== 'none' ? 'text-[#EF4444]' : 'text-[#28BFEF]'}>{comparisonSlider >= 95 ? '100% RECONSTRUCTED' : damageType !== 'none' ? 'DAMAGED' : 'PRISTINE GT'}</strong></span>
        <span>• Mode: <strong className="text-[#17324D] uppercase">{viewingMode}</strong></span>
        <span>• Shader: <strong className="text-[#28BFEF] uppercase">{renderMode}</strong></span>
        {selectedLevel !== 'all' && (
          <span>• Level: <strong className="text-[#D97706] uppercase">{selectedLevel}</strong></span>
        )}
      </div>
    </div>
  );
});
