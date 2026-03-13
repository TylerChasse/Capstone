"""
Utility: Packet Builders

Builds and sends real network packets for protocol-specific testing.

TCP/UDP/HTTP/DNS/TLS packets are sent using Python's socket module so they
travel through the Windows TCP/IP stack and appear on the Npcap loopback
capture adapter (\\Device\\NPF_Loopback), exactly the same way that ping does.

Scapy's send() injects packets at a lower level that does NOT route through
the Npcap loopback capture adapter on Windows, so it is only used for ICMP
(which is handled by the Windows ICMP stack) and ARP (L2 only).

ARP is a Layer 2 protocol and cannot travel over loopback. Its builder returns
an Ether/ARP frame for use with sendp() on a real interface only.

Supported protocols:
    TCP, UDP, HTTP, DNS, ICMP, ARP, TLS (TCP to port 443)

Usage:
    from tests.utility.packet_builders import build_tcp_packet, send_packet
    send_packet(build_tcp_packet())
"""

import sys
import os
import socket as _socket

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from scapy.all import (
        Ether, IP, TCP, UDP, ICMP, ARP, DNS, DNSQR, Raw,
        send, sendp, conf,
    )
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

# ---------------------------------------------------------------------------
# Test addresses — loopback IPs to keep traffic self-contained
# ---------------------------------------------------------------------------

SRC_IP  = "127.0.0.1"
DST_IP  = "127.0.0.1"
SRC_MAC = "02:00:00:00:00:01"

# Dedicated source ports per protocol to allow precise capture filters
TCP_SPORT  = 52001
UDP_SPORT  = 52003
HTTP_SPORT = 52005
DNS_SPORT  = 52006
TLS_SPORT  = 52007


# ---------------------------------------------------------------------------
# Packet builders
# Return Scapy packets — used to describe the packet structure.
# send_packet() decides how to actually inject them.
# ---------------------------------------------------------------------------

def build_tcp_packet():
    """
    Build a TCP SYN packet descriptor.
    Filter: tcp and src port 52001
    """
    return IP(src=SRC_IP, dst=DST_IP) / TCP(sport=TCP_SPORT, dport=9000, flags="S")


def build_udp_packet():
    """
    Build a UDP packet descriptor with a small payload.
    Filter: udp and src port 52003
    """
    return (
        IP(src=SRC_IP, dst=DST_IP)
        / UDP(sport=UDP_SPORT, dport=9001)
        / Raw(load=b"test udp payload")
    )


def build_http_packet():
    """
    Build an HTTP GET request packet descriptor (TCP to port 80).
    Filter: tcp and dst port 80
    """
    http_payload = (
        b"GET / HTTP/1.1\r\n"
        b"Host: example.com\r\n"
        b"Connection: close\r\n"
        b"\r\n"
    )
    return (
        IP(src=SRC_IP, dst=DST_IP)
        / TCP(sport=HTTP_SPORT, dport=80, flags="PA")
        / Raw(load=http_payload)
    )


def build_dns_packet():
    """
    Build a DNS query packet descriptor (UDP to port 53) for example.com.
    Filter: udp and dst port 53
    """
    return (
        IP(src=SRC_IP, dst=DST_IP)
        / UDP(sport=DNS_SPORT, dport=53)
        / DNS(rd=1, qd=DNSQR(qname="example.com", qtype="A"))
    )


def build_icmp_packet():
    """
    Build an ICMP Echo Request (ping) packet.
    Filter: icmp
    Sent via Scapy send() — Windows ICMP stack routes these through loopback.
    """
    return (
        IP(src=SRC_IP, dst=DST_IP)
        / ICMP(type=8, code=0, id=1, seq=1)
        / Raw(load=b"ping test payload")
    )


def build_arp_packet():
    """
    Build an ARP request packet (L2 — requires sendp() on a real interface).
    Filter: arp
    Note: ARP cannot be sent via the loopback adapter. This packet is provided
    for use on real Ethernet/Wi-Fi interfaces only.
    """
    return (
        Ether(src=SRC_MAC, dst="ff:ff:ff:ff:ff:ff")
        / ARP(
            op=1,
            hwsrc=SRC_MAC,
            psrc="192.168.1.100",
            hwdst="00:00:00:00:00:00",
            pdst="192.168.1.1",
        )
    )


def build_tls_packet():
    """
    Build a TCP SYN packet to port 443 (start of a TLS connection).
    Filter: tcp and dst port 443
    """
    return IP(src=SRC_IP, dst=DST_IP) / TCP(sport=TLS_SPORT, dport=443, flags="S")


# ---------------------------------------------------------------------------
# Interface helpers
# ---------------------------------------------------------------------------

def get_loopback_interface():
    """
    Return the loopback interface device path for PyShark capture.

    Searches the tshark interface list for a loopback entry first so the
    returned path is consistent with what PacketCapture expects.
    Falls back to platform defaults if tshark is unavailable.
    """
    from backend.packet_capture import load_interfaces

    try:
        names, interface_map = load_interfaces()
        for name in names:
            if "loopback" in name.lower():
                return interface_map[name]
    except Exception:
        pass

    if sys.platform == "win32":
        return r"\Device\NPF_Loopback"
    return "lo"


# ---------------------------------------------------------------------------
# Internal socket senders (TCP / UDP via OS stack)
# ---------------------------------------------------------------------------

def _send_tcp_via_socket(ip_src, ip_dst, sport, dport, payload=b""):
    """
    Open a TCP connection from ip_src:sport to ip_dst:dport.
    The OS generates a real SYN (and data if payload is given) that travels
    through the Windows TCP/IP stack and appears on the Npcap loopback adapter.
    A refused connection is expected and harmless — the SYN is all we need.
    """
    s = _socket.socket(_socket.AF_INET, _socket.SOCK_STREAM)
    s.setsockopt(_socket.SOL_SOCKET, _socket.SO_REUSEADDR, 1)
    s.settimeout(1.0)
    try:
        s.bind((ip_src, sport))
    except OSError:
        pass  # port already in use — connect will still work from a random port
    try:
        s.connect((ip_dst, dport))
        if payload:
            s.sendall(payload)
    except OSError:
        pass  # connection refused / timeout is expected
    finally:
        try:
            s.close()
        except OSError:
            pass


def _send_udp_via_socket(ip_src, ip_dst, sport, dport, payload=b"test udp payload"):
    """
    Send a single UDP datagram from ip_src:sport to ip_dst:dport.
    Goes through the Windows TCP/IP stack — appears on the Npcap loopback adapter.
    """
    s = _socket.socket(_socket.AF_INET, _socket.SOCK_DGRAM)
    s.setsockopt(_socket.SOL_SOCKET, _socket.SO_REUSEADDR, 1)
    try:
        s.bind((ip_src, sport))
    except OSError:
        pass
    try:
        s.sendto(payload, (ip_dst, dport))
    finally:
        try:
            s.close()
        except OSError:
            pass


# ---------------------------------------------------------------------------
# Public send_packet dispatcher
# ---------------------------------------------------------------------------

def send_packet(packet, iface=None):
    """
    Send a packet built by one of the build_* functions.

    IP-based packets (TCP, UDP, ICMP, DNS, HTTP, TLS) are sent with Scapy's
    send() at Layer 3.  On Windows with Npcap, Scapy's raw socket injection
    goes through the same kernel path as ICMP ping, which the Npcap loopback
    adapter (\\Device\\NPF_Loopback) monitors.  Python socket TCP/UDP traffic
    uses Windows's loopback fast-path and is NOT visible to Npcap.

    ARP and other L2-only packets are sent via sendp() on the specified real
    interface. An explicit iface is required.

    Args:
        packet: A Scapy packet object returned by one of the build_* functions.
        iface:  Required only for L2 packets (e.g. ARP). Ignored for IP packets.
    """
    if not SCAPY_AVAILABLE:
        raise ImportError("Scapy is required to send packets. Install it with: pip install scapy")

    if IP in packet:
        # L3 raw socket injection — visible to Npcap loopback capture adapter
        send(packet, verbose=False)
    else:
        # L2 only (ARP) — requires a real interface
        if iface is None:
            raise ValueError(
                "An explicit interface is required for L2 packets such as ARP. "
                "Pass a device path via the iface argument."
            )
        sendp(packet, iface=iface, verbose=False)
