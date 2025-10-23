"""
Test Suite: Exporting and Storage
Tests the ability to export and read packet data
"""

import unittest
import os
import json
import tempfile
import pyshark
import subprocess
import re
import time


class TestExportingAndStorage(unittest.TestCase):
    """Test that we can save and load packet data"""

    def setUp(self):
        """Setup temp directory and capture a real packet"""
        self.temp_dir = tempfile.mkdtemp()
        self.test_file = os.path.join(self.temp_dir, 'test_capture.json')

        # Try to capture a real packet
        self.packet_data = None

        try:
            result = subprocess.run(['tshark', '-D'],
                                  capture_output=True,
                                  text=True,
                                  timeout=5)

            interfaces = []
            pattern = r'(\d+)\.\s+(.+?)\s+\((.+?)\)'

            for line in result.stdout.strip().split('\n'):
                match = re.match(pattern, line)
                if match:
                    number, device_path, friendly_name = match.groups()
                    interfaces.append({
                        'path': device_path,
                        'name': friendly_name
                    })

            # Try to capture a packet from any interface
            for interface_info in interfaces:
                capture = None
                try:
                    capture = pyshark.LiveCapture(interface=interface_info['path'])
                    packets_collected = []

                    def packet_handler(packet):
                        packets_collected.append(packet)

                    try:
                        capture.apply_on_packets(packet_handler, timeout=2)
                    except:
                        pass

                    if capture:
                        capture.close()
                        time.sleep(0.1)

                    # Convert first packet to dict for export
                    if packets_collected:
                        packet = packets_collected[0]
                        self.packet_data = {
                            'number': packet.number,
                            'timestamp': str(packet.sniff_time),
                            'length': packet.length,
                            'layers': [str(layer.layer_name) for layer in packet.layers]  # Convert to strings
                        }

                        # Add IP info if available
                        if hasattr(packet, 'ip'):
                            self.packet_data['src_ip'] = packet.ip.src
                            self.packet_data['dst_ip'] = packet.ip.dst

                        # Add transport info if available
                        if hasattr(packet, 'tcp'):
                            self.packet_data['protocol'] = 'TCP'
                            self.packet_data['src_port'] = packet.tcp.srcport
                            self.packet_data['dst_port'] = packet.tcp.dstport
                        elif hasattr(packet, 'udp'):
                            self.packet_data['protocol'] = 'UDP'
                            self.packet_data['src_port'] = packet.udp.srcport
                            self.packet_data['dst_port'] = packet.udp.dstport

                        break

                except:
                    if capture:
                        try:
                            capture.close()
                            time.sleep(0.1)
                        except:
                            pass
                    continue

        except:
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
        output.append(f"    Packet Number: {packet_data['number']}")
        output.append(f"    Timestamp: {packet_data['timestamp']}")
        output.append(f"    Length: {packet_data['length']} bytes")
        output.append(f"    Layers: {packet_data['layers']}")

        if 'src_ip' in packet_data and 'dst_ip' in packet_data:
            output.append(f"    Source IP: {packet_data['src_ip']}")
            output.append(f"    Destination IP: {packet_data['dst_ip']}")

        if 'protocol' in packet_data:
            output.append(f"    Protocol: {packet_data['protocol']}")
            output.append(f"    Source Port: {packet_data['src_port']}")
            output.append(f"    Destination Port: {packet_data['dst_port']}")

        return '\n'.join(output)

    def test_can_export_to_json(self):
        """Test exporting real packet data to JSON"""
        if not self.packet_data:
            self.skipTest("No packet captured for export test")

        print("\n" + "="*70)
        print("EXPORTING REAL PACKET DATA TO JSON:")
        print("="*70)
        print(f"  Export Path: {self.test_file}")
        print(self._format_packet_info(self.packet_data, "Original Packet Data"))

        # Export to JSON
        with open(self.test_file, 'w') as f:
            json.dump([self.packet_data], f, indent=2)

        file_size = os.path.getsize(self.test_file)
        print(f"\n  Export Status: ✓ Success")
        print(f"  File Size: {file_size} bytes")
        print("="*70)

        self.assertTrue(os.path.exists(self.test_file))
        self.assertGreater(file_size, 0)

    def test_can_read_exported_data(self):
        """Test reading exported real packet data"""
        if not self.packet_data:
            self.skipTest("No packet captured for import test")

        # Write real packet data
        with open(self.test_file, 'w') as f:
            json.dump([self.packet_data], f, indent=2)

        # Read it back
        with open(self.test_file, 'r') as f:
            loaded_data = json.load(f)

        loaded_packet = loaded_data[0]

        print("\n" + "="*70)
        print("READING EXPORTED REAL PACKET DATA:")
        print("="*70)
        print(f"  Import Path: {self.test_file}")

        # Show side-by-side comparison
        print("\n" + "-"*70)
        print("COMPARISON: ORIGINAL vs IMPORTED")
        print("-"*70)

        # Format both packets identically
        print(self._format_packet_info(self.packet_data, "ORIGINAL PACKET"))
        print(self._format_packet_info(loaded_packet, "IMPORTED PACKET"))

        # Detailed field comparison
        print("\n" + "-"*70)
        print("FIELD-BY-FIELD VERIFICATION:")
        print("-"*70)

        # Check each field
        fields_to_check = ['number', 'timestamp', 'length', 'layers']
        if 'src_ip' in self.packet_data:
            fields_to_check.extend(['src_ip', 'dst_ip'])
        if 'protocol' in self.packet_data:
            fields_to_check.extend(['protocol', 'src_port', 'dst_port'])

        all_match = True
        for field in fields_to_check:
            original = str(self.packet_data[field])
            imported = str(loaded_packet[field])
            match = original == imported
            all_match = all_match and match
            status = "✓" if match else "✗"
            print(f"  {field:20s} {status} {'Match' if match else 'MISMATCH'}")

        print("-"*70)
        print(f"\n  Overall Status: {'✓ All fields match perfectly!' if all_match else '✗ Some fields do not match'}")
        print("="*70)

        # Assertions
        self.assertEqual(len(loaded_data), 1)
        for field in fields_to_check:
            self.assertEqual(str(loaded_packet[field]), str(self.packet_data[field]),
                           f"Field '{field}' should match")


if __name__ == '__main__':
    unittest.main(verbosity=2)