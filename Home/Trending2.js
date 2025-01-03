import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useID } from '../context/IdProvider';
import { useMyId} from '../context/PlaylistProvider';

const RecentEpisodes = () => {
  const navigation = useNavigation();
    const { selectId, setselectid } = useID();  // Correct destructuring
    const { MyListID, setsMyListID } = useMyId();  // Correct destructuring
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(Dimensions.get('window').width); // Initialize item width

  const fetchData = async () => {
    try {
      const response = await axios.get('https://juanito66.vercel.app/meta/anilist/trending');
      setEpisodes(response.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const subscription = Dimensions.addEventListener('change', () => {
      const { width, height } = Dimensions.get('window');
      setItemWidth(width > height ? width : width); // Set width based on orientation
    });

    // Clean up subscription on unmount
    return () => subscription?.remove();
  }, []);
 const handleAddBookmark = (id) => {
  setsMyListID(id);  // Set the selected ID when the bookmark is clicked
      setIsBookmarked(true); // Mark as bookmarked

  console.log('Bookmark clicked, selectId:', id);
};
 useEffect(() => {
    if (isBookmarked) {
      const timer = setTimeout(() => {
        setIsBookmarked(false); // Hide the message after 5 seconds
      }, 2000); // 5000ms = 5 seconds

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [isBookmarked]);
 
 const renderItem = ({ item }) => (
  <View key={item.id} style={[styles.itemContainer, { width: itemWidth }]}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={[styles.image, { width: itemWidth }]} />
      <LinearGradient
        colors={['rgba(10, 20, 22, 0.2)', 'rgba(22, 22, 22, 1)']}
        style={styles.overlayGradient}
      />
    </View>
    
    <View style={styles.textContainer}>
    
      <Text style={[styles.title, { width: itemWidth - 20 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.title.userPreferred}
      </Text>
      
      <Text style={[styles.description, { width: itemWidth - 20 }]} numberOfLines={4} ellipsizeMode="tail">
        {item.description}
      </Text>
      <View style={[styles.container, { width: itemWidth - 20 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('EpisodeDetail', { id: item.id })}>
          <View style={styles.playButtonContainer}>
            <Ionicons name={"play"} size={35} color="white" />
            <Text style={styles.playButtonText}>Watch Now</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.iconContainer}>
           
         <TouchableOpacity onPress={() => handleAddBookmark(item.id)}>
        <Ionicons name="bookmark-outline" size={30} color="#DB202C" />
      </TouchableOpacity>

    
        </View>
        
      </View>
    </View>
       {isBookmarked && MyListID === item.id && ( // Conditionally render the message
        <Text style={{ color: '#DB202C',   }}>Added to Favorites</Text>
      )}
  </View>
);
  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current.scrollToIndex({ animated: true, index: currentIndex + 1 });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current.scrollToIndex({ animated: true, index: currentIndex - 1 });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!episodes.length) {
    return <Text style={styles.title}>No data available</Text>;
  }

  return (
    <View style={styles.carouselContainer}>
 
      <FlatList
        ref={flatListRef}
        data={episodes}
        keyExtractor={(item) => item.episodeId}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        getItemLayout={(data, index) => (
          { length: itemWidth, offset: itemWidth * index, index }
        )}
        initialScrollIndex={currentIndex}
        pagingEnabled={true} // Snap to one item at a time
      />
     </View>
  );
};

const styles = StyleSheet.create({
  carouselWrapper: {
    position: 'relative', // Ensure the wrapper allows absolute positioning
  },
  itemContainer: {
    paddingVertical: 0,
    alignItems: 'center',
    marginHorizontal: 0, // Remove margin to ensure full-width display
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 500, // Adjust as needed
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContainer: {
    position: 'absolute',
    right: 10, // Position near the right edge
    top: '65%', // Vertically center
    transform: [{ translateY: -20 }], // Adjust based on text height
    alignItems: 'flex-end', // Align text to the right
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold', // Use quotes around 'bold'
  },
  flatListContainer: {
    paddingHorizontal: 0, // Remove padding to ensure items fit the screen width
  },
  description: {
    fontSize: 15,
    color: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    width: '100%', // Adjust width as needed
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB202C',
    padding: 5,
    borderRadius: 5,
    width: 200, // Adjust width as needed
  },
  playButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold', // Use quotes around 'bold'
  },
  iconContainer: {
    backgroundColor: 'black',    // Black background
    borderRadius: 5,   
    padding: 5,                 // Padding for space around the icon
    borderColor: '#DB202C',        // White border
    borderWidth: 2,              // Thickness of the white border
    alignItems: 'center',        // Center align the icon
    justifyContent: 'center',    // Center vertically
    marginLeft: 10,
  },
});

export default RecentEpisodes;
