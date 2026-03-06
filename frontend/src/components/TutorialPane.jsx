import { useState, useEffect, useRef } from 'react';

/**
 * TutorialPane - Side panel for step-by-step tutorials
 *
 * Renders alongside the main tool so the user can follow along
 * while still using the application.
 */
function TutorialPane({ tutorial, onClose, onHighlight, onAction, onSelectPacket }) {
  const [frameIndex, setFrameIndex] = useState(0);

  const frame = tutorial?.frames[frameIndex];

  // Keep a ref to onSelectPacket so the frame-change effect doesn't re-fire
  // when the parent re-renders and passes a new inline function reference.
  const onSelectPacketRef = useRef(onSelectPacket);
  useEffect(() => { onSelectPacketRef.current = onSelectPacket; });

  // Notify parent of the current frame's highlight and auto-select a packet
  // once when the frame changes — does not re-run on parent re-renders so the
  // user can freely click other packets without being overridden.
  useEffect(() => {
    if (onHighlight) onHighlight(frame?.highlight ?? null);
    if (onSelectPacketRef.current && frame?.selectPacket) {
      onSelectPacketRef.current(frame.selectPacket);
    }
  }, [frame, onHighlight]);

  // Clear highlight when pane unmounts
  useEffect(() => {
    return () => { if (onHighlight) onHighlight(null); };
  }, [onHighlight]);

  if (!tutorial || !tutorial.frames.length) return null;

  const isFirst = frameIndex === 0;
  const isLast = frameIndex === tutorial.frames.length - 1;

  return (
    <div className="tutorial-pane">
      <div className="tutorial-pane-header">
        <h2 className="tutorial-name">{tutorial.name}</h2>
        <button className="tutorial-close" onClick={onClose}>✕</button>
      </div>

      <div className="tutorial-pane-body">
        <div className="tutorial-frame">
          <h3 className="tutorial-frame-title">{frame.title}</h3>
          <p className="tutorial-frame-text">{frame.text}</p>
          {frame.image && (
            <>
              <br />
              <img className="tutorial-image" src={frame.image} alt={frame.title} />
            </>
          )}
        </div>
      </div>

      <div className="tutorial-nav">
        <button onClick={() => setFrameIndex(frameIndex - 1)} disabled={isFirst}>
          Previous
        </button>
        <span className="tutorial-counter">
          {frameIndex + 1} / {tutorial.frames.length}
        </span>
        {isLast ? (
          <button className="primary" onClick={onClose}>Finish</button>
        ) : frame.actionButton ? (
          <button
            className="primary tutorial-action-btn"
            onClick={() => {
              if (onAction) onAction(frame.actionButton.action);
              setFrameIndex(frameIndex + 1);
            }}
          >
            {frame.actionButton.label}
          </button>
        ) : (
          <button className="primary" onClick={() => setFrameIndex(frameIndex + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default TutorialPane;
