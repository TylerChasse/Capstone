import { getLevel } from '../config/levels';

/**
 * PacketDetails - Detailed view of a selected packet
 *
 * Shows all parsed information organized by network layer:
 *   - General: timestamp, length, protocol, layers
 *   - Data Link: Ethernet MACs (intermediate+)
 *   - Network: IP addresses
 *   - Transport: ports, TCP flags
 *   - ARP: MAC/IP mappings
 *   - Application: HTTP, DNS, TLS details
 *   - Raw Hex: hex dump of packet (advanced)
 */
function PacketDetails({ interfaceLevel, packet }) {
  if (!packet) return null;

  const level = getLevel(interfaceLevel);

  return (
    <div className="packet-details">
      <h3>Packet #{packet.number} Details</h3>

      <div className="detail-section">
        <h4>General</h4>
        <div className="detail-row">
          <span className="label">Timestamp:</span>
          <span>{packet.timestamp}</span>
        </div>
        <div className="detail-row">
          <span className="label">Length:</span>
          <span>{packet.length} bytes</span>
        </div>
        <div className="detail-row">
          <span className="label">Protocol:</span>
          <span>{packet.protocol}</span>
        </div>
        <div className="detail-row">
          <span className="label">Layers:</span>
          <span>{packet.layers}</span>
        </div>
      </div>

      {level.showMacAddresses && packet.ethernet && (
        <div className="detail-section">
          <h4>Data Link Layer</h4>
          <div className="detail-row">
            <span className="label">Source MAC:</span>
            <span>{packet.ethernet.src_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label">Destination MAC:</span>
            <span>{packet.ethernet.dst_mac}</span>
          </div>
        </div>
      )}

      {packet.network && (
        <div className="detail-section">
          <h4>Network Layer</h4>
          <div className="detail-row">
            <span className="label">Source IP:</span>
            <span>{packet.network.src_ip}</span>
          </div>
          <div className="detail-row">
            <span className="label">Destination IP:</span>
            <span>{packet.network.dst_ip}</span>
          </div>
          {packet.network.ttl && (
            <div className="detail-row">
              <span className="label">TTL:</span>
              <span>{packet.network.ttl}</span>
            </div>
          )}
        </div>
      )}

      {packet.transport && (
        <div className="detail-section">
          <h4>Transport Layer</h4>
          <div className="detail-row">
            <span className="label">Source Port:</span>
            <span>{packet.transport.src_port}</span>
          </div>
          <div className="detail-row">
            <span className="label">Destination Port:</span>
            <span>{packet.transport.dst_port}</span>
          </div>
          {packet.transport.flags && (
            <div className="detail-row">
              <span className="label">Flags:</span>
              <span>{packet.transport.flags}</span>
            </div>
          )}
        </div>
      )}

      {packet.arp && (
        <div className="detail-section">
          <h4>ARP</h4>
          <div className="detail-row">
            <span className="label">Operation:</span>
            <span>{packet.arp.operation}</span>
          </div>
          <div className="detail-row">
            <span className="label">Sender MAC:</span>
            <span>{packet.arp.sender_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label">Sender IP:</span>
            <span>{packet.arp.sender_ip}</span>
          </div>
          <div className="detail-row">
            <span className="label">Target MAC:</span>
            <span>{packet.arp.target_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label">Target IP:</span>
            <span>{packet.arp.target_ip}</span>
          </div>
        </div>
      )}

      {packet.application && (
        <div className="detail-section">
          <h4>Application Layer</h4>
          {packet.application.http_host && (
            <div className="detail-row">
              <span className="label">HTTP Host:</span>
              <span>{packet.application.http_host}</span>
            </div>
          )}
          {packet.application.http_method && (
            <div className="detail-row">
              <span className="label">HTTP Method:</span>
              <span>{packet.application.http_method}</span>
            </div>
          )}
          {packet.application.dns_query && (
            <div className="detail-row">
              <span className="label">DNS Query:</span>
              <span>{packet.application.dns_query}</span>
            </div>
          )}
        </div>
      )}

      {level.showRawHex && packet.raw_hex && (
        <div className="detail-section">
          <h4>Raw Hex</h4>
          <pre className="raw-hex">{
            packet.raw_hex.match(/.{1,32}/g)?.map((line, i) => {
              const offset = (i * 16).toString(16).padStart(4, '0');
              const hexPairs = line.match(/.{1,2}/g)?.join(' ') || '';
              return `${offset}  ${hexPairs}`;
            }).join('\n')
          }</pre>
        </div>
      )}
    </div>
  );
}

export default PacketDetails;
