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
  // Interface state
  const [interfaces, setInterfaces] = useState([]);
  const [connectedInterfaces, setConnectedInterfaces] = useState([]);
  const [selectedInterface, setSelectedInterface] = useState('');
  const [showOnlyConnected, setShowOnlyConnected] = useState(true);

  // Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [displayFilter, setDisplayFilter] = useState('');
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Polling interval ref
  const pollInterval = useRef(null);

  // Load interfaces on mount
  useEffect(() => {
    loadInterfaces();
  }, []);

  // Poll for packets when capturing
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

  async function handleClearPackets() {
    try {
      await api.clearPackets();
      setPackets([]);
      setSelectedPacket(null);
    } catch (err) {
      setError(err.message);
    }
  }

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

  const displayInterfaces = showOnlyConnected ? connectedInterfaces : interfaces;

  function isConnected(iface) {
    return connectedInterfaces.includes(iface);
  }

  return (
    <div className="app">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        canExport={packets.length > 0}
      />

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Controls
        interfaces={displayInterfaces}
        selectedInterface={selectedInterface}
        onInterfaceChange={setSelectedInterface}
        showOnlyConnected={showOnlyConnected}
        onShowOnlyConnectedChange={setShowOnlyConnected}
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
        isCapturing={isCapturing}
        packetCount={packets.length}
        selectedInterface={selectedInterface}
        isConnected={isConnected(selectedInterface)}
        displayFilter={displayFilter}
      />

      <PacketTable
        packets={packets}
        selectedPacket={selectedPacket}
        onSelectPacket={setSelectedPacket}
      />

      <PacketDetails packet={selectedPacket} />
    </div>
  );
}

export default App;
