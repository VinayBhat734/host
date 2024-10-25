import React from 'react';
import '../LoadingOverlay.css'; // Import the CSS for styling

const LoadingOverlay = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-message">{message || 'Loading...'}</div>
    </div>
  );
};

export default LoadingOverlay;
