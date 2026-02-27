import { useState, useRef, useEffect } from 'react';

const TUTORIAL_MENU = [
  { id: 'what-is-network-analyzer', label: 'What Is a Network Analyzer?' },
  { id: 'getting-started', label: 'Getting Started' },
  { type: 'separator' },
  {
    label: 'Beginner', children: [
      { id: 'the-basics', label: 'The Fundamentals' },
      { id: 'packet-protocols', label: 'Packet Protocols' },
    ]
  },
  {
    label: 'Intermediate', children: [
      { id: 'mac-addresses', label: 'MAC Addresses' },
      { id: 'ttl', label: 'TTL (Time to Live)' },
    ]
  },
  {
    label: 'Advanced', children: [
      { id: 'packet-lengths', label: 'Packet & Layer Lengths' },
      { id: 'raw-hex', label: 'Raw Hex' },
    ]
  },
];

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
  onOpenTutorial,
}) {
  const isConnected = (iface) => connectedInterfaces.includes(iface);

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const tutorialRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (tutorialRef.current && !tutorialRef.current.contains(e.target)) {
        setTutorialOpen(false);
        setExpandedGroup(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleTutorialSelect(id) {
    setTutorialOpen(false);
    setExpandedGroup(null);
    onOpenTutorial(id);
  }

  return (
    <div className="header">
      <div className="header-controls">
        <div className="control-group" data-highlight="interface-selector">
          <label>Interface:</label>
          <select
            className="interface-select"
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
        <div className="tutorial-dropdown" ref={tutorialRef} data-highlight="tutorials-button">
          <button
            className="tutorial-dropdown-toggle"
            onClick={() => { setTutorialOpen(!tutorialOpen); setExpandedGroup(null); }}
          >
            Tutorials {tutorialOpen ? '▲' : '▼'}
          </button>
          {tutorialOpen && (
            <div className="tutorial-dropdown-menu">
              {TUTORIAL_MENU.map((item, i) => {
                if (item.type === 'separator') {
                  return <div key={i} className="tutorial-menu-separator" />;
                }
                if (item.children) {
                  return (
                    <div key={item.label} className="tutorial-menu-group">
                      <button
                        className="tutorial-menu-group-toggle"
                        onClick={() => setExpandedGroup(expandedGroup === item.label ? null : item.label)}
                      >
                        {item.label} {expandedGroup === item.label ? '▲' : '▼'}
                      </button>
                      {expandedGroup === item.label && (
                        <div className="tutorial-menu-children">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              className="tutorial-menu-item tutorial-menu-child"
                              onClick={() => handleTutorialSelect(child.id)}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    className="tutorial-menu-item"
                    onClick={() => handleTutorialSelect(item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="level-selector" data-highlight="level-selector">
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
          <button data-highlight="export-button" onClick={onExport} disabled={!canExport}>
            Export
          </button>
          <button data-highlight="import-button" onClick={onImport}>Import</button>
        </div>
      </div>
    </div>
  );
}

export default Header;
