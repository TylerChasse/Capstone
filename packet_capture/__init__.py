"""
Packet Capture module for educational network analyzer.

This module provides core functionality for:
- Loading network interfaces (load_interfaces)
- Capturing packets (capture_packets)
- Parsing and formatting packet data (display_packet)
"""

from .load_interfaces import load_interfaces, get_interface_device
from .capture_packets import PacketCapture, CaptureConfig, CaptureStats
from .display_packet import (
    parse_packet,
    format_packet_text,
    format_packet_dict,
    PacketInfo,
)

__all__ = [
    # Interface loading
    'load_interfaces',
    'get_interface_device',
    # Packet capture
    'PacketCapture',
    'CaptureConfig',
    'CaptureStats',
    # Packet display
    'parse_packet',
    'format_packet_text',
    'format_packet_dict',
    'PacketInfo',
]
