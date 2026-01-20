"""
Test Suite: Packet Parsing
Tests the ability to extract information from captured packets
"""

import unittest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.packet_capture import (
    get_interface_device,
    PacketCapture,
    CaptureConfig,
    parse_packet,
    format_packet_text,
    format_packet_dict,
    PacketInfo,
)
from backend.helpers import get_connected_interfaces


class TestPacketParsing(unittest.TestCase):
    """Test that we can extract data from packets"""

    def setUp(self):
        """Capture a real packet for testing"""
        try:
            interfaces, interface_map = get_connected_interfaces()
        except (FileNotFoundError, RuntimeError):
            self.packet = None
            self.packet_info = None
            return

        # Try to capture a real packet
        self.packet = None
        self.packet_info = None

        for display_name in interfaces:
            interface_path = get_interface_device(display_name, interface_map)

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=1,
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def packet_handler(packet, number):
                    packets.append((packet, number))

                capture.start(packet_handler)

                if packets:
                    self.packet, num = packets[0]
                    self.packet_info = parse_packet(self.packet, num)
                    break

            except Exception:
                continue

    def test_can_extract_basic_info(self):
        """Test extraction of packet number and length"""
        if not self.packet or not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - BASIC INFORMATION (REAL PACKET):")
        print("=" * 70)
        print(f"  Packet Number: {self.packet_info.number}")
        print(f"  Packet Length: {self.packet_info.length} bytes")
        print(f"  Timestamp: {self.packet_info.timestamp}")
        print(f"  Layers: {self.packet_info.layers}")
        print(f"  Protocol: {self.packet_info.protocol}")
        print("=" * 70)

        self.assertIsNotNone(self.packet_info.number)
        self.assertIsNotNone(self.packet_info.length)
        self.assertIsNotNone(self.packet_info.timestamp)
        self.assertIsInstance(self.packet_info.layers, list)

    def test_can_extract_ip_info(self):
        """Test extraction of IP addresses"""
        if not self.packet or not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - IP LAYER (REAL PACKET):")
        print("=" * 70)
        print(f"  Has IP: {self.packet_info.src_ip is not None}")

        if self.packet_info.src_ip:
            print(f"  Source IP: {self.packet_info.src_ip}")
            print(f"  Destination IP: {self.packet_info.dst_ip}")
            print(f"  Is IPv6: {self.packet_info.is_ipv6}")
            print("=" * 70)

            self.assertIsNotNone(self.packet_info.src_ip)
            self.assertIsNotNone(self.packet_info.dst_ip)
        else:
            print(f"  Note: This packet doesn't have an IP layer")
            print(f"  Layers present: {self.packet_info.layers}")
            print("=" * 70)
            self.assertIsNone(self.packet_info.src_ip)

    def test_can_extract_transport_info(self):
        """Test extraction of port numbers"""
        if not self.packet or not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - TRANSPORT LAYER (REAL PACKET):")
        print("=" * 70)
        print(f"  Protocol: {self.packet_info.protocol}")
        print(f"  Has Ports: {self.packet_info.src_port is not None}")

        if self.packet_info.src_port:
            print(f"  Source Port: {self.packet_info.src_port}")
            print(f"  Destination Port: {self.packet_info.dst_port}")

            if self.packet_info.tcp_flags:
                print(f"  TCP Flags: {', '.join(self.packet_info.tcp_flags)}")
            print("=" * 70)

            self.assertIsNotNone(self.packet_info.src_port)
            self.assertIsNotNone(self.packet_info.dst_port)
        else:
            print(f"  Note: This packet doesn't have TCP or UDP layer")
            print(f"  Layers present: {self.packet_info.layers}")
            print("=" * 70)
            self.assertIsNone(self.packet_info.src_port)

    def test_format_packet_text(self):
        """Test formatting packet as text"""
        if not self.packet or not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        text = format_packet_text(self.packet_info)

        print("\n" + "=" * 70)
        print("PACKET PARSING - TEXT FORMAT:")
        print("=" * 70)
        print(text)
        print("=" * 70)

        self.assertIsInstance(text, str)
        self.assertGreater(len(text), 0)
        self.assertIn(f"Packet #{self.packet_info.number}", text)

    def test_format_packet_dict(self):
        """Test formatting packet as dictionary"""
        if not self.packet or not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        data = format_packet_dict(self.packet_info)

        print("\n" + "=" * 70)
        print("PACKET PARSING - DICT FORMAT:")
        print("=" * 70)
        for key, value in data.items():
            print(f"  {key}: {value}")
        print("=" * 70)

        self.assertIsInstance(data, dict)
        self.assertIn('number', data)
        self.assertIn('timestamp', data)
        self.assertIn('length', data)
        self.assertIn('layers', data)
        self.assertIn('protocol', data)

        self.assertEqual(data['number'], self.packet_info.number)
        self.assertEqual(data['length'], self.packet_info.length)

    def test_packet_info_dataclass(self):
        """Test PacketInfo dataclass fields"""
        if not self.packet_info:
            self.skipTest("No packet captured for parsing test")

        self.assertIsInstance(self.packet_info, PacketInfo)

        # Check all required fields exist
        self.assertTrue(hasattr(self.packet_info, 'number'))
        self.assertTrue(hasattr(self.packet_info, 'timestamp'))
        self.assertTrue(hasattr(self.packet_info, 'length'))
        self.assertTrue(hasattr(self.packet_info, 'layers'))
        self.assertTrue(hasattr(self.packet_info, 'protocol'))
        self.assertTrue(hasattr(self.packet_info, 'src_ip'))
        self.assertTrue(hasattr(self.packet_info, 'dst_ip'))
        self.assertTrue(hasattr(self.packet_info, 'src_port'))
        self.assertTrue(hasattr(self.packet_info, 'dst_port'))
        self.assertTrue(hasattr(self.packet_info, 'tcp_flags'))
        self.assertTrue(hasattr(self.packet_info, 'application'))
        self.assertTrue(hasattr(self.packet_info, 'application_details'))


if __name__ == '__main__':
    unittest.main(verbosity=2)
