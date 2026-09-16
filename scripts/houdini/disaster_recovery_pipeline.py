"""
Houdini Python SOP Network Controller for S3DGen Disaster Demonstration
========================================================================
This Python script controls the Houdini geometry process:
- Creates the SOP network in Houdini (/obj/s3dgen_disaster_geo)
- Sets up disaster parameters (affected region bounding box, displacement magnitude, debris density)
- Attaches VEX Attribute Wrangle nodes for geometry deformation & debris generation
- Manages the recovery sequence (interpolating disaster -> recovery condition)
- Attaches VEX Highlight Wrangle to generate recovery point attributes
- Exports the geometry & attributes for the S3DGen Three.js viewer
"""

import sys
import os
import json

# Check if running inside SideFX Houdini environment
try:
    import hou
    HOUDINI_AVAILABLE = True
except ImportError:
    HOUDINI_AVAILABLE = False


class S3DGenHoudiniDisasterProcessor:
    """
    Python controller managing Houdini SOP network & VEX geometry processing.
    """
    def __init__(self, scene_name="s3dgen_disaster_geo"):
        self.scene_name = scene_name
        self.params = {
            # Affected region bounding box (Front bays 1-3 on lower floors)
            "affected_bbox_min": [-7.0, 0.0, 5.0],
            "affected_bbox_max": [3.0, 10.0, 9.0],
            "displacement_scale": 0.45,
            "noise_frequency": 0.85,
            "debris_count": 24,
            "recovery_blend": 0.0, # 0.0 = disaster, 1.0 = fully recovered
            "highlight_color": [0.15, 0.75, 0.55] # Clean emerald highlight
        }

    def setup_sop_network(self):
        """Creates the Houdini SOP network and wires VEX wrangle nodes."""
        if not HOUDINI_AVAILABLE:
            print("[Python] Running in standalone export mode (Houdini Python API simulated).")
            return

        obj = hou.node("/obj")
        geo_node = obj.createNode("geo", self.scene_name)

        # 1. File SOP / Input Reconstructed Mesh
        file_sop = geo_node.createNode("file", "input_reconstructed_mesh")

        # 2. VEX Attribute Wrangle SOP for Disaster Deformation
        vex_deform = geo_node.createNode("attribwrangle", "vex_disaster_deform")
        vex_deform.setInput(0, file_sop)
        vex_deform.parm("snippet").set(self.load_vex_code("vex/disaster_deform.vfl"))

        # Wire parameters to VEX node
        vex_deform.parm("disp_scale").set(self.params["displacement_scale"])
        vex_deform.parm("freq").set(self.params["noise_frequency"])

        # 3. VEX Attribute Wrangle SOP for Recovery & Highlight
        vex_recovery = geo_node.createNode("attribwrangle", "vex_recovery_highlight")
        vex_recovery.setInput(0, vex_deform)
        vex_recovery.parm("snippet").set(self.load_vex_code("vex/recovery_highlight.vfl"))
        vex_recovery.parm("u_recovery").set(self.params["recovery_blend"])

        # 4. ROP Output Driver SOP for S3DGen 3D Viewer export
        rop_sop = geo_node.createNode("rop_gltf", "export_s3dgen_mesh")
        rop_sop.setInput(0, vex_recovery)

        print(f"[Python] Houdini SOP network created: {geo_node.path()}")

    def load_vex_code(self, relative_path):
        """Loads VEX snippet file."""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, relative_path)
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                return f.read()
        return "// VEX code fallback\n"

    def export_geometry_definition(self):
        """
        Exports the procedural parameters and metadata for the S3DGen Three.js viewer.
        """
        output = {
            "version": "1.0",
            "processor": "Houdini Python + VEX Engine",
            "parameters": self.params,
            "workflow": ["before", "disaster", "recovery", "highlighted"],
            "vex_modules": [
                "scripts/houdini/vex/disaster_deform.vfl",
                "scripts/houdini/vex/recovery_highlight.vfl"
            ]
        }
        return output


if __name__ == "__main__":
    processor = S3DGenHoudiniDisasterProcessor()
    processor.setup_sop_network()
    definition = processor.export_geometry_definition()
    print("[Python] S3DGen Disaster Geometry Configuration:")
    print(json.dumps(definition, indent=2))
