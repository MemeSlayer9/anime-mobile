  import React, { useEffect, useState } from 'react';
  import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
  import { useID } from '../context/IdProvider'; // Ensure this is correctly implemented
  import axios from 'axios';
  import { useNavigation } from '@react-navigation/native';


  const HelloWorldApp = () => {
                const navigation = useNavigation(); // Use the hook to access navigation

    const { selectId, setselectid } = useID();  // Correct destructuring
    const [item, setItem] = useState(null);
    const [selectedIDList, setSelectedIDList] = useState([]); // Store all selected episodes
    const [loading, setLoading] = useState(true); // Manage loading state

    // Fetch the episode details from the API
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`https://amvstrmapiprod-1-f3650650.deta.app/api/v2/info/${selectId}`);
        setItem(response.data); // Store the fetched data in state
      } catch (error) {
        console.error('Failed to fetch episode details:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    // Call fetchDetail when selectId changes
    useEffect(() => {
      if (selectId) {
        setLoading(true); // Reset loading state when a new selectId is provided
        fetchDetail();
      }
    }, [selectId]);



    // Add the fetched episode to the selectedIDList
    useEffect(() => {
      if (item && selectId) {
        const alreadyExists = selectedIDList.some((episode) => episode.id === item.id);

        if (!alreadyExists) {
          const newEpisode = {
            title: item.title?.userPreferred || item.title, // Use a fallback if userPreferred is missing
            id: item.id, // Store the ID of the series
            image: item.coverImage?.large || '', // Store the image
          };

          setSelectedIDList((prevItems) => [...prevItems, newEpisode]); // Add new episode to the list
        }
              setItem(null); // Clear the item after adding it to the list

      }
    }, [item, selectId]);


    const clearData = () => {
      setSelectedIDList([]);
     setItem(null); // Reset item to avoid duplicate additions
         setselectid(null); // Reset the selectId to ensure it can be reused

          console.log("Data cleared"); // Debug log

    };
    console.log(selectId)
    
    return (
      <View style={styles.container}>
        <View style={styles.paginationContainer}>
          <Text style={styles.title}>My Playlist</Text>
          <TouchableOpacity onPress={clearData}>
                          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">

                 CLEAR
                  </Text>
                              

                </TouchableOpacity>
<TouchableOpacity onPress={() => navigation.navigate('ViewAllMyPlaylist')}>

          <Text style={styles.title}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Display previously selected episodes */}
        {loading ? (
          <Text style={styles.text}>No previous episodes selected.</Text>
        ) : selectedIDList.length > 0 ? (
          <ScrollView  contentContainerStyle={styles.scrollContainer}>
            {selectedIDList.slice().reverse().map((episode, index) => (
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
       flex: 1,
    backgroundColor: '#161616',
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
