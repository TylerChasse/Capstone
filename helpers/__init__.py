"""
Helper utilities for the network analyzer.
"""

from .find_connected_interfaces import (
    get_connected_interface_names,
    get_connected_interfaces,
    get_first_connected_interface,
)

__all__ = [
    'get_connected_interface_names',
    'get_connected_interfaces',
    'get_first_connected_interface',
]
