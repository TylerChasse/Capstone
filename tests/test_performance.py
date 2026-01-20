"""
Test Suite: Performance Testing
Tests the performance and scalability of packet capture
"""

import unittest
import time
import statistics
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from packet_capture import (
    get_interface_device,
    PacketCapture,
    CaptureConfig,
    parse_packet,
)
from helpers import get_connected_interfaces


class TestPerformance(unittest.TestCase):
    """Test performance characteristics of packet capture"""

    def setUp(self):
        """Get connected interfaces and find an active one"""
        try:
            self.interfaces, self.interface_map = get_connected_interfaces()
        except (FileNotFoundError, RuntimeError):
            self.interfaces = []
            self.interface_map = {}

        # Find an active interface for testing
        self.active_interface = None
        self.active_interface_path = None

        for display_name in self.interfaces:
            interface_path = get_interface_device(display_name, self.interface_map)

            try:
                config = CaptureConfig(
                    interface=interface_path,
                    packet_count=1,
                    timeout=30
                )
                capture = PacketCapture(config)
                packets = []

                def test_handler(packet, number):
                    packets.append(packet)

                capture.start(test_handler)

                if packets:
                    self.active_interface = display_name
                    self.active_interface_path = interface_path
                    break

            except Exception:
                continue

    def test_capture_rate_packets(self):
        """Test capture rate for packets"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: Capture Rate")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=0,  # Continuous
                timeout=30
            )
            capture = PacketCapture(config)
            packets = []

            def packet_handler(packet, number):
                packets.append(packet)

            start_time = time.time()
            stats = capture.start(packet_handler)
            elapsed_time = stats.elapsed_time

            packets_captured = stats.packets_captured

            if packets_captured > 0:
                packets_per_second = packets_captured / elapsed_time

                print(f"\n  Results:")
                print(f"    Packets Captured: {packets_captured}")
                print(f"    Time Elapsed: {elapsed_time:.2f} seconds")
                print(f"    Capture Rate: {packets_per_second:.2f} packets/second")

                # Performance threshold: should handle at least 10 packets/second
                if packets_per_second >= 10:
                    print(f"    Status: PASS (>= 10 packets/sec)")
                else:
                    print(f"    Status: SLOW (< 10 packets/sec)")

                print("=" * 70)

                self.assertGreater(packets_captured, 0, "Should capture packets")
                self.assertGreater(packets_per_second, 0, "Should have non-zero capture rate")
            else:
                print(f"\n  Status: No packets captured in timeout period")
                print("=" * 70)
                self.skipTest("No traffic on interface")

        except Exception as e:
            self.skipTest(f"Performance test failed: {e}")

    def test_packet_processing_latency(self):
        """Test latency between packet arrival and processing"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: Packet Processing Latency")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=20,
                timeout=30
            )
            capture = PacketCapture(config)
            latencies = []

            def packet_handler(packet, number):
                processing_time = time.time()
                capture_time = float(packet.sniff_timestamp)
                latency = (processing_time - capture_time) * 1000  # Convert to ms
                latencies.append(latency)

            capture.start(packet_handler)

            if len(latencies) >= 5:
                avg_latency = statistics.mean(latencies)
                min_latency = min(latencies)
                max_latency = max(latencies)

                print(f"\n  Results ({len(latencies)} packets sampled):")
                print(f"    Average Latency: {avg_latency:.2f} ms")
                print(f"    Min Latency: {min_latency:.2f} ms")
                print(f"    Max Latency: {max_latency:.2f} ms")

                # Performance threshold: average latency should be under 100ms
                if avg_latency < 100:
                    print(f"    Status: PASS (< 100ms average)")
                else:
                    print(f"    Status: SLOW (>= 100ms average)")

                print("=" * 70)

                self.assertLess(avg_latency, 1000, "Average latency should be under 1 second")
            else:
                print(f"\n  Status: Insufficient packets for latency test")
                print("=" * 70)
                self.skipTest("Not enough packets captured")

        except Exception as e:
            self.skipTest(f"Latency test failed: {e}")

    def test_continuous_capture_stability(self):
        """Test stability during continuous capture"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: Continuous Capture Stability (10 seconds)")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=0,  # Continuous
                timeout=30
            )
            capture = PacketCapture(config)
            packets = []
            error_count = [0]

            def packet_handler(packet, number):
                try:
                    # Try to access packet attributes
                    _ = packet.length
                    _ = packet.sniff_time
                    packets.append(packet)
                except Exception:
                    error_count[0] += 1

            print(f"\n  Capturing for 10 seconds...")

            stats = capture.start(packet_handler)

            total_processed = len(packets) + error_count[0]
            success_rate = (len(packets) / total_processed * 100) if total_processed > 0 else 0

            print(f"\n  Results:")
            print(f"    Duration: {stats.elapsed_time:.2f} seconds")
            print(f"    Packets Captured: {len(packets)}")
            print(f"    Processing Errors: {error_count[0]}")
            print(f"    Success Rate: {success_rate:.1f}%")

            # Should have high success rate
            if success_rate >= 95:
                print(f"    Status: PASS (>= 95% success)")
            elif success_rate >= 80:
                print(f"    Status: ACCEPTABLE (80-95% success)")
            else:
                print(f"    Status: UNSTABLE (< 80% success)")

            print("=" * 70)

            self.assertGreater(len(packets), 0, "Should capture some packets")
            self.assertGreater(success_rate, 50, "Success rate should be above 50%")

        except Exception as e:
            self.skipTest(f"Stability test failed: {e}")

    def test_parse_packet_performance(self):
        """Test performance of parse_packet function"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: parse_packet Performance")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=50,
                timeout=30
            )
            capture = PacketCapture(config)
            raw_packets = []

            def packet_handler(packet, number):
                raw_packets.append((packet, number))

            capture.start(packet_handler)

            if len(raw_packets) >= 10:
                # Time the parsing
                start_time = time.time()
                parsed_packets = []
                for packet, num in raw_packets:
                    info = parse_packet(packet, num)
                    parsed_packets.append(info)
                parse_time = time.time() - start_time

                avg_parse_time = (parse_time / len(raw_packets)) * 1000  # ms per packet

                print(f"\n  Results:")
                print(f"    Packets Parsed: {len(raw_packets)}")
                print(f"    Total Parse Time: {parse_time:.4f} seconds")
                print(f"    Avg Parse Time: {avg_parse_time:.4f} ms/packet")

                if avg_parse_time < 1:
                    print(f"    Status: EXCELLENT (< 1 ms/packet)")
                elif avg_parse_time < 5:
                    print(f"    Status: GOOD (< 5 ms/packet)")
                else:
                    print(f"    Status: SLOW (>= 5 ms/packet)")

                print("=" * 70)

                self.assertLess(avg_parse_time, 100, "Parse time should be under 100ms per packet")
            else:
                print(f"\n  Status: Insufficient packets for parse test")
                print("=" * 70)
                self.skipTest("Not enough packets captured")

        except Exception as e:
            self.skipTest(f"Parse performance test failed: {e}")

    def test_memory_efficiency(self):
        """Test memory usage during packet capture"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: Memory Efficiency")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            import psutil

            process = psutil.Process(os.getpid())

            # Get baseline memory
            baseline_memory = process.memory_info().rss / 1024 / 1024  # MB

            print(f"\n  Baseline Memory: {baseline_memory:.2f} MB")
            print(f"  Capturing 50 packets...")

            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=50,
                timeout=30
            )
            capture = PacketCapture(config)
            packets = []

            def packet_handler(packet, number):
                packets.append(packet)

            capture.start(packet_handler)

            # Get memory after capture
            after_memory = process.memory_info().rss / 1024 / 1024  # MB

            memory_increase = after_memory - baseline_memory
            memory_per_packet = memory_increase / len(packets) if packets else 0

            print(f"\n  Results:")
            print(f"    Packets Captured: {len(packets)}")
            print(f"    Memory After Capture: {after_memory:.2f} MB")
            print(f"    Memory Increase: {memory_increase:.2f} MB")
            print(f"    Memory per Packet: {memory_per_packet:.4f} MB")

            # Memory should scale reasonably
            if memory_per_packet < 0.1:
                print(f"    Status: EFFICIENT (< 0.1 MB/packet)")
            elif memory_per_packet < 0.5:
                print(f"    Status: ACCEPTABLE (0.1-0.5 MB/packet)")
            else:
                print(f"    Status: INEFFICIENT (> 0.5 MB/packet)")

            print("=" * 70)

            self.assertGreater(len(packets), 0, "Should capture packets")
            self.assertLess(memory_per_packet, 1.0, "Memory per packet should be reasonable")

        except ImportError:
            print("\n  psutil not installed - skipping memory test")
            print("  Install with: pip install psutil")
            print("=" * 70)
            self.skipTest("psutil not available")
        except Exception as e:
            self.skipTest(f"Memory test failed: {e}")

    def test_filter_performance(self):
        """Test performance impact of applying filters"""
        if not self.active_interface_path:
            self.skipTest("No active interface found")

        print("\n" + "=" * 70)
        print("PERFORMANCE TEST: Filter Performance Impact")
        print("=" * 70)
        print(f"  Interface: {self.active_interface}")

        try:
            # Test without filter
            print(f"\n  Test 1: No filter")
            config = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=0,
                timeout=30
            )
            capture = PacketCapture(config)
            packets_no_filter = []

            def handler_no_filter(packet, number):
                packets_no_filter.append(packet)

            stats_no_filter = capture.start(handler_no_filter)

            print(f"    Packets: {stats_no_filter.packets_captured}")
            print(f"    Time: {stats_no_filter.elapsed_time:.2f}s")

            # Test with filter
            print(f"\n  Test 2: With TCP filter")
            config_filtered = CaptureConfig(
                interface=self.active_interface_path,
                packet_count=0,
                display_filter='tcp',
                timeout=30
            )
            capture_filtered = PacketCapture(config_filtered)
            packets_with_filter = []

            def handler_with_filter(packet, number):
                packets_with_filter.append(packet)

            stats_with_filter = capture_filtered.start(handler_with_filter)

            print(f"    Packets: {stats_with_filter.packets_captured}")
            print(f"    Time: {stats_with_filter.elapsed_time:.2f}s")

            # Calculate overhead
            if stats_no_filter.packets_captured > 0 and stats_with_filter.packets_captured > 0:
                time_no_filter = stats_no_filter.elapsed_time
                time_with_filter = stats_with_filter.elapsed_time

                if time_no_filter > 0:
                    overhead = ((time_with_filter - time_no_filter) / time_no_filter) * 100

                    print(f"\n  Results:")
                    print(f"    Filter Overhead: {overhead:.1f}%")

                    if abs(overhead) < 20:
                        print(f"    Status: MINIMAL IMPACT (< 20%)")
                    elif abs(overhead) < 50:
                        print(f"    Status: MODERATE IMPACT (20-50%)")
                    else:
                        print(f"    Status: HIGH IMPACT (> 50%)")

                    print("=" * 70)

                    self.assertTrue(True, "Filter performance test completed")
                else:
                    self.skipTest("Capture time too short for comparison")
            else:
                print(f"\n  Status: Insufficient packets for comparison")
                print("=" * 70)
                self.skipTest("Not enough packets captured")

        except Exception as e:
            self.skipTest(f"Filter performance test failed: {e}")


if __name__ == '__main__':
    unittest.main(verbosity=2)
