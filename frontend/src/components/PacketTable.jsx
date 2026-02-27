import { useRef, useEffect } from 'react';
import { getLevel } from '../config/levels';

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

function PacketTable({ interfaceLevel, packets, selectedPacket, onSelectPacket, autoScroll, onAutoScrollChange }) {
  const containerRef = useRef(null);
  const selectedRowRef = useRef(null);

  // Check if user is near the bottom (within 50px) and update autoScroll state
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (onAutoScrollChange && atBottom !== autoScroll) {
      onAutoScrollChange(atBottom);
    }
  };

  // Auto-scroll to bottom when new packets arrive (only if autoScroll is enabled)
  useEffect(() => {
    if (containerRef.current && autoScroll) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [packets.length, autoScroll]);

  // Scroll selected packet into view when selection changes via navigation
  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedPacket]);

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

  const level = getLevel(interfaceLevel);

  return (
    <div className="packet-table-container" ref={containerRef} onScroll={handleScroll} data-highlight="packet-table">
      <table>
        <thead>
          <tr>
            <th title="Packet sequence number">#</th>
            <th title="Time the packet was captured">Time</th>
            <th title="Source IP or MAC address">Source</th>
            <th title="Destination IP or MAC address">Destination</th>
            <th title="Highest-layer protocol detected">Protocol</th>
            <th title="Total packet size in bytes">Length</th>
            {level.showInfoColumn && <th title="Port info or protocol layer summary">Info</th>}
          </tr>
        </thead>
        <tbody>
          {packets.map((packet) => {
            const isSelected = selectedPacket?.number === packet.number;
            return (
            <tr
              key={packet.number}
              ref={isSelected ? selectedRowRef : null}
              className={`packet-row ${getProtocolClass(packet.protocol)} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPacket(packet)}
            >
              <td>{packet.number}</td>
              <td>{packet.timestamp}</td>
              <td>{packet.network?.src_ip || packet.arp?.sender_ip || '-'}</td>
              <td>{packet.network?.dst_ip || packet.arp?.target_ip || '-'}</td>
              <td>{packet.protocol}</td>
              <td>{packet.length}</td>
              {level.showInfoColumn && (
                <td>
                  {packet.transport
                    ? `${packet.transport.src_port} → ${packet.transport.dst_port}`
                    : packet.layers}
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PacketTable;
