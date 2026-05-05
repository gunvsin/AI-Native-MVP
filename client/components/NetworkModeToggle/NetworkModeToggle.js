// client/components/NetworkModeToggle.js
import React, { useState, useEffect } from 'react';

const NetworkModeToggle = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.isNetworkModeActive = isActive;
    }
  }, [isActive]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid black',
      zIndex: 9999,
    }}>
      <label htmlFor="network-mode-toggle">
        <input
          type="checkbox"
          id="network-mode-toggle"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Enable Network Mode
      </label>
    </div>
  );
};

export default NetworkModeToggle;
