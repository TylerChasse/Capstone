"""
Test Suite: Packet Filtering
Tests the ability to filter packets using display filters
"""

import unittest
import pyshark
import subprocess
import re


class TestPacketFiltering(unittest.TestCase):
    """Test that we can filter packets"""

    def setUp(self):
        """Get first available interface"""
        try:
            result = subprocess.run(['tshark', '-D'],
                                    capture_output=True,
                                    text=True,
                                    timeout=5)

            self.interfaces = []
            pattern = r'(\d+)\.\s+(.+?)\s+\((.+?)\)'

            for line in result.stdout.strip().split('\n'):
                match = re.match(pattern, line)
                if match:
                    number, device_path, friendly_name = match.groups()
                    self.interfaces.append({
                        'number': number,
                        'path': device_path,
                        'name': friendly_name
                    })
        except:
            self.interfaces = []

    def test_can_apply_filter(self):
        """Test that display filters can be applied"""
        if not self.interfaces:
            self.skipTest("No interface available")

        print("\n" + "=" * 70)
        print("FILTERING PACKETS (TCP only):")
        print("=" * 70)

        # Try each interface until we find one with TCP traffic
        for interface_info in self.interfaces:
            interface_path = interface_info['path']
            interface_name = interface_info['name']

            print(f"\n  Trying: {interface_name}")

            try:
                capture = pyshark.LiveCapture(interface=interface_path,
                                              display_filter='tcp')
                packets = []
                packet_limit = [False]

                def packet_handler(packet):
                    if not packet_limit[0]:
                        packets.append(packet)
                        if len(packets) >= 2:
                            packet_limit[0] = True

                try:
                    capture.apply_on_packets(packet_handler, timeout=5)
                except:
                    pass

                capture.close()

                if packets:
                    print(f"    Status: ✓ Found TCP traffic")
                    for idx, packet in enumerate(packets, 1):
                        print(f"\n  Filtered Packet #{idx}:")
                        print(f"    Has TCP: {hasattr(packet, 'tcp')}")
                        if hasattr(packet, 'tcp'):
                            print(f"    TCP Ports: {packet.tcp.srcport} → {packet.tcp.dstport}")
                        if hasattr(packet, 'ip'):
                            print(f"    IP: {packet.ip.src} → {packet.ip.dst}")

                    print(f"\n  Total Filtered Packets: {len(packets)}")
                    print("=" * 70)

                    # All captured packets should have TCP layer
                    for packet in packets:
                        self.assertTrue(hasattr(packet, 'tcp'))
                    return
                else:
                    print(f"    Status: ✗ No TCP traffic")

            except PermissionError:
                print(f"    Status: ✗ Permission denied")
                continue
            except TimeoutError:
                print(f"    Status: ✗ Timeout")
                continue
            except Exception as e:
                print(f"    Status: ✗ Error - {str(e)}")
                continue

        print(f"\n{'=' * 70}")
        print("NO TCP TRAFFIC FOUND ON ANY INTERFACE")
        print("=" * 70)
        self.skipTest("No TCP traffic found")


if __name__ == '__main__':
    unittest.main(verbosity=2)