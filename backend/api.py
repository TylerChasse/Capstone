"""
api.py - FastAPI REST Backend for Network Analyzer

This file creates a web server that the frontend (Electron/React) communicates with.
It provides HTTP endpoints for:
  - Loading network interfaces
  - Starting/stopping packet capture
  - Retrieving captured packets
  - Exporting/importing packet data to/from JSON files

The backend runs on http://127.0.0.1:8000 and handles all the heavy lifting
of packet capture while the frontend focuses on displaying the data.

Usage:
    python api.py
    # or from project root:
    python run_api.py
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


# =============================================================================
# APP INITIALIZATION
# =============================================================================

app = FastAPI(title="Network Analyzer API")

# Enable CORS (Cross-Origin Resource Sharing) so the frontend can make requests
# to this backend. Without this, browsers block requests from different origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],       # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],       # Allow all headers
)


# =============================================================================
# GLOBAL STATE
# =============================================================================

# This dictionary holds the current state of packet capture.
# Since FastAPI handles multiple requests, we need a shared place to store:
#   - The active capture object
#   - All captured packets
#   - Whether a capture is currently running
#   - The mapping of interface names to device paths
capture_state = {
    "capture": None,           # The PacketCapture instance
    "packets": [],             # List of captured packet dictionaries
    "is_capturing": False,     # Flag to track if capture is active
    "interface_map": {},       # Maps display names to device paths
}


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================
# These classes define the structure of data sent to/from the API.
# Pydantic automatically validates incoming requests against these schemas.

class CaptureRequest(BaseModel):
    """Data required to start a packet capture."""
    interface: str             # The interface name to capture on
    packet_count: int = 0      # Number of packets to capture (0 = unlimited)
    display_filter: str = ""   # Wireshark display filter (e.g., "tcp", "udp")
    timeout: int = 300         # Maximum capture time in seconds


class ExportRequest(BaseModel):
    """Data required to export packets to a file."""
    file_path: str                    # Where to save the JSON file
    packets: List[Dict[str, Any]]     # The packet data to export


class ImportRequest(BaseModel):
    """Data required to import packets from a file."""
    file_path: str             # Path to the JSON file to import


# =============================================================================
# INTERFACE ENDPOINTS
# =============================================================================

@app.get("/interfaces")
def get_interfaces():
    """
    Get all available network interfaces.

    Returns a list of interface names and a mapping to their device paths.
    The device path is what pyshark needs to actually capture on the interface.
    """
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
    """
    Get only connected (active) network interfaces.

    This is faster for the user since it filters out disconnected interfaces
    that wouldn't capture any traffic anyway.
    """
    try:
        interfaces, interface_map = get_connected_interfaces()
        capture_state["interface_map"] = interface_map
        return {
            "interfaces": interfaces,
            "interface_map": interface_map
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# CAPTURE ENDPOINTS
# =============================================================================

@app.post("/capture/start")
def start_capture(request: CaptureRequest):
    """
    Start capturing packets on the specified interface.

    The capture runs in a background thread so this endpoint returns immediately.
    Use /capture/status or /capture/packets to check progress.
    """
    # Prevent starting multiple captures at once
    if capture_state["is_capturing"]:
        raise HTTPException(status_code=400, detail="Capture already in progress")

    try:
        # Convert the display name (e.g., "Ethernet 3") to a device path
        # that pyshark can use (e.g., "\\Device\\NPF_{GUID}")
        interface_path = get_interface_device(
            request.interface,
            capture_state["interface_map"]
        )

        # Create the capture configuration
        config = CaptureConfig(
            interface=interface_path,
            packet_count=request.packet_count,
            display_filter=request.display_filter,
            timeout=request.timeout
        )

        # Initialize capture state
        capture_state["capture"] = PacketCapture(config)
        capture_state["packets"] = []
        capture_state["is_capturing"] = True

        def packet_handler(packet, number):
            """Called for each packet captured. Parses and stores the packet."""
            try:
                packet_info = parse_packet(packet, number)
                packet_dict = format_packet_dict(packet_info)
                capture_state["packets"].append(packet_dict)
            except Exception:
                pass  # Skip packets that fail to parse

        def run_capture():
            """Runs the capture in a background thread."""
            try:
                capture_state["capture"].start(packet_handler)
            finally:
                capture_state["is_capturing"] = False

        # Start capture in background thread so API remains responsive
        thread = threading.Thread(target=run_capture, daemon=True)
        thread.start()

        return {"status": "started", "interface": request.interface}

    except Exception as e:
        capture_state["is_capturing"] = False
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/capture/stop")
def stop_capture():
    """
    Stop the current packet capture.

    This signals the capture thread to stop and returns the final packet count.
    """
    if not capture_state["is_capturing"]:
        return {"status": "not_capturing"}

    if capture_state["capture"]:
        capture_state["capture"].stop()

    capture_state["is_capturing"] = False
    return {"status": "stopped", "packets_captured": len(capture_state["packets"])}


@app.get("/capture/status")
def capture_status():
    """
    Get the current capture status.

    The frontend polls this endpoint to know when capture has finished
    and how many packets have been captured so far.
    """
    return {
        "is_capturing": capture_state["is_capturing"],
        "packet_count": len(capture_state["packets"]),
    }


@app.get("/capture/packets")
def get_packets(offset: int = 0, limit: int = 100):
    """
    Get captured packets with pagination.

    Args:
        offset: Number of packets to skip (for pagination)
        limit: Maximum number of packets to return

    Use this for large captures to avoid sending all packets at once.
    """
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
    """
    Get all captured packets at once.

    Simpler than paginated endpoint but may be slow for large captures.
    """
    return {
        "packets": capture_state["packets"],
        "total": len(capture_state["packets"])
    }


@app.delete("/capture/packets")
def clear_packets():
    """Clear all captured packets from memory."""
    capture_state["packets"] = []
    return {"status": "cleared"}


# =============================================================================
# IMPORT/EXPORT ENDPOINTS
# =============================================================================

@app.post("/export")
def export_packets(request: ExportRequest):
    """
    Export packets to a JSON file.

    Saves the packet data to the specified file path so it can be
    imported later or analyzed with other tools.
    """
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
    """
    Import packets from a JSON file.

    Loads previously exported packet data for viewing in the frontend.
    """
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


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    # Start the server on localhost:8000
    # The frontend will connect to this address
    uvicorn.run(app, host="127.0.0.1", port=8000)
