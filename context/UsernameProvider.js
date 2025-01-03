import React, { createContext, useContext, useState } from 'react';

const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  const [username1, setUsername1] = useState(null);  // Same structure as EpisodeContext

  return (
    <UsernameContext.Provider value={{ username1, setUsername1 }}>
      {children}
    </UsernameContext.Provider>
  );
};

export const useMyUsername = () => {
  return useContext(UsernameContext);  // Same hook structure
};
