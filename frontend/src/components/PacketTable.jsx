function PacketTable({ packets, selectedPacket, onSelectPacket }) {
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
    <div className="packet-table-container">
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
              className={`packet-row ${selectedPacket?.number === packet.number ? 'selected' : ''}`}
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
