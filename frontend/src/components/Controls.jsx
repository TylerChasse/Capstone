/**
 * Controls - Interface selector, filter input, and capture buttons
 *
 * Contains all the user inputs for configuring and controlling packet capture.
 */
function Controls({
  interfaces,
  selectedInterface,
  onInterfaceChange,
  showOnlyConnected,
  onShowOnlyConnectedChange,
  displayFilter,
  onFilterChange,
  isCapturing,
  loading,
  onStartCapture,
  onStopCapture,
  onClear,
  onRefresh,
  canClear,
}) {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Interface:</label>
        <select
          value={selectedInterface}
          onChange={(e) => onInterfaceChange(e.target.value)}
          disabled={isCapturing || loading}
        >
          {interfaces.length === 0 ? (
            <option value="">No interfaces found</option>
          ) : (
            interfaces.map((iface) => (
              <option key={iface} value={iface}>
                {iface}
              </option>
            ))
          )}
        </select>
        <label>
          <input
            type="checkbox"
            checked={showOnlyConnected}
            onChange={(e) => onShowOnlyConnectedChange(e.target.checked)}
            disabled={isCapturing}
          />
          {' '}Connected only
        </label>
      </div>

      <div className="control-group">
        <label>Filter:</label>
        <input
          type="text"
          placeholder="e.g., tcp, udp, ip.addr == 192.168.1.1"
          value={displayFilter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>

      <div className="control-group">
        {!isCapturing ? (
          <button
            className="primary"
            onClick={onStartCapture}
            disabled={loading || !selectedInterface}
          >
            Start Capture
          </button>
        ) : (
          <button className="danger" onClick={onStopCapture}>
            Stop Capture
          </button>
        )}
        <button onClick={onClear} disabled={isCapturing || !canClear}>
          Clear
        </button>
        <button onClick={onRefresh} disabled={isCapturing || loading}>
          Refresh Interfaces
        </button>
      </div>
    </div>
  );
}

export default Controls;
