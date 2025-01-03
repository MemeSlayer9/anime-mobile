  import React, { useEffect, useState } from 'react';
  import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
   import axios from 'axios';
  import { useNavigation } from '@react-navigation/native';
import { useMyId } from '../context/PlaylistProvider';
 
import { usePlaylist } from '../context/MyPlaylistProvider'; // Import your context

  const HelloWorldApp = () => {
                const navigation = useNavigation(); // Use the hook to access navigation
    const { MyListID, setsMyListID } = useMyId();  // Correct destructuring
   const { playlist, addEpisodeToPlaylist, clearPlaylist } = usePlaylist(); // Get playlist and methods from context

     const [item, setItem] = useState(null);
    const [selectedIDList, setSelectedIDList] = useState([]); // Store all selected episodes
    const [loading, setLoading] = useState(true); // Manage loading state

    // Fetch the episode details from the API
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`https://amvstrmapiprod-1-f3650650.deta.app/api/v2/info/${MyListID}`);
        setItem(response.data); // Store the fetched data in state
      } catch (error) {
        console.error('Failed to fetch episode details:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    // Call fetchDetail when selectId changes
    useEffect(() => {
      if (MyListID) {
        setLoading(true); // Reset loading state when a new selectId is provided
        fetchDetail();
      }
    }, [MyListID]);



    // Add the fetched episode to the selectedIDList
  useEffect(() => {
    if (item && MyListID) {
      const newEpisode = {
        title: item.title?.userPreferred || item.title,
        id: item.id,
        image: item.coverImage?.large || '',
      };
      addEpisodeToPlaylist(newEpisode); // Add the episode to the playlist
      setItem(null); // Reset the item after adding
    }
  }, [item, MyListID]);

    const clearData = () => {
      setSelectedIDList([]);
     setItem(null); // Reset item to avoid duplicate additions
         setsMyListID(null); // Reset the selectId to ensure it can be reused

          console.log("Data cleared"); // Debug log

    };
    console.log(MyListID)
    
    return (
      <View style={styles.container}>
        <View style={styles.paginationContainer}>
          <Text style={styles.title}>My Playlist</Text>
          <TouchableOpacity onPress={clearPlaylist}>
                          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">

                  clearData
                  </Text>
                              

                </TouchableOpacity>
         </View>

        {/* Display previously selected episodes */}
        {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
        ) : playlist.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {playlist.slice().reverse().map((episode, index) => (
              <View key={index} style={styles.episodeContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: episode.id })}>
                  <Image source={{ uri: episode.image }} style={styles.episodeImage} />
                          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">

                    {episode.title}
                  </Text>
                              

                </TouchableOpacity>
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
    text: {
      fontSize: 16,
      color: '#fff', // White color for the text
      marginBottom: 10,
      textAlign: 'center',
    },
    episodeContainer: {
      marginRight: 15, // Add space between episodes
      justifyContent: 'center',
      alignItems: 'center',
    },
    episodeImage: {
      width: 140,
      height: 200,
      resizeMode: 'cover',
      borderRadius: 10, // Optionally add border radius for a modern look
    },
  });

  export default HelloWorldApp;
