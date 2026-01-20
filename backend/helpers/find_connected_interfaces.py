"""
Helper utilities for finding connected network interfaces.
"""

import subprocess
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from packet_capture import load_interfaces, get_interface_device


def get_connected_interface_names():
    """
    Get list of connected (active) network interface names using netsh.
    Works on Windows only.

    Returns:
        List of connected interface names (e.g., ["Ethernet 3", "Wi-Fi"])
    """
    try:
        result = subprocess.run(
            ['netsh', 'interface', 'show', 'interface'],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode != 0:
            return []

        connected = []
        for line in result.stdout.strip().split('\n'):
            # Look for lines with "Connected" status (not "Disconnected")
            if 'Connected' in line and 'Disconnected' not in line:
                # Parse: "Enabled        Connected      Dedicated        Ethernet 3"
                parts = line.split()
                if len(parts) >= 4 and parts[1] == 'Connected':
                    # Interface name is everything after the type column
                    interface_name = ' '.join(parts[3:])
                    connected.append(interface_name)

        return connected

    except Exception:
        return []


def get_connected_interfaces():
    """
    Get only connected interfaces for testing.

    Returns:
        Tuple of (interfaces_list, interface_map) containing only connected interfaces.
        Falls back to all interfaces if connection status can't be determined.
    """
    # Get all interfaces from tshark
    all_interfaces, interface_map = load_interfaces()

    # Get connected interface names from netsh
    connected_names = get_connected_interface_names()

    if not connected_names:
        # Can't determine connected status, return all
        return all_interfaces, interface_map

    # Filter to only connected interfaces
    connected_interfaces = []
    connected_map = {}

    for display_name in all_interfaces:
        # Check if any connected name is in the display name
        for connected_name in connected_names:
            if connected_name in display_name:
                connected_interfaces.append(display_name)
                connected_map[display_name] = interface_map[display_name]
                break

    # Fallback to all if no matches
    if not connected_interfaces:
        return all_interfaces, interface_map

    return connected_interfaces, connected_map


def get_first_connected_interface():
    """
    Get the first connected interface for testing.

    Returns:
        Tuple of (display_name, device_path) or (None, None) if none found.
    """
    interfaces, interface_map = get_connected_interfaces()

    if interfaces:
        display_name = interfaces[0]
        return display_name, interface_map[display_name]

    return None, None
