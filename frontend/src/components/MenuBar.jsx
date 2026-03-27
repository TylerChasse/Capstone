import { useState, useRef, useEffect } from 'react';
import GlossaryModal from './Glossary';

/**
 * MenuBar - Custom application menu bar replacing the native Electron menu.
 *
 * Rendered inside the frameless window so every element is part of the React
 * DOM and can be targeted by the tutorial data-highlight system.
 *
 * data-highlight targets:
 *   file-menu, export-button, import-button,
 *   view-menu, help-menu, protocol-colors-button
 */
function MenuBar({ onExport, onImport, onShowProtocolColors }) {
  const [openMenu, setOpenMenu] = useState(null);
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
    setOpenMenu(openMenu === menu ? null : menu);
  }

  function hover(menu) {
    if (openMenu !== null) setOpenMenu(menu);
  }

  function action(fn) {
    setOpenMenu(null);
    fn();
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
