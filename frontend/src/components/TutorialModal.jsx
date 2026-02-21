import { useState } from 'react';

/**
 * TutorialModal - Popup overlay for step-by-step tutorials
 *
 * Displays a Tutorial's frames one at a time with navigation.
 * Each frame can have a title, text, and optional image.
 */
function TutorialModal({ tutorial, onClose }) {
  const [frameIndex, setFrameIndex] = useState(0);

  if (!tutorial || !tutorial.frames.length) return null;

  const frame = tutorial.frames[frameIndex];
  const isFirst = frameIndex === 0;
  const isLast = frameIndex === tutorial.frames.length - 1;

  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>✕</button>

        <h2 className="tutorial-name">{tutorial.name}</h2>

        <div className="tutorial-frame">
          <h3 className="tutorial-frame-title">{frame.title}</h3>
          <p className="tutorial-frame-text">{frame.text}</p>
          <br></br>
          {frame.image && (
            <img className="tutorial-image" src={frame.image} alt={frame.title} />
          )}
        </div>

        <div className="tutorial-nav">
          <button
            onClick={() => setFrameIndex(frameIndex - 1)}
            disabled={isFirst}
          >
            Previous
          </button>
          <span className="tutorial-counter">
            {frameIndex + 1} / {tutorial.frames.length}
          </span>
          {isLast ? (
            <button className="primary" onClick={onClose}>
              Finish
            </button>
          ) : (
            <button
              className="primary"
              onClick={() => setFrameIndex(frameIndex + 1)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
