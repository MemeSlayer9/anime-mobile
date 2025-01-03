import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useMyId } from '../context/PlaylistProvider';
import { usePlaylist } from '../context/MyPlaylistProvider'; 
import { supabase } from '../supabase/supabaseClient';

const MyPlaylist2 = () => {
  const navigation = useNavigation();
  const { MyListID } = useMyId();  
  const { playlist, addEpisodeToPlaylist, clearPlaylist } = usePlaylist(); 
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userPlaylist, setUserPlaylist] = useState([]);

  // Fetch user details from Supabase authentication session
  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data?.user;
  };

  // Fetch the user's playlist from Supabase
  const fetchUserPlaylist = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user playlist:', error);
      } else {
        setUserPlaylist(data); // Set the fetched playlist for the user
      }
    } catch (error) {
      console.error('Database error while fetching user playlist:', error);
    }
  };

  // Fetch user details and their playlists
  const fetchUserAndPlaylist = async () => {
    const currentUser = await getUser();
    if (currentUser) {
      setUser(currentUser);
      await fetchUserPlaylist(currentUser.id); // Fetch the user's playlist when user changes
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchUserAndPlaylist();
  }, []);

  useEffect(() => {
  const initializeUser = async () => {
    const currentUser = await getUser();
    if (currentUser) {
      setUser(currentUser);
      await fetchUserPlaylist(currentUser.id);
    }
  };
  initializeUser();
}, []);

  // Clear the playlist when the user logs out
// Clear the playlist when the user logs out
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearPlaylist();         // Clear the playlist locally
      setUserPlaylist([]);     // Reset the playlist state
      setUser(null);           // Clear the user state
    } else if (event === 'SIGNED_IN') {
      fetchUserAndPlaylist();  // Fetch new user's playlist after sign in
    }
  });

  // Return the unsubscribe function for cleanup
  return () => {
    authListener?.unsubscribe(); // Ensure the listener is unsubscribed on unmount
  };
}, []);


  // Fetch the episode details from the API
  

  const clearData = async () => {
    try {
      clearPlaylist();
      setItem(null);

      // Now clear the entries in Supabase
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing playlist from Supabase:', error);
      } else {
         setUserPlaylist([]); // Clear the local state after deletion
      }
    } catch (error) {
      console.error('Database error while clearing playlist:', error);
    }
  };

  const saveEpisodeToDatabase = async (episode) => {
  try {
    if (!user) {
      console.error('No user is authenticated.');
      return;
    }

    // Check if the episode already exists in the database
    const { data: existingEpisodes, error: fetchError } = await supabase
      .from('playlists')
      .select('episode_id')
      .eq('user_id', user.id)
      .eq('episode_id', episode.id);

    if (fetchError) {
      console.error('Error checking for existing episode:', fetchError);
      return;
    }

    // If an existing episode is found, do not add it again
    if (existingEpisodes.length > 0) {
      console.log('Episode already exists in the playlist. Skipping insertion.');
      return;
    }

    console.log('Inserting episode with user_id:', user.id);
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        {
          user_id: user.id,
          episode_id: episode.id,
          episode_title: episode.title,
          episode_image: episode.image,
        }
      ]);

    if (error) {
      console.error('Error adding episode to playlist:', error);
    } else {
      setUserPlaylist((prev) => {
        const updatedPlaylist = [...prev, { ...episode, user_id: user.id }];
        console.log('Updated playlist:', updatedPlaylist);
        return updatedPlaylist;
      });
    }
  } catch (error) {
    console.error('Database error while saving episode:', error);
  }
};
 const fetchDetail = async () => {
    try {
      const response = await axios.get(`https://api.amvstr.me/api/v2/info/${MyListID}`);
      setItem(response.data);
    } catch (error) {
      console.error('Failed to fetch episode details:', error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (MyListID) {
      setLoading(true);
      fetchDetail();
    }
  }, [MyListID]);

  
  useEffect(() => {
    if (item && MyListID && user) {
      const newEpisode = {
        title: item.title?.userPreferred || item.title,
        id: item.id,
        image: item.coverImage?.large || '',
      };

      // Save the episode to the playlist locally
 
      // Save the episode to the Supabase 'playlists' table
      saveEpisodeToDatabase(newEpisode);

      setItem(null);
    }
  }, [item, MyListID, user]);

  return (
    <View style={styles.container}>
      <View style={styles.paginationContainer}>
        <Text style={styles.title}>My Playlist</Text>
        <TouchableOpacity onPress={clearData}>
          <Text style={[styles.title, { width: 130 }]}>Clear Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyAccount', { initialTab: 'MyPlaylist' })}>
          <Text style={styles.title}>View All</Text>
        </TouchableOpacity>
      </View>
 
      {userPlaylist.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {userPlaylist.slice().reverse().map((episode, index) => (
              <View key={index} style={styles.episodeContainer}>
   {episode.episode_id && (
  <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: episode.episode_id })}>
    {episode.episode_image && (
      <Image source={{ uri: episode.episode_image }} style={styles.episodeImage} />
    )}
    {episode.episode_title && (
      <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">
        {episode.episode_title}
      </Text>
    )}
  </TouchableOpacity>
)}

{episode.id && (
  <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: episode.id })}>
    {episode.image && (
      <Image source={{ uri: episode.image }} style={styles.episodeImage} />
    )}
    {episode.title && (
      <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">
        {episode.title}
      </Text>
    )}
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
    fontSize: 15,
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

export default MyPlaylist2;
