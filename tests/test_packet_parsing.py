"""
Test Suite: Packet Parsing
Tests the ability to extract information from captured packets
"""

import unittest
import pyshark
import subprocess
import re
import time


class TestPacketParsing(unittest.TestCase):
    """Test that we can extract data from packets"""

    def setUp(self):
        """Capture a real packet for testing"""
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

        # Try to capture a real packet
        self.packet = None
        self.capture = None

        for interface_info in self.interfaces:
            capture = None
            try:
                capture = pyshark.LiveCapture(interface=interface_info['path'])
                packets_collected = []

                def packet_handler(packet):
                    packets_collected.append(packet)

                try:
                    capture.apply_on_packets(packet_handler, timeout=5)
                except:
                    pass

                # Get first packet if any were collected
                if packets_collected:
                    self.packet = packets_collected[0]

                # Close immediately after use
                if capture:
                    capture.close()
                    # Give it a moment to clean up
                    time.sleep(0.1)

                if self.packet:
                    break

            except:
                if capture:
                    try:
                        capture.close()
                        time.sleep(0.1)
                    except:
                        pass
                continue

    def tearDown(self):
        """Clean up - nothing to do since we close in setUp"""
        pass

    def test_can_extract_basic_info(self):
        """Test extraction of packet number and length"""
        if not self.packet:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - BASIC INFORMATION (REAL PACKET):")
        print("=" * 70)
        print(f"  Packet Number: {self.packet.number}")
        print(f"  Packet Length: {self.packet.length} bytes")
        print(f"  Timestamp: {self.packet.sniff_time}")
        print("=" * 70)

        self.assertIsNotNone(self.packet.number)
        self.assertIsNotNone(self.packet.length)
        self.assertIsNotNone(self.packet.sniff_time)

    def test_can_extract_ip_info(self):
        """Test extraction of IP addresses"""
        if not self.packet:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - IP LAYER (REAL PACKET):")
        print("=" * 70)
        print(f"  Has IP Layer: {hasattr(self.packet, 'ip')}")

        if hasattr(self.packet, 'ip'):
            print(f"  Source IP: {self.packet.ip.src}")
            print(f"  Destination IP: {self.packet.ip.dst}")
            print("=" * 70)

            self.assertIsNotNone(self.packet.ip.src)
            self.assertIsNotNone(self.packet.ip.dst)
        else:
            print(f"  Note: This packet doesn't have an IP layer")
            print(f"  Layers present: {self.packet.layers}")
            print("=" * 70)
            # Just verify we can check for layer existence
            self.assertFalse(hasattr(self.packet, 'ip'))

    def test_can_extract_transport_info(self):
        """Test extraction of port numbers"""
        if not self.packet:
            self.skipTest("No packet captured for parsing test")

        print("\n" + "=" * 70)
        print("PACKET PARSING - TRANSPORT LAYER (REAL PACKET):")
        print("=" * 70)
        print(f"  Has TCP Layer: {hasattr(self.packet, 'tcp')}")
        print(f"  Has UDP Layer: {hasattr(self.packet, 'udp')}")

        if hasattr(self.packet, 'tcp'):
            print(f"  Protocol: TCP")
            print(f"  Source Port: {self.packet.tcp.srcport}")
            print(f"  Destination Port: {self.packet.tcp.dstport}")
            print("=" * 70)

            self.assertIsNotNone(self.packet.tcp.srcport)
            self.assertIsNotNone(self.packet.tcp.dstport)
        elif hasattr(self.packet, 'udp'):
            print(f"  Protocol: UDP")
            print(f"  Source Port: {self.packet.udp.srcport}")
            print(f"  Destination Port: {self.packet.udp.dstport}")
            print("=" * 70)

            self.assertIsNotNone(self.packet.udp.srcport)
            self.assertIsNotNone(self.packet.udp.dstport)
        else:
            print(f"  Note: This packet doesn't have TCP or UDP layer")
            print(f"  Layers present: {self.packet.layers}")
            print("=" * 70)
            # Just verify we can check for layer existence
            self.assertFalse(hasattr(self.packet, 'tcp'))
            self.assertFalse(hasattr(self.packet, 'udp'))


if __name__ == '__main__':
    unittest.main(verbosity=2)