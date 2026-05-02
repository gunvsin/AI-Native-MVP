import React from 'react';
import ReactDOM from 'react-dom';

const AxeAccessibility = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  React.useEffect(() => {
    const runAxe = async () => {
      const axe = await (await import('@axe-core/react')).default;
      axe(React, ReactDOM, 1000);
    };
    runAxe();
  }, []);

  return null;
};

export default AxeAccessibility;
