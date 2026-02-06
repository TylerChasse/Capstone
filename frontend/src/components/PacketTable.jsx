import { useRef, useEffect } from 'react';

/**
 * PacketTable - Scrollable table displaying captured packets
 *
 * Shows packet summary info (time, IPs, protocol, ports).
 * Click a row to select it and view details in PacketDetails.
 * Rows are color-coded by protocol type.
 * Auto-scrolls to show new packets as they arrive.
 */

// Map protocol names to CSS class names for color coding
function getProtocolClass(protocol) {
  const proto = (protocol || '').toUpperCase();

  if (proto.includes('TCP')) return 'proto-tcp';
  if (proto.includes('UDP')) return 'proto-udp';
  if (proto.includes('HTTP')) return 'proto-http';
  if (proto.includes('DNS')) return 'proto-dns';
  if (proto.includes('ICMP')) return 'proto-icmp';
  if (proto.includes('ARP')) return 'proto-arp';
  if (proto.includes('TLS') || proto.includes('SSL')) return 'proto-tls';
  if (proto.includes('STP')) return 'proto-stp';
  if (proto.includes('VRRP')) return 'proto-vrrp';
  if (proto.includes('PIM')) return 'proto-pim';

  return 'proto-other';
}

function PacketTable({ interfaceLevel, packets, selectedPacket, onSelectPacket }) {
  const containerRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  // Check if user is near the bottom (within 50px)
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    shouldAutoScroll.current = atBottom;
  };

  // Auto-scroll to bottom when new packets arrive (only if user hasn't scrolled up)
  useEffect(() => {
    if (containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [packets.length]);

  if (packets.length === 0) {
    return (
      <div className="packet-table-container">
        <div className="empty-state">
          <p>No packets captured</p>
          <p>Select an interface and click Start Capture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="packet-table-container" ref={containerRef} onScroll={handleScroll}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Protocol</th>
            <th>Length</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {packets.map((packet) => (
            <tr
              key={packet.number}
              className={`packet-row ${getProtocolClass(packet.protocol)} ${selectedPacket?.number === packet.number ? 'selected' : ''}`}
              onClick={() => onSelectPacket(packet)}
            >
              <td>{packet.number}</td>
              <td>{packet.timestamp}</td>
              <td>{packet.network?.src_ip || packet.arp?.sender_ip || '-'}</td>
              <td>{packet.network?.dst_ip || packet.arp?.target_ip || '-'}</td>
              <td>{packet.protocol}</td>
              <td>{packet.length}</td>
              <td>
                {packet.transport
                  ? `${packet.transport.src_port} → ${packet.transport.dst_port}`
                  : packet.layers}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PacketTable;
