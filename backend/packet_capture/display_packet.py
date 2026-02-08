"""
display_packet.py - Packet Parsing and Formatting

Converts raw pyshark packet objects into structured, readable formats.
Extracts information from each layer of the network stack:
    - Layer 2: Ethernet, ARP
    - Layer 3: IPv4, IPv6
    - Layer 4: TCP, UDP, ICMP
    - Layer 7: HTTP, DNS, TLS

Output Formats:
    - PacketInfo: Structured dataclass for internal use
    - format_packet_text(): Human-readable string
    - format_packet_dict(): JSON-serializable dictionary
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class PacketInfo:
    """Structured packet information for display."""
    number: int
    timestamp: str
    length: int
    layers: List[str]
    protocol: str

    # Network layer info
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    is_ipv6: bool = False
    ttl: Optional[int] = None

    # Transport layer info
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    tcp_flags: List[str] = field(default_factory=list)

    # ARP info
    arp_sender_ip: Optional[str] = None
    arp_sender_mac: Optional[str] = None
    arp_target_ip: Optional[str] = None
    arp_target_mac: Optional[str] = None
    arp_type: Optional[str] = None

    # Ethernet (Data Link) layer info
    src_mac: Optional[str] = None
    dst_mac: Optional[str] = None

    # Raw hex data
    raw_hex: Optional[str] = None

    # Application layer info
    application: Optional[str] = None
    application_details: Dict[str, str] = field(default_factory=dict)


# =============================================================================
# MAIN PARSING FUNCTION
# =============================================================================

def parse_packet(packet: Any, number: int) -> PacketInfo:
    """
    Parse a pyshark packet into a structured PacketInfo object.

    Args:
        packet: A pyshark packet object
        number: The packet number in the capture sequence

    Returns:
        PacketInfo with parsed packet details
    """
    info = PacketInfo(
        number=number,
        timestamp=str(packet.sniff_time),
        length=int(packet.length),
        layers=[str(layer.layer_name) for layer in packet.layers],
        protocol=packet.highest_layer
    )

    # Parse Ethernet (Data Link) layer
    if hasattr(packet, 'eth'):
        info.src_mac = packet.eth.src
        info.dst_mac = packet.eth.dst

    # Extract raw hex data
    try:
        raw_bytes = bytes(packet.get_raw_packet())
        info.raw_hex = raw_bytes.hex()
    except Exception:
        pass

    # Parse ARP packets
    if hasattr(packet, 'arp'):
        info.protocol = "ARP"
        if hasattr(packet.arp, 'src_proto_ipv4'):
            info.arp_sender_ip = packet.arp.src_proto_ipv4
        if hasattr(packet.arp, 'src_hw_mac'):
            info.arp_sender_mac = packet.arp.src_hw_mac
        if hasattr(packet.arp, 'dst_proto_ipv4'):
            info.arp_target_ip = packet.arp.dst_proto_ipv4
        if hasattr(packet.arp, 'dst_hw_mac'):
            info.arp_target_mac = packet.arp.dst_hw_mac
        if hasattr(packet.arp, 'opcode'):
            opcode = packet.arp.opcode
            info.arp_type = "Request" if opcode == "1" else "Reply" if opcode == "2" else opcode

    # Parse IPv4
    elif hasattr(packet, 'ip'):
        info.src_ip = packet.ip.src
        info.dst_ip = packet.ip.dst
        if hasattr(packet.ip, 'ttl'):
            info.ttl = int(packet.ip.ttl)
        _parse_transport_layer(packet, info)
        _parse_application_layer(packet, info)

    # Parse IPv6
    elif hasattr(packet, 'ipv6'):
        info.src_ip = packet.ipv6.src
        info.dst_ip = packet.ipv6.dst
        info.is_ipv6 = True
        if hasattr(packet.ipv6, 'hlim'):
            info.ttl = int(packet.ipv6.hlim)
        _parse_transport_layer(packet, info)
        _parse_application_layer(packet, info)

    return info


# =============================================================================
# LAYER PARSERS (internal helpers)
# =============================================================================

def _parse_transport_layer(packet: Any, info: PacketInfo) -> None:
    """Parse TCP/UDP/ICMP transport layer information."""
    if hasattr(packet, 'tcp'):
        info.protocol = "TCP"
        info.src_port = int(packet.tcp.srcport)
        info.dst_port = int(packet.tcp.dstport)

        # Parse TCP flags
        flag_checks = [
            ('flags_syn', 'SYN'),
            ('flags_ack', 'ACK'),
            ('flags_fin', 'FIN'),
            ('flags_push', 'PSH'),
            ('flags_reset', 'RST'),
            ('flags_urg', 'URG'),
        ]
        for attr, flag_name in flag_checks:
            if hasattr(packet.tcp, attr) and getattr(packet.tcp, attr) == '1':
                info.tcp_flags.append(flag_name)

    elif hasattr(packet, 'udp'):
        info.protocol = "UDP"
        info.src_port = int(packet.udp.srcport)
        info.dst_port = int(packet.udp.dstport)

    elif hasattr(packet, 'icmp'):
        info.protocol = "ICMP"
        if hasattr(packet.icmp, 'type'):
            icmp_type = packet.icmp.type
            type_str = {
                "8": "Echo Request (Ping)",
                "0": "Echo Reply (Pong)",
                "3": "Destination Unreachable",
                "11": "Time Exceeded"
            }.get(icmp_type, f"Type {icmp_type}")
            info.application_details['icmp_type'] = type_str

    elif hasattr(packet, 'icmpv6'):
        info.protocol = "ICMPv6"


def _parse_application_layer(packet: Any, info: PacketInfo) -> None:
    """Parse application layer (HTTP, DNS, TLS) information."""
    if hasattr(packet, 'http'):
        info.application = "HTTP"
        http_layer = packet.http

        # Request Method
        for attr in ['request_method', 'method']:
            if hasattr(http_layer, attr):
                info.application_details['method'] = getattr(http_layer, attr)
                break

        # Host
        for attr in ['host', 'request_host']:
            if hasattr(http_layer, attr):
                info.application_details['host'] = getattr(http_layer, attr)
                break

        # URI
        for attr in ['request_uri', 'request_full_uri', 'uri', 'request_line']:
            if hasattr(http_layer, attr):
                info.application_details['uri'] = getattr(http_layer, attr)
                break

        # Response Code
        for attr in ['response_code', 'response_status_code', 'status_code']:
            if hasattr(http_layer, attr):
                info.application_details['response_code'] = getattr(http_layer, attr)
                break

        # User Agent
        for attr in ['user_agent', 'request_user_agent']:
            if hasattr(http_layer, attr):
                ua = getattr(http_layer, attr)
                if len(ua) > 50:
                    ua = ua[:47] + "..."
                info.application_details['user_agent'] = ua
                break

        # Content Type
        for attr in ['content_type', 'response_content_type']:
            if hasattr(http_layer, attr):
                info.application_details['content_type'] = getattr(http_layer, attr)
                break

    elif hasattr(packet, 'dns'):
        info.application = "DNS"
        if hasattr(packet.dns, 'qry_name'):
            info.application_details['query'] = packet.dns.qry_name
        if hasattr(packet.dns, 'qry_type'):
            qry_type = packet.dns.qry_type
            type_str = {
                "1": "A (IPv4)",
                "28": "AAAA (IPv6)",
                "5": "CNAME",
                "15": "MX (Mail)",
                "16": "TXT"
            }.get(qry_type, f"Type {qry_type}")
            info.application_details['query_type'] = type_str
        if hasattr(packet.dns, 'a'):
            info.application_details['answer'] = packet.dns.a

    elif hasattr(packet, 'tls'):
        info.application = "TLS/SSL"
        if hasattr(packet.tls, 'handshake_type'):
            handshake = {
                "1": "Client Hello",
                "2": "Server Hello",
                "11": "Certificate",
                "16": "Client Key Exchange"
            }.get(packet.tls.handshake_type, f"Type {packet.tls.handshake_type}")
            info.application_details['handshake'] = handshake
        if hasattr(packet.tls, 'handshake_extensions_server_name'):
            info.application_details['server_name'] = packet.tls.handshake_extensions_server_name


# =============================================================================
# OUTPUT FORMATTERS
# =============================================================================

def format_packet_text(info: PacketInfo) -> str:
    """
    Format a PacketInfo object as human-readable text.

    Args:
        info: PacketInfo object with parsed packet data

    Returns:
        Formatted string representation of the packet
    """
    lines = []
    lines.append(f"\n[Packet #{info.number}] Time: {info.timestamp} | Length: {info.length} bytes")
    lines.append(f"  Layers: {info.layers}")

    # ARP packets
    if info.protocol == "ARP":
        lines.append(f"  Protocol: ARP")
        if info.arp_sender_ip:
            lines.append(f"  Sender: {info.arp_sender_ip} ({info.arp_sender_mac})")
        if info.arp_target_ip:
            lines.append(f"  Target: {info.arp_target_ip} ({info.arp_target_mac})")
        if info.arp_type:
            lines.append(f"  Type: {info.arp_type}")

    # IP packets
    elif info.src_ip and info.dst_ip:
        ip_version = "IPv6" if info.is_ipv6 else "IP"
        lines.append(f"  {ip_version}: {info.src_ip} -> {info.dst_ip}")

        # Transport layer
        if info.protocol in ("TCP", "UDP"):
            lines.append(f"  Protocol: {info.protocol} | Ports: {info.src_port} -> {info.dst_port}")
            if info.tcp_flags:
                lines.append(f"  TCP Flags: {', '.join(info.tcp_flags)}")
        elif info.protocol in ("ICMP", "ICMPv6"):
            icmp_detail = info.application_details.get('icmp_type', '')
            if icmp_detail:
                lines.append(f"  Protocol: {info.protocol} | {icmp_detail}")
            else:
                lines.append(f"  Protocol: {info.protocol}")

        # Application layer
        if info.application:
            lines.append(f"  Application: {info.application}")
            for key, value in info.application_details.items():
                if key != 'icmp_type':  # Already shown above
                    lines.append(f"    {key}: {value}")

    else:
        lines.append(f"  Protocol: {info.protocol}")

    return '\n'.join(lines)


def format_packet_dict(info: PacketInfo) -> Dict:
    """
    Format a PacketInfo object as a dictionary (for JSON serialization).

    Args:
        info: PacketInfo object with parsed packet data

    Returns:
        Dictionary representation of the packet
    """
    return {
        'number': info.number,
        'timestamp': info.timestamp,
        'length': info.length,
        'layers': info.layers,
        'protocol': info.protocol,
        'ethernet': {
            'src_mac': info.src_mac,
            'dst_mac': info.dst_mac,
        } if info.src_mac else None,
        'network': {
            'src_ip': info.src_ip,
            'dst_ip': info.dst_ip,
            'is_ipv6': info.is_ipv6,
            'ttl': info.ttl,
        } if info.src_ip else None,
        'transport': {
            'src_port': info.src_port,
            'dst_port': info.dst_port,
            'tcp_flags': info.tcp_flags,
        } if info.src_port else None,
        'arp': {
            'sender_ip': info.arp_sender_ip,
            'sender_mac': info.arp_sender_mac,
            'target_ip': info.arp_target_ip,
            'target_mac': info.arp_target_mac,
            'type': info.arp_type,
        } if info.arp_sender_ip else None,
        'application': {
            'name': info.application,
            'details': info.application_details,
        } if info.application else None,
        'raw_hex': info.raw_hex,
    }
