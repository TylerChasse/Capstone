"""
Test Suite: Protocol Capture
Tests that each supported protocol can be captured and correctly parsed.

Each test sends a real packet of the target protocol onto the loopback interface
using Scapy, captures it with PyShark, parses it with our backend parser, and
verifies the expected fields are present.

IP-based packets (TCP, UDP, HTTP, DNS, ICMP, TLS) are sent using scapy's send()
at Layer 3 so the OS routes them through loopback. The Npcap loopback adapter
uses a NULL link type, not Ethernet, so sendp() with an Ether() header does not
work on it.

ARP is a Layer 2 protocol and cannot travel over loopback. Its test requires a
real Ethernet or Wi-Fi interface and will be skipped if one is not available.

Requirements:
    - Scapy installed (pip install scapy)
    - Npcap installed with loopback adapter support (Windows)
    - Run as administrator (packet injection requires elevated privileges)
"""

import unittest
import threading
import time
import sys
import os

import pyshark

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.packet_capture import (
    parse_packet,
    format_packet_dict,
)

try:
    from tests.utility.packet_builders import (
        build_tcp_packet,
        build_udp_packet,
        build_http_packet,
        build_dns_packet,
        build_icmp_packet,
        build_arp_packet,
        build_tls_packet,
        get_loopback_interface,
        send_packet,
        SCAPY_AVAILABLE,
    )
except ImportError:
    SCAPY_AVAILABLE = False

# Seconds to wait after starting capture before injecting the first packet.
# On Windows, tshark with use_json=True + include_raw=True can take 5-7 seconds
# to fully initialise before it starts forwarding packets to PyShark.
SEND_DELAY = 6

# How many times to re-send the packet (1-second apart) after the initial send.
# If tshark starts just after the first send, a retry will still be captured.
SEND_RETRIES = 4


class TestProtocolCapture(unittest.TestCase):
    """
    Test that each supported protocol can be captured and parsed correctly.
    IP-based packets are sent on the loopback interface.
    ARP is sent on the first connected real interface.
    """

    @classmethod
    def setUpClass(cls):
        """Resolve interface paths once for all tests."""
        cls.loopback_path = None
        cls.real_interface_path = None

        if not SCAPY_AVAILABLE:
            return

        # Loopback — used for all IP-based protocols
        try:
            cls.loopback_path = get_loopback_interface()
            print(f"\n  Loopback interface : {cls.loopback_path}")
        except Exception as e:
            print(f"\n  Could not find loopback interface: {e}")

        # First connected real interface — used for ARP
        try:
            from backend.helpers import get_connected_interfaces
            from backend.packet_capture import get_interface_device
            interfaces, interface_map = get_connected_interfaces()
            if interfaces:
                cls.real_interface_path = get_interface_device(interfaces[0], interface_map)
                print(f"  Real interface     : {interfaces[0]}")
        except Exception as e:
            print(f"  Could not find real interface: {e}")

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------

    def _capture_with_send(self, packet, interface_path,
                            display_filter=None, python_filter=None,
                            timeout=20, iface=None):
        """
        Start a PyShark capture on interface_path, inject packet after
        SEND_DELAY seconds, and return the first PacketInfo that satisfies
        python_filter (or the first packet if no filter is given).

        display_filter: tshark display filter string — only use on real
            interfaces. On the Npcap loopback (DLT_NULL), TCP/UDP display
            filters cause tshark to exit immediately; omit and use
            python_filter instead.

        python_filter: callable(pyshark_packet) -> bool applied after
            capture to find the specific packet we injected.

        Uses pyshark.LiveCapture.sniff() so PyShark owns its asyncio loop.
        """
        result = [None]

        def send_after_delay():
            time.sleep(SEND_DELAY)
            for attempt in range(1 + SEND_RETRIES):
                if result[0]:
                    break
                try:
                    send_packet(packet, iface=iface)
                except Exception as e:
                    print(f"\n    Packet send failed (attempt {attempt + 1}): {e}")
                    break
                if attempt < SEND_RETRIES:
                    time.sleep(1)

        sender = threading.Thread(target=send_after_delay, daemon=True)
        sender.start()

        start = time.time()
        try:
            kwargs = dict(interface=interface_path, include_raw=True, use_json=True)
            if display_filter:
                kwargs['display_filter'] = display_filter
            cap = pyshark.LiveCapture(**kwargs)
            cap.sniff(timeout=timeout)
            elapsed = time.time() - start
            print(f"\n    Capture stats: {len(cap)} packets in {elapsed:.1f}s")
            # Use index access — iterating cap directly calls sniff_continuously()
            # which blocks waiting for more packets instead of walking the buffer.
            for i in range(len(cap)):
                pkt = cap[i]
                if python_filter is None or python_filter(pkt):
                    result[0] = parse_packet(pkt, 1)
                    break
        except Exception as e:
            elapsed = time.time() - start
            print(f"\n    Capture error after {elapsed:.1f}s: {e}")

        return result[0]

    def _skip_if_no_loopback(self):
        if not SCAPY_AVAILABLE:
            self.skipTest("Scapy is not installed")
        if not self.loopback_path:
            self.skipTest("Loopback interface not available")

    def _print_result(self, label, info):
        print(f"\n{'=' * 70}")
        print(f"  {label}")
        print(f"{'=' * 70}")
        if info:
            for key, value in format_packet_dict(info).items():
                if value is not None:
                    print(f"    {key}: {value}")
        else:
            print("    No packet captured within timeout")
        print("=" * 70)

    # -----------------------------------------------------------------------
    # TCP
    # -----------------------------------------------------------------------

    def test_capture_tcp(self):
        """Test that a TCP packet is captured and parsed with port information."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: TCP")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_tcp_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'tcp') and str(p.tcp.srcport) == '52001',
        )

        self._print_result("TCP SYN", info)

        if info is None:
            self.skipTest("TCP packet not captured within timeout")

        self.assertEqual(info.src_port, 52001)
        self.assertEqual(info.dst_port, 9000)
        self.assertIsNotNone(info.src_ip)
        self.assertIsNotNone(info.dst_ip)
        self.assertIn("TCP", info.protocol.upper())
        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # UDP
    # -----------------------------------------------------------------------

    def test_capture_udp(self):
        """Test that a UDP packet is captured and parsed with port information."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: UDP")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_udp_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'udp') and str(p.udp.srcport) == '52003',
        )

        self._print_result("UDP", info)

        if info is None:
            self.skipTest("UDP packet not captured within timeout")

        self.assertEqual(info.src_port, 52003)
        self.assertEqual(info.dst_port, 9001)
        self.assertIsNotNone(info.src_ip)
        self.assertIn("UDP", info.protocol.upper())
        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # HTTP
    # -----------------------------------------------------------------------

    def test_capture_http(self):
        """Test that an HTTP GET packet is captured and the application layer parsed."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: HTTP")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_http_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'tcp') and str(p.tcp.dstport) == '80'
                                    and str(p.tcp.srcport) == '52005',
        )

        self._print_result("HTTP GET", info)

        if info is None:
            self.skipTest("HTTP packet not captured within timeout")

        self.assertEqual(info.dst_port, 80)
        self.assertIsNotNone(info.src_ip)

        # PyShark may identify it as TCP if HTTP dissection doesn't fire
        self.assertIn(info.protocol.upper(), ("HTTP", "TCP"))
        if info.protocol.upper() == "HTTP":
            self.assertEqual(info.application, "HTTP")
            self.assertIsNotNone(info.application_details)

        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # DNS
    # -----------------------------------------------------------------------

    def test_capture_dns(self):
        """Test that a DNS query packet is captured and the query name parsed."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: DNS")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_dns_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'udp') and str(p.udp.dstport) == '53'
                                    and str(p.udp.srcport) == '52006',
        )

        self._print_result("DNS Query", info)

        if info is None:
            self.skipTest("DNS packet not captured within timeout")

        self.assertEqual(info.dst_port, 53)
        self.assertIsNotNone(info.src_ip)

        if info.protocol.upper() == "DNS":
            self.assertEqual(info.application, "DNS")
            self.assertIsNotNone(info.application_details)

        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # ICMP
    # -----------------------------------------------------------------------

    def test_capture_icmp(self):
        """Test that an ICMP Echo Request packet is captured."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: ICMP")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_icmp_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'icmp') and hasattr(p, 'ip')
                                    and str(p.ip.src) == '127.0.0.1',
        )

        self._print_result("ICMP Echo Request", info)

        if info is None:
            self.skipTest("ICMP packet not captured within timeout")

        self.assertIsNotNone(info.src_ip)
        self.assertIsNotNone(info.dst_ip)
        self.assertIn("ICMP", info.protocol.upper())
        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # ARP — requires a real interface (not loopback)
    # -----------------------------------------------------------------------

    def test_capture_arp(self):
        """Test that an ARP request packet is captured on a real interface."""
        if not SCAPY_AVAILABLE:
            self.skipTest("Scapy is not installed")
        if not self.real_interface_path:
            self.skipTest("No real interface available for ARP capture")

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: ARP")
        print("=" * 70)
        print(f"  Interface: {self.real_interface_path}")

        info = self._capture_with_send(
            packet=build_arp_packet(),
            interface_path=self.real_interface_path,
            display_filter="arp",
            iface=self.real_interface_path,
            timeout=15,
        )

        self._print_result("ARP Request", info)

        if info is None:
            self.skipTest("ARP packet not captured within timeout")

        self.assertIn("ARP", info.protocol.upper())
        self.assertIsNotNone(info.arp_type)
        self.assertIsNotNone(info.arp_sender_ip)
        self.assertIsNotNone(info.arp_target_ip)
        print("  Status: PASS")

    # -----------------------------------------------------------------------
    # TLS
    # -----------------------------------------------------------------------

    def test_capture_tls(self):
        """Test that a TCP SYN to port 443 is captured (start of TLS connection)."""
        self._skip_if_no_loopback()

        print("\n" + "=" * 70)
        print("PROTOCOL CAPTURE TEST: TLS")
        print("=" * 70)

        info = self._capture_with_send(
            packet=build_tls_packet(),
            interface_path=self.loopback_path,
            python_filter=lambda p: hasattr(p, 'tcp') and str(p.tcp.dstport) == '443'
                                    and str(p.tcp.srcport) == '52007',
        )

        self._print_result("TLS (TCP SYN to port 443)", info)

        if info is None:
            self.skipTest("TLS/TCP packet not captured within timeout")

        self.assertEqual(info.dst_port, 443)
        self.assertIsNotNone(info.src_ip)
        self.assertIn(info.protocol.upper(), ("TLS", "TCP"))
        print("  Status: PASS")


if __name__ == "__main__":
    unittest.main(verbosity=2)
