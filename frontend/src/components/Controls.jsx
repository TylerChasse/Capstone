import { useState, useRef, useEffect } from 'react';

const ALL_PROTOCOLS = [
  'TCP', 'UDP', 'HTTP', 'DNS', 'ICMP', 'ARP', 'TLS/SSL', 'STP', 'VRRP', 'PIM', 'Other'
];

/**
 * Controls - Protocol filter, IP filter, and capture buttons
 */
function Controls({
  protocolFilters,
  onProtocolFiltersChange,
  ipFilters,
  onIpFiltersChange,
  isCapturing,
  loading,
  selectedInterface,
  onStartCapture,
  onStopCapture,
  onClear,
  canClear,
}) {
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [ipOpen, setIpOpen] = useState(false);
  const [ipInput, setIpInput] = useState('');
  const protocolRef = useRef(null);
  const ipRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (protocolRef.current && !protocolRef.current.contains(e.target)) {
        setProtocolOpen(false);
      }
      if (ipRef.current && !ipRef.current.contains(e.target)) {
        setIpOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleProtocolToggle(protocol) {
    const next = new Set(protocolFilters);
    if (next.has(protocol)) {
      next.delete(protocol);
    } else {
      next.add(protocol);
    }
    onProtocolFiltersChange(next);
  }

  function handleSelectAll() {
    onProtocolFiltersChange(new Set(ALL_PROTOCOLS));
  }

  function handleSelectNone() {
    onProtocolFiltersChange(new Set());
  }

  function handleIpAdd(e) {
    if (e.key === 'Enter' && ipInput.trim()) {
      const ip = ipInput.trim();
      if (!ipFilters.includes(ip)) {
        onIpFiltersChange([...ipFilters, ip]);
      }
      setIpInput('');
    }
  }

  function handleIpRemove(ip) {
    onIpFiltersChange(ipFilters.filter((f) => f !== ip));
  }

  const protocolLabel = protocolFilters.size === ALL_PROTOCOLS.length
    ? 'Protocols: All'
    : protocolFilters.size === 0
      ? 'Protocols: None'
      : `Protocols: ${protocolFilters.size}/${ALL_PROTOCOLS.length}`;

  return (
    <div className="controls">
      {/* Protocol Filter */}
      <div className="filter-group" ref={protocolRef}>
        <label>Protocol Filter:</label>
        <div className="filter-dropdown-wrapper">
          <button
            className="filter-dropdown-btn"
            onClick={() => setProtocolOpen(!protocolOpen)}
          >
            {protocolLabel} {protocolOpen ? '▲' : '▼'}
          </button>
          {protocolOpen && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-actions">
                <button onClick={handleSelectAll}>All</button>
                <button onClick={handleSelectNone}>None</button>
              </div>
              {ALL_PROTOCOLS.map((proto) => (
                <label key={proto} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={protocolFilters.has(proto)}
                    onChange={() => handleProtocolToggle(proto)}
                  />
                  {proto}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IP Filter */}
      <div className="filter-group" ref={ipRef}>
        <label>IP Filter:</label>
        <div className="filter-dropdown-wrapper">
          <div className="ip-filter-input-row">
            <input
              type="text"
              placeholder="Enter IP and press Enter"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={handleIpAdd}
            />
            <button
              className="filter-dropdown-btn ip-dropdown-toggle"
              onClick={() => setIpOpen(!ipOpen)}
            >
              {ipFilters.length > 0 ? `${ipFilters.length}` : '0'} {ipOpen ? '▲' : '▼'}
            </button>
          </div>
          {ipOpen && (
            <div className="filter-dropdown ip-dropdown">
              {ipFilters.length === 0 ? (
                <div className="ip-empty">No IPs added</div>
              ) : (
                <>
                  <div className="filter-dropdown-actions">
                    <button onClick={() => onIpFiltersChange([])}>Clear All</button>
                  </div>
                  {ipFilters.map((ip) => (
                    <div key={ip} className="ip-tag">
                      <span>{ip}</span>
                      <button onClick={() => handleIpRemove(ip)}>✕</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Capture Buttons */}
      <div className="control-group" style={{ marginLeft: 'auto' }}>
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
      </div>
    </div>
  );
}

export default Controls;
