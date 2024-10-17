import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image, Pressable, Modal, ScrollView  } from 'react-native';
import axios from 'axios';
import { Video } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FullscreenContext } from './FullscreenContext'; // Import the context

import * as ScreenOrientation from 'expo-screen-orientation';
import VideoPlayer from './components/VideoPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure AsyncStorage is installed
import { useEpisode } from '../context/EpisodeProvider';

const Watch = ({ route }) => {
        const navigation = useNavigation(); // Use the hook to access navigation

  const { episodeid, id, selectedItemId2, selectedEpisodeID3 } = route.params;
   const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [qualityOptions, setQualityOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const { isFullscreen, setIsFullscreen } = useContext(FullscreenContext);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [volume, setVolume] = useState(1.0); // Volume state
      const [episode2, setEpisodes2] = useState(null);
const [selectedItemId, setSelectedItemId] = useState(selectedItemId2 || selectedEpisodeID3 || null); // Initialize with passed ID
 
const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const videoRef = useRef(null);
  const [videoSources, setVideoSources] = useState([]);


  const [controlsVisible, setControlsVisible] = useState(true); // State to manage visibility of controls
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [savedPosition, setSavedPosition] = useState(0); // State to store the saved position
   const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode(); // Use your hook in a functional component


// Function to load playback position from AsyncStorage
const savePlaybackPosition = async (position) => {
  try {
    if (episodeid) {
      const key = `playbackPosition_${episodeid}`;
       await AsyncStorage.setItem(key, JSON.stringify(position)); // Save position based on episodeId
    }
  } catch (error) {
    console.error('Failed to save the playback position:', error);
  }
};

// Load playback position for the current episode
const loadPlaybackPosition = async (episodeid) => {
  try {
    const key = `playbackPosition_${episodeid}`;
    const position = await AsyncStorage.getItem(key);
    if (position !== null) {
      const parsedPosition = JSON.parse(position);
       setSavedPosition(parsedPosition);
    } else {
       setSavedPosition(0);
    }
  } catch (error) {
    console.error('Failed to load the playback position:', error);
  }
};

// Handle playback status update to save position when paused or stopped
const handlePlaybackStatusUpdate = (status) => {
  setPlaybackStatus(status);
  if (!status.isPlaying && status.positionMillis > 0) {
     savePlaybackPosition(status.positionMillis);
  }
};

// Handle play/pause button and start from the saved position
const handlePlayPause = async () => {
  if (videoRef.current) {
    const status = await videoRef.current.getStatusAsync();
    
    if (status.isPlaying) {
      // If the video is playing, pause it and save the current position
       await videoRef.current.pauseAsync();
      savePlaybackPosition(status.positionMillis); // Save position when paused
      setIsPlaying(false); // Update state to reflect paused state
    } else {
      // If the video is paused, resume it from the current position
       await videoRef.current.playAsync(); // Resume from the current position
      setIsPlaying(true); // Update state to reflect playing state
    }
  }
};


// Load the saved position for the new episode on mount or episode change
useEffect(() => {
  if (episodeid) {
    loadPlaybackPosition(episodeid); // Load position based on the current episode
  }
}, [episodeid]);

const navigateBack = async (episodeid) => {
  try {
    // Get the current playback position from the video player
    const status = await videoRef.current.getStatusAsync();
    const position = status.positionMillis;

     await savePlaybackPosition(position); // Save the current position

    // Navigate back to HomeTabs with the saved position
    navigation.navigate('HomeTabs', {
      showHello: true,
      episodeid: selectedItemId,  // Make sure this is the correct selected episode ID
      id: episode2.id,            // Pass the correct `id` for episode2
      savedPosition: position,    // Pass the saved playback position
    });
  } catch (error) {
    console.error('Failed to save position or navigate:', error);
  }
};

 

 const formatTitle = (id) => {
  // Replace 'tv' with 'Tv' and capitalize each word
  return id
    .replace(/-/g, ' ')            // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase())  // Capitalize the first letter of each word
    .replace('Tv', 'TV')            // Replace 'Tv' with 'TV'
    .replace('Episode', 'Episode'); // Add hyphen before episode number
};

const formatTitle2 = (id) => {
  // Extract and format the episode number part only
  const match = id.match(/episode-\d+/i); // This will match 'episode-1', 'episode-2', etc.
  if (match) {
    return match[0].replace(/\b\w/g, char => char.toUpperCase()); // Capitalize 'Episode'
  }
  return ''; // Return an empty string if no match is found
};


const handleFastForward = async () => {
  if (videoRef.current && playbackStatus) {
    const newPosition = playbackStatus.positionMillis + 10000; // Move forward by 10 seconds
    if (newPosition <= playbackStatus.durationMillis) {
      await videoRef.current.setPositionAsync(newPosition);
    } else {
      await videoRef.current.setPositionAsync(playbackStatus.durationMillis); // Set to end of video if exceeds duration
    }
  }
};

// Function to rewind by 10 seconds
const handleRewind = async () => {
  if (videoRef.current && playbackStatus) {
    const newPosition = playbackStatus.positionMillis - 10000; // Move backward by 10 seconds
    if (newPosition >= 0) {
      await videoRef.current.setPositionAsync(newPosition);
    } else {
      await videoRef.current.setPositionAsync(0); // Set to start of video if new position is less than 0
    }
  }
};





const handleSelectQuality = async (quality) => {
  if (playbackStatus && videoRef.current) {
    try {
      // Capture the current playback position and whether it was playing
      const currentPosition = playbackStatus.positionMillis;
      const wasPlaying = playbackStatus.isPlaying;

      // Find the new source URL based on the selected quality
      const selectedSource = qualityOptions.find(source => source.quality === quality);
      if (selectedSource) {
        setSelectedQuality(quality);  // Update selected quality

        // Pause the video before changing the source
        await videoRef.current.pauseAsync();

        // Unload the current video to reset any potential conflicts
        await videoRef.current.unloadAsync();

        // Load the new video source
        await videoRef.current.loadAsync(
          { uri: selectedSource.url },
          {
            shouldPlay: wasPlaying,  // Resume playing if it was playing before
            positionMillis: currentPosition,  // Continue from the same position
          }
        );

        // After loading the video, force an update to playback status
        videoRef.current.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);

        // If the video was playing before, ensure it starts again
        if (wasPlaying) {
          await videoRef.current.playAsync();
        }
      }
      
    } catch (error) {
      console.error('Error while switching video quality: ', error);
    }
  }

  // Close the modal after selection
  setIsModalVisible(false);
};










const toggleControls = () => {
  setControlsVisible(!controlsVisible);
};

const hideControlsAfterTimeout = () => {
  setTimeout(() => {
    setControlsVisible(false);
  }, 3000); // Adjust the timeout duration as needed
};

useEffect(() => {
  if (isFullscreen) {
    hideControlsAfterTimeout();
  }
}, [isFullscreen]);
const fetchEpisodeDetail = async () => {
  try {
    const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/watch/${episodeid}`);
    
    // Filter out 'backup' and 'default' qualities
     const qualityList = response.data.sources
      .filter(source => source.quality !== 'backup' && source.quality !== 'default')
      .map(source => ({
        quality: source.quality,
        url: source.url,
      }));
    
    setQualityOptions(qualityList);
    setVideoSources(qualityList);

    // Set the source to the first available quality (e.g., 360p, 480p, etc.)
    if (qualityList.length > 0) {
      setSources(qualityList[0].url);
    } else {
      console.error('No valid video source found');
    }
  } catch (error) {
    console.error('Error fetching episode detail:', error);
  } finally {
    setLoading(false);
  }
};


  const fetchEpisode2 = async () => {
    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${id}`);
      setEpisodes2(response.data)
    } catch (error) {
      console.error('Error fetching episode yawa:', error);
     } finally {
      setLoading(false);
    }
  };
   


  useEffect(() => {
    fetchEpisodeDetail();
    fetchEpisode2();
  }, [episodeid, id]); // Fetch data whenever episodeid or id changes

  useEffect(() => {
    if (sources) {
      const selectedSource = qualityOptions.find(source => source.quality === selectedQuality);
      if (selectedSource) {
        setSources(selectedSource.url);
      }
    }
  }, [selectedQuality]);

 const handleFullscreenToggle = async () => {
    setIsFullscreen(!isFullscreen);

    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };
 

 
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
 

  const handleSliderChange = (value) => {
    if (videoRef.current && playbackStatus) {
      videoRef.current.setPositionAsync(value * playbackStatus.durationMillis);
    }
  };

 const handleNextEpisode = () => {
  const currentIndex = episode2.episodes.findIndex((item) => item.id === selectedItemId);
  if (currentIndex < episode2.episodes.length - 1) {
    const nextEpisode = episode2.episodes[currentIndex + 1];
    if (nextEpisode) {
      setSelectedItemId(nextEpisode.id);
      navigateToEpisode(nextEpisode);
    }
  }
};

const handlePreviousEpisode = () => {
  const currentIndex = episode2.episodes.findIndex((item) => item.id === selectedItemId);
  if (currentIndex > 0) {
    const previousEpisode = episode2.episodes[currentIndex - 1];
    if (previousEpisode) {
      setSelectedItemId(previousEpisode.id);
      navigateToEpisode(previousEpisode);
    }
  }
};

const navigateToEpisode = (episode) => {
  if (episode) {
    navigation.navigate('Watch', {
      episodeid: episode.episodeid || episode.id,
      id: episode2.id, // Pass the ID of the current episode set
      selectedItemId2: episode.id, // Pass the selected item ID
    });
  }
};
 
useEffect(() => {
  if (selectedItemId2 || selectedEpisodeID3) {
    setSelectedItemId(selectedItemId2 || selectedEpisodeID3); // Update the state with the passed ID
  }
}, [selectedItemId2, selectedEpisodeID3]);

 
  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.setVolumeAsync(value);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

   if (!episode2) {
   return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' }}
        style={styles.loadingGif}
      />
    </View> 
  );
}

 
 const renderEpisode2 = ({ item }) => (
    <TouchableOpacity
      onPress={async () => {
        const selectedEpisodeId = item.episodeid || item.id;

        // Use the context here, inside the functional component
        setSelectedEpisodeId(selectedEpisodeId);

        // Navigate to the Watch screen with the selected episode ID
        navigation.navigate('Watch', {
          episodeid: selectedEpisodeId, // Pass the selected episode ID
          id: episode2.id,               // Passing episode2.id as a parameter
        });
      }}
      style={styles.episodeContainer}
    >
      <Image source={{ uri: episode2.image }} style={styles.episodeImage} />
      <View style={styles.yawa}>
        <Text style={styles.episodeTitle}>{formatTitle(item.id)}</Text>
      </View>
    </TouchableOpacity>
  );
 

  return (
    <ScrollView style={styles.container}>
    
  <Pressable onPress={toggleControls} style={isFullscreen ? styles.videoContainerFullscreen : styles.videoContainer}>
    <View style={isFullscreen ? styles.videoContainerFullscreen : styles.videoContainer}>
     <Video
      ref={videoRef}
      source={{ uri: sources }}
      rate={1.0}
      volume={volume}
      isMuted={false}
      resizeMode="contain"
      shouldPlay={isPlaying}
      useNativeControls={false}
      style={isFullscreen ? styles.videoFullscreen : styles.video}
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      onLoad={async () => {
        // Ensure video starts from saved position when it loads
        if (savedPosition > 0) {
           await videoRef.current.setPositionAsync(savedPosition);
        }
      }}
    />
  
  
     {isFullscreen && controlsVisible ? (
    <View style={styles.controlRow}>
   <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
    <Ionicons name="play-back" size={32} color="white" />
  </TouchableOpacity>

    <TouchableOpacity
      onPress={handlePreviousEpisode}
      disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0
          ? styles.disabledButton
          : null,
      ]}
    >
      <Ionicons name="chevron-back" size={30} color="white" />
    </TouchableOpacity>
    

    <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.centeredControlButton}>
      <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={handleNextEpisode}
      disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1
          ? styles.disabledButton
          : null,
      ]}
    >
      <Ionicons name="chevron-forward" size={30} color="white" />
    </TouchableOpacity>
        <TouchableOpacity onPress={handleFastForward} style={styles.controlButton}>
    <Ionicons name="play-forward" size={32} color="white" />
  </TouchableOpacity>
  </View>
) : (
  controlsVisible && (
    <View style={styles.controlRow}>
  <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
    <Ionicons name="play-back" size={32} color="white" />
  </TouchableOpacity>

    <TouchableOpacity
      onPress={handlePreviousEpisode}
      disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0
          ? styles.disabledButton
          : null,
      ]}
    >
      <Ionicons name="chevron-back" size={30} color="white" />
    </TouchableOpacity>
    

    <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.centeredControlButton}>
      <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={handleNextEpisode}
      disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1
          ? styles.disabledButton
          : null,
      ]}
    >
      <Ionicons name="chevron-forward" size={30} color="white" />
    </TouchableOpacity>
        <TouchableOpacity onPress={handleFastForward} style={styles.controlButton}>
    <Ionicons name="play-forward" size={32} color="white" />
  </TouchableOpacity>
  </View>
  
  )
)}

      {/* Controls */}
      {controlsVisible && (
        <View style={styles.controls}>
          {!isFullscreen && (
            <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.controlButton}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
            </TouchableOpacity>
            
                      
          )}
           

          
          
          
          {playbackStatus && (
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(playbackStatus.positionMillis)} / </Text>
              <Text style={styles.timeText}>{formatTime(playbackStatus.durationMillis)}</Text>
            </View>
          )}
          
          
          
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            thumbTintColor="white"
            minimumTrackTintColor="#DB202C"
            maximumTrackTintColor="gray"
          />
   <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.pickerButton}>
          <Ionicons name="settings" size={24} color="white" />
          <Text style={styles.selectedQualityText}>{selectedQuality}</Text>
          <Ionicons name="chevron-down" size={24} color="white" />
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {qualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.quality}
                  style={styles.optionButton}
                  onPress={() => handleSelectQuality(option.quality)}
                >
                  <Ionicons name="settings" size={24} color="white" />
                  <Text style={styles.optionText}>{option.quality}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
 
          <TouchableOpacity onPress={handleFullscreenToggle} style={styles.controlButton}>
            <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
      

      {playbackStatus && controlsVisible && (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={playbackStatus.positionMillis / playbackStatus.durationMillis}
          onValueChange={handleSliderChange}
          thumbTintColor="white"
          minimumTrackTintColor="#DB202C"
          maximumTrackTintColor="gray"
        />
      )}
    </View>
  </Pressable>
 
                 {selectedEpisodeId && <Text style={styles.selectedIdText}>Currently Selected Episode ID: {selectedEpisodeId}</Text>}

               <Text style={styles.selectedIdText}>{episode2.title}</Text>
{(selectedItemId || selectedItemId2 || selectedEpisodeID3  ) && (
  <Text style={styles.selectedIdText}>
    {formatTitle(selectedItemId || selectedItemId2 || selectedEpisodeID3  )}
  </Text>
)}

<View style={styles.navigationButtonsContainer}>
  <TouchableOpacity
    onPress={handlePreviousEpisode}
    disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0}
    style={[styles.navigationButton, episode2.episodes.findIndex((item) => item.id === selectedItemId) <= 0 ? styles.disabledButton : null]}
  >
         <Ionicons name="chevron-back" size={30} color="white" /> 

     
  </TouchableOpacity>
{(selectedItemId || selectedItemId2 || selectedEpisodeID3 ) && (
  <Text style={styles.selectedIdText}>
    {formatTitle2(selectedItemId || selectedItemId2 || selectedEpisodeID3) }
  </Text>
)}
  <TouchableOpacity
    onPress={handleNextEpisode}
    disabled={episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1}
    style={[styles.navigationButton, episode2.episodes.findIndex((item) => item.id === selectedItemId) >= episode2.episodes.length - 1 ? styles.disabledButton : null]}
  >
      <Ionicons name="chevron-forward" size={30} color="white" />
  </TouchableOpacity>
</View>

<TouchableOpacity
    onPress={navigateBack}
    
  >
      <Ionicons name="arrow-down" size={30} color="white" />
  </TouchableOpacity>
 

        <FlatList
        data={episode2.episodes}
        renderItem={renderEpisode2}
    keyExtractor={(item) => item.id} // Use id as the key
        contentContainerStyle={styles.episodeList}
      />
    </ScrollView>
  );
  
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers the buttons horizontally
    alignItems: 'center',     // Aligns the buttons vertically in the middle
    position: 'absolute',
    alignSelf: 'center',
    bottom: '40%', // Adjust this to position the row as needed
 
  },
  centeredControlButton: {
    marginHorizontal: 20, // Add some spacing between the play/pause button and the navigation buttons
  },
  navigationButton: {
    padding: 22,
     borderRadius: 20,
    },
     previousNextButton: {
    marginHorizontal: 20, // Adds margin to both sides (left and right)
   },
  disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // Grey out the button if it's disabled
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
  },
   selectedIdText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
   navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
 
    episodeImage: {
    width: 100,
    height: 150,
    marginRight: 10,
     resizeMode: 'cover',
  },
  navigationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  episodeContainer: {
  flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  episodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  episodeTitle: {
    color: 'white', // Ensure the text color is visible
    fontSize: 16,
  },
  yawa: {
      flex: 1,
    justifyContent: 'center',
  },
  episodeList: {
    paddingBottom: 100, // Add some padding to avoid clipping
  },
  videoContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoContainerFullscreen: {
    width: Dimensions.get('window').height,
    height: Dimensions.get('window').width,
  },
  videoFullscreen: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
    centeredControlButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  picker: {
    height: 50,
    width: 150,
    color: 'white',
  },
  volumeSlider: {
    width: 100,
    marginHorizontal: 10,
  },
  slider: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
  },
  timeContainer: {
   
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
  
   pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
     padding: 10,
    borderRadius: 5,
  },
  selectedQualityText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   },
  modalContent: {
    width: 300,
    backgroundColor: '#444',
    padding: 20,
    borderRadius: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#555',
    borderBottomWidth: 1,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
closeButton: {
    position: 'absolute',
    top: 10, // Position from the top
    right: 10, // Position from the right
     padding: 5,
    borderRadius: 20,
  },
  
  closeText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  
});

export default Watch;
