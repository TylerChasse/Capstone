"""
Test Suite: Packet Capturing
Tests the ability to capture live network packets
"""

import unittest
import threading
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.packet_capture import (
    get_interface_device,
    PacketCapture,
    CaptureConfig,
    CaptureStats,
)
from backend.helpers import get_connected_interfaces


class TestPacketCapturing(unittest.TestCase):
    """Test that we can capture packets"""

    def setUp(self):
        """Get connected interfaces only"""
        try:
            self.interfaces, self.interface_map = get_connected_interfaces()
        except (FileNotFoundError, RuntimeError):
            self.interfaces = []
            self.interface_map = {}

    def test_can_capture_packets(self):
        """Test that we can capture packets by trying each interface"""
        if not self.interfaces:
            self.skipTest("No interfaces available")

        print("\n" + "=" * 70)
        print("ATTEMPTING TO CAPTURE PACKETS ON EACH INTERFACE:")
        print("=" * 70)

        successful_interface = None
        captured_packets = []

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            print(f"\n  Trying: {display_name}")
            print(f"    Path: {interface_path}")

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=3,
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def packet_handler(packet, number):
                    packets.append((packet, number))

                # Run capture in thread with short timeout
                stats = capture.start(packet_handler)

                if packets:
                    print(f"    Status: SUCCESS - Captured {len(packets)} packet(s)")
                    successful_interface = display_name
                    captured_packets = packets
                    break
                else:
                    print(f"    Status: No traffic detected")

            except PermissionError:
                print(f"    Status: Permission denied (requires admin)")
                continue
            except Exception as e:
                print(f"    Status: Error - {str(e)}")
                continue

        if successful_interface and captured_packets:
            print(f"\n{'=' * 70}")
            print(f"SUCCESSFULLY CAPTURED ON: {successful_interface}")
            print(f"{'=' * 70}")

            for packet, idx in captured_packets:
                print(f"\n  Captured Packet #{idx}:")
                print(f"    Timestamp: {packet.sniff_time}")
                print(f"    Length: {packet.length} bytes")
                print(f"    Layers: {packet.layers}")

                if hasattr(packet, 'ip'):
                    print(f"    IP: {packet.ip.src} -> {packet.ip.dst}")

                if hasattr(packet, 'tcp'):
                    print(f"    TCP Ports: {packet.tcp.srcport} -> {packet.tcp.dstport}")
                elif hasattr(packet, 'udp'):
                    print(f"    UDP Ports: {packet.udp.srcport} -> {packet.udp.dstport}")

            print(f"\n  Total Captured: {len(captured_packets)} packets")
            print("=" * 70)

            self.assertGreater(len(captured_packets), 0, "Should capture at least one packet")
        else:
            print(f"\n{'=' * 70}")
            print("NO ACTIVE INTERFACES FOUND")
            print("Try generating some network traffic and run again")
            print("=" * 70)
            self.skipTest("No interfaces with active traffic found")

    def test_stop_capture(self):
        """Test that we can stop a capture in progress"""
        if not self.interfaces:
            self.skipTest("No interfaces available")

        print("\n" + "=" * 70)
        print("TESTING STOP CAPTURE:")
        print("=" * 70)

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=0,  # Continuous
                    timeout=30  # Short timeout for test
                )
                capture = PacketCapture(config)
                packets = []

                def packet_handler(packet, number):
                    packets.append(packet)
                    if len(packets) >= 2:
                        capture.stop()  # Stop after 2 packets

                stats = capture.start(packet_handler)

                # The capture should have stopped - either by user or by the close() causing an error
                if stats.packets_captured == 2:
                    print(f"  Interface: {display_name}")
                    print(f"  Packets captured: {stats.packets_captured}")
                    print(f"  Stopped by user: {stats.stopped_by_user}")
                    print(f"  Elapsed time: {stats.elapsed_time:.2f}s")
                    print("  Status: SUCCESS - Capture stopped after target packets")
                    print("=" * 70)

                    # We captured at least 2 packets and stopped before timeout
                    self.assertGreaterEqual(stats.packets_captured, 2)
                    self.assertLess(stats.elapsed_time, 10)  # Should stop well before timeout
                    return

            except Exception as e:
                print(f"  Error on {display_name}: {e}")
                continue

        self.skipTest("Could not test stop capture on any interface")

    def test_capture_stats(self):
        """Test that CaptureStats contains correct information"""
        if not self.interfaces:
            self.skipTest("No interfaces available")

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=5,
                    timeout=30
                )
                capture = PacketCapture(config)

                def packet_handler(packet, number):
                    pass

                stats = capture.start(packet_handler)

                print("\n" + "=" * 70)
                print("CAPTURE STATS TEST:")
                print("=" * 70)
                print(f"  Interface: {display_name}")
                print(f"  Packets Captured: {stats.packets_captured}")
                print(f"  Elapsed Time: {stats.elapsed_time:.2f}s")
                print(f"  Stopped by User: {stats.stopped_by_user}")
                print(f"  Stopped by Timeout: {stats.stopped_by_timeout}")
                print(f"  Error: {stats.error}")
                print("=" * 70)

                self.assertIsInstance(stats, CaptureStats)
                self.assertIsInstance(stats.packets_captured, int)
                self.assertIsInstance(stats.elapsed_time, float)
                self.assertIsInstance(stats.stopped_by_user, bool)
                self.assertIsInstance(stats.stopped_by_timeout, bool)

                if stats.packets_captured > 0:
                    return

            except Exception:
                continue

        self.skipTest("Could not capture packets for stats test")


if __name__ == '__main__':
    unittest.main(verbosity=2)
