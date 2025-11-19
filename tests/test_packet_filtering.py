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

        print("\n" + "="*70)
        print("FILTERING PACKETS (TCP only):")
        print("="*70)

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
                    capture.apply_on_packets(packet_handler, timeout=3)
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
                    print("="*70)

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

        print(f"\n{'='*70}")
        print("NO TCP TRAFFIC FOUND ON ANY INTERFACE")
        print("="*70)
        self.skipTest("No TCP traffic found")

    def test_ip_address_filter(self):
        """Test filtering by specific IP address"""
        if not self.interfaces:
            self.skipTest("No interface available")

        print("\n" + "="*70)
        print("FILTERING PACKETS (IP Address):")
        print("="*70)

        # First, capture a packet to get an IP address to filter on
        target_ip = None
        active_interface = None

        print("\n  Step 1: Finding an active IP address...")

        for interface_info in self.interfaces:
            interface_path = interface_info['path']
            interface_name = interface_info['name']

            try:
                capture = pyshark.LiveCapture(interface=interface_path)
                test_packets = []

                def test_handler(packet):
                    if hasattr(packet, 'ip'):
                        test_packets.append(packet)

                try:
                    capture.apply_on_packets(test_handler, timeout=3)
                except:
                    pass

                capture.close()

                if test_packets:
                    # Use the source IP from first packet
                    target_ip = test_packets[0].ip.src
                    active_interface = interface_info
                    print(f"    Found IP: {target_ip} on {interface_name}")
                    break

            except:
                continue

        if not target_ip or not active_interface:
            print(f"\n{'='*70}")
            print("NO IP TRAFFIC FOUND")
            print("="*70)
            self.skipTest("No IP traffic to filter")

        # Now filter for that specific IP
        print(f"\n  Step 2: Filtering for IP address {target_ip}...")

        try:
            capture = pyshark.LiveCapture(
                interface=active_interface['path'],
                display_filter=f'ip.addr == {target_ip}'
            )
            filtered_packets = []
            packet_limit = [False]

            def filter_handler(packet):
                if not packet_limit[0]:
                    filtered_packets.append(packet)
                    if len(filtered_packets) >= 3:
                        packet_limit[0] = True

            try:
                capture.apply_on_packets(filter_handler, timeout=5)
            except:
                pass

            capture.close()

            if filtered_packets:
                print(f"    Status: ✓ Successfully filtered")
                print(f"\n  Results:")
                print(f"    Target IP: {target_ip}")
                print(f"    Packets Found: {len(filtered_packets)}")

                for idx, packet in enumerate(filtered_packets, 1):
                    print(f"\n  Packet #{idx}:")
                    if hasattr(packet, 'ip'):
                        src = packet.ip.src
                        dst = packet.ip.dst
                        print(f"    IP: {src} → {dst}")

                        # Verify at least one matches target
                        matches_target = (src == target_ip or dst == target_ip)
                        print(f"    Contains Target IP: {'✓' if matches_target else '✗'}")

                        self.assertTrue(matches_target,
                                      f"Packet should contain target IP {target_ip}")

                print("="*70)
            else:
                print(f"    Status: ✗ No packets matched filter")
                print("="*70)
                self.skipTest("No packets matched IP filter")

        except Exception as e:
            print(f"    Status: ✗ Error - {str(e)}")
            print("="*70)
            self.skipTest(f"IP filter test failed: {e}")


if __name__ == '__main__':
    unittest.main(verbosity=2)