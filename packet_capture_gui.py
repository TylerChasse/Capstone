import pyshark
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import subprocess
import re
import asyncio
import time


class PacketCaptureGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Packet Capture Tool")
        self.root.geometry("900x700")

        self.capture = None
        self.is_capturing = False
        self.capture_thread = None

        self.setup_gui()
        self.load_interfaces()

    def setup_gui(self):
        """Setup the GUI layout"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(2, weight=1)

        # Interface Selection Frame
        interface_frame = ttk.LabelFrame(main_frame, text="Interface Selection", padding="10")
        interface_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        interface_frame.columnconfigure(1, weight=1)

        ttk.Label(interface_frame, text="Network Interface:").grid(row=0, column=0, sticky=tk.W, padx=(0, 10))

        self.interface_var = tk.StringVar()
        self.interface_combo = ttk.Combobox(interface_frame, textvariable=self.interface_var, state="readonly")
        self.interface_combo.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(0, 10))

        self.refresh_btn = ttk.Button(interface_frame, text="Refresh", command=self.load_interfaces)
        self.refresh_btn.grid(row=0, column=2)

        # Capture Controls Frame
        control_frame = ttk.LabelFrame(main_frame, text="Capture Controls", padding="10")
        control_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        # Packet count
        ttk.Label(control_frame, text="Packet Count (0 = continuous):").grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
        self.packet_count_var = tk.StringVar(value="50")
        packet_count_entry = ttk.Entry(control_frame, textvariable=self.packet_count_var, width=10)
        packet_count_entry.grid(row=0, column=1, sticky=tk.W, padx=(0, 20))

        # Display filter
        ttk.Label(control_frame, text="Filter (optional):").grid(row=0, column=2, sticky=tk.W, padx=(0, 10))
        self.filter_var = tk.StringVar()
        filter_entry = ttk.Entry(control_frame, textvariable=self.filter_var, width=20)
        filter_entry.grid(row=0, column=3, sticky=tk.W, padx=(0, 20))

        # Add timeout option
        ttk.Label(control_frame, text="Timeout (sec):").grid(row=1, column=0, sticky=tk.W, padx=(0, 10))
        self.timeout_var = tk.StringVar(value="120")
        timeout_entry = ttk.Entry(control_frame, textvariable=self.timeout_var, width=10)
        timeout_entry.grid(row=1, column=1, sticky=tk.W, padx=(0, 20))

        # Buttons
        self.start_btn = ttk.Button(control_frame, text="Start Capture", command=self.start_capture)
        self.start_btn.grid(row=0, column=4, padx=(0, 5))

        self.stop_btn = ttk.Button(control_frame, text="Stop Capture", command=self.stop_capture, state="disabled")
        self.stop_btn.grid(row=0, column=5, padx=(0, 5))

        self.clear_btn = ttk.Button(control_frame, text="Clear Output", command=self.clear_output)
        self.clear_btn.grid(row=0, column=6)

        # Filter examples button
        self.examples_btn = ttk.Button(control_frame, text="Filter Examples", command=self.show_filter_examples)
        self.examples_btn.grid(row=1, column=2, columnspan=2, pady=(5, 0))

        # Status Label
        self.status_var = tk.StringVar(value="Ready")
        status_label = ttk.Label(control_frame, textvariable=self.status_var, foreground="blue")
        status_label.grid(row=2, column=0, columnspan=7, sticky=tk.W, pady=(10, 0))

        # Output Frame
        output_frame = ttk.LabelFrame(main_frame, text="Captured Packets", padding="10")
        output_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        output_frame.columnconfigure(0, weight=1)
        output_frame.rowconfigure(0, weight=1)

        # Scrolled Text Widget
        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, width=80, height=25)
        self.output_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configure text tags for colored output
        self.output_text.tag_config("header", foreground="blue", font=("Courier", 10, "bold"))
        self.output_text.tag_config("ip", foreground="green")
        self.output_text.tag_config("protocol", foreground="purple")
        self.output_text.tag_config("error", foreground="red")
        self.output_text.tag_config("warning", foreground="orange")

    def show_filter_examples(self):
        """Show filter syntax examples"""
        examples = """
Common Wireshark Display Filters:

Protocol Filters:
  tcp                    - All TCP packets
  udp                    - All UDP packets
  icmp                   - All ICMP packets
  dns                    - All DNS packets
  http                   - All HTTP packets
  arp                    - All ARP packets

IP Address Filters:
  ip.addr == 8.8.8.8           - Packets to/from 8.8.8.8
  ip.src == 192.168.1.1        - Packets from 192.168.1.1
  ip.dst == 192.168.1.1        - Packets to 192.168.1.1

Port Filters:
  tcp.port == 443              - TCP traffic on port 443
  udp.port == 53               - UDP traffic on port 53
  tcp.dstport == 80            - TCP to port 80

Combined Filters:
  tcp and ip.addr == 8.8.8.8   - TCP packets to/from 8.8.8.8
  dns or http                  - DNS or HTTP packets
  tcp.port == 443 or tcp.port == 80  - HTTPS or HTTP

Note: These are display filters (Wireshark syntax), not capture filters (BPF syntax).
        """
        messagebox.showinfo("Filter Examples", examples)

    def load_interfaces(self):
        """Load available network interfaces using tshark"""
        try:
            self.status_var.set("Loading interfaces...")
            self.root.update()

            # Run tshark -D to get interfaces
            result = subprocess.run(['tshark', '-D'], capture_output=True, text=True)

            if result.returncode != 0:
                messagebox.showerror("Error", "Failed to load interfaces. Make sure TShark is installed and in PATH.")
                self.status_var.set("Error loading interfaces")
                return

            # Parse output
            interfaces = []
            interface_map = {}

            for line in result.stdout.strip().split('\n'):
                # Try Windows format first: "1. \Device\NPF_{GUID} (Name)"
                match = re.match(r'(\d+)\.\s+(.+?)\s+\((.+?)\)', line)
                if match:
                    number, device_path, friendly_name = match.groups()
                    display_name = f"{number}. {friendly_name}"
                    interfaces.append(display_name)
                    interface_map[display_name] = device_path
                else:
                    # Try Linux/Mac format: "1. eth0" or "1. eth0 (additional info)"
                    match_simple = re.match(r'(\d+)\.\s+(\S+)', line)
                    if match_simple:
                        number, device_name = match_simple.groups()
                        display_name = f"{number}. {device_name}"
                        interfaces.append(display_name)
                        interface_map[display_name] = device_name

            self.interface_map = interface_map
            self.interface_combo['values'] = interfaces

            if interfaces:
                self.interface_combo.current(0)
                self.status_var.set(f"Loaded {len(interfaces)} interface(s)")
            else:
                self.status_var.set("No interfaces found")

        except FileNotFoundError:
            messagebox.showerror("Error", "TShark not found. Please install Wireshark and add it to PATH.")
            self.status_var.set("TShark not found")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load interfaces: {str(e)}")
            self.status_var.set("Error loading interfaces")

    def start_capture(self):
        """Start packet capture in a separate thread"""
        if not self.interface_var.get():
            messagebox.showwarning("Warning", "Please select a network interface")
            return

        try:
            packet_count = int(self.packet_count_var.get())
            if packet_count < 0:
                messagebox.showwarning("Warning", "Packet count must be 0 or positive")
                return
        except ValueError:
            messagebox.showwarning("Warning", "Invalid packet count")
            return

        try:
            timeout = int(self.timeout_var.get())
            if timeout <= 0:
                messagebox.showwarning("Warning", "Timeout must be positive")
                return
        except ValueError:
            messagebox.showwarning("Warning", "Invalid timeout value")
            return

        self.is_capturing = True
        self.start_btn.config(state="disabled")
        self.stop_btn.config(state="normal")
        self.interface_combo.config(state="disabled")
        self.refresh_btn.config(state="disabled")

        # Start capture in separate thread
        self.capture_thread = threading.Thread(target=self.capture_packets, daemon=True)
        self.capture_thread.start()

    def stop_capture(self):
        """Stop packet capture"""
        self.is_capturing = False
        self.status_var.set("Stopping capture...")

    def capture_packets(self):
        """Capture packets (runs in separate thread)"""
        # Create a new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # Get selected interface
            selected = self.interface_var.get()
            interface = self.interface_map[selected]

            packet_count = int(self.packet_count_var.get())
            display_filter = self.filter_var.get().strip()
            timeout = int(self.timeout_var.get())

            self.write_output(f"{'=' * 80}\n", "header")
            self.write_output(f"Starting capture on: {selected}\n", "header")
            if display_filter:
                self.write_output(f"Display Filter: {display_filter}\n", "header")
                self.write_output(f"Timeout: {timeout} seconds\n", "header")
                self.write_output(f"Waiting for packets matching filter...\n", "warning")
                self.write_output(f"Note: Generate matching traffic or be patient!\n", "warning")
            self.write_output(f"{'=' * 80}\n\n", "header")

            self.status_var.set("Capturing packets...")

            # Create capture object with filter if provided
            try:
                if display_filter:
                    self.capture = pyshark.LiveCapture(interface=interface, display_filter=display_filter)
                else:
                    self.capture = pyshark.LiveCapture(interface=interface)
            except Exception as filter_error:
                self.write_output(f"\nError creating capture with filter: {str(filter_error)}\n", "error")
                self.write_output("Check filter syntax. Click 'Filter Examples' for help.\n", "error")
                raise

            # Capture packets
            captured = 0
            start_time = time.time()
            last_update_time = start_time
            update_interval = 2  # Update status every 2 seconds

            if packet_count == 0:
                # Continuous capture with timeout
                self.write_output(f"Continuous capture mode (will run for {timeout} seconds or until stopped)\n\n",
                                  "warning")

                for packet in self.capture.sniff_continuously():
                    if not self.is_capturing:
                        break

                    # Check timeout
                    elapsed = time.time() - start_time
                    if elapsed > timeout:
                        self.write_output(f"\n{'=' * 80}\n", "header")
                        self.write_output(f"Timeout reached ({timeout} seconds)\n", "warning")
                        break

                    self.display_packet(packet, captured + 1)
                    captured += 1

                    # Periodic status update
                    current_time = time.time()
                    if current_time - last_update_time >= update_interval:
                        remaining = int(timeout - elapsed)
                        self.status_var.set(f"Capturing... ({captured} packets, {remaining}s remaining)")
                        last_update_time = current_time
            else:
                # Fixed count capture with timeout
                for packet in self.capture.sniff_continuously():
                    if not self.is_capturing:
                        break

                    # Check if we've captured enough
                    if captured >= packet_count:
                        break

                    # Check timeout
                    elapsed = time.time() - start_time
                    if elapsed > timeout:
                        self.write_output(f"\n{'=' * 80}\n", "header")
                        if captured == 0 and display_filter:
                            self.write_output(
                                f"Timeout: No packets matching filter '{display_filter}' found in {timeout} seconds.\n",
                                "error")
                            self.write_output("\nTroubleshooting tips:\n", "warning")
                            self.write_output("  1. Generate matching traffic:\n")
                            self.write_output("     - For 'tcp': Browse a website\n")
                            self.write_output("     - For 'icmp': Run 'ping 8.8.8.8'\n")
                            self.write_output("     - For 'dns': Browse a new website\n")
                            self.write_output("     - For 'http': Visit http://neverssl.com\n")
                            self.write_output("  2. Check filter syntax (click 'Filter Examples')\n")
                            self.write_output("  3. Try without filter to see all traffic\n")
                            self.write_output("  4. Increase timeout value\n")
                        else:
                            self.write_output(
                                f"Timeout reached after {timeout} seconds ({captured} packets captured)\n", "warning")
                        self.write_output(f"{'=' * 80}\n", "header")
                        break

                    self.display_packet(packet, captured + 1)
                    captured += 1

                    # Status update
                    if captured % 5 == 0 or time.time() - last_update_time >= update_interval:
                        remaining = int(timeout - elapsed)
                        self.status_var.set(f"Capturing... ({captured}/{packet_count} packets, {remaining}s remaining)")
                        last_update_time = time.time()

            # Final summary
            if captured > 0:
                elapsed = time.time() - start_time
                self.write_output(f"\n{'=' * 80}\n", "header")
                self.write_output(f"Capture complete!\n", "header")
                self.write_output(f"  Total packets: {captured}\n", "header")
                self.write_output(f"  Time elapsed: {elapsed:.1f} seconds\n", "header")
                if captured > 0:
                    self.write_output(f"  Capture rate: {captured / elapsed:.1f} packets/sec\n", "header")
                self.write_output(f"{'=' * 80}\n", "header")
            elif display_filter:
                self.write_output(f"\n{'=' * 80}\n", "header")
                self.write_output(f"No packets captured matching filter: '{display_filter}'\n", "error")
                self.write_output(f"{'=' * 80}\n", "header")
            else:
                self.write_output(f"\n{'=' * 80}\n", "header")
                self.write_output(f"No packets captured (interface may be inactive)\n", "error")
                self.write_output(f"{'=' * 80}\n", "header")

        except Exception as e:
            self.write_output(f"\nError during capture: {str(e)}\n", "error")
            # Don't show messagebox if user stopped capture
            if self.is_capturing:
                self.root.after(0, lambda: messagebox.showerror("Capture Error", f"An error occurred:\n{str(e)}"))

        finally:
            self.is_capturing = False
            self.root.after(0, self.reset_controls)
            if self.capture:
                try:
                    self.capture.close()
                except:
                    pass
            # Close the event loop
            loop.close()

    def display_packet(self, packet, number):
        """Display packet information"""
        try:
            output = f"\n[Packet #{number}] "
            output += f"Time: {packet.sniff_time} | Length: {packet.length} bytes\n"

            # Show all layers for debugging (helpful for HTTP)
            output += f"  Layers: {packet.layers}\n"

            # ARP packets
            if hasattr(packet, 'arp'):
                output += f"  Protocol: ARP\n"
                if hasattr(packet.arp, 'src_proto_ipv4'):
                    output += f"  Sender: {packet.arp.src_proto_ipv4} ({packet.arp.src_hw_mac})\n"
                if hasattr(packet.arp, 'dst_proto_ipv4'):
                    output += f"  Target: {packet.arp.dst_proto_ipv4} ({packet.arp.dst_hw_mac})\n"
                if hasattr(packet.arp, 'opcode'):
                    opcode = packet.arp.opcode
                    opcode_str = "Request" if opcode == "1" else "Reply" if opcode == "2" else opcode
                    output += f"  Type: {opcode_str}\n"

            # IP information
            elif hasattr(packet, 'ip'):
                output += f"  IP: {packet.ip.src} → {packet.ip.dst}\n"

                # Protocol information
                if hasattr(packet, 'tcp'):
                    output += f"  Protocol: TCP | Ports: {packet.tcp.srcport} → {packet.tcp.dstport}\n"

                    # TCP flags
                    flags = []
                    if hasattr(packet.tcp, 'flags_syn') and packet.tcp.flags_syn == '1':
                        flags.append('SYN')
                    if hasattr(packet.tcp, 'flags_ack') and packet.tcp.flags_ack == '1':
                        flags.append('ACK')
                    if hasattr(packet.tcp, 'flags_fin') and packet.tcp.flags_fin == '1':
                        flags.append('FIN')
                    if hasattr(packet.tcp, 'flags_push') and packet.tcp.flags_push == '1':
                        flags.append('PSH')
                    if flags:
                        output += f"  TCP Flags: {', '.join(flags)}\n"

                elif hasattr(packet, 'udp'):
                    output += f"  Protocol: UDP | Ports: {packet.udp.srcport} → {packet.udp.dstport}\n"
                elif hasattr(packet, 'icmp'):
                    output += f"  Protocol: ICMP"
                    if hasattr(packet.icmp, 'type'):
                        icmp_type = packet.icmp.type
                        type_str = {
                            "8": "Echo Request (Ping)",
                            "0": "Echo Reply (Pong)",
                            "3": "Destination Unreachable",
                            "11": "Time Exceeded"
                        }.get(icmp_type, f"Type {icmp_type}")
                        output += f" | {type_str}\n"
                    else:
                        output += "\n"

                # Application layer - Enhanced HTTP detection
                if hasattr(packet, 'http'):
                    output += f"  Application: HTTP\n"

                    # Try multiple attribute names for HTTP fields
                    http_layer = packet.http

                    # Request Method (GET, POST, etc.)
                    for method_attr in ['request_method', 'method']:
                        if hasattr(http_layer, method_attr):
                            output += f"    Method: {getattr(http_layer, method_attr)}\n"
                            break

                    # Host
                    for host_attr in ['host', 'request_host']:
                        if hasattr(http_layer, host_attr):
                            output += f"    Host: {getattr(http_layer, host_attr)}\n"
                            break

                    # URI/Path
                    for uri_attr in ['request_uri', 'request_full_uri', 'uri', 'request_line']:
                        if hasattr(http_layer, uri_attr):
                            uri_value = getattr(http_layer, uri_attr)
                            output += f"    URI: {uri_value}\n"
                            break

                    # Response Code
                    for code_attr in ['response_code', 'response_status_code', 'status_code']:
                        if hasattr(http_layer, code_attr):
                            output += f"    Response Code: {getattr(http_layer, code_attr)}\n"
                            break

                    # User Agent
                    for ua_attr in ['user_agent', 'request_user_agent']:
                        if hasattr(http_layer, ua_attr):
                            ua = getattr(http_layer, ua_attr)
                            if len(ua) > 50:
                                ua = ua[:47] + "..."
                            output += f"    User-Agent: {ua}\n"
                            break

                    # Content Type
                    for ct_attr in ['content_type', 'response_content_type']:
                        if hasattr(http_layer, ct_attr):
                            output += f"    Content-Type: {getattr(http_layer, ct_attr)}\n"
                            break

                    # Debug: Show all available HTTP attributes (helpful for troubleshooting)
                    # Uncomment the next two lines to see all HTTP fields:
                    # output += f"    [DEBUG] Available HTTP fields: {dir(http_layer)}\n"

                elif hasattr(packet, 'dns'):
                    output += f"  Application: DNS\n"
                    if hasattr(packet.dns, 'qry_name'):
                        output += f"    Query: {packet.dns.qry_name}\n"
                    if hasattr(packet.dns, 'qry_type'):
                        qry_type = packet.dns.qry_type
                        type_str = {
                            "1": "A (IPv4)",
                            "28": "AAAA (IPv6)",
                            "5": "CNAME",
                            "15": "MX (Mail)",
                            "16": "TXT"
                        }.get(qry_type, f"Type {qry_type}")
                        output += f"    Type: {type_str}\n"
                    if hasattr(packet.dns, 'a'):
                        output += f"    Answer: {packet.dns.a}\n"

                elif hasattr(packet, 'tls'):
                    output += f"  Application: TLS/SSL\n"
                    if hasattr(packet.tls, 'handshake_type'):
                        handshake = {
                            "1": "Client Hello",
                            "2": "Server Hello",
                            "11": "Certificate",
                            "16": "Client Key Exchange"
                        }.get(packet.tls.handshake_type, f"Type {packet.tls.handshake_type}")
                        output += f"    Handshake: {handshake}\n"
                    if hasattr(packet.tls, 'handshake_extensions_server_name'):
                        output += f"    Server Name: {packet.tls.handshake_extensions_server_name}\n"

            elif hasattr(packet, 'ipv6'):
                output += f"  IPv6: {packet.ipv6.src} → {packet.ipv6.dst}\n"

                # Protocol information for IPv6
                if hasattr(packet, 'tcp'):
                    output += f"  Protocol: TCP | Ports: {packet.tcp.srcport} → {packet.tcp.dstport}\n"
                elif hasattr(packet, 'udp'):
                    output += f"  Protocol: UDP | Ports: {packet.udp.srcport} → {packet.udp.dstport}\n"
                elif hasattr(packet, 'icmpv6'):
                    output += f"  Protocol: ICMPv6\n"

            else:
                # For other protocols (like pure Ethernet frames)
                output += f"  Protocol: {packet.highest_layer}\n"

            self.write_output(output)

        except Exception as e:
            self.write_output(f"  Error displaying packet: {str(e)}\n", "error")

    def write_output(self, text, tag=None):
        """Write text to output widget (thread-safe)"""
        self.root.after(0, self._write_output_main, text, tag)

    def _write_output_main(self, text, tag):
        """Write text to output widget (must run in main thread)"""
        self.output_text.insert(tk.END, text, tag)
        self.output_text.see(tk.END)

    def clear_output(self):
        """Clear the output text widget"""
        self.output_text.delete(1.0, tk.END)

    def reset_controls(self):
        """Reset controls after capture stops"""
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.interface_combo.config(state="readonly")
        self.refresh_btn.config(state="normal")
        self.status_var.set("Ready")


def main():
    root = tk.Tk()
    app = PacketCaptureGUI(root)
    root.mainloop()


if __name__ == "__main__":
    print("Starting Packet Capture GUI...")
    print("Remember to run as Administrator for packet capture!")
    main()