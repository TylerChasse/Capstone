/**
 * App.jsx - Main Application Component
 *
 * This is the root component that manages all application state and logic.
 * It coordinates between the UI components and the backend API.
 *
 * State Management:
 *   - Interface state: Which network interfaces are available/selected
 *   - Capture state: Is capture running, what packets have been captured
 *   - Filter state: Protocol and IP filters (client-side)
 *   - UI state: Loading indicators, error/success messages
 *
 * The component polls the backend every 500ms during capture to get new packets.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as api from './api';
import {
  Header,
  Controls,
  StatusBar,
  PacketTable,
  PacketDetails,
  TutorialModal,
  TutorialPane,
  ProtocolColorsModal,
} from './components';
import tutorials from './tutorials';

const ALL_PROTOCOLS = [
  'TCP', 'UDP', 'HTTP', 'DNS', 'ICMP', 'ARP', 'TLS/SSL', 'STP', 'VRRP', 'PIM', 'Other'
];

/** Map a packet's protocol string to a filter category */
function getProtocolCategory(protocol) {
  const proto = (protocol || '').toUpperCase();
  if (proto.includes('TCP')) return 'TCP';
  if (proto.includes('UDP')) return 'UDP';
  if (proto.includes('HTTP')) return 'HTTP';
  if (proto.includes('DNS')) return 'DNS';
  if (proto.includes('ICMP')) return 'ICMP';
  if (proto.includes('ARP')) return 'ARP';
  if (proto.includes('TLS') || proto.includes('SSL')) return 'TLS/SSL';
  if (proto.includes('STP')) return 'STP';
  if (proto.includes('VRRP')) return 'VRRP';
  if (proto.includes('PIM')) return 'PIM';
  return 'Other';
}

function App() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  // Interface level - controls UI complexity (beginner/intermediate/advanced)
  const [interfaceLevel, setInterfaceLevel] = useState('beginner');

  // Interface state - which network interfaces are available
  const [interfaces, setInterfaces] = useState([]);
  const [connectedInterfaces, setConnectedInterfaces] = useState([]);
  const [selectedInterface, setSelectedInterface] = useState('');

  // Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);

  // Filter state
  const [protocolFilters, setProtocolFilters] = useState(new Set(ALL_PROTOCOLS));
  const [ipFilters, setIpFilters] = useState([]);

  // UI state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Tutorial state
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [showProtocolColors, setShowProtocolColors] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);

  // Resizable panel
  const [detailsHeight, setDetailsHeight] = useState(200);
  const isResizing = useRef(false);

  // Ref to store the polling interval ID
  const pollInterval = useRef(null);

  // -------------------------------------------------------------------------
  // FILTERED PACKETS
  // -------------------------------------------------------------------------

  const filteredPackets = useMemo(() => {
    return packets.filter((packet) => {
      // Protocol filter
      const category = getProtocolCategory(packet.protocol);
      if (!protocolFilters.has(category)) return false;

      // IP filter (AND with protocol; empty list = show all)
      if (ipFilters.length > 0) {
        const packetIps = [
          packet.network?.src_ip,
          packet.network?.dst_ip,
          packet.arp?.sender_ip,
          packet.arp?.target_ip,
        ].filter(Boolean);

        if (!packetIps.some((ip) => ipFilters.includes(ip))) return false;
      }

      return true;
    });
  }, [packets, protocolFilters, ipFilters]);

  // -------------------------------------------------------------------------
  // EFFECTS (side effects that run on state changes)
  // -------------------------------------------------------------------------

  // Load interfaces when app first mounts
  useEffect(() => {
    loadInterfaces();
  }, []);

  // Listen for tutorial open events from Electron menu
  useEffect(() => {
    if (window.electronAPI?.onOpenTutorial) {
      window.electronAPI.onOpenTutorial((tutorialId) => {
        const tutorial = tutorials[tutorialId];
        if (tutorial) setActiveTutorial(tutorial);
      });
    }
    if (window.electronAPI?.onShowProtocolColors) {
      window.electronAPI.onShowProtocolColors(() => {
        setShowProtocolColors(true);
      });
    }
  }, []);

  // Apply/remove tutorial highlight on UI elements
  useEffect(() => {
    document.querySelectorAll('.tutorial-highlight').forEach((el) => {
      el.classList.remove('tutorial-highlight');
    });
    if (activeHighlight) {
      const targets = Array.isArray(activeHighlight) ? activeHighlight : [activeHighlight];
      targets.forEach((id) => {
        const el = document.querySelector(`[data-highlight="${id}"]`);
        if (el) el.classList.add('tutorial-highlight');
      });
    }
  }, [activeHighlight]);

  // Poll backend for new packets while capture is running
  useEffect(() => {
    if (isCapturing) {
      pollInterval.current = setInterval(async () => {
        try {
          const status = await api.getCaptureStatus();
          if (!status.is_capturing) {
            setIsCapturing(false);
          }
          const data = await api.getAllPackets();
          setPackets(data.packets);
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 500);
    } else {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [isCapturing]);

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------

  /** Load all interfaces and connected interfaces from backend */
  async function loadInterfaces() {
    setLoading(true);
    setError(null);
    try {
      const [allData, connectedData] = await Promise.all([
        api.getInterfaces(),
        api.getConnectedInterfaces(),
      ]);
      setInterfaces(allData.interfaces);
      setConnectedInterfaces(connectedData.interfaces);

      // Auto-select first connected interface
      if (connectedData.interfaces.length > 0) {
        setSelectedInterface(connectedData.interfaces[0]);
      } else if (allData.interfaces.length > 0) {
        setSelectedInterface(allData.interfaces[0]);
      }
    } catch (err) {
      setError('Failed to load interfaces. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  /** Start capturing packets on the selected interface */
  async function handleStartCapture() {
    if (!selectedInterface) {
      setError('Please select an interface');
      return;
    }

    setError(null);
    try {
      await api.startCapture({
        interface: selectedInterface,
        packet_count: 0,
        display_filter: '',
        timeout: 300,
      });
      setIsCapturing(true);
      setPackets([]);
    } catch (err) {
      setError(err.message);
    }
  }

  /** Stop the current capture and fetch final packets */
  async function handleStopCapture() {
    try {
      await api.stopCapture();
      setIsCapturing(false);
      // Final fetch of packets
      const data = await api.getAllPackets();
      setPackets(data.packets);
    } catch (err) {
      setError(err.message);
    }
  }

  /** Clear all captured packets */
  async function handleClearPackets() {
    try {
      await api.clearPackets();
      setPackets([]);
      setSelectedPacket(null);
    } catch (err) {
      setError(err.message);
    }
  }

  /** Export packets to a JSON file */
  async function handleExport() {
    if (packets.length === 0) {
      setError('No packets to export');
      return;
    }

    try {
      // Use Electron dialog if available
      let filePath = 'capture.json';
      if (window.electronAPI) {
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: 'capture.json',
        });
        if (result.canceled) return;
        filePath = result.filePath;
      } else {
        filePath = prompt('Enter file path:', 'capture.json');
        if (!filePath) return;
      }

      await api.exportPackets(filePath, packets);
      setSuccess(`Exported ${packets.length} packets`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  /** Import packets from a JSON file */
  async function handleImport() {
    try {
      let filePath;
      if (window.electronAPI) {
        const result = await window.electronAPI.showOpenDialog({});
        if (result.canceled || result.filePaths.length === 0) return;
        filePath = result.filePaths[0];
      } else {
        filePath = prompt('Enter file path to import:');
        if (!filePath) return;
      }

      // Stop any ongoing capture first
      if (isCapturing) {
        await api.stopCapture();
      }

      const data = await api.importPackets(filePath);
      setIsCapturing(false);  // Ensure capture state is reset
      setPackets(data.packets);
      setSelectedPacket(null);
      setSuccess(`Imported ${data.packet_count} packets`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  // -------------------------------------------------------------------------
  // PACKET NAVIGATION (operates on filtered packets)
  // -------------------------------------------------------------------------

  const selectedPacketIndex = selectedPacket
    ? filteredPackets.findIndex((p) => p.number === selectedPacket.number)
    : -1;

  function handleFirstPacket() {
    if (filteredPackets.length > 0) {
      setSelectedPacket(filteredPackets[0]);
      setAutoScroll(false);
    }
  }

  function handlePrevPacket() {
    if (selectedPacketIndex > 0) {
      setSelectedPacket(filteredPackets[selectedPacketIndex - 1]);
      setAutoScroll(false);
    }
  }

  function handleNextPacket() {
    if (selectedPacketIndex < filteredPackets.length - 1) {
      setSelectedPacket(filteredPackets[selectedPacketIndex + 1]);
      setAutoScroll(false);
    }
  }

  function handleLastPacket() {
    if (filteredPackets.length > 0) {
      setSelectedPacket(filteredPackets[filteredPackets.length - 1]);
      setAutoScroll(true);
    }
  }

  function handleToggleAutoScroll() {
    setAutoScroll(!autoScroll);
  }

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------

  function isConnected(iface) {
    return connectedInterfaces.includes(iface);
  }

  // -------------------------------------------------------------------------
  // RESIZE HANDLE
  // -------------------------------------------------------------------------

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    const startY = e.clientY;
    const startHeight = detailsHeight;

    function onMouseMove(e) {
      if (!isResizing.current) return;
      const delta = startY - e.clientY;
      const newHeight = Math.max(80, Math.min(window.innerHeight - 200, startHeight + delta));
      setDetailsHeight(newHeight);
    }

    function onMouseUp() {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [detailsHeight]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="app-layout">
      <div className="app">
        <Header
          interfaces={interfaces}
          connectedInterfaces={connectedInterfaces}
          selectedInterface={selectedInterface}
          onInterfaceChange={setSelectedInterface}
          isCapturing={isCapturing}
          loading={loading}
          onRefresh={loadInterfaces}
          onExport={handleExport}
          onImport={handleImport}
          canExport={packets.length > 0}
          interfaceLevel={interfaceLevel}
          onLevelChange={setInterfaceLevel}
          onOpenTutorial={(id) => {
            const tutorial = tutorials[id];
            if (tutorial) setActiveTutorial(tutorial);
          }}
        />

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <Controls
          protocolFilters={protocolFilters}
          onProtocolFiltersChange={setProtocolFilters}
          ipFilters={ipFilters}
          onIpFiltersChange={setIpFilters}
          isCapturing={isCapturing}
          loading={loading}
          selectedInterface={selectedInterface}
          onStartCapture={handleStartCapture}
          onStopCapture={handleStopCapture}
          onClear={handleClearPackets}
          canClear={packets.length > 0}
        />

        <StatusBar
          interfaceLevel={interfaceLevel}
          isCapturing={isCapturing}
          packetCount={packets.length}
          filteredCount={filteredPackets.length}
          selectedInterface={selectedInterface}
          isConnected={isConnected(selectedInterface)}
          selectedPacketIndex={selectedPacketIndex}
          onFirstPacket={handleFirstPacket}
          onPrevPacket={handlePrevPacket}
          onNextPacket={handleNextPacket}
          onLastPacket={handleLastPacket}
          autoScroll={autoScroll}
          onToggleAutoScroll={handleToggleAutoScroll}
        />

        <PacketTable
          interfaceLevel={interfaceLevel}
          packets={filteredPackets}
          selectedPacket={selectedPacket}
          onSelectPacket={setSelectedPacket}
          autoScroll={autoScroll}
          onAutoScrollChange={setAutoScroll}
        />

        <div className="resize-handle" onMouseDown={handleResizeStart} />

        <PacketDetails
          interfaceLevel={interfaceLevel}
          packet={selectedPacket}
          style={{ height: detailsHeight, maxHeight: 'none' }}
        />
      </div>

      {activeTutorial && (
        <TutorialPane
          tutorial={activeTutorial}
          onClose={() => { setActiveTutorial(null); setActiveHighlight(null); }}
          onHighlight={setActiveHighlight}
        />
      )}

      {showProtocolColors && (
        <ProtocolColorsModal onClose={() => setShowProtocolColors(false)} />
      )}
    </div>
  );
}

export default App;
