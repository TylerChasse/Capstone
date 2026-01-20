"""
FastAPI backend for packet capture functionality.
Exposes REST endpoints for the Electron/React frontend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import json
import threading

# Add backend directory to path for imports when run directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from packet_capture import (
    load_interfaces,
    get_interface_device,
    PacketCapture,
    CaptureConfig,
    parse_packet,
    format_packet_dict,
)
from helpers import get_connected_interfaces

app = FastAPI(title="Network Analyzer API")

# Enable CORS for Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for active capture
capture_state = {
    "capture": None,
    "packets": [],
    "is_capturing": False,
    "interface_map": {},
}


class CaptureRequest(BaseModel):
    interface: str
    packet_count: int = 0  # 0 = continuous
    display_filter: str = ""
    timeout: int = 300


class ExportRequest(BaseModel):
    file_path: str
    packets: List[Dict[str, Any]]


class ImportRequest(BaseModel):
    file_path: str


@app.get("/interfaces")
def get_interfaces():
    """Get all available network interfaces."""
    try:
        interfaces, interface_map = load_interfaces()
        capture_state["interface_map"] = interface_map
        return {
            "interfaces": interfaces,
            "interface_map": interface_map
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/interfaces/connected")
def get_connected():
    """Get only connected network interfaces."""
    try:
        interfaces, interface_map = get_connected_interfaces()
        capture_state["interface_map"] = interface_map
        return {
            "interfaces": interfaces,
            "interface_map": interface_map
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/capture/start")
def start_capture(request: CaptureRequest):
    """Start packet capture on specified interface."""
    if capture_state["is_capturing"]:
        raise HTTPException(status_code=400, detail="Capture already in progress")

    try:
        # Get the device path for the interface
        interface_path = get_interface_device(
            request.interface,
            capture_state["interface_map"]
        )

        config = CaptureConfig(
            interface=interface_path,
            packet_count=request.packet_count,
            display_filter=request.display_filter,
            timeout=request.timeout
        )

        capture_state["capture"] = PacketCapture(config)
        capture_state["packets"] = []
        capture_state["is_capturing"] = True

        def packet_handler(packet, number):
            try:
                packet_info = parse_packet(packet, number)
                packet_dict = format_packet_dict(packet_info)
                capture_state["packets"].append(packet_dict)
            except Exception:
                pass

        # Run capture in background thread
        def run_capture():
            try:
                capture_state["capture"].start(packet_handler)
            finally:
                capture_state["is_capturing"] = False

        thread = threading.Thread(target=run_capture, daemon=True)
        thread.start()

        return {"status": "started", "interface": request.interface}

    except Exception as e:
        capture_state["is_capturing"] = False
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/capture/stop")
def stop_capture():
    """Stop the current capture."""
    if not capture_state["is_capturing"]:
        return {"status": "not_capturing"}

    if capture_state["capture"]:
        capture_state["capture"].stop()

    capture_state["is_capturing"] = False
    return {"status": "stopped", "packets_captured": len(capture_state["packets"])}


@app.get("/capture/status")
def capture_status():
    """Get current capture status and packets."""
    return {
        "is_capturing": capture_state["is_capturing"],
        "packet_count": len(capture_state["packets"]),
    }


@app.get("/capture/packets")
def get_packets(offset: int = 0, limit: int = 100):
    """Get captured packets with pagination."""
    packets = capture_state["packets"]
    total = len(packets)

    return {
        "packets": packets[offset:offset + limit],
        "total": total,
        "offset": offset,
        "limit": limit
    }


@app.get("/capture/packets/all")
def get_all_packets():
    """Get all captured packets."""
    return {
        "packets": capture_state["packets"],
        "total": len(capture_state["packets"])
    }


@app.post("/export")
def export_packets(request: ExportRequest):
    """Export packets to a JSON file."""
    try:
        with open(request.file_path, 'w') as f:
            json.dump(request.packets, f, indent=2)

        return {
            "status": "success",
            "file_path": request.file_path,
            "packet_count": len(request.packets)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/import")
def import_packets(request: ImportRequest):
    """Import packets from a JSON file."""
    try:
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")

        with open(request.file_path, 'r') as f:
            packets = json.load(f)

        return {
            "status": "success",
            "file_path": request.file_path,
            "packets": packets,
            "packet_count": len(packets)
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/capture/packets")
def clear_packets():
    """Clear all captured packets."""
    capture_state["packets"] = []
    return {"status": "cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
