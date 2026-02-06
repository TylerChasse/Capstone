/**
 * NavigationControls - Packet list navigation buttons and auto-scroll toggle
 *
 * Provides controls to navigate through the packet list:
 * - First/Previous/Next/Last packet buttons
 * - Auto-scroll toggle button
 */
function NavigationControls({
  packetCount,
  selectedPacketIndex,
  onFirstPacket,
  onPrevPacket,
  onNextPacket,
  onLastPacket,
  autoScroll,
  onToggleAutoScroll,
}) {
  return (
    <div className="packet-nav">
      <button
        onClick={onFirstPacket}
        disabled={packetCount === 0 || selectedPacketIndex === 0}
        title="First packet"
      >
        |◀
      </button>
      <button
        onClick={onPrevPacket}
        disabled={packetCount === 0 || selectedPacketIndex <= 0}
        title="Previous packet"
      >
        ◀
      </button>
      <span className="nav-position">
        {packetCount > 0 ? `${selectedPacketIndex + 1} / ${packetCount}` : '0 / 0'}
      </span>
      <button
        onClick={onNextPacket}
        disabled={packetCount === 0 || selectedPacketIndex >= packetCount - 1}
        title="Next packet"
      >
        ▶
      </button>
      <button
        onClick={onLastPacket}
        disabled={packetCount === 0 || selectedPacketIndex === packetCount - 1}
        title="Last packet"
      >
        ▶|
      </button>
      <button
        onClick={onToggleAutoScroll}
        className={autoScroll ? 'active' : ''}
        title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
      >
        ⬇
      </button>
    </div>
  );
}

export default NavigationControls;
