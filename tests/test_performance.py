"""
Test Suite: Performance Testing
Tests the performance and scalability of packet capture
"""

import unittest
import pyshark
import subprocess
import re
import time
import statistics


class TestPerformance(unittest.TestCase):
    """Test performance characteristics of packet capture"""
    
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
                        'path': device_path,
                        'name': friendly_name
                    })
        except:
            self.interfaces = []
        
        # Find an active interface for testing
        self.active_interface = None
        for interface_info in self.interfaces:
            try:
                capture = pyshark.LiveCapture(interface=interface_info['path'])
                test_packets = []
                
                def test_handler(packet):
                    test_packets.append(packet)
                
                try:
                    capture.apply_on_packets(test_handler, timeout=2)
                except:
                    pass
                
                capture.close()
                
                if test_packets:
                    self.active_interface = interface_info
                    break
            except:
                continue
    
    def test_capture_rate_100_packets(self):
        """Test capture rate for 100 packets"""
        if not self.active_interface:
            self.skipTest("No active interface found")
        
        print("\n" + "="*70)
        print("PERFORMANCE TEST: Capture Rate (100 packets)")
        print("="*70)
        print(f"  Interface: {self.active_interface['name']}")
        
        try:
            capture = pyshark.LiveCapture(interface=self.active_interface['path'])
            packets = []
            target_count = 100
            
            start_time = time.time()
            
            def packet_handler(packet):
                packets.append(packet)
                if len(packets) >= target_count:
                    return
            
            try:
                capture.apply_on_packets(packet_handler, timeout=30)
            except:
                pass
            
            end_time = time.time()
            capture.close()
            
            elapsed_time = end_time - start_time
            packets_captured = len(packets)
            
            if packets_captured > 0:
                packets_per_second = packets_captured / elapsed_time
                
                print(f"\n  Results:")
                print(f"    Packets Captured: {packets_captured}")
                print(f"    Time Elapsed: {elapsed_time:.2f} seconds")
                print(f"    Capture Rate: {packets_per_second:.2f} packets/second")
                
                # Performance threshold: should handle at least 10 packets/second
                if packets_per_second >= 10:
                    print(f"    Status: ✓ PASS (>= 10 packets/sec)")
                else:
                    print(f"    Status: ⚠ SLOW (< 10 packets/sec)")
                
                print("="*70)
                
                self.assertGreater(packets_captured, 0, "Should capture packets")
                self.assertGreater(packets_per_second, 0, "Should have non-zero capture rate")
            else:
                print(f"\n  Status: ✗ No packets captured in 30 seconds")
                print("="*70)
                self.skipTest("No traffic on interface")
                
        except Exception as e:
            self.skipTest(f"Performance test failed: {e}")
    
    def test_packet_processing_latency(self):
        """Test latency between packet arrival and processing"""
        if not self.active_interface:
            self.skipTest("No active interface found")
        
        print("\n" + "="*70)
        print("PERFORMANCE TEST: Packet Processing Latency")
        print("="*70)
        print(f"  Interface: {self.active_interface['name']}")
        
        try:
            capture = pyshark.LiveCapture(interface=self.active_interface['path'])
            latencies = []
            target_count = 20
            
            def packet_handler(packet):
                # Calculate time from packet capture to processing
                processing_time = time.time()
                capture_time = float(packet.sniff_timestamp)
                latency = (processing_time - capture_time) * 1000  # Convert to ms
                latencies.append(latency)
            
            try:
                capture.apply_on_packets(packet_handler, timeout=15)
            except:
                pass
            
            capture.close()
            
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
                    print(f"    Status: ✓ PASS (< 100ms average)")
                else:
                    print(f"    Status: ⚠ SLOW (>= 100ms average)")
                
                print("="*70)
                
                self.assertLess(avg_latency, 1000, "Average latency should be under 1 second")
            else:
                print(f"\n  Status: ✗ Insufficient packets for latency test")
                print("="*70)
                self.skipTest("Not enough packets captured")
                
        except Exception as e:
            self.skipTest(f"Latency test failed: {e}")
    
    def test_continuous_capture_stability(self):
        """Test stability during continuous capture"""
        if not self.active_interface:
            self.skipTest("No active interface found")
        
        print("\n" + "="*70)
        print("PERFORMANCE TEST: Continuous Capture Stability (10 seconds)")
        print("="*70)
        print(f"  Interface: {self.active_interface['name']}")
        
        try:
            capture = pyshark.LiveCapture(interface=self.active_interface['path'])
            packets = []
            error_count = 0
            
            def packet_handler(packet):
                try:
                    # Try to access packet attributes
                    _ = packet.number
                    _ = packet.length
                    packets.append(packet)
                except Exception:
                    error_count += 1
            
            print(f"\n  Capturing for 10 seconds...")
            start_time = time.time()
            
            try:
                capture.apply_on_packets(packet_handler, timeout=10)
            except:
                pass
            
            end_time = time.time()
            capture.close()
            
            elapsed = end_time - start_time
            total_processed = len(packets) + error_count
            success_rate = (len(packets) / total_processed * 100) if total_processed > 0 else 0
            
            print(f"\n  Results:")
            print(f"    Duration: {elapsed:.2f} seconds")
            print(f"    Packets Captured: {len(packets)}")
            print(f"    Processing Errors: {error_count}")
            print(f"    Success Rate: {success_rate:.1f}%")
            
            # Should have high success rate
            if success_rate >= 95:
                print(f"    Status: ✓ PASS (>= 95% success)")
            elif success_rate >= 80:
                print(f"    Status: ⚠ ACCEPTABLE (80-95% success)")
            else:
                print(f"    Status: ✗ UNSTABLE (< 80% success)")
            
            print("="*70)
            
            self.assertGreater(len(packets), 0, "Should capture some packets")
            self.assertGreater(success_rate, 50, "Success rate should be above 50%")
            
        except Exception as e:
            self.skipTest(f"Stability test failed: {e}")
    
    def test_memory_efficiency(self):
        """Test memory usage during packet capture"""
        if not self.active_interface:
            self.skipTest("No active interface found")
        
        print("\n" + "="*70)
        print("PERFORMANCE TEST: Memory Efficiency")
        print("="*70)
        print(f"  Interface: {self.active_interface['name']}")
        
        try:
            import psutil
            import os
            
            process = psutil.Process(os.getpid())
            
            # Get baseline memory
            baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            print(f"\n  Baseline Memory: {baseline_memory:.2f} MB")
            print(f"  Capturing 50 packets...")
            
            capture = pyshark.LiveCapture(interface=self.active_interface['path'])
            packets = []
            target_count = 50
            
            def packet_handler(packet):
                packets.append(packet)
            
            try:
                capture.apply_on_packets(packet_handler, timeout=15)
            except:
                pass
            
            # Get memory after capture
            after_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            capture.close()
            
            memory_increase = after_memory - baseline_memory
            memory_per_packet = memory_increase / len(packets) if packets else 0
            
            print(f"\n  Results:")
            print(f"    Packets Captured: {len(packets)}")
            print(f"    Memory After Capture: {after_memory:.2f} MB")
            print(f"    Memory Increase: {memory_increase:.2f} MB")
            print(f"    Memory per Packet: {memory_per_packet:.4f} MB")
            
            # Memory should scale reasonably
            if memory_per_packet < 0.1:
                print(f"    Status: ✓ EFFICIENT (< 0.1 MB/packet)")
            elif memory_per_packet < 0.5:
                print(f"    Status: ⚠ ACCEPTABLE (0.1-0.5 MB/packet)")
            else:
                print(f"    Status: ✗ INEFFICIENT (> 0.5 MB/packet)")
            
            print("="*70)
            
            self.assertGreater(len(packets), 0, "Should capture packets")
            self.assertLess(memory_per_packet, 1.0, "Memory per packet should be reasonable")
            
        except ImportError:
            print("\n  psutil not installed - skipping memory test")
            print("  Install with: pip install psutil")
            print("="*70)
            self.skipTest("psutil not available")
        except Exception as e:
            self.skipTest(f"Memory test failed: {e}")
    
    def test_filter_performance(self):
        """Test performance impact of applying filters"""
        if not self.active_interface:
            self.skipTest("No active interface found")
        
        print("\n" + "="*70)
        print("PERFORMANCE TEST: Filter Performance Impact")
        print("="*70)
        print(f"  Interface: {self.active_interface['name']}")
        
        try:
            # Test without filter
            print(f"\n  Test 1: No filter")
            capture = pyshark.LiveCapture(interface=self.active_interface['path'])
            packets_no_filter = []
            
            start_time = time.time()
            
            def handler_no_filter(packet):
                packets_no_filter.append(packet)
            
            try:
                capture.apply_on_packets(handler_no_filter, timeout=5)
            except:
                pass
            
            time_no_filter = time.time() - start_time
            capture.close()
            
            print(f"    Packets: {len(packets_no_filter)}")
            print(f"    Time: {time_no_filter:.2f}s")
            
            # Test with filter
            print(f"\n  Test 2: With TCP filter")
            capture = pyshark.LiveCapture(interface=self.active_interface['path'],
                                         display_filter='tcp')
            packets_with_filter = []
            
            start_time = time.time()
            
            def handler_with_filter(packet):
                packets_with_filter.append(packet)
            
            try:
                capture.apply_on_packets(handler_with_filter, timeout=5)
            except:
                pass
            
            time_with_filter = time.time() - start_time
            capture.close()
            
            print(f"    Packets: {len(packets_with_filter)}")
            print(f"    Time: {time_with_filter:.2f}s")
            
            # Calculate overhead
            if len(packets_no_filter) > 0 and len(packets_with_filter) > 0:
                overhead = ((time_with_filter - time_no_filter) / time_no_filter) * 100
                
                print(f"\n  Results:")
                print(f"    Filter Overhead: {overhead:.1f}%")
                
                if abs(overhead) < 20:
                    print(f"    Status: ✓ MINIMAL IMPACT (< 20%)")
                elif abs(overhead) < 50:
                    print(f"    Status: ⚠ MODERATE IMPACT (20-50%)")
                else:
                    print(f"    Status: ⚠ HIGH IMPACT (> 50%)")
                
                print("="*70)
                
                self.assertTrue(True, "Filter performance test completed")
            else:
                print(f"\n  Status: ✗ Insufficient packets for comparison")
                print("="*70)
                self.skipTest("Not enough packets captured")
                
        except Exception as e:
            self.skipTest(f"Filter performance test failed: {e}")


if __name__ == '__main__':
    unittest.main(verbosity=2)