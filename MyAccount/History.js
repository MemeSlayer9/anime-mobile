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
      id: selectedEpisodeId,
      title: episode2?.title,
      seriesId: episode2?.id, // Ensure this is defined correctly
      image: episode2?.image,
    };
    console.log("New episode object:", newEpisode); // Log the new episode object
    addEpisode(newEpisode); // Add the episode to the playlist
    setEpisodes2(null);
  } else {
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
        <View style={styles.itemContainer}>
          {selectedEpisodesList.slice().reverse().map((episode, index) => (
            <View key={index} style={styles.episodeContainer}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await handleClose();
                    const selectedEpisodeId = episode.id;
                    const selectId = episode.seriesId;
                    setSelectedEpisodeId(selectedEpisodeId);
                    setselectid(selectId);
                    navigation.navigate('Watch', {
                      episodeid: episode.id,
                      id: episode.seriesId,
                      selectedItemId2: episode.id,
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
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.text}>No previous episodes selected.</Text>
      )}
    </View>
  );
};


const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping for items
    justifyContent: 'space-between', // Space between the items in the row
  },
  episodeContainer: {
    width: (screenWidth / 2) - 10, // Set each item to half of the screen width minus some margin
    padding: 10,
    marginBottom: 15, // Margin between rows
    borderRadius: 8,
   },
  episodeImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center',
  },
});

export default HelloWorldApp;
