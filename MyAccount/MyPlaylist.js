import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useMyId } from '../context/PlaylistProvider';
import { usePlaylist } from '../context/MyPlaylistProvider'; 
import { supabase } from '../supabase/supabaseClient';
 import { Ionicons } from '@expo/vector-icons';

const MyPlaylist2 = () => {
  const navigation = useNavigation();
  const { MyListID } = useMyId();  
  const { playlist, addEpisodeToPlaylist, clearPlaylist } = usePlaylist(); 
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userPlaylist, setUserPlaylist] = useState([]);
  const [showModal, setShowModal] = useState(false); // show modal state
  const [episodeToDelete, setEpisodeToDelete] = useState(null); // episode to delete

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

 

  // Clear the playlist when the user logs out
  useEffect(() => {
    const { subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearPlaylist();         // Clear the playlist locally
        setUserPlaylist([]);     // Reset the playlist state
        setUser(null);           // Clear the user state
      } else if (event === 'SIGNED_IN') {
        fetchUserAndPlaylist();  // Fetch new user's playlist after sign in
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch the episode details from the API
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

  const deleteEpisode = async (episodeId) => {
  try {
    // Delete the episode from Supabase
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('user_id', user.id)
      .eq('episode_id', episodeId);

    if (error) {
      console.error('Error deleting episode:', error);
      return;
    }

    // Update the local state after deletion
     setUserPlaylist((prev) =>
  prev.filter(
    (episode) =>
      episode.episode_id !== episodeId && // Check for non-nested structure
      episode.id !== episodeId            // Check for nested structure
  )
);
        setShowModal(false); // Hide the modal after deletion

  } catch (error) {
    console.error('Error during episode deletion:', error);
  }
};

 

 const handleDeletePress = (episodeId) => {
    setEpisodeToDelete(episodeId); // Store the episode id to delete
    setShowModal(true); // Show the modal for confirmation
  };

  const closeModal = () => {
    setShowModal(false); // Close modal if user cancels
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
       return;
    }

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
         return updatedPlaylist;
      });
    }
  } catch (error) {
    console.error('Database error while saving episode:', error);
  }
};


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
  <View>
    {userPlaylist.slice().reverse().map((episode, index) => (
      <View key={index} style={styles.itemContainer}>
        {episode.episode_id && (
          <TouchableOpacity
            onPress={() => navigation.navigate('EpisodeDetail', { id: episode.episode_id })}
            style={styles.rowContainer} // Container for alignment
          >
            {episode.episode_image && (
              <Image source={{ uri: episode.episode_image }} style={styles.episodeImage} />
            )}
            <View style={styles.episodeContainer}>
              {episode.episode_title && (
                <View style={styles.titleRow}>
                  <Text style={styles.episodeTitle} numberOfLines={1} ellipsizeMode="tail">
                    {episode.episode_title}
                  </Text>
                 <TouchableOpacity onPress={() => handleDeletePress(episode.episode_id)}>
                    <Ionicons name="ellipsis-vertical-outline" size={20} color="#FFF" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {episode.id && (
          <TouchableOpacity
            onPress={() => navigation.navigate('EpisodeDetail', { id: episode.id })}
            style={styles.rowContainer} // Container for alignment
          >
            {episode.image && (
              <Image source={{ uri: episode.image }} style={styles.episodeImage} />
            )}
            <View style={styles.episodeContainer}>
              {episode.title && (
                <View style={styles.titleRow}>
                  <Text style={styles.episodeTitle} numberOfLines={1} ellipsizeMode="tail">
                    {episode.title}
                  </Text>
                                <TouchableOpacity onPress={() => handleDeletePress(episode.id)}>
                    <Ionicons name="ellipsis-vertical-outline" size={20} color="#FFF" style={styles.icon} />
                  </TouchableOpacity>

                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    ))}
  </View>
) : (
  <Text style={styles.text}>No previous episodes selected.</Text>
)}
  <Modal visible={showModal} animationType="fade" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete from MyPlaylist</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this MyPlaylist?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteEpisode(episodeToDelete)}
                style={styles.deleteButton}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    },
    scrollContainer: {
      paddingHorizontal: 10, // Add some horizontal padding to the ScrollView
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeImage: {
    width: 100,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 8,
    marginRight: 10,
  },
  episodeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  episodeTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1, // Ensures the text takes available space
    marginRight: 10, // Space between text and icon
  },
  icon: {
    padding: 5, // Adds some clickable padding for the icon
  },
  text: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 20,
  },
  message: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#FFF',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default MyPlaylist2;
