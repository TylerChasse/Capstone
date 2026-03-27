import { useState, useRef, useEffect } from 'react';
import GlossaryModal from './Glossary';

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
 * MenuBar - Custom application menu bar replacing the native Electron menu.
 *
 * Rendered inside the frameless window so every element is part of the React
 * DOM and can be targeted by the tutorial data-highlight system.
 *
 * data-highlight targets:
 *   file-menu, export-button, import-button,
 *   view-menu, tutorials-button, help-menu, protocol-colors-button
 */
function MenuBar({ onExport, onImport, onShowProtocolColors, onOpenTutorial }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const barRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcuts (Ctrl+E export, Ctrl+I import)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          onExport();
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          onImport();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExport, onImport]);

  function toggle(menu) {
    if (openMenu === menu) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menu);
      setExpandedGroup(null);
    }
  }

  function hover(menu) {
    if (openMenu !== null) {
      setOpenMenu(menu);
      setExpandedGroup(null);
    }
  }

  function action(fn) {
    setOpenMenu(null);
    setExpandedGroup(null);
    fn();
  }

  function handleTutorialSelect(id) {
    setOpenMenu(null);
    setExpandedGroup(null);
    onOpenTutorial(id);
  }

  const api = window.electronAPI;

  return (
    <div className="menu-bar" ref={barRef}>
      <div className="menu-bar-menus">
        {/* ---- File ---- */}
        <div className="menu-item" data-highlight="file-menu">
          <button
            className={openMenu === 'file' ? 'active' : ''}
            onClick={() => toggle('file')}
            onMouseEnter={() => hover('file')}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="menu-dropdown">
              <button data-highlight="export-button" onClick={() => action(onExport)}>
                Export Capture <span className="shortcut">Ctrl+E</span>
              </button>
              <button data-highlight="import-button" onClick={() => action(onImport)}>
                Import Capture <span className="shortcut">Ctrl+I</span>
              </button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.appQuit())}>Quit</button>
            </div>
          )}
        </div>

        {/* ---- View ---- */}
        <div className="menu-item" data-highlight="view-menu">
          <button
            className={openMenu === 'view' ? 'active' : ''}
            onClick={() => toggle('view')}
            onMouseEnter={() => hover('view')}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="menu-dropdown">
              <button onClick={() => action(() => api?.windowReload())}>Reload</button>
              <button onClick={() => action(() => api?.windowForceReload())}>Force Reload</button>
              <button onClick={() => action(() => api?.windowToggleDevTools())}>Toggle DevTools</button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.windowResetZoom())}>Reset Zoom</button>
              <button onClick={() => action(() => api?.windowZoomIn())}>Zoom In</button>
              <button onClick={() => action(() => api?.windowZoomOut())}>Zoom Out</button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.windowToggleFullscreen())}>Toggle Fullscreen</button>
            </div>
          )}
        </div>

        {/* ---- Tutorials ---- */}
        <div className="menu-item" data-highlight="tutorials-button">
          <button
            className={openMenu === 'tutorials' ? 'active' : ''}
            onClick={() => toggle('tutorials')}
            onMouseEnter={() => hover('tutorials')}
          >
            Tutorials
          </button>
          {openMenu === 'tutorials' && (
            <div className="menu-dropdown">
              {TUTORIAL_MENU.map((item, i) => {
                if (item.type === 'separator') {
                  return <div key={i} className="menu-separator" />;
                }
                if (item.children) {
                  return (
                    <div key={item.label} className="tutorial-menu-group">
                      <button
                        onClick={() => setExpandedGroup(expandedGroup === item.label ? null : item.label)}
                      >
                        {item.label} {expandedGroup === item.label ? '▲' : '▼'}
                      </button>
                      {expandedGroup === item.label && (
                        <div>
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              className="tutorial-menu-child"
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
                  <button key={item.id} onClick={() => handleTutorialSelect(item.id)}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ---- Help ---- */}
        <div className="menu-item" data-highlight="help-menu">
          <button
            className={openMenu === 'help' ? 'active' : ''}
            onClick={() => toggle('help')}
            onMouseEnter={() => hover('help')}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="menu-dropdown">
              <button onClick={() => action(() => setShowGlossary(true))}>
                Glossary
              </button>
              <div className="menu-separator" />
              <button
                data-highlight="protocol-colors-button"
                onClick={() => action(onShowProtocolColors)}
              >
                Protocol Colors
              </button>
              <div className="menu-separator" />
              <button onClick={() => action(() => api?.openExternal('https://github.com/TylerChasse/Capstone'))}>
                Documentation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Window Controls ---- */}
      {api && (
        <div className="window-controls">
          <button className="win-btn" onClick={() => api.windowMinimize()} title="Minimize">&#x2013;</button>
          <button className="win-btn" onClick={() => api.windowMaximize()} title="Maximize">&#x25A1;</button>
          <button className="win-btn win-close" onClick={() => api.windowClose()} title="Close">&#x2715;</button>
        </div>
      )}

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
    </div>
  );
}

export default MenuBar;
