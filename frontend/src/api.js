const API_BASE = 'http://127.0.0.1:8000';

export async function getInterfaces() {
  const response = await fetch(`${API_BASE}/interfaces`);
  if (!response.ok) throw new Error('Failed to load interfaces');
  return response.json();
}

export async function getConnectedInterfaces() {
  const response = await fetch(`${API_BASE}/interfaces/connected`);
  if (!response.ok) throw new Error('Failed to load connected interfaces');
  return response.json();
}

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

export async function stopCapture() {
  const response = await fetch(`${API_BASE}/capture/stop`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to stop capture');
  return response.json();
}

export async function getCaptureStatus() {
  const response = await fetch(`${API_BASE}/capture/status`);
  if (!response.ok) throw new Error('Failed to get status');
  return response.json();
}

export async function getPackets(offset = 0, limit = 100) {
  const response = await fetch(`${API_BASE}/capture/packets?offset=${offset}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to get packets');
  return response.json();
}

export async function getAllPackets() {
  const response = await fetch(`${API_BASE}/capture/packets/all`);
  if (!response.ok) throw new Error('Failed to get packets');
  return response.json();
}

export async function clearPackets() {
  const response = await fetch(`${API_BASE}/capture/packets`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to clear packets');
  return response.json();
}

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
