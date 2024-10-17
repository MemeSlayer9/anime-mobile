import React, { useContext, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack, ListStack, BrowseList, AccountStack } from './Navigator';
import { FullscreenContext } from './FullscreenContext';
import Hello from './Hello';
import { Text, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useClose } from '../context/CloseProvider';
import { useEpisode } from '../context/EpisodeProvider';
const Tab = createBottomTabNavigator();

export default function HomeTabs({ route, navigation }) {
  const { handleClose, showHello, setShowHello, videoRef } = useClose();
  const { isFullscreen } = useContext(FullscreenContext);

  const [episodeid, setEpisodeId] = useState(null); // Selected episode ID
  const [id, setId] = useState(null); // Series ID
  const [savedPosition, setSavedPosition] = useState(null);
  const [episode2, setEpisodes2] = useState(null); // Episode details
  const [loading, setLoading] = useState(true);
  const [selectedEpisodesList, setSelectedEpisodesList] = useState([]); // Store all selected episodes
  const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode();

  // Fetch the episode details from the API
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
            title: 'List',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
         <Tab.Screen
          name="AccountStack"
          component={AccountStack}
          options={{
            title: 'List',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="accessibility-outline" size={size} color={color} />
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

    {loading ? (
        <View>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text>Loading episode details...</Text>
        </View>
      ) : (
        <View>
          {/* Display the currently selected episode */}
           
          {/* Display all previously selected episodes */}
         {selectedEpisodesList.length > 0 ? (
  <View>
    <Text>Previously Selected Episodes:</Text>
    {selectedEpisodesList.map((episode, index) => (
      <Text key={index}>Episode ID: {episode.id || episode}</Text> // Ensure you're accessing the correct property
    ))}
  </View>
) : (
  <Text>No previous episodes selected.</Text>
)}
        </View>
      )}
    </>
  );
}
