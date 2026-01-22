/**
 * Header - App title bar with export/import buttons
 */
function Header({ onExport, onImport, canExport }) {
  return (
    <div className="header">
      <h1>Network Analyzer</h1>
      <div className="control-group">
        <button onClick={onExport} disabled={!canExport}>
          Export
        </button>
        <button onClick={onImport}>Import</button>
      </div>
    </div>
  );
}

export default Header;
