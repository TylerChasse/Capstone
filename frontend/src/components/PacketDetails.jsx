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
          <span className="label" title="Time the packet was captured">Timestamp:</span>
          <span>{packet.timestamp}</span>
        </div>
        <div className="detail-row">
          <span className="label" title="Total packet size in bytes">Length:</span>
          <span>{packet.length} bytes</span>
        </div>
        <div className="detail-row">
          <span className="label" title="Highest-layer protocol detected">Protocol:</span>
          <span>{packet.protocol}</span>
        </div>
        <div className="detail-row">
          <span className="label" title="Protocol stack from lowest to highest layer">Layers:</span>
          <span>{packet.layers}</span>
        </div>
        {level.showInterfaceId && packet.interface_id && (
          <div className="detail-row">
            <span className="label" title="Network adapter device path used for capture">Interface ID:</span>
            <span>{packet.interface_id}</span>
          </div>
        )}
      </div>

      {level.showMacAddresses && packet.ethernet && (
        <div className="detail-section">
          <h4>Data Link Layer</h4>
          <div className="detail-row">
            <span className="label" title="Hardware address of the sending device">Source MAC:</span>
            <span>{packet.ethernet.src_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="Hardware address of the receiving device">Destination MAC:</span>
            <span>{packet.ethernet.dst_mac}</span>
          </div>
          {level.showLayerLengths && packet.ethernet.header_len && (
            <div className="detail-row">
              <span className="label" title="Size of the Ethernet frame header">Header Length:</span>
              <span>{packet.ethernet.header_len} bytes</span>
            </div>
          )}
        </div>
      )}

      {packet.network && (
        <div className="detail-section">
          <h4>Network Layer</h4>
          <div className="detail-row">
            <span className="label" title="IP address of the sender">Source IP:</span>
            <span>{packet.network.src_ip}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="IP address of the receiver">Destination IP:</span>
            <span>{packet.network.dst_ip}</span>
          </div>
          {level.showTtl && packet.network.ttl && (
            <div className="detail-row">
              <span className="label" title="Max hops before the packet is discarded">TTL:</span>
              <span>{packet.network.ttl}</span>
            </div>
          )}
          {level.showLayerLengths && packet.network.header_len && (
            <div className="detail-row">
              <span className="label" title="Size of the IP header">Header Length:</span>
              <span>{packet.network.header_len} bytes</span>
            </div>
          )}
          {level.showLayerLengths && packet.network.total_len && (
            <div className="detail-row">
              <span className="label" title="IP header plus payload size">Total Length:</span>
              <span>{packet.network.total_len} bytes</span>
            </div>
          )}
        </div>
      )}

      {packet.transport && (
        <div className="detail-section">
          <h4>Transport Layer</h4>
          <div className="detail-row">
            <span className="label" title="Port number on the sending host">Source Port:</span>
            <span>{packet.transport.src_port}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="Port number on the receiving host">Destination Port:</span>
            <span>{packet.transport.dst_port}</span>
          </div>
          {packet.transport.flags && (
            <div className="detail-row">
              <span className="label" title="TCP control flags (SYN, ACK, FIN, etc.)">Flags:</span>
              <span>{packet.transport.flags}</span>
            </div>
          )}
          {level.showLayerLengths && packet.transport.header_len && (
            <div className="detail-row">
              <span className="label" title="Size of the transport layer header">Header Length:</span>
              <span>{packet.transport.header_len} bytes</span>
            </div>
          )}
          {level.showLayerLengths && packet.transport.payload_len != null && (
            <div className="detail-row">
              <span className="label" title="Size of the data carried by the transport layer">Payload Length:</span>
              <span>{packet.transport.payload_len} bytes</span>
            </div>
          )}
        </div>
      )}

      {packet.arp && (
        <div className="detail-section">
          <h4>ARP</h4>
          <div className="detail-row">
            <span className="label" title="ARP request or reply">Operation:</span>
            <span>{packet.arp.operation}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="Hardware address of the ARP sender">Sender MAC:</span>
            <span>{packet.arp.sender_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="IP address of the ARP sender">Sender IP:</span>
            <span>{packet.arp.sender_ip}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="Hardware address being queried">Target MAC:</span>
            <span>{packet.arp.target_mac}</span>
          </div>
          <div className="detail-row">
            <span className="label" title="IP address being resolved">Target IP:</span>
            <span>{packet.arp.target_ip}</span>
          </div>
        </div>
      )}

      {packet.application && (
        <div className="detail-section">
          <h4>Application Layer</h4>
          {packet.application.http_host && (
            <div className="detail-row">
              <span className="label" title="Domain name of the HTTP server">HTTP Host:</span>
              <span>{packet.application.http_host}</span>
            </div>
          )}
          {packet.application.http_method && (
            <div className="detail-row">
              <span className="label" title="HTTP request method (GET, POST, etc.)">HTTP Method:</span>
              <span>{packet.application.http_method}</span>
            </div>
          )}
          {packet.application.dns_query && (
            <div className="detail-row">
              <span className="label" title="Domain name being looked up">DNS Query:</span>
              <span>{packet.application.dns_query}</span>
            </div>
          )}
        </div>
      )}

      {level.showRawHex && packet.raw_hex && (
        <div className="detail-section">
          <h4 title="Raw packet bytes in hexadecimal format">Raw Hex</h4>
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
