import NavigationControls from './NavigationControls';

/**
 * StatusBar - Displays capture status, packet count, and navigation controls
 */
function StatusBar({
  interfaceLevel,
  isCapturing,
  packetCount,
  filteredCount,
  selectedInterface,
  isConnected,
  selectedPacketIndex,
  onFirstPacket,
  onPrevPacket,
  onNextPacket,
  onLastPacket,
  autoScroll,
  onToggleAutoScroll,
}) {
  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="label">Status:</span>
        <span className={`value ${isCapturing ? 'capturing' : ''}`}>
          {isCapturing ? 'Capturing...' : 'Idle'}
        </span>
      </div>
      <div className="status-item">
        <span className="label">Packets:</span>
        <span className="value">
          {filteredCount !== packetCount
            ? `${filteredCount} / ${packetCount}`
            : packetCount}
        </span>
      </div>
      <div className="status-item">
        <span className="label">Interface:</span>
        <span className="value">
          {selectedInterface || 'None'}
          {selectedInterface && (
            <span className={`connected-badge ${isConnected ? 'yes' : 'no'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </span>
      </div>

      <NavigationControls
        packetCount={filteredCount}
        selectedPacketIndex={selectedPacketIndex}
        onFirstPacket={onFirstPacket}
        onPrevPacket={onPrevPacket}
        onNextPacket={onNextPacket}
        onLastPacket={onLastPacket}
        autoScroll={autoScroll}
        onToggleAutoScroll={onToggleAutoScroll}
      />
    </div>
  );
}

export default StatusBar;
