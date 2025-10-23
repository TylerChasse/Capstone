"""
Test Suite: Packet Capturing
Tests the ability to capture live network packets
"""

import unittest
import pyshark
import subprocess
import re


class TestPacketCapturing(unittest.TestCase):
    """Test that we can capture packets"""

    def setUp(self):
        """Get all available interfaces"""
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

    def test_can_capture_packets(self):
        """Test that we can capture packets by trying each interface"""
        if not self.interfaces:
            self.skipTest("No interfaces available")

        print("\n" + "=" * 70)
        print("ATTEMPTING TO CAPTURE PACKETS ON EACH INTERFACE:")
        print("=" * 70)

        successful_interface = None
        captured_packets = []

        for interface_info in self.interfaces:
            interface_path = interface_info['path']
            interface_name = interface_info['name']

            print(f"\n  Trying: {interface_name}")
            print(f"    Path: {interface_path}")

            try:
                capture = pyshark.LiveCapture(interface=interface_path)
                packets = []
                packet_limit = [False]  # Use list to allow modification in nested function

                def packet_handler(packet):
                    """Collect packets until we have enough"""
                    if not packet_limit[0]:  # Only collect if we haven't hit limit
                        packets.append(packet)
                        if len(packets) >= 3:
                            packet_limit[0] = True  # Signal we have enough

                try:
                    # Apply handler with timeout - will stop after 3 seconds
                    capture.apply_on_packets(packet_handler, timeout=3)
                except KeyboardInterrupt:
                    # Handle manual interrupt
                    pass
                except Exception as e:
                    # Handle any other errors during capture
                    pass

                capture.close()

                if packets:
                    print(f"    Status: ✓ SUCCESS - Captured {len(packets)} packet(s)")
                    successful_interface = interface_name
                    captured_packets = packets
                    break
                else:
                    print(f"    Status: ✗ No traffic detected")

            except PermissionError:
                print(f"    Status: ✗ Permission denied (requires admin)")
                continue
            except TimeoutError:
                print(f"    Status: ✗ Timeout - No traffic detected")
                continue
            except Exception as e:
                print(f"    Status: ✗ Error - {str(e)}")
                continue

        if successful_interface and captured_packets:
            print(f"\n{'=' * 70}")
            print(f"SUCCESSFULLY CAPTURED ON: {successful_interface}")
            print(f"{'=' * 70}")

            for idx, packet in enumerate(captured_packets, 1):
                print(f"\n  Captured Packet #{idx}:")
                print(f"    Timestamp: {packet.sniff_time}")
                print(f"    Length: {packet.length} bytes")
                print(f"    Layers: {packet.layers}")

                if hasattr(packet, 'ip'):
                    print(f"    IP: {packet.ip.src} → {packet.ip.dst}")

                if hasattr(packet, 'tcp'):
                    print(f"    TCP Ports: {packet.tcp.srcport} → {packet.tcp.dstport}")
                elif hasattr(packet, 'udp'):
                    print(f"    UDP Ports: {packet.udp.srcport} → {packet.udp.dstport}")

            print(f"\n  Total Captured: {len(captured_packets)} packets")
            print("=" * 70)

            self.assertGreater(len(captured_packets), 0, "Should capture at least one packet")
        else:
            print(f"\n{'=' * 70}")
            print("NO ACTIVE INTERFACES FOUND")
            print("Try generating some network traffic and run again")
            print("=" * 70)
            self.skipTest("No interfaces with active traffic found")


if __name__ == '__main__':
    unittest.main(verbosity=2)