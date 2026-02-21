const PROTOCOL_COLORS = [
  { name: 'TCP',     color: '#4caf50' },
  { name: 'UDP',     color: '#2196f3' },
  { name: 'HTTP',    color: '#ffc107' },
  { name: 'DNS',     color: '#9c27b0' },
  { name: 'ICMP',    color: '#ff5722' },
  { name: 'ARP',     color: '#00bcd4' },
  { name: 'TLS/SSL', color: '#e91e63' },
  { name: 'STP',     color: '#795548' },
  { name: 'VRRP',    color: '#3f51b5' },
  { name: 'PIM',     color: '#009688' },
  { name: 'Other',   color: '#9e9e9e' },
];

function ProtocolColorsModal({ onClose }) {
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="protocol-colors-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>✕</button>
        <h2 className="tutorial-name">Protocol Color Coding</h2>
        <div className="protocol-colors-list">
          {PROTOCOL_COLORS.map(({ name, color }) => (
            <div key={name} className="protocol-color-row">
              <span
                className="protocol-color-swatch"
                style={{ background: `rgba(${hexToRgb(color)}, 0.15)`, borderLeft: `3px solid ${color}` }}
              />
              <span className="protocol-color-label">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default ProtocolColorsModal;
