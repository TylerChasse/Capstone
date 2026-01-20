function StatusBar({
  isCapturing,
  packetCount,
  selectedInterface,
  isConnected,
  displayFilter,
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
        <span className="value">{packetCount}</span>
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
      {displayFilter && (
        <div className="status-item">
          <span className="label">Filter:</span>
          <span className="value">{displayFilter}</span>
        </div>
      )}
    </div>
  );
}

export default StatusBar;
