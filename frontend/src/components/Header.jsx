/**
 * Header - Interface selector, level selector, and export/import buttons
 */
function Header({
  interfaces,
  connectedInterfaces,
  selectedInterface,
  onInterfaceChange,
  isCapturing,
  loading,
  onRefresh,
  onExport,
  onImport,
  canExport,
  interfaceLevel,
  onLevelChange,
}) {
  const isConnected = (iface) => connectedInterfaces.includes(iface);

  return (
    <div className="header">
      <div className="header-controls">
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
                  {iface}{isConnected(iface) ? ' (Connected)' : ''}
                </option>
              ))
            )}
          </select>
          <button onClick={onRefresh} disabled={isCapturing || loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="header-controls">
        <div className="level-selector">
          <label>Level:</label>
          <select
            value={interfaceLevel}
            onChange={(e) => onLevelChange(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="control-group">
          <button onClick={onExport} disabled={!canExport}>
            Export
          </button>
          <button onClick={onImport}>Import</button>
        </div>
      </div>
    </div>
  );
}

export default Header;
