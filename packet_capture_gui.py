import pyshark
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import subprocess
import re
import asyncio

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
        
        # Buttons
        self.start_btn = ttk.Button(control_frame, text="Start Capture", command=self.start_capture)
        self.start_btn.grid(row=0, column=4, padx=(0, 5))
        
        self.stop_btn = ttk.Button(control_frame, text="Stop Capture", command=self.stop_capture, state="disabled")
        self.stop_btn.grid(row=0, column=5, padx=(0, 5))
        
        self.clear_btn = ttk.Button(control_frame, text="Clear Output", command=self.clear_output)
        self.clear_btn.grid(row=0, column=6)
        
        # Status Label
        self.status_var = tk.StringVar(value="Ready")
        status_label = ttk.Label(control_frame, textvariable=self.status_var, foreground="blue")
        status_label.grid(row=1, column=0, columnspan=7, sticky=tk.W, pady=(10, 0))
        
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
            
            self.write_output(f"{'='*80}\n", "header")
            self.write_output(f"Starting capture on: {selected}\n", "header")
            if display_filter:
                self.write_output(f"Filter: {display_filter}\n", "header")
            self.write_output(f"{'='*80}\n\n", "header")
            
            self.status_var.set("Capturing packets...")
            
            # Create capture object
            if display_filter:
                self.capture = pyshark.LiveCapture(interface=interface, display_filter=display_filter)
            else:
                self.capture = pyshark.LiveCapture(interface=interface)
            
            # Capture packets
            captured = 0
            if packet_count == 0:
                # Continuous capture
                for packet in self.capture.sniff_continuously():
                    if not self.is_capturing:
                        break
                    self.display_packet(packet, captured + 1)
                    captured += 1
            else:
                # Fixed count capture
                for packet in self.capture.sniff_continuously():
                    if not self.is_capturing or captured >= packet_count:
                        break
                    self.display_packet(packet, captured + 1)
                    captured += 1
            
            self.write_output(f"\n{'='*80}\n", "header")
            self.write_output(f"Capture complete. Total packets: {captured}\n", "header")
            self.write_output(f"{'='*80}\n", "header")
            
        except Exception as e:
            self.write_output(f"\nError during capture: {str(e)}\n", "error")
            messagebox.showerror("Capture Error", f"An error occurred:\n{str(e)}")
        
        finally:
            self.is_capturing = False
            self.root.after(0, self.reset_controls)
            if self.capture:
                self.capture.close()
            # Close the event loop
            loop.close()
    
    def display_packet(self, packet, number):
        """Display packet information"""
        try:
            output = f"\n[Packet #{number}] "
            output += f"Time: {packet.sniff_time} | Length: {packet.length} bytes\n"
            
            # IP information
            if hasattr(packet, 'ip'):
                output += f"  IP: {packet.ip.src} → {packet.ip.dst}\n"
            elif hasattr(packet, 'ipv6'):
                output += f"  IPv6: {packet.ipv6.src} → {packet.ipv6.dst}\n"
            
            # Protocol information
            if hasattr(packet, 'tcp'):
                output += f"  Protocol: TCP | Ports: {packet.tcp.srcport} → {packet.tcp.dstport}\n"
            elif hasattr(packet, 'udp'):
                output += f"  Protocol: UDP | Ports: {packet.udp.srcport} → {packet.udp.dstport}\n"
            
            # Application layer
            if hasattr(packet, 'http'):
                output += f"  Application: HTTP\n"
                if hasattr(packet.http, 'request_uri'):
                    output += f"    URI: {packet.http.request_uri}\n"
            elif hasattr(packet, 'dns'):
                output += f"  Application: DNS\n"
                if hasattr(packet.dns, 'qry_name'):
                    output += f"    Query: {packet.dns.qry_name}\n"
            elif hasattr(packet, 'tls'):
                output += f"  Application: TLS/SSL\n"
            
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
