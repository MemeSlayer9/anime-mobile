import React, { useContext, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack, ListStack, BrowseList, AccountStack, MyAccountStack2 } from './Navigator';
import { FullscreenContext } from './FullscreenContext';
import Hello from './Hello';
import { Text, View, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useClose } from '../context/CloseProvider';
import { useEpisode } from '../context/EpisodeProvider';
import { useProfile } from '../context/ImageProvider';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useID } from '../context/IdProvider';

import { useMyUsername } from '../context/UsernameProvider';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ route, navigation }) {
  const { handleClose, showHello, setShowHello, videoRef } = useClose();
  const { isFullscreen } = useContext(FullscreenContext);
    const { username1, setUsername1 } = useMyUsername();  // Get the setter function from the context
  const { profile, setProfileImage } = useProfile(); // Profile image context
  const { selectId,  setselectid } = useID();  // Correct destructuring
  const [episodeid, setEpisodeId] = useState(null); // Selected episode ID
  const [id, setId] = useState(null); // Series ID
  const [savedPosition, setSavedPosition] = useState(null);
  const [episode2, setEpisodes2] = useState(null); // Episode details
  const [loading, setLoading] = useState(true);
  const [selectedEpisodesList, setSelectedEpisodesList] = useState([]); // Store all selected episodes
  const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode();

  // Fetch the episode details from the API

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username1');
        const storedProfileImage = await AsyncStorage.getItem('profile');

        if (storedUsername) {
          setUsername1(storedUsername);
        } else {
          console.warn('No username found in AsyncStorage.');
        }

        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        } else {
          console.warn('No profile image found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error loading session from AsyncStorage:', error);
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    loadSession();
  }, []);

  // Save session data to AsyncStorage whenever `username1` or `profile` changes
  useEffect(() => {
    const saveSessionToAsyncStorage = async () => {
      try {
        if (username1) {
          await AsyncStorage.setItem('username1', username1);
        }
        if (profile) {
          await AsyncStorage.setItem('profile', profile);
        }
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
      }
    };

    saveSessionToAsyncStorage();
  }, [username1, profile]);





  const fetchEpisode2 = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${id}`);
      setEpisodes2(response.data);
    } catch (error) {
      console.error('Error fetching episode:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode2();
  }, [id]);

  // Handle route params (e.g. for savedPosition, episodeid)
  useEffect(() => {
    if (route.params?.showHello !== undefined) {
      setShowHello(route.params.showHello);
      setId(route.params.id);
      setEpisodeId(route.params.episodeid);

      if (route.params?.savedPosition !== undefined) {
        setSavedPosition(route.params.savedPosition);
        if (videoRef.current) {
          videoRef.current.setPositionAsync(route.params.savedPosition);
        }
      }

      navigation.setParams({
        showHello: undefined,
        episodeid: undefined,
        id: undefined,
        savedPosition: undefined,
      });
    }
  }, [route.params]);



useEffect(() => {
  console.log('Route params:', route.params); // Log incoming parameters
  if (route.params?.episodeid3) {
    setSelectedEpisodeId(route.params.episodeid3);
    console.log('Updated selectedEpisodeId:', route.params.episodeid3);
  }
}, [route.params]);


  // Find and accumulate selected episodes
   useEffect(() => {
    if (episode2 && episodeid) {
      const foundEpisode = episode2.episodes?.find((episode) => episode.id === episodeid);
      
      if (foundEpisode) {
        setSelectedEpisodesList((prevEpisodes) => {
          // Add the found episode if it's not already in the list
          if (!prevEpisodes.some((episode) => episode.id === foundEpisode.id)) {
            return [...prevEpisodes, foundEpisode]; // Add the new episode to the list
          }
          return prevEpisodes; // If already in the list, do nothing
        });
      }
    }
  }, [episodeid, episode2]);  

   useEffect(() => {
    if (selectedEpisodeId) {
      // Add the episode to the list if it's not already in it
      setSelectedEpisodesList((prevEpisodes) => {
        if (!prevEpisodes.includes(selectedEpisodeId)) {
          return [...prevEpisodes, selectedEpisodeId];
        }
        return prevEpisodes;
      });
    }
  }, [selectedEpisodeId]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#BBBBBB',
          tabBarStyle: {
            backgroundColor: '#161616',
            borderTopWidth: 1,
            borderTopColor: '#161616',
            display: isFullscreen ? 'none' : 'flex',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Browse"
          component={BrowseList}
          options={{
            title: 'Browse',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="clipboard-sharp" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ListStack"
          component={ListStack}
          options={{
            title: 'Anime List',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
          <Tab.Screen
            name="AccountStack"
            component={AccountStack}
            options={{
              title: 'My List',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bookmarks-outline" size={size} color={color} />
              ),
            }}
          />
   <Tab.Screen
  name="MyAccountStack2"
  component={MyAccountStack2}
  options={{
    // Dynamically set the title based on whether the user is logged in
    title: username1 ? username1 : 'Account',
    tabBarIcon: ({ color, size }) => (
      // Conditionally render an Image if the profile exists, otherwise fallback to Ionicons
      profile ? (
 <Image
          source={{ uri: profile }}
          style={[styles.image, { width: 35, height: 35 }]} // Manually set a larger size
        />      ) : (
        <Ionicons name="person-outline" size={size} color={color} />
      )
    ),
  }}
/>
      </Tab.Navigator>
       {showHello && (
        <Hello
          ref={videoRef}
          onClose={handleClose}
          selectedEpisodeID3={episodeid}
          selectedID3={id}
          savedPosition={savedPosition}
        />
      )}
       </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 40, // Adjust to a larger value
    height: 40, // Adjust to a larger value
    borderRadius: 20, // Make the image circular
  },
});