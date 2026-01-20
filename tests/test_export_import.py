"""
Test Suite: Exporting and Storage
Tests the ability to export and read packet data
"""

import unittest
import os
import json
import tempfile
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.packet_capture import (
    get_interface_device,
    PacketCapture,
    CaptureConfig,
    parse_packet,
    format_packet_dict,
)
from backend.helpers import get_connected_interfaces


class TestExportingAndStorage(unittest.TestCase):
    """Test that we can save and load packet data"""

    def setUp(self):
        """Setup temp directory and capture a real packet"""
        self.temp_dir = tempfile.mkdtemp()
        self.test_file = os.path.join(self.temp_dir, 'test_capture.json')

        # Try to capture a real packet
        self.packet_data = None

        try:
            interfaces, interface_map = get_connected_interfaces()

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
                        packet, num = packets[0]
                        packet_info = parse_packet(packet, num)
                        self.packet_data = format_packet_dict(packet_info)
                        break

                except Exception:
                    continue

        except (FileNotFoundError, RuntimeError):
            pass

    def tearDown(self):
        """Cleanup"""
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
        os.rmdir(self.temp_dir)

    def _format_packet_info(self, packet_data, title):
        """Format packet data for display"""
        output = []
        output.append(f"\n  {title}:")
        output.append(f"    Number: {packet_data.get('number')}")
        output.append(f"    Timestamp: {packet_data.get('timestamp')}")
        output.append(f"    Length: {packet_data.get('length')} bytes")
        output.append(f"    Layers: {packet_data.get('layers')}")
        output.append(f"    Protocol: {packet_data.get('protocol')}")

        if packet_data.get('network'):
            net = packet_data['network']
            output.append(f"    Source IP: {net.get('src_ip')}")
            output.append(f"    Destination IP: {net.get('dst_ip')}")

        if packet_data.get('transport'):
            transport = packet_data['transport']
            output.append(f"    Source Port: {transport.get('src_port')}")
            output.append(f"    Destination Port: {transport.get('dst_port')}")

        return '\n'.join(output)

    def test_can_export_to_json(self):
        """Test exporting real packet data to JSON"""
        if not self.packet_data:
            self.skipTest("No packet captured for export test")

        print("\n" + "=" * 70)
        print("EXPORTING REAL PACKET DATA TO JSON:")
        print("=" * 70)
        print(f"  Export Path: {self.test_file}")
        print(self._format_packet_info(self.packet_data, "Original Packet Data"))

        # Export to JSON
        with open(self.test_file, 'w') as f:
            json.dump([self.packet_data], f, indent=2)

        file_size = os.path.getsize(self.test_file)
        print(f"\n  Export Status: Success")
        print(f"  File Size: {file_size} bytes")
        print("=" * 70)

        self.assertTrue(os.path.exists(self.test_file))
        self.assertGreater(file_size, 0)

    def test_can_read_exported_data(self):
        """Test reading exported real packet data"""
        if not self.packet_data:
            self.skipTest("No packet captured for import test")

        # Write real packet data
        with open(self.test_file, 'w') as f:
            json.dump([self.packet_data], f, indent=2)

        # Get file size after export
        exported_file_size = os.path.getsize(self.test_file)

        # Read it back
        with open(self.test_file, 'r') as f:
            loaded_data = json.load(f)

        # Get file size after reading (should be same)
        imported_file_size = os.path.getsize(self.test_file)

        loaded_packet = loaded_data[0]

        print("\n" + "=" * 70)
        print("READING EXPORTED REAL PACKET DATA:")
        print("=" * 70)
        print(f"  Import Path: {self.test_file}")
        print(f"\n  File Size Verification:")
        print(f"    Exported File Size: {exported_file_size} bytes")
        print(f"    Imported File Size: {imported_file_size} bytes")
        match_status = "Yes" if exported_file_size == imported_file_size else "No"
        print(f"    Match: {match_status}")

        # Verify file sizes match
        self.assertEqual(exported_file_size, imported_file_size,
                         "File size should not change after reading")

        # Show side-by-side comparison
        print("\n" + "-" * 70)
        print("COMPARISON: ORIGINAL vs IMPORTED")
        print("-" * 70)

        # Format both packets identically
        print(self._format_packet_info(self.packet_data, "ORIGINAL PACKET"))
        print(self._format_packet_info(loaded_packet, "IMPORTED PACKET"))

        # Detailed field comparison
        print("\n" + "-" * 70)
        print("FIELD-BY-FIELD VERIFICATION:")
        print("-" * 70)

        # Check top-level fields
        fields_to_check = ['number', 'timestamp', 'length', 'layers', 'protocol']

        all_match = True
        for field in fields_to_check:
            original = str(self.packet_data.get(field))
            imported = str(loaded_packet.get(field))
            match = original == imported
            all_match = all_match and match
            status = "Match" if match else "MISMATCH"
            print(f"  {field:20s} {status}")

        print("-" * 70)
        overall_status = "All fields match perfectly!" if all_match else "Some fields do not match"
        print(f"\n  Overall Status: {overall_status}")
        print("=" * 70)

        # Assertions
        self.assertEqual(len(loaded_data), 1)
        for field in fields_to_check:
            self.assertEqual(str(loaded_packet.get(field)), str(self.packet_data.get(field)),
                             f"Field '{field}' should match")

    def test_format_packet_dict_structure(self):
        """Test that format_packet_dict produces correct structure"""
        if not self.packet_data:
            self.skipTest("No packet captured for structure test")

        print("\n" + "=" * 70)
        print("PACKET DICT STRUCTURE TEST:")
        print("=" * 70)

        # Check required top-level keys
        required_keys = ['number', 'timestamp', 'length', 'layers', 'protocol',
                         'network', 'transport', 'arp', 'application']

        print("\n  Checking required keys:")
        for key in required_keys:
            exists = key in self.packet_data
            status = "Present" if exists else "Missing"
            print(f"    {key}: {status}")
            self.assertIn(key, self.packet_data)

        print("=" * 70)

    def test_multiple_packets_export(self):
        """Test exporting multiple packets"""
        if not self.packet_data:
            self.skipTest("No packet captured for multi-export test")

        # Create multiple packet entries
        packets = [self.packet_data.copy() for _ in range(3)]
        for i, pkt in enumerate(packets, 1):
            pkt['number'] = i

        # Export
        with open(self.test_file, 'w') as f:
            json.dump(packets, f, indent=2)

        # Read back
        with open(self.test_file, 'r') as f:
            loaded = json.load(f)

        print("\n" + "=" * 70)
        print("MULTIPLE PACKETS EXPORT TEST:")
        print("=" * 70)
        print(f"  Packets exported: {len(packets)}")
        print(f"  Packets loaded: {len(loaded)}")
        print(f"  Match: {'Yes' if len(packets) == len(loaded) else 'No'}")
        print("=" * 70)

        self.assertEqual(len(loaded), 3)
        for i, pkt in enumerate(loaded, 1):
            self.assertEqual(pkt['number'], i)


if __name__ == '__main__':
    unittest.main(verbosity=2)
