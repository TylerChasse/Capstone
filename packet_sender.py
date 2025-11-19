from scapy.all import *
from scapy.layers.inet import *
from scapy.layers.l2 import ARP
import random

def send_tcp(dst_ip, dst_port):
    packet = IP(dst=dst_ip)/TCP(dport=dst_port, flags="S")
    send(packet)
    print(f"TCP packet sent to {dst_ip}:{dst_port}")

def send_udp(dst_ip, dst_port, data):
    packet = IP(dst=dst_ip)/UDP(dport=dst_port)/Raw(load=data)
    send(packet)
    print(f"UDP packet sent to {dst_ip}:{dst_port}")

def send_icmp(dst_ip):
    packet = IP(dst=dst_ip)/ICMP()
    reply = sr1(packet, timeout=2, verbose=0)
    if reply:
        print(f"ICMP reply from {reply.src}")
    else:
        print("No ICMP reply")

def send_arp(dst_ip):
    packet = ARP(pdst=dst_ip)
    send(packet)
    print(f"ARP packet sent for {dst_ip}")


def setup_iptables(dst_ip, dst_port):
    """
    Setup iptables to prevent kernel from sending RST packets.
    Only works on Linux. Run script with sudo.
    """
    if sys.platform.startswith('linux'):
        rule = f"iptables -A OUTPUT -p tcp --tcp-flags RST RST -d {dst_ip} --dport {dst_port} -j DROP"
        print(f"[*] Setting up iptables rule to prevent RST packets")
        print(f"[*] Run this command manually: sudo {rule}")
        return rule
    return None


def cleanup_iptables(dst_ip, dst_port):
    """Remove iptables rule"""
    if sys.platform.startswith('linux'):
        rule = f"iptables -D OUTPUT -p tcp --tcp-flags RST RST -d {dst_ip} --dport {dst_port} -j DROP"
        print(f"[*] Cleanup: sudo {rule}")
        return rule
    return None


def send_http_request(dst_ip, dst_port=80, method="GET", path="/", host=None, headers=None, body=None, timeout=10):
    """
    Send an HTTP request using Scapy with proper TCP handshake.

    Args:
        dst_ip: Destination IP address
        dst_port: Destination port (default 80)
        method: HTTP method (GET, POST, etc.)
        path: URL path (default "/")
        host: Host header value (defaults to dst_ip)
        headers: Dictionary of additional headers
        body: Request body (for POST, PUT, etc.)

    Returns:
        Response packet if received, None otherwise
    """

    # Generate random source port
    src_port = random.randint(1024, 65535)

    # Set default host header
    if host is None:
        host = dst_ip

    print(f"[*] Initiating TCP connection to {dst_ip}:{dst_port}")
    print(f"[*] Source port: {src_port}")

    # Check if running with privileges
    if os.geteuid() != 0 if hasattr(os, 'geteuid') else False:
        print("[!] Warning: Not running as root. This may cause issues.")

    # Show iptables commands for Linux users
    if sys.platform.startswith('linux'):
        print("\n[!] IMPORTANT - Run these commands first to prevent kernel RST:")
        print(f"    sudo iptables -A OUTPUT -p tcp --tcp-flags RST RST -d {dst_ip} --dport {dst_port} -j DROP")
        print(f"    (After testing, cleanup with:)")
        print(f"    sudo iptables -D OUTPUT -p tcp --tcp-flags RST RST -d {dst_ip} --dport {dst_port} -j DROP\n")

    # Step 1: Send SYN
    ip = IP(dst=dst_ip)
    syn = TCP(sport=src_port, dport=dst_port, flags='S', seq=1000)

    print(f"[*] Sending SYN packet...")
    syn_ack = sr1(ip / syn, timeout=timeout, verbose=0)

    if syn_ack is None:
        print("[!] No SYN-ACK received. Connection failed.")
        print("[!] Possible causes:")
        print("    1. Firewall blocking packets")
        print("    2. Target not responding")
        print("    3. Need to run as root/administrator")
        print("    4. OS kernel sending RST (run iptables command above)")
        print("    5. Wrong IP or port")
        print(f"\n[*] Try: ping {dst_ip}")
        print(f"[*] Try: nc -zv {dst_ip} {dst_port}")
        return None

    if not syn_ack.haslayer(TCP) or syn_ack[TCP].flags != 0x12:  # SYN-ACK
        print("[!] Unexpected response to SYN")
        return None

    print(f"[+] SYN-ACK received (seq={syn_ack[TCP].seq}, ack={syn_ack[TCP].ack})")

    # Step 2: Send ACK to complete handshake
    ack = TCP(sport=src_port, dport=dst_port, flags='A',
              seq=syn_ack[TCP].ack, ack=syn_ack[TCP].seq + 1)
    send(ip / ack, verbose=0)
    print("[+] TCP handshake complete")

    # Step 3: Build HTTP request
    http_request = f"{method} {path} HTTP/1.1\r\n"
    http_request += f"Host: {host}\r\n"

    # Add custom headers
    if headers:
        for key, value in headers.items():
            http_request += f"{key}: {value}\r\n"
    else:
        # Default headers
        http_request += "User-Agent: Scapy-HTTP-Client/1.0\r\n"
        http_request += "Accept: */*\r\n"

    # Add body if present
    if body:
        http_request += f"Content-Length: {len(body)}\r\n"
        http_request += "\r\n"
        http_request += body
    else:
        http_request += "\r\n"

    print(f"[*] Sending HTTP {method} request")
    print(f"[*] Request:\n{http_request[:200]}...")

    # Step 4: Send HTTP request
    push_ack = TCP(sport=src_port, dport=dst_port, flags='PA',
                   seq=syn_ack[TCP].ack, ack=syn_ack[TCP].seq + 1)
    http_packet = ip / push_ack / Raw(load=http_request)

    response = sr1(http_packet, timeout=timeout, verbose=0)

    if response and response.haslayer(Raw):
        print("[+] HTTP response received")
        http_response = response[Raw].load.decode('utf-8', errors='ignore')
        print(f"[*] Response:\n{http_response[:500]}")

        # Send final ACK
        final_ack = TCP(sport=src_port, dport=dst_port, flags='A',
                        seq=response[TCP].ack, ack=response[TCP].seq + len(response[Raw].load))
        send(ip / final_ack, verbose=0)

        # Send FIN to close connection
        fin = TCP(sport=src_port, dport=dst_port, flags='FA',
                  seq=response[TCP].ack, ack=response[TCP].seq + len(response[Raw].load))
        send(ip / fin, verbose=0)
        print("[+] Connection closed")

        return response
    else:
        print("[!] No HTTP response received")
        return None


def send_http_get(dst_ip, path="/", dst_port=80, timeout=10):
    """Simplified function for HTTP GET requests"""
    return send_http_request(dst_ip, dst_port, method="GET", path=path, timeout=timeout)


def send_http_post(dst_ip, path="/", data="", dst_port=80, timeout=10):
    """Simplified function for HTTP POST requests"""
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    return send_http_request(dst_ip, dst_port, method="POST", path=path,
                             headers=headers, body=data, timeout=timeout)


def test_connection(dst_ip, dst_port=80):
    """
    Test if we can reach the destination and receive SYN-ACK.
    Useful for debugging connection issues.
    """
    print(f"[*] Testing connection to {dst_ip}:{dst_port}")
    src_port = random.randint(1024, 65535)

    ip = IP(dst=dst_ip)
    syn = TCP(sport=src_port, dport=dst_port, flags='S', seq=1000)

    print("[*] Sending SYN...")
    response = sr1(ip / syn, timeout=5, verbose=1)

    if response:
        response.show()
        if response.haslayer(TCP):
            if response[TCP].flags == 0x12:  # SYN-ACK
                print("[+] SUCCESS: Received SYN-ACK")
                # Send RST to close
                rst = TCP(sport=src_port, dport=dst_port, flags='R', seq=response[TCP].ack)
                send(ip / rst, verbose=0)
                return True
            elif response[TCP].flags == 0x14:  # RST-ACK
                print("[!] Received RST-ACK: Port might be closed or filtered")
        return False
    else:
        print("[!] No response received")
        return False


# Example usage

# Usage
target = "" # target IP address
#send_tcp(target, 80)
#send_udp(target, 53, "test")
#send_icmp(target)
#send_arp(target)
#send_http_get(target, path="/api/data")
test_connection(target, 80)
#send_http_post(target, path="/submit", data="key=value")