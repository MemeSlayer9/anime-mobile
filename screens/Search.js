import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, FlatList, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useRoute to get navigation params

const Search = () => {
  const route = useRoute(); // Access route params
  const { query } = route.params || {}; // Get the query parameter from route
  const navigation = useNavigation(); // Use the hook to access navigation

  const [loading, setLoading] = useState(false); // State for loading indicator
  const [episodes, setEpisodes] = useState([]); // State to store fetched episodes

  // Function to fetch data based on query
  const fetchData = async () => {
    if (!query) return;
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/${query}?perPage=100`);
      setEpisodes(response.data.results); // Set fetched episodes
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Fetch data when component mounts or when query changes
  useEffect(() => {
    fetchData();
  }, [query]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: item.id })}>

      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
         <Text style={[styles.title, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
            {item.title.userPreferred}
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
      
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({

  container: {
                backgroundColor: '#161616',

  },
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

export default Search;
