import React, { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useEpisode } from '../context/EpisodeProvider';
import { useID } from '../context/IdProvider';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useClose } from '../context/CloseProvider';
import { useEpisodeHistory } from '../context/EpisodeHistoryProvider';

const { width } = Dimensions.get('window'); // Get the window width
const itemWidth = width / 3; // Set each item to take up 1/3 of the screen width

const HelloWorldApp = () => {
   const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode(); // Use your hook in a functional component
  const { selectId, setselectid } = useID();  // Correct destructuring
          const navigation = useNavigation(); // Use the hook to access navigation
  const { handleClose } = useClose(); // Destructure handleClose from useClose
  const { addEpisode, selectedEpisodesList, clearEpisodeHistory } = useEpisodeHistory();
  const [episode2, setEpisodes2] = useState(null); // Episode details
  const [loading, setLoading] = useState(true); // Loading state
 
  const fetchEpisode2 = async () => {
    if (!selectId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${selectId}`);
      setEpisodes2(response.data);
    } catch (error) {
     } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode2();
  }, [selectId]);


   useEffect(() => {
    if (episode2 && selectedEpisodeId) {
      const newEpisode = {
        id: selectedEpisodeId, // Ensure id is included
        title: episode2.title,
        seriesId: episode2.id,
        image: episode2.image
      };
      addEpisode(newEpisode); // Add the episode to the playlist
    }
  }, [selectedEpisodeId, episode2]);
 



  const formatTitle2 = (id) => {
    // Extract and format the episode number part only
    const match = id.match(/episode-\d+/i); // This will match 'episode-1', 'episode-2', etc.
    if (match) {
      return match[0].replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize 'Episode'
    }
    return ''; // Return an empty string if no match is found
  };
 const clearData = () => {
    clearEpisodeHistory(); // Call the context function to clear history
    setEpisodes2(null);
    setSelectedEpisodeId(null);
    console.log("Data cleared");
  };
  return (
    <View style={styles.container}>
                   <View style={styles.paginationContainer}>

      <Text style={styles.title}>My History</Text>
         <TouchableOpacity onPress={clearData}>
                          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">

                  clearData
                  </Text>
                  </TouchableOpacity>
      <Text style={styles.title}>View All</Text>
      </View>
       {selectedEpisodesList.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={itemWidth} // Set snapping interval to itemWidth
          contentContainerStyle={styles.scrollContainer} // Custom container for scroll view content
        >
          {selectedEpisodesList.slice().reverse().map((episode, index) => (
          
            <View key={index} style={[styles.episodeContainer, { width: itemWidth }]}>
         <TouchableOpacity
      onPress={async () => {
        try {
          // Call handleClose before proceeding with navigation
          await handleClose();

          const selectedEpisodeId = episode.id;
          const selectId = episode2.id;

          // Set selected episode in context or state
          setSelectedEpisodeId(selectedEpisodeId);
          setselectid(selectId);

          // Navigate to the Watch screen with the selected episode ID
          navigation.navigate('Watch', {
            episodeid: episode.id,   // Pass the selected episode ID
            id: episode.seriesId,         // Pass the episode2.id
            selectedItemId2: episode.id,
          });
        } catch (error) {
          console.error('Error closing and navigating:', error);
        }
      }}
    >
              <Image source={{ uri: episode.image }} style={styles.episodeImage} />
              <Text style={styles.text}>{formatTitle2(episode.id || episode)}</Text>
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

// StyleSheet for styling the text and layout
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
   seriesId: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});

export default HelloWorldApp;
