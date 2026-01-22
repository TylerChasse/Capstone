/**
 * Header - App title bar with level selector and export/import buttons
 */
function Header({ onExport, onImport, canExport, interfaceLevel, onLevelChange }) {
  return (
    <div className="header">
      <h1>Network Analyzer</h1>
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
