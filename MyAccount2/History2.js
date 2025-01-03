import React, { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useEpisode } from '../context/EpisodeProvider';
import { useID } from '../context/IdProvider';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useClose } from '../context/CloseProvider';
import { useEpisodeHistory } from '../context/EpisodeHistoryProvider';
import { supabase } from '../supabase/supabaseClient';

const { width } = Dimensions.get('window');
const itemWidth = width / 3;

const HelloWorldApp = () => {
  const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode();
  const { selectId, setselectid } = useID();
  const navigation = useNavigation();
  const { handleClose } = useClose();
  const { clearEpisodeHistory } = useEpisodeHistory();
  const [episode2, setEpisodes2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [episodeHistory, setEpisodeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [user, setUser] = useState(null);

  // Function to fetch episode details based on selectId
  const fetchEpisode2 = async () => {
    if (!selectId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${selectId}`);
      setEpisodes2(response.data);
    } catch (error) {
      console.error("Error fetching episode details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode2();
  }, [selectId]);

 useEffect(() => {
  const handleAddEpisode = async () => {
    if (episode2 && selectedEpisodeId && user) {
      const newEpisode = {
        id: selectedEpisodeId,
      title: episode2?.title,
      seriesId: episode2?.id, // Ensure this is defined correctly
      image: episode2?.image,
        
      };
      
       
      setEpisodes2(null); // Reset episodes2 after the new episode is created

      // Await the call to save the episode to the database
      
      await saveEpisodeToDatabase(newEpisode);
    
    }
  };

  handleAddEpisode(); // Call the async handler

}, [selectedEpisodeId, episode2, user]); // Dependencies to trigger effect


 
const saveEpisodeToDatabase = async (episode) => {
  try {
    if (!user) {
      console.error('No user is authenticated.');
      return;
    }

    // Log the episode being saved
    console.log("Saving episode:", episode);

    // Check for duplicates
  const exists = episodeHistory.some(
  (ep) => ep.episode_id === episode.id && ep.series_id === episode.seriesId
);

    console.log("Does episode already exist in history?", exists);

    // Insert the episode into Supabase
    const { data, error } = await supabase
      .from('episode_history')
      .insert([{
        user_id: user.id,
        episode_id: episode.id,
        title: episode.title,
        series_id: episode.seriesId,
        image_url: episode.image,
      }]);

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error adding episode to playlist:', error);
      return; // Exit on error
    }

    // Update episode history if the episode does not already exist
      if (!exists) {
      setEpisodeHistory((prev) => [
        ...(prev || []),  // Use previous state, default to an empty array
        { ...episode, user_id: user.id } // Add the new episode
      ]);
     }
  } catch (error) {
    console.error('Unexpected error while saving episode:', error);
  }
};


useEffect(() => {
  if (user && selectedEpisodeId) {
    fetchEpisode2();
  }
}, [selectedEpisodeId, user]);



  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }
    return user;
  };

  // Initialize user and fetch episode history if user is logged in
useEffect(() => {
  const initializeUser = async () => {
    const currentUser = await getUser();
    setUser(currentUser);
     if (currentUser) {
      await fetchEpisodeHistory(currentUser.id);
    }
  };
  initializeUser();
}, []);


  const fetchEpisodeHistory = async (userId) => {
    setLoadingHistory(true);

    if (!userId) {
      console.error('User ID is missing.');
      setLoadingHistory(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('episode_history')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user episode history:', error);
        return;
      }
       setEpisodeHistory(data);
    } catch (error) {
      console.error('Database error while fetching user episode history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

     const fetchUserAndPlaylist = async () => {
    const currentUser = await getUser();
    if (currentUser) {
      setUser(currentUser);
      await fetchEpisodeHistory(currentUser.id); // Fetch the user's playlist when user changes
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchUserAndPlaylist();
  }, []);



useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearEpisodeHistory();
      setEpisodeHistory([]);
      setUser(null);
    } else if (event === 'SIGNED_IN') {
      fetchUserAndPlaylist(); // Fetch new user's playlist after sign in
    }
  });

  // Return the unsubscribe function for cleanup
  return () => {
    authListener?.subscription.unsubscribe(); // Adjusted to correctly access unsubscribe function
  };
}, []);



  const clearData2 = async () => {
    if (!user) {
      console.error('User is not authenticated. Cannot clear data.');
      return;
    }

    try {
      clearEpisodeHistory();
      setEpisodes2(null);

      const { error } = await supabase
        .from('episode_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing playlist from Supabase:', error);
      } else {
        setEpisodeHistory([]); // Clear the local state after deletion
      }
    } catch (error) {
      console.error('Database error while clearing playlist:', error);
    }
  };

 

  const fetchUserEpisodeHistory = async () => {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error retrieving session:", sessionError);
      return;
    }

    const userId = session?.user?.id;
    if (userId) {
      await fetchEpisodeHistory(userId);
    } else {
      console.log("No user session found, skipping fetch of episode history.");
    }
  };

 
  const formatTitle2 = (id) => {
    const match = id.match(/episode-\d+/i);
    if (match) {
      return match[0].replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return '';
  };

  const clearData = () => {
    clearEpisodeHistory();
    setEpisodes2(null);
    setSelectedEpisodeId(null);
    console.log("Data cleared");
  };

  return (
    <View style={styles.container}>
      <View style={styles.paginationContainer}>
        <Text style={styles.title}>My History</Text>
        <TouchableOpacity onPress={clearData2}>
          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">
            clearData
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyAccount', { initialTab: 'History' })}>
          <Text style={styles.title}>View All</Text>
        </TouchableOpacity>
      </View>

      {loadingHistory ? (
        <Text style={styles.text}>Loading history...</Text>
      ) : episodeHistory.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {episodeHistory.slice().reverse().map((episode, index) => (
            
            <View key={index} style={styles.episodeContainer}>
            
              {episode.image_url && episode.episode_id && episode.series_id && (
    <TouchableOpacity
      onPress={async () => {
        try {
          await handleClose();
          const selectedEpisodeId = episode.episode_id;
          const selectId = episode.series_id;
          setSelectedEpisodeId(selectedEpisodeId);
          setselectid(selectId);
          navigation.navigate('Watch', {
            episodeid: selectedEpisodeId,
            id: selectId,
            selectedItemId2: selectedEpisodeId,
          });
        } catch (error) {
          console.error('Error closing and navigating:', error);
        }
      }}
    >
      <Image source={{ uri: episode.image_url }} style={styles.episodeImage} />
      <Text style={styles.text}>{formatTitle2(episode.episode_id)}</Text>
       <Text style={[styles.title, { width: 160 }]} numberOfLines={1} ellipsizeMode="tail">
        {episode.title}
      </Text>
    </TouchableOpacity>
  )}

  {episode.image && episode.id && episode.seriesId && (
    <TouchableOpacity
      onPress={async () => {
        try {
          await handleClose();
          const selectedEpisodeId = episode.id;
          const selectId = episode.seriesId;
          setSelectedEpisodeId(selectedEpisodeId);
          setselectid(selectId);
          navigation.navigate('Watch', {
            episodeid: selectedEpisodeId,
            id: selectId,
            selectedItemId2: selectedEpisodeId,
          });
        } catch (error) {
          console.error('Error closing and navigating:', error);
        }
      }}
    >
      <Image source={{ uri: episode.image }} style={styles.episodeImage} />
      <Text style={styles.text}>{formatTitle2(episode.id || episode)}</Text>
      <Text style={[styles.title, { width: 160 }]} numberOfLines={1} ellipsizeMode="tail">
        {episode.title}
      </Text>
    </TouchableOpacity>
  )} 
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.text}>No previous episodes selected.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scrollContainer: {
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  episodeContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeImage: {
    width: 140,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default HelloWorldApp;
