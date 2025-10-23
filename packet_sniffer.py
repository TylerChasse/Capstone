import pyshark


def capture_packets(packet_count=10):
    """
    Capture packets from Ethernet 3 interface
    """
    # Use the full device path
    interface = r'\Device\NPF_{487228F2-34B8-49D3-B76E-DA58803B314F}'

    print(f"Starting capture on Ethernet 3...")

    capture = pyshark.LiveCapture(interface=interface)

    capture.sniff(packet_count=packet_count)

    for packet in capture:
        print(f"\n{'=' * 50}")
        print(f"Packet #{packet.number}")
        print(f"Time: {packet.sniff_time}")
        print(f"Length: {packet.length}")

        if hasattr(packet, 'ip'):
            print(f"Source IP: {packet.ip.src}")
            print(f"Destination IP: {packet.ip.dst}")

        if hasattr(packet, 'tcp'):
            print(f"Protocol: TCP")
            print(f"Source Port: {packet.tcp.srcport}")
            print(f"Destination Port: {packet.tcp.dstport}")
        elif hasattr(packet, 'udp'):
            print(f"Protocol: UDP")
            print(f"Source Port: {packet.udp.srcport}")
            print(f"Destination Port: {packet.udp.dstport}")


if __name__ == "__main__":
    capture_packets(packet_count=10)