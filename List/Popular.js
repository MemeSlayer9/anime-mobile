import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useClose } from '../context/CloseProvider';

const RecentEpisodes = () => {
        const {  handleClose } = useClose();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigation = useNavigation(); // Use the hook to access navigation



   const Close = async () => {
    await handleClose(); // Use the context's handlePauseVideo function
  };
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://juanito66.vercel.app/meta/anilist/popular?page=${page}&perPage=100`
      );
      setEpisodes(response.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
      onPress={async () => {
        await Close(); // Call handlePause first
      navigation.navigate('EpisodeDetail', { id: item.id })
      }}
    > 
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
         <Text style={[styles.title, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
            {item.title.english}
          </Text>
       
      </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!episodes.length) {
    return <Text>No data available</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.episodeId}
        renderItem={renderItem}
        numColumns={2}
        key={'_'} // Force a fresh render
        columnWrapperStyle={styles.row}
      />

      {/* Pagination Buttons */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (page > 1) setPage(page - 1); // Go to the previous page
          }}
          disabled={page === 1} // Disable "Previous" button on the first page
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPage(page + 1)} // Go to the next page
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,

  },
  
  itemContainer: {
    width: (screenWidth / 2) - 5,
    padding: 10,
     borderRadius: 8,
     
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  textContainer: {
    paddingVertical: 5,
    alignItems: 'center', // Center the content inside the textContainer (for non-text elements)
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center', // Center-align the text
  },
  episode: {
    fontSize: 14,
    color: 'white',
    marginVertical: 4,
    textAlign: 'center', // Center-align the text
  },
  link: {
    fontSize: 14,
    color: 'lightblue',
    marginTop: 5,
    textAlign: 'center', // Center-align the text
  },
    paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
    button: {
  padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RecentEpisodes;
