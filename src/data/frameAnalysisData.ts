export interface FrameQuality {
  sharpness: 'high' | 'medium' | 'low';
  blur: 'none' | 'mild' | 'severe';
  visual_quality: 'high' | 'medium' | 'low';
  exposure_issue: boolean;
  notes: string;
}

export interface FrameRedundancy {
  assessment: 'low' | 'medium' | 'high';
  notes: string;
}

export interface FrameViewpoint {
  category: 'oblique' | 'nadir' | 'lateral';
  usefulness: 'high' | 'medium' | 'low';
  notes: string;
}

export interface FrameDecision {
  selected: boolean;
  reason: string;
}

export interface AnalyzedFrame {
  frame_id: number;
  filename: string;
  quality: FrameQuality;
  redundancy: FrameRedundancy;
  viewpoint: FrameViewpoint;
  reconstruction_usefulness: 'high' | 'medium' | 'low';
  decision: FrameDecision;
}

export interface FrameAnalysisSummary {
  total_frames: number;
  selected_frames: number;
  rejected_frames: number;
  selection_rate_percent: number;
  rejection_rate_percent: number;
  rejection_breakdown: {
    excessive_redundancy: number;
    motion_blur: number;
  };
}

export interface FrameAnalysisDataset {
  project: {
    problem_statement_id: string;
    pipeline_stage: string;
  };
  source: {
    input_type: string;
    source_description: string;
  };
  summary: FrameAnalysisSummary;
  frames: AnalyzedFrame[];
  limitations: string[];
}

export const FRAME_ANALYSIS_DATA: FrameAnalysisDataset = {
  project: {
    problem_statement_id: "S3DGEN-UAV-3D",
    pipeline_stage: "frame_analysis_and_selection"
  },
  source: {
    input_type: "drone_video_frames",
    source_description: "Uploaded extracted drone-video frames"
  },
  summary: {
    total_frames: 63,
    selected_frames: 18,
    rejected_frames: 45,
    selection_rate_percent: 28.57,
    rejection_rate_percent: 71.43,
    rejection_breakdown: {
      excessive_redundancy: 42,
      motion_blur: 3
    }
  },
  frames: [
    {
      frame_id: 1,
      filename: "frame_001.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp aerial perspective providing structural coverage."
      },
      redundancy: {
        assessment: "low",
        notes: "Initial viewpoint of the sequence."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Good baseline view for structural geometry."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Initial keyframe establishing trajectory baseline with clear visual quality."
      }
    },
    {
      frame_id: 2,
      filename: "frame_002.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Near-identical spatial baseline to frame_001.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Viewpoint is useful but redundant."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 3,
      filename: "frame_003.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear visual details."
      },
      redundancy: {
        assessment: "high",
        notes: "Minimal camera translation relative to frame_001.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Similar viewpoint."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 4,
      filename: "frame_004.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sufficient disparity and clean edges."
      },
      redundancy: {
        assessment: "low",
        notes: "Sufficient angular and translational progression from frame_001.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Provides structural overlap."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Keyframe selection with appropriate baseline translation."
      }
    },
    {
      frame_id: 5,
      filename: "frame_005.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "High sharpness."
      },
      redundancy: {
        assessment: "high",
        notes: "High visual overlap with frame_004.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Redundant angle."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 6,
      filename: "frame_006.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense overlap with adjacent keyframes."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Minor disparity."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 7,
      filename: "frame_007.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp perspective with new visual coverage."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline shift relative to frame_004.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Expands multi-view triangulation baseline."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Good baseline step for photogrammetry point matching."
      }
    },
    {
      frame_id: 8,
      filename: "frame_008.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Strong redundancy with frame_007.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental motion."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 9,
      filename: "frame_009.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good contrast and sharpness."
      },
      redundancy: {
        assessment: "high",
        notes: "High similarity with neighboring frames."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental perspective."
      },
      reconstruction_usefulness: "medium",
      decision: {
        "selected": false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 10,
      filename: "frame_010.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Distinct camera position and clean visual details."
      },
      redundancy: {
        assessment: "low",
        notes: "Progressive spatial shift."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Maintains 60-80% required overlap with frame_007.jpg."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Keyframe offering optimal baseline distance."
      }
    },
    {
      frame_id: 11,
      filename: "frame_011.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Excessive overlap with frame_010.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor viewpoint delta."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 12,
      filename: "frame_012.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant view."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor angle shift."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 13,
      filename: "frame_013.jpg",
      quality: {
        sharpness: "low",
        blur: "mild",
        visual_quality: "low",
        exposure_issue: false,
        notes: "Mild motion blur artifacts."
      },
      redundancy: {
        assessment: "medium",
        notes: "Similar to neighboring sequence."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "low",
        notes: "Degraded edge contrast."
      },
      reconstruction_usefulness: "low",
      decision: {
        selected: false,
        reason: "motion_blur"
      }
    },
    {
      "frame_id": 14,
      filename: "frame_014.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp restoration of track."
      },
      redundancy: {
        assessment: "low",
        notes: "Sufficient displacement from frame_010.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Clear parallax shift."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Selected over blurred predecessor to maintain tracking trajectory."
      }
    },
    {
      frame_id: 15,
      filename: "frame_015.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Excessive similarity to frame_014.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Redundant coverage."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 16,
      filename: "frame_016.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good visual clarity."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense adjacent sampling."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minimal translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 17,
      filename: "frame_017.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Consistent sharpness across scene."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline delta from frame_014.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Expands multi-view baseline."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Provides new triangulation angle while maintaining overlap."
      }
    },
    {
      frame_id: 18,
      filename: "frame_018.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap with frame_017.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 19,
      filename: "frame_019.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera location."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar geometry."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 20,
      filename: "frame_020.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clean high contrast details."
      },
      redundancy: {
        assessment: "low",
        notes: "Clear translation along flight path."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Robust keyframe spacing."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Optimal keyframe spacing relative to frame_017.jpg."
      }
    },
    {
      frame_id: 21,
      filename: "frame_021.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Near identical to frame_020.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "High overlap."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 22,
      filename: "frame_022.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good contrast."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant position."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor angle change."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 23,
      filename: "frame_023.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp edges and strong structure visibility."
      },
      redundancy: {
        assessment: "low",
        notes: "Meaningful step in flight trajectory."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Provides distinct view of facade and context."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Provides baseline divergence needed for dense matching."
      }
    },
    {
      frame_id: 24,
      filename: "frame_024.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant with frame_023.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental view."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 25,
      filename: "frame_025.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good sharpness."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense overlap."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar viewpoint."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 26,
      filename: "frame_026.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Well-defined features and geometry."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline shift from frame_023.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Sufficient angular difference."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Essential keyframe for maintaining loop coverage."
      }
    },
    {
      frame_id: 27,
      filename: "frame_027.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap with frame_026.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental motion."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 28,
      filename: "frame_028.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear scene elements."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera position."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar coverage."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 29,
      filename: "frame_029.jpg",
      quality: {
        sharpness: "low",
        blur: "mild",
        visual_quality: "low",
        exposure_issue: false,
        notes: "Mild blur from drone movement."
      },
      redundancy: {
        assessment: "medium",
        notes: "Overlaps trajectory segment."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "low",
        notes: "Reduced feature point trackability."
      },
      reconstruction_usefulness: "low",
      decision: {
        selected: false,
        reason: "motion_blur"
      }
    },
    {
      frame_id: 30,
      filename: "frame_030.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "High quality sharp replacement for blurred neighbor."
      },
      redundancy: {
        assessment: "low",
        notes: "Progressive shift from frame_026.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Maintains track continuity."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Clear keyframe sustaining continuity after degraded frame."
      }
    },
    {
      frame_id: 31,
      filename: "frame_031.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp visual details."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant with frame_030.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 32,
      filename: "frame_032.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense adjacent sampling."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental angle change."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 33,
      filename: "frame_033.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Distinct oblique angle with sharp features."
      },
      redundancy: {
        assessment: "low",
        notes: "Displaced perspective from frame_030.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Supports bundle adjustment constraints."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Provides broad baseline step and high point visibility."
      }
    },
    {
      frame_id: 34,
      filename: "frame_034.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good contrast."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap with frame_033.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 35,
      filename: "frame_035.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp features."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera angle."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar geometry."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 36,
      filename: "frame_036.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Strong structure visibility and sharp focus."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline shift relative to frame_033.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Extends surface coverage."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Selected for baseline progression and clean texture definition."
      }
    },
    {
      frame_id: 37,
      filename: "frame_037.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Excessive overlap with frame_036.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental view."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 38,
      filename: "frame_038.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good clarity."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense adjacent sampling."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor angle delta."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 39,
      filename: "frame_039.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame with noticeable camera translation."
      },
      redundancy: {
        assessment: "low",
        notes: "Translational step from frame_036.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Provides distinct triangulation baseline."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Maintains spatial sampling density across the target."
      }
    },
    {
      frame_id: 40,
      filename: "frame_040.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap with frame_039.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar viewpoint."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 41,
      filename: "frame_041.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera angle."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental motion."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 42,
      filename: "frame_042.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear visual clarity and clean edges."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline shift from frame_039.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Key viewpoint progression."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Provides necessary spatial shift without losing keypoint tracks."
      }
    },
    {
      frame_id: 43,
      filename: "frame_043.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Strong redundancy with frame_042.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 44,
      filename: "frame_044.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good contrast."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental angle."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 45,
      filename: "frame_045.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp structural representation."
      },
      redundancy: {
        assessment: "low",
        notes: "Distinct camera position along orbit."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Good angular baseline relative to frame_042.jpg."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Keyframe offering spatial distribution across orbit."
      }
    },
    {
      frame_id: 46,
      filename: "frame_046.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant with frame_045.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor perspective change."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 47,
      filename: "frame_047.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense adjacent sampling."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "High overlap."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 48,
      filename: "frame_048.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp texture details."
      },
      redundancy: {
        assessment: "low",
        notes: "Baseline translation from frame_045.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Captures distinct geometry."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Maintains geometric triangulation stability."
      }
    },
    {
      frame_id: 49,
      filename: "frame_049.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good visual clarity."
      },
      redundancy: {
        assessment: "high",
        notes: "High similarity with frame_048.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 50,
      filename: "frame_050.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera angle."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar coverage."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 51,
      filename: "frame_051.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp and informative perspective."
      },
      redundancy: {
        assessment: "low",
        notes: "Solid baseline progression from frame_048.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Clear parallax delta."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Selected for viewpoint diversity and sharp structural fidelity."
      }
    },
    {
      frame_id: 52,
      filename: "frame_052.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Overlaps frame_051.jpg densely."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor movement."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 53,
      filename: "frame_053.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clear features."
      },
      redundancy: {
        assessment: "high",
        notes: "Excessive overlap."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental view."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 54,
      filename: "frame_054.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Clean high contrast structural details."
      },
      redundancy: {
        assessment: "low",
        notes: "Significant displacement from frame_051.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Maintains geometric triangulation."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Keyframe selection providing uniform spatial density."
      }
    },
    {
      frame_id: 55,
      filename: "frame_055.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame."
      },
      redundancy: {
        assessment: "high",
        notes: "High overlap with frame_054.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor translation."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 56,
      filename: "frame_056.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good clarity."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant camera angle."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Similar perspective."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 57,
      filename: "frame_057.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp focus across background and foreground structure."
      },
      redundancy: {
        assessment: "low",
        notes: "Adequate baseline shift from frame_054.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Clear angle divergence."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Selected to ensure full coverage of the final flight arc."
      }
    },
    {
      frame_id: 58,
      filename: "frame_058.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp image."
      },
      redundancy: {
        assessment: "high",
        notes: "Excessive overlap with frame_057.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Minor perspective change."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 59,
      filename: "frame_059.jpg",
      quality: {
        sharpness: "low",
        blur: "mild",
        visual_quality: "low",
        exposure_issue: false,
        notes: "Mild motion blur and edge softness."
      },
      redundancy: {
        assessment: "medium",
        notes: "Adjacent to terminal frames."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "low",
        notes: "Degraded sharpness."
      },
      reconstruction_usefulness: "low",
      decision: {
        selected: false,
        reason: "motion_blur"
      }
    },
    {
      frame_id: 60,
      filename: "frame_060.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp frame recovery."
      },
      redundancy: {
        assessment: "low",
        notes: "Progressive shift from frame_057.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Maintains track to sequence end."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "High-sharpness keyframe replacing blurred predecessor."
      }
    },
    {
      frame_id: 61,
      filename: "frame_061.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Sharp visual features."
      },
      redundancy: {
        assessment: "high",
        notes: "Redundant with frame_060.jpg."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "High overlap."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 62,
      filename: "frame_062.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Good contrast."
      },
      redundancy: {
        assessment: "high",
        notes: "Dense adjacent sampling."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "medium",
        notes: "Incremental view."
      },
      reconstruction_usefulness: "medium",
      decision: {
        selected: false,
        reason: "excessive_redundancy"
      }
    },
    {
      frame_id: 63,
      filename: "frame_063.jpg",
      quality: {
        sharpness: "high",
        blur: "none",
        visual_quality: "high",
        exposure_issue: false,
        notes: "Final sequence boundary frame with sharp coverage."
      },
      redundancy: {
        assessment: "low",
        notes: "Terminal sequence endpoint."
      },
      viewpoint: {
        category: "oblique",
        usefulness: "high",
        notes: "Bounds the reconstruction volume."
      },
      reconstruction_usefulness: "high",
      decision: {
        selected: true,
        reason: "Final boundary keyframe completing flight pass coverage."
      }
    }
  ],
  limitations: [
    "Frame usefulness is evaluated qualitatively from visual quality, structural visibility, redundancy, and viewpoint diversity.",
    "GPS, altitude, flight speed, and absolute 6-DoF camera poses are not derived from the frame images in this stage.",
    "Downstream Structure-from-Motion may discard additional frames during feature matching and bundle adjustment."
  ]
};
