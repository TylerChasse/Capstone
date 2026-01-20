"""
Module for loading and parsing network interfaces using tshark.
"""

import subprocess
import re
from typing import Tuple, Dict, List


def load_interfaces() -> Tuple[List[str], Dict[str, str]]:
    """
    Load available network interfaces using tshark.

    Returns:
        Tuple containing:
            - List of display names (e.g., ["1. Ethernet", "2. Wi-Fi"])
            - Dict mapping display names to device paths/names

    Raises:
        FileNotFoundError: If tshark is not installed or not in PATH
        RuntimeError: If tshark command fails
    """
    # Run tshark -D to get interfaces
    result = subprocess.run(['tshark', '-D'], capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(
            "Failed to load interfaces. Make sure TShark is installed and in PATH. "
            f"Error: {result.stderr}"
        )

    interfaces = []
    interface_map = {}

    for line in result.stdout.strip().split('\n'):
        if not line.strip():
            continue

        # Try Windows format first: "1. \Device\NPF_{GUID} (Name)"
        match = re.match(r'(\d+)\.\s+(.+?)\s+\((.+?)\)', line)
        if match:
            number, device_path, friendly_name = match.groups()
            display_name = f"{number}. {friendly_name}"
            interfaces.append(display_name)
            interface_map[display_name] = device_path
        else:
            # Try Linux/Mac format: "1. eth0" or "1. eth0 (additional info)"
            match_simple = re.match(r'(\d+)\.\s+(\S+)', line)
            if match_simple:
                number, device_name = match_simple.groups()
                display_name = f"{number}. {device_name}"
                interfaces.append(display_name)
                interface_map[display_name] = device_name

    return interfaces, interface_map


def get_interface_device(display_name: str, interface_map: Dict[str, str]) -> str:
    """
    Get the device path/name for a given display name.

    Args:
        display_name: The user-friendly display name (e.g., "1. Ethernet")
        interface_map: Dict mapping display names to device paths

    Returns:
        The device path/name for use with pyshark

    Raises:
        KeyError: If display_name not found in interface_map
    """
    return interface_map[display_name]
