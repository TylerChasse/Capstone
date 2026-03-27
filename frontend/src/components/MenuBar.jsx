import { useState, useRef, useEffect } from 'react';

/**
 * MenuBar - Custom application menu bar replacing the native Electron menu.
 *
 * Rendered inside the frameless window so every element is part of the React
 * DOM and can be targeted by the tutorial data-highlight system.
 *
 * data-highlight targets:
 *   file-menu, export-button, import-button,
 *   view-menu, help-menu, protocol-colors-button
 */
const GLOSSARY_TERMS = [
  { term: 'ARP (Address Resolution Protocol)', def: 'Maps IP addresses to MAC addresses on a local network segment.' },
  { term: 'Bandwidth', def: 'The maximum rate of data transfer across a network path, measured in bits per second (bps).' },
  { term: 'Broadcast', def: 'A packet sent to all devices on a network segment, typically using the address 255.255.255.255 or a subnet broadcast address.' },
  { term: 'Capture Filter', def: 'A filter applied before packets are captured to limit which packets are recorded, reducing file size and noise.' },
  { term: 'Checksum', def: 'A value calculated from packet data used to detect errors or corruption during transmission.' },
  { term: 'DHCP (Dynamic Host Configuration Protocol)', def: 'Automatically assigns IP addresses and network configuration to devices when they join a network.' },
  { term: 'DNS (Domain Name System)', def: 'Translates human-readable domain names (e.g., example.com) into IP addresses.' },
  { term: 'Ethernet', def: 'The most common wired networking technology, operating at the data link layer (Layer 2) using MAC addresses and frames.' },
  { term: 'FIN', def: 'A TCP control flag used to signal the end of a connection; part of the four-way TCP teardown handshake.' },
  { term: 'Flow', def: 'A sequence of packets between a specific source and destination sharing the same protocol, IP addresses, and ports.' },
  { term: 'Fragment', def: 'A portion of a larger IP packet that has been split to fit within the MTU of a network link.' },
  { term: 'Frame', def: 'A unit of data transmission at the data link layer (Layer 2), encapsulating a packet with source/destination MAC addresses.' },
  { term: 'Gateway', def: 'A network node that serves as an entry/exit point between networks, often a router forwarding traffic to the internet.' },
  { term: 'Header', def: 'The control information at the beginning of a packet or frame, containing addresses, protocol type, length, flags, and other metadata.' },
  { term: 'HTTP (HyperText Transfer Protocol)', def: 'Application-layer protocol used for transmitting web pages and data over the internet (unencrypted).' },
  { term: 'HTTPS', def: 'HTTP over TLS/SSL — encrypted web traffic providing confidentiality and integrity for web communications.' },
  { term: 'ICMP (Internet Control Message Protocol)', def: 'Used for network diagnostics and error reporting. Powers tools like ping and traceroute.' },
  { term: 'IP Address', def: 'A numerical label assigned to each device on a network. IPv4 uses 32-bit addresses (e.g., 192.168.1.1); IPv6 uses 128-bit addresses.' },
  { term: 'IPv4', def: '32-bit Internet Protocol version 4, the most widely used version. Addresses written as four octets (e.g., 10.0.0.1).' },
  { term: 'IPv6', def: '128-bit Internet Protocol version 6, designed to replace IPv4 with a vastly larger address space.' },
  { term: 'Latency', def: 'The time delay between a packet being sent and received, typically measured in milliseconds (ms).' },
  { term: 'MAC Address', def: 'A 48-bit hardware identifier assigned to a network interface, used for communication within a local network segment.' },
  { term: 'MTU (Maximum Transmission Unit)', def: 'The largest packet size that can be transmitted over a network link without fragmentation, commonly 1500 bytes for Ethernet.' },
  { term: 'Multicast', def: 'A packet sent to a group of interested receivers simultaneously, more efficient than broadcast for group communication.' },
  { term: 'NAT (Network Address Translation)', def: 'Translates private IP addresses to a public IP address, allowing multiple devices to share a single public IP.' },
  { term: 'OSI Model', def: 'A 7-layer conceptual framework describing network communication: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  { term: 'Packet', def: 'A formatted unit of data transmitted over a network, containing a header (control info) and payload (data).' },
  { term: 'Payload', def: 'The actual data content carried within a packet, excluding protocol headers and trailers.' },
  { term: 'PCAP', def: 'Packet capture file format used to save captured network traffic for offline analysis.' },
  { term: 'PDU (Protocol Data Unit)', def: 'A block of data specified in a protocol — a frame at Layer 2, a packet at Layer 3, a segment at Layer 4.' },
  { term: 'Ping', def: 'A network utility using ICMP echo request/reply to test reachability and measure round-trip time to a host.' },
  { term: 'Port', def: 'A 16-bit number identifying a specific process or service on a host. Well-known ports: HTTP (80), HTTPS (443), DNS (53), SSH (22).' },
  { term: 'Protocol', def: 'A set of rules governing how data is formatted and transmitted between devices on a network (e.g., TCP, UDP, HTTP, DNS).' },
  { term: 'RST', def: 'A TCP control flag that abruptly terminates a connection, typically indicating an error or refused connection.' },
  { term: 'RTT (Round-Trip Time)', def: 'The time for a packet to travel from sender to receiver and back, a key latency metric.' },
  { term: 'Socket', def: 'An endpoint for network communication, identified by an IP address and port number combination.' },
  { term: 'SSH (Secure Shell)', def: 'An encrypted protocol for secure remote login and command execution over a network (port 22).' },
  { term: 'Subnet / Subnet Mask', def: 'A subdivision of an IP network. The subnet mask (e.g., /24 = 255.255.255.0) defines which part of an IP address is the network vs. host.' },
  { term: 'SYN', def: 'A TCP control flag used to initiate a connection. A SYN/SYN-ACK/ACK exchange forms the TCP three-way handshake.' },
  { term: 'TCP (Transmission Control Protocol)', def: 'A connection-oriented Layer 4 protocol guaranteeing ordered, reliable, error-checked delivery of data between applications.' },
  { term: 'TCP Handshake', def: 'The three-step process (SYN → SYN-ACK → ACK) that establishes a TCP connection before data transfer begins.' },
  { term: 'TLS/SSL', def: 'Cryptographic protocols that provide encryption, authentication, and integrity for network communications (used by HTTPS).' },
  { term: 'Throughput', def: 'The actual rate of successful data delivery over a network, often lower than bandwidth due to overhead and retransmissions.' },
  { term: 'TTL (Time to Live)', def: 'A counter in IP packets decremented at each router hop. When it reaches 0 the packet is discarded, preventing infinite loops.' },
  { term: 'UDP (User Datagram Protocol)', def: 'A connectionless Layer 4 protocol offering low-overhead, best-effort delivery with no guaranteed ordering or reliability (used by DNS, video streaming).' },
  { term: 'Unicast', def: 'A packet addressed to a single specific destination, as opposed to broadcast or multicast.' },
  { term: 'VLAN (Virtual LAN)', def: 'A logical grouping of network devices regardless of physical location, segmenting traffic within a switched network.' },
  { term: 'Wireshark', def: 'A popular open-source packet analyzer used for network troubleshooting, analysis, and protocol development.' },
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
      <div
        className="glossary-modal"
        onClick={e => e.stopPropagation()}
      >
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

function MenuBar({ onExport, onImport, onShowProtocolColors }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const barRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcuts (Ctrl+E export, Ctrl+I import)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          onExport();
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          onImport();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExport, onImport]);

  function toggle(menu) {
    setOpenMenu(openMenu === menu ? null : menu);
  }

  function hover(menu) {
    if (openMenu !== null) setOpenMenu(menu);
  }

  function action(fn) {
    setOpenMenu(null);
    fn();
  }

  const api = window.electronAPI;

  return (
    <div className="menu-bar" ref={barRef}>
      <div className="menu-bar-menus">
        {/* ---- File ---- */}
        <div className="menu-item" data-highlight="file-menu">
          <button
            className={openMenu === 'file' ? 'active' : ''}
            onClick={() => toggle('file')}
            onMouseEnter={() => hover('file')}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="menu-dropdown">
              <button data-highlight="export-button" onClick={() => action(onExport)}>
                Export Capture <span className="shortcut">Ctrl+E</span>
              </button>
              <button data-highlight="import-button" onClick={() => action(onImport)}>
                Import Capture <span className="shortcut">Ctrl+I</span>
              </button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.appQuit())}>Quit</button>
            </div>
          )}
        </div>

        {/* ---- View ---- */}
        <div className="menu-item" data-highlight="view-menu">
          <button
            className={openMenu === 'view' ? 'active' : ''}
            onClick={() => toggle('view')}
            onMouseEnter={() => hover('view')}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="menu-dropdown">
              <button onClick={() => action(() => api?.windowReload())}>Reload</button>
              <button onClick={() => action(() => api?.windowForceReload())}>Force Reload</button>
              <button onClick={() => action(() => api?.windowToggleDevTools())}>Toggle DevTools</button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.windowResetZoom())}>Reset Zoom</button>
              <button onClick={() => action(() => api?.windowZoomIn())}>Zoom In</button>
              <button onClick={() => action(() => api?.windowZoomOut())}>Zoom Out</button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.windowToggleFullscreen())}>Toggle Fullscreen</button>
            </div>
          )}
        </div>

        {/* ---- Help ---- */}
        <div className="menu-item" data-highlight="help-menu">
          <button
            className={openMenu === 'help' ? 'active' : ''}
            onClick={() => toggle('help')}
            onMouseEnter={() => hover('help')}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="menu-dropdown">
              <button onClick={() => action(() => setShowGlossary(true))}>
                Glossary
              </button>
              <div className="menu-separator" />
              <button
                data-highlight="protocol-colors-button"
                onClick={() => action(onShowProtocolColors)}
              >
                Protocol Colors
              </button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.openExternal('https://github.com/TylerChasse/Capstone'))}>
                Documentation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Window Controls ---- */}
      {api && (
        <div className="window-controls">
          <button className="win-btn" onClick={() => api.windowMinimize()} title="Minimize">&#x2013;</button>
          <button className="win-btn" onClick={() => api.windowMaximize()} title="Maximize">&#x25A1;</button>
          <button className="win-btn win-close" onClick={() => api.windowClose()} title="Close">&#x2715;</button>
        </div>
      )}

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
    </div>
  );
}

export default MenuBar;
