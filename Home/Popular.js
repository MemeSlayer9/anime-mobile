import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useClose } from '../context/CloseProvider';

const RecentEpisodes = () => {
  const navigation = useNavigation(); // Use the hook to access navigation
      const {  handleClose } = useClose();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const Close = async () => {
    await handleClose(); // Use the context's handlePauseVideo function
  };
  const fetchData = async () => {
    try {
      const response = await axios.get('https://juanito66.vercel.app/meta/anilist/popular');
      setEpisodes(response.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { width } = Dimensions.get('window');
  const itemWidth = width / 3; // Set the width to exactly one-third of the screen width

  const renderItem = ({ item }) => (
    <View key={item.id} style={[styles.itemContainer, { width: itemWidth }]}>
        <TouchableOpacity
      onPress={async () => {
        await Close(); // Call handlePause first
      navigation.navigate('EpisodeDetail', { id: item.id })
      }}
    > 
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          {/* Ensure title fits within the image width */}
          <Text style={[styles.title, { width: 120 }]} numberOfLines={1} ellipsizeMode="tail">
            {item.title.english}
          </Text>
         
        </View>
      </TouchableOpacity>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < episodes.length - 3) {
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
    return <Text>No data available</Text>;
  }

  return (
    <View> 
               <View style={styles.paginationContainer}>
        
          <Text style={styles.buttonText}>Popular</Text>
      <TouchableOpacity onPress={() => navigation.navigate('List', { initialTab: 'Popular' })}>
  <Text style={styles.buttonText}>View All</Text>
</TouchableOpacity>

       </View>
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
      />
       <TouchableOpacity style={[styles.arrow, styles.arrowLeft]} onPress={handlePrev} disabled={currentIndex === 0}>
        <FontAwesome name="angle-left" style={styles.arrowIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.arrow, styles.arrowRight]} onPress={handleNext} disabled={currentIndex >= episodes.length - 1}>
        <FontAwesome name="angle-right" style={styles.arrowIcon} />
      </TouchableOpacity>
 
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
    arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }], // Adjust based on arrow size
    zIndex: 1, // Ensure arrows are above other content
  },
  arrowLeft: {
    left: 10, // Distance from the left edge
  },
  arrowRight: {
    right: 10, // Distance from the right edge
  },
  arrowIcon: {
    color: 'white',
    fontSize: 40,
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  itemContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 10, // Adds spacing between items
  },
  image: {
    width: 140,
    height: 200,
    resizeMode: 'cover',
  },
  textContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
   },
  episode: {
    fontSize: 14,
    color: 'black',
  },
  link: {
    fontSize: 14,
    color: 'blue',
    marginTop: 5,
  },
  flatListContainer: {
    paddingHorizontal: 10,
  },
   paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
   buttonText: {
    color: 'white',
    fontWeight: 'bold',
        fontSize: 20,

  },
});

export default RecentEpisodes;
