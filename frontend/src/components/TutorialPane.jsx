import { useState, useEffect } from 'react';

/**
 * TutorialPane - Side panel for step-by-step tutorials
 *
 * Renders alongside the main tool so the user can follow along
 * while still using the application.
 */
function TutorialPane({ tutorial, onClose, onHighlight }) {
  const [frameIndex, setFrameIndex] = useState(0);

  const frame = tutorial?.frames[frameIndex];

  // Notify parent of the current frame's highlight target
  useEffect(() => {
    if (onHighlight) onHighlight(frame?.highlight ?? null);
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
