import React, { createContext, useState, useContext } from 'react';

const HelloVisibilityContext = createContext();

export const HelloVisibilityProvider = ({ children }) => {
  const [showHello, setShowHello] = useState(false);

  return (
    <HelloVisibilityContext.Provider value={{ showHello, setShowHello }}>
      {children}
    </HelloVisibilityContext.Provider>
  );
};

export const useHelloVisibility = () => useContext(HelloVisibilityContext);
