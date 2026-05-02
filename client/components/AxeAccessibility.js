'use client';

import React from 'react';
import ReactDOM from 'react-dom';

const AxeAccessibility = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      import('@axe-core/react').then((axe) => {
        axe.default(React, ReactDOM, 1000);
      });
    }
  }, []);

  return null;
};

export default AxeAccessibility;
