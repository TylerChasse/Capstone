/**
 * App.jsx - Main Application Component
 *
 * This is the root component that manages all application state and logic.
 * It coordinates between the UI components and the backend API.
 *
 * State Management:
 *   - Interface state: Which network interfaces are available/selected
 *   - Capture state: Is capture running, what packets have been captured
 *   - UI state: Loading indicators, error/success messages
 *
 * The component polls the backend every 500ms during capture to get new packets.
 */

import { useState, useEffect, useRef } from 'react';
import * as api from './api';
import {
  Header,
  Controls,
  StatusBar,
  PacketTable,
  PacketDetails,
} from './components';

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
  const [displayFilter, setDisplayFilter] = useState('');
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ref to store the polling interval ID
  const pollInterval = useRef(null);

  // -------------------------------------------------------------------------
  // EFFECTS (side effects that run on state changes)
  // -------------------------------------------------------------------------

  // Load interfaces when app first mounts
  useEffect(() => {
    loadInterfaces();
  }, []);

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
        display_filter: displayFilter,
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
  // HELPERS
  // -------------------------------------------------------------------------

  /** Check if an interface is in the connected list */
  function isConnected(iface) {
    return connectedInterfaces.includes(iface);
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="app">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        canExport={packets.length > 0}
        interfaceLevel={interfaceLevel}
        onLevelChange={setInterfaceLevel}
      />

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Controls
        interfaceLevel={interfaceLevel}
        interfaces={interfaces}
        connectedInterfaces={connectedInterfaces}
        selectedInterface={selectedInterface}
        onInterfaceChange={setSelectedInterface}
        displayFilter={displayFilter}
        onFilterChange={setDisplayFilter}
        isCapturing={isCapturing}
        loading={loading}
        onStartCapture={handleStartCapture}
        onStopCapture={handleStopCapture}
        onClear={handleClearPackets}
        onRefresh={loadInterfaces}
        canClear={packets.length > 0}
      />

      <StatusBar
        interfaceLevel={interfaceLevel}
        isCapturing={isCapturing}
        packetCount={packets.length}
        selectedInterface={selectedInterface}
        isConnected={isConnected(selectedInterface)}
        displayFilter={displayFilter}
      />

      <PacketTable
        interfaceLevel={interfaceLevel}
        packets={packets}
        selectedPacket={selectedPacket}
        onSelectPacket={setSelectedPacket}
      />

      <PacketDetails interfaceLevel={interfaceLevel} packet={selectedPacket} />
    </div>
  );
}

export default App;
