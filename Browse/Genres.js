import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Import the Picker component
import { useNavigation } from '@react-navigation/native';

const Genres = () => {
    const navigation = useNavigation();

  const [selectedGenre, setSelectedGenre] = useState('Action'); // Default to 'Action'
  const [data, setData] = useState([]); // Store the fetched data
  const [loading, setLoading] = useState(false); // Loading state
  const [page, setPage] = useState(1); // For pagination

  const genres = [
    "Action", "Adventure", "Cars", "Comedy", "Drama", "Fantasy", 
    "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", 
    "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", 
    "Supernatural", "Thriller"
  ];

  // Fetch data when the selected genre changes
  const fetchData = async (genre) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/advanced-search?genres=["${genre}"]&page=${page}`);
      setData(response.data.results); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchData when the selectedGenre changes
  useEffect(() => {
    fetchData(selectedGenre);
  }, [selectedGenre, page]);


    const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: item.id })}>

      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
         <Text style={[styles.title, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
            {item.title.english}
          </Text>
       
      </View>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      {/* Genre Picker */}
      <Picker
        selectedValue={selectedGenre}
        onValueChange={(itemValue, itemIndex) => setSelectedGenre(itemValue)}
        style={styles.picker}
      >
        {genres.map((genre, index) => (
          <Picker.Item key={index} label={genre} value={genre}  />
        ))}
      </Picker>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#DB202C" />}

      {/* Fetched Data Display */}
      {!loading && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
                 renderItem={renderItem}
        numColumns={2}
        key={'_'} // Force a fresh render
        columnWrapperStyle={styles.row}
      />
      )}
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
  container: {
    flex: 1,
    padding: 10,
        backgroundColor: '#000',

   },
  picker: {
    height: 50,
    backgroundColor: '#333',
    color: 'white',
    marginBottom: 20,
  },
 itemContainer: {
    width: (screenWidth / 2) - 5,
    padding: 10,
     borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center', // Center-align the text
  },
   textContainer: {
    paddingVertical: 5,
    alignItems: 'center', // Center the content inside the textContainer (for non-text elements)
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
   paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
    button: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Genres;
