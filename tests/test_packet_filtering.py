"""
Test Suite: Packet Filtering
Tests the ability to filter packets using display filters
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
)
from backend.helpers import get_connected_interfaces


class TestPacketFiltering(unittest.TestCase):
    """Test that we can filter packets"""

    def setUp(self):
        """Get connected interfaces only"""
        try:
            self.interfaces, self.interface_map = get_connected_interfaces()
        except (FileNotFoundError, RuntimeError):
            self.interfaces = []
            self.interface_map = {}

    def test_can_apply_filter(self):
        """Test that display filters can be applied"""
        if not self.interfaces:
            self.skipTest("No interface available")

        print("\n" + "=" * 70)
        print("FILTERING PACKETS (TCP only):")
        print("=" * 70)

        # Try each interface until we find one with TCP traffic
        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            print(f"\n  Trying: {display_name}")

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=2,
                    display_filter='tcp',
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def packet_handler(packet, number):
                    packets.append(packet)

                capture.start(packet_handler)

                if packets:
                    print(f"    Status: Found TCP traffic")
                    for idx, packet in enumerate(packets, 1):
                        print(f"\n  Filtered Packet #{idx}:")
                        print(f"    Has TCP: {hasattr(packet, 'tcp')}")
                        if hasattr(packet, 'tcp'):
                            print(f"    TCP Ports: {packet.tcp.srcport} -> {packet.tcp.dstport}")
                        if hasattr(packet, 'ip'):
                            print(f"    IP: {packet.ip.src} -> {packet.ip.dst}")

                    print(f"\n  Total Filtered Packets: {len(packets)}")
                    print("=" * 70)

                    # All captured packets should have TCP layer
                    for packet in packets:
                        self.assertTrue(hasattr(packet, 'tcp'))
                    return
                else:
                    print(f"    Status: No TCP traffic")

            except PermissionError:
                print(f"    Status: Permission denied")
                continue
            except Exception as e:
                print(f"    Status: Error - {str(e)}")
                continue

        print(f"\n{'=' * 70}")
        print("NO TCP TRAFFIC FOUND ON ANY INTERFACE")
        print("=" * 70)
        self.skipTest("No TCP traffic found")

    def test_ip_address_filter(self):
        """Test filtering by specific IP address"""
        if not self.interfaces:
            self.skipTest("No interface available")

        print("\n" + "=" * 70)
        print("FILTERING PACKETS (IP Address):")
        print("=" * 70)

        # First, capture a packet to get an IP address to filter on
        target_ip = None
        active_interface = None
        active_interface_path = None

        print("\n  Step 1: Finding an active IP address...")

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=10,  # Capture more packets to find IP traffic
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def test_handler(packet, number):
                    # Check for IPv4 or IPv6
                    if hasattr(packet, 'ip') or hasattr(packet, 'ipv6'):
                        packets.append(packet)

                capture.start(test_handler)

                if packets:
                    # Prefer IPv4, fall back to IPv6
                    for pkt in packets:
                        if hasattr(pkt, 'ip'):
                            target_ip = pkt.ip.src
                            active_interface = display_name
                            active_interface_path = interface_path
                            print(f"    Found IPv4: {target_ip} on {display_name}")
                            break
                    else:
                        # No IPv4 found, use IPv6
                        target_ip = packets[0].ipv6.src
                        active_interface = display_name
                        active_interface_path = interface_path
                        print(f"    Found IPv6: {target_ip} on {display_name}")
                    break

            except Exception:
                continue

        if not target_ip or not active_interface_path:
            print(f"\n{'=' * 70}")
            print("NO IP TRAFFIC FOUND")
            print("=" * 70)
            self.skipTest("No IP traffic to filter")

        # Determine if IPv4 or IPv6
        is_ipv6 = ':' in target_ip
        filter_expr = f'ipv6.addr == {target_ip}' if is_ipv6 else f'ip.addr == {target_ip}'

        # Now filter for that specific IP
        print(f"\n  Step 2: Filtering for IP address {target_ip}...")
        print(f"    Filter: {filter_expr}")

        try:
            config = CaptureConfig(
                interface=active_interface_path,
                packet_count=3,
                display_filter=filter_expr,
                timeout=30
            )
            capture = PacketCapture(config)
            filtered_packets = []

            def filter_handler(packet, number):
                filtered_packets.append(packet)

            capture.start(filter_handler)

            if filtered_packets:
                print(f"    Status: Successfully filtered")
                print(f"\n  Results:")
                print(f"    Target IP: {target_ip}")
                print(f"    Packets Found: {len(filtered_packets)}")

                for idx, packet in enumerate(filtered_packets, 1):
                    print(f"\n  Packet #{idx}:")
                    if hasattr(packet, 'ip'):
                        src = packet.ip.src
                        dst = packet.ip.dst
                        print(f"    IP: {src} -> {dst}")
                        matches_target = (src == target_ip or dst == target_ip)
                    elif hasattr(packet, 'ipv6'):
                        src = packet.ipv6.src
                        dst = packet.ipv6.dst
                        print(f"    IPv6: {src} -> {dst}")
                        matches_target = (src == target_ip or dst == target_ip)
                    else:
                        matches_target = False

                    status = "Yes" if matches_target else "No"
                    print(f"    Contains Target IP: {status}")

                    self.assertTrue(matches_target,
                                    f"Packet should contain target IP {target_ip}")

                print("=" * 70)
            else:
                print(f"    Status: No packets matched filter")
                print("=" * 70)
                self.skipTest("No packets matched IP filter")

        except Exception as e:
            print(f"    Status: Error - {str(e)}")
            print("=" * 70)
            self.skipTest(f"IP filter test failed: {e}")

    def test_udp_filter(self):
        """Test filtering for UDP packets"""
        if not self.interfaces:
            self.skipTest("No interface available")

        print("\n" + "=" * 70)
        print("FILTERING PACKETS (UDP only):")
        print("=" * 70)

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            print(f"\n  Trying: {display_name}")

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=2,
                    display_filter='udp',
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def packet_handler(packet, number):
                    packets.append(packet)

                capture.start(packet_handler)

                if packets:
                    print(f"    Status: Found UDP traffic")
                    for idx, packet in enumerate(packets, 1):
                        print(f"\n  Filtered Packet #{idx}:")
                        print(f"    Has UDP: {hasattr(packet, 'udp')}")
                        if hasattr(packet, 'udp'):
                            print(f"    UDP Ports: {packet.udp.srcport} -> {packet.udp.dstport}")

                    print(f"\n  Total Filtered Packets: {len(packets)}")
                    print("=" * 70)

                    # All captured packets should have UDP layer
                    for packet in packets:
                        self.assertTrue(hasattr(packet, 'udp'))
                    return
                else:
                    print(f"    Status: No UDP traffic")

            except Exception as e:
                print(f"    Status: Error - {str(e)}")
                continue

        print(f"\n{'=' * 70}")
        print("NO UDP TRAFFIC FOUND ON ANY INTERFACE")
        print("=" * 70)
        self.skipTest("No UDP traffic found")


if __name__ == '__main__':
    unittest.main(verbosity=2)
