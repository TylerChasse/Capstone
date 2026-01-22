/**
 * api.js - Backend API Client
 *
 * Functions to communicate with the Python FastAPI backend.
 * All functions are async and return promises.
 *
 * The backend must be running at http://127.0.0.1:8000 for these to work.
 */

const API_BASE = 'http://127.0.0.1:8000';

// =============================================================================
// INTERFACE FUNCTIONS
// =============================================================================

/** Get all available network interfaces */
export async function getInterfaces() {
  const response = await fetch(`${API_BASE}/interfaces`);
  if (!response.ok) throw new Error('Failed to load interfaces');
  return response.json();
}

/** Get only connected (active) network interfaces */
export async function getConnectedInterfaces() {
  const response = await fetch(`${API_BASE}/interfaces/connected`);
  if (!response.ok) throw new Error('Failed to load connected interfaces');
  return response.json();
}

// =============================================================================
// CAPTURE FUNCTIONS
// =============================================================================

/**
 * Start packet capture on an interface
 * @param {Object} options - Capture options
 * @param {string} options.interface - Interface name to capture on
 * @param {number} options.packet_count - Max packets (0 = unlimited)
 * @param {string} options.display_filter - Wireshark filter string
 * @param {number} options.timeout - Max capture time in seconds
 */
export async function startCapture(options) {
  const response = await fetch(`${API_BASE}/capture/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to start capture');
  }
  return response.json();
}

/** Stop the current capture */
export async function stopCapture() {
  const response = await fetch(`${API_BASE}/capture/stop`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to stop capture');
  return response.json();
}

/** Get current capture status (is_capturing, packet_count) */
export async function getCaptureStatus() {
  const response = await fetch(`${API_BASE}/capture/status`);
  if (!response.ok) throw new Error('Failed to get status');
  return response.json();
}

/** Get packets with pagination */
export async function getPackets(offset = 0, limit = 100) {
  const response = await fetch(`${API_BASE}/capture/packets?offset=${offset}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to get packets');
  return response.json();
}

/** Get all captured packets at once */
export async function getAllPackets() {
  const response = await fetch(`${API_BASE}/capture/packets/all`);
  if (!response.ok) throw new Error('Failed to get packets');
  return response.json();
}

/** Clear all captured packets from memory */
export async function clearPackets() {
  const response = await fetch(`${API_BASE}/capture/packets`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to clear packets');
  return response.json();
}

// =============================================================================
// IMPORT/EXPORT FUNCTIONS
// =============================================================================

/**
 * Export packets to a JSON file
 * @param {string} filePath - Where to save the file
 * @param {Array} packets - Packet data to export
 */
export async function exportPackets(filePath, packets) {
  const response = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath, packets }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to export packets');
  }
  return response.json();
}

/**
 * Import packets from a JSON file
 * @param {string} filePath - Path to the JSON file
 */
export async function importPackets(filePath) {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to import packets');
  }
  return response.json();
}
