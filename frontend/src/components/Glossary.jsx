import { useState } from 'react';

const GLOSSARY_TERMS = [
  // ── Packet Details fields ──────────────────────────────────────────────────
  { term: 'Timestamp', def: 'The exact date and time a packet was captured. Useful for understanding the order of events and how long things took.' },
  { term: 'Length (Packet Length)', def: 'The total size of a packet in bytes, from the very beginning of the frame to the end of the data. Larger packets carry more data but can also cause delays on slow networks.' },
  { term: 'Protocol', def: 'The "language" a packet is using — for example TCP, UDP, DNS, or HTTP. It tells you what kind of communication is happening.' },
  { term: 'Layers', def: 'The stack of protocols used to build the packet, from the lowest level (like Ethernet) up to the application level (like HTTP). Each layer adds its own information.' },
  { term: 'Interface / Interface ID', def: 'The network adapter (e.g., Wi-Fi card or Ethernet port) that captured the packet. A computer can have multiple interfaces.' },
  { term: 'Source IP', def: 'The IP address of the device that sent the packet — the "from" address at the network level.' },
  { term: 'Destination IP', def: 'The IP address of the device the packet is being sent to — the "to" address at the network level.' },
  { term: 'Source MAC', def: 'The hardware address of the network card that sent the packet on the local network. MAC addresses only travel within the same local network.' },
  { term: 'Destination MAC', def: 'The hardware address of the network card the packet is being delivered to on the local network.' },
  { term: 'Source Port', def: 'The port number used by the application that sent the packet. Think of it as the "door" on the sender\'s side of the connection.' },
  { term: 'Destination Port', def: 'The port number the packet is being sent to. Common examples: 80 for HTTP, 443 for HTTPS, 53 for DNS. It tells the receiving computer which application should handle the packet.' },
  { term: 'TCP Flags', def: 'Special on/off switches in a TCP packet that control how the connection is managed. Common flags: SYN (start connection), ACK (acknowledge), FIN (close connection), RST (reset/abort).' },
  { term: 'Header Length', def: 'The size of the protocol\'s header section in bytes. The header holds control information (like addresses and flags), separate from the actual data being carried.' },
  { term: 'Total Length', def: 'The combined size of the IP header and its payload in bytes. This is the full size of the IP portion of the packet.' },
  { term: 'Payload Length', def: 'The size of the actual data inside a packet, not counting the headers. This is the "contents" being delivered.' },
  { term: 'TTL (Time to Live)', def: 'A number that decreases by 1 each time a packet passes through a router. When it hits 0 the packet is dropped. This prevents lost packets from circling the internet forever. A high TTL (like 128) usually means the packet hasn\'t traveled far.' },
  { term: 'Raw Hex', def: 'The complete contents of a packet displayed as hexadecimal (base-16) numbers. Every byte of data is shown, including all headers and payload. Useful for deep inspection when other views don\'t show enough detail.' },
  { term: 'ARP Operation', def: 'Indicates whether an ARP message is a request ("Who has this IP address?") or a reply ("I have that IP — here is my MAC address").' },
  { term: 'Sender MAC / Target MAC', def: 'In an ARP message, the Sender MAC is the hardware address of the device asking or replying, and the Target MAC is the hardware address being looked up (filled in when replying).' },
  { term: 'Sender IP / Target IP', def: 'In an ARP message, the Sender IP is the address of the device asking, and the Target IP is the address being resolved to a MAC address.' },
  { term: 'HTTP Host', def: 'The domain name included in an HTTP request, telling the server which website is being requested (e.g., www.example.com). Important because one server can host many websites.' },
  { term: 'HTTP Method', def: 'The action being requested in an HTTP message. GET retrieves a page or file; POST sends data (like a form submission). Other methods include PUT, DELETE, and HEAD.' },
  { term: 'DNS Query', def: 'The domain name a device is looking up, like "google.com". The DNS system responds with the matching IP address so the device knows where to send traffic.' },

  // ── Core concepts ──────────────────────────────────────────────────────────
  { term: 'ARP (Address Resolution Protocol)', def: 'A protocol that finds the MAC address of a device when you only know its IP address. Your computer uses ARP every time it wants to send data to another device on the same local network.' },
  { term: 'Bandwidth', def: 'The maximum amount of data that can travel through a network connection per second (e.g., 100 Mbps). Think of it like the width of a highway — more lanes means more traffic can flow at once.' },
  { term: 'Broadcast', def: 'A packet sent to every device on the local network at once, rather than to one specific device. Used for things like ARP requests and DHCP discovery.' },
  { term: 'Capture Filter', def: 'A rule set before capturing that limits which packets are recorded. For example, you could capture only DNS traffic. This keeps the capture file smaller and easier to work with.' },
  { term: 'DHCP (Dynamic Host Configuration Protocol)', def: 'The protocol that automatically gives your device an IP address when it connects to a network. Without DHCP you\'d have to set your IP address manually every time.' },
  { term: 'DNS (Domain Name System)', def: 'The internet\'s phone book — it translates domain names like "google.com" into IP addresses that computers can actually route traffic to.' },
  { term: 'Ethernet', def: 'The most common wired networking standard. Ethernet handles getting data from one device to another on the same local network using MAC addresses and frames.' },
  { term: 'FIN', def: 'A TCP flag that means "I\'m done sending data." Both sides send a FIN when closing a connection gracefully.' },
  { term: 'Flow', def: 'All the packets belonging to one conversation between two devices — same source IP, destination IP, source port, and destination port. Grouping packets into flows makes it easier to follow a single connection.' },
  { term: 'Frame', def: 'The envelope that wraps a packet for delivery on a local network. A frame includes the source and destination MAC addresses so the right device on the local network accepts it.' },
  { term: 'Gateway', def: 'The device (usually your router) that your computer sends traffic to when the destination is outside the local network. It acts as the exit door to the internet.' },
  { term: 'Header', def: 'The section at the front of a packet that contains control information — like the "to" and "from" addresses, protocol type, and size. The header is separate from the actual data (payload) being carried.' },
  { term: 'HTTP (HyperText Transfer Protocol)', def: 'The protocol web browsers use to request and receive web pages. HTTP traffic is unencrypted, meaning anyone capturing packets can read the content.' },
  { term: 'HTTPS', def: 'HTTP with encryption added (via TLS). HTTPS keeps web traffic private so it can\'t be read by someone capturing packets between you and the server.' },
  { term: 'ICMP (Internet Control Message Protocol)', def: 'A helper protocol used for network diagnostics. The "ping" command uses ICMP to check if a host is reachable, and traceroute uses it to map the path packets take.' },
  { term: 'IP Address', def: 'A unique address assigned to every device on a network, used to route traffic to the right destination. Like a mailing address, but for computers. Example: 192.168.1.5.' },
  { term: 'IPv4', def: 'The most common version of the Internet Protocol. IPv4 addresses are four numbers separated by dots (e.g., 192.168.0.1). There are about 4 billion possible addresses.' },
  { term: 'IPv6', def: 'The newer version of IP, using longer addresses (e.g., 2001:0db8::1) to support far more devices. Created because IPv4 addresses are running out.' },
  { term: 'Latency', def: 'The delay between sending a packet and receiving a response, measured in milliseconds (ms). Lower latency means a more responsive connection. High latency causes lag.' },
  { term: 'MAC Address', def: 'A hardware address built into every network card that uniquely identifies it on a local network. Formatted as six pairs of hex digits, e.g., 00:1A:2B:3C:4D:5E. Unlike IP addresses, MAC addresses don\'t change and aren\'t used for routing across the internet.' },
  { term: 'OSI Model', def: 'A way of thinking about networking in seven layers, from the physical cable at the bottom up to the application (like a web browser) at the top. Each layer has a specific job. Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  { term: 'Packet', def: 'A small chunk of data sent over a network. Large messages are broken into many packets, sent separately, and reassembled at the destination. Each packet has a header (control info) and a payload (the actual data).' },
  { term: 'Payload', def: 'The actual content being delivered inside a packet — the data the application cares about. Everything else (headers) is just infrastructure to get the payload where it needs to go.' },
  { term: 'Ping', def: 'A simple tool that sends a small ICMP packet to a host and waits for a reply. If you get a reply, the host is reachable. The reply time tells you the latency.' },
  { term: 'Port', def: 'A number (0–65535) that identifies which application on a device should receive a packet. IP addresses get traffic to the right machine; ports get it to the right program. Example: port 443 = HTTPS, port 53 = DNS.' },
  { term: 'RST (Reset)', def: 'A TCP flag that immediately closes a connection, usually because something went wrong or the connection was rejected. Unlike FIN, RST doesn\'t wait for the other side to respond.' },
  { term: 'RTT (Round-Trip Time)', def: 'The time it takes for a packet to travel from your device to another and back. It\'s a practical measure of latency — the RTT you see in a ping result is one example.' },
  { term: 'SYN', def: 'A TCP flag used to start a new connection. The process goes: sender sends SYN → receiver replies SYN-ACK → sender replies ACK. This is called the TCP three-way handshake.' },
  { term: 'TCP (Transmission Control Protocol)', def: 'A protocol that makes sure data arrives completely and in order. TCP establishes a connection before sending data and re-sends anything that gets lost. Used by web browsers, email, and most apps where reliability matters.' },
  { term: 'TCP Handshake', def: 'The three-step process that starts every TCP connection: (1) SYN — sender says "I want to connect", (2) SYN-ACK — receiver says "OK, I\'m ready", (3) ACK — sender says "Great, let\'s go." After this, data can flow.' },
  { term: 'TLS/SSL', def: 'The encryption technology behind HTTPS. TLS wraps the connection in a secure layer so that captured packets appear as scrambled data rather than readable content.' },
  { term: 'Throughput', def: 'How much data actually gets transferred successfully in a given time period. Throughput is often lower than the stated bandwidth because of packet overhead, retransmissions, and network congestion.' },
  { term: 'UDP (User Datagram Protocol)', def: 'A simpler, faster alternative to TCP that doesn\'t guarantee delivery or order. Packets can be lost with no automatic retry. Used where speed matters more than perfection — like video calls, games, and DNS.' },
];

function GlossaryModal({ onClose }) {
  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? GLOSSARY_TERMS.filter(
        ({ term, def }) =>
          term.toLowerCase().includes(search.toLowerCase()) ||
          def.toLowerCase().includes(search.toLowerCase())
      )
    : GLOSSARY_TERMS;

  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="glossary-modal" onClick={e => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>✕</button>
        <h2 className="glossary-title">Network Analyzer Glossary</h2>
        <input
          className="glossary-search"
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <div className="glossary-list">
          {filtered.length === 0 ? (
            <p className="glossary-empty">No matching terms.</p>
          ) : (
            filtered.map(({ term, def }) => (
              <div key={term} className="glossary-entry">
                <div className="glossary-term">{term}</div>
                <div className="glossary-def">{def}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GlossaryModal;
