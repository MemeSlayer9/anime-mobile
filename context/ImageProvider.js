import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const ImageProvider = ({ children }) => {
  const [profile, setProfileImage] = useState(null);  // Same structure as EpisodeContext

  return (
    <ProfileContext.Provider value={{ profile, setProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);  // Same hook structure
};
