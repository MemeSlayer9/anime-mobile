import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Draggable from 'react-native-draggable';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Video } from 'expo-av';
import { VideoProvider } from '../context/VideoProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useVideo } from '../context/VideoProvider'; // Adjust the path as needed
import { useClose } from '../context/CloseProvider';
 import { useKeepAwake } from 'expo-keep-awake';

const Hello = forwardRef(({ onClose, selectedEpisodeID3, selectedID3 }, ref) => {
  const navigation = useNavigation();
  const { videoRef, handlePauseVideo } = useVideo();
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const { handleClose } = useClose();  // Access handleClose from CloseProvider

  const [sources, setSources] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [savedPosition, setSavedPosition] = useState(0);
 
   useKeepAwake();

  
  const formatTitle = (selectedEpisodeID3) => {
  // Replace 'tv' with 'Tv' and capitalize each word
  return selectedEpisodeID3
    .replace(/-/g, ' ')            // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase())  // Capitalize the first letter of each word
    .replace('Tv', 'TV')            // Replace 'Tv' with 'TV'
    .replace('Episode', 'Episode'); // Add hyphen before episode number
};


    const handlePause = async () => {
    await handlePauseVideo(); // Use the context's handlePauseVideo function
  };
  const fetchEpisodeDetail = async () => {
    try {
      const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/watch/${selectedEpisodeID3}`);
      const qualityList = response.data.sources
        .filter(source => source.quality !== 'backup' && source.quality !== 'default')
        .map(source => ({
          quality: source.quality,
          url: source.url,
        }));

      setSources(qualityList.length > 0 ? qualityList[0].url : '');
    } catch (error) {
      console.error('Error fetching episode detail:', error);
    } finally {
      setLoading(false);
    }
  };

    const handleSliderChange = (value) => {
    if (videoRef.current && playbackStatus) {
      videoRef.current.setPositionAsync(value * playbackStatus.durationMillis);
    }
  };
 

  const savePlaybackPosition = async (position) => {
    try {
      if (selectedEpisodeID3) {
        const key = `playbackPosition_${selectedEpisodeID3}`;
        console.log(`Saving position ${position} for episode ${selectedEpisodeID3}`);
        await AsyncStorage.setItem(key, JSON.stringify(position));
      }
    } catch (error) {
      console.error('Failed to save the playback position:', error);
    }
  };

  const loadPlaybackPosition = async () => {
    try {
      const key = `playbackPosition_${selectedEpisodeID3}`;
      const position = await AsyncStorage.getItem(key);
      if (position !== null) {
        const parsedPosition = JSON.parse(position);
        console.log(`Loaded saved position ${parsedPosition} for episode ${selectedEpisodeID3}`);
        setSavedPosition(parsedPosition);
      } else {
         setSavedPosition(0);
      }
    } catch (error) {
     }
  };

  const handlePlaybackStatusUpdate = (status) => {
      setPlaybackStatus(status);

    if (!status.isPlaying && status.positionMillis > 0) {
      console.log(`Video paused, saving position ${status.positionMillis}`);
      savePlaybackPosition(status.positionMillis);
    }
  };
 

  const handlePlayPause = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      
      if (status.isPlaying) {
         await videoRef.current.pauseAsync();
        savePlaybackPosition(status.positionMillis);
        setIsPlaying(false);
      } else {
         await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleFullscreenToggle = () => {
  // Call the handleClose function first
  handleClose(); // This will perform any actions you have defined in handleClose

  if (isPlaying) {
    setIsPlaying(false); // Stop playback
  }

  if (selectedEpisodeID3) {
    navigation.navigate('Watch', {
      episodeid: selectedEpisodeID3,
      selectedEpisodeID3: selectedEpisodeID3,
      id: selectedID3
    });
  } else {
    console.error('No selected ID available for navigation.');
  }
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
  useEffect(() => {
    fetchEpisodeDetail();
    loadPlaybackPosition();
  }, [selectedEpisodeID3]);

  return (
<Draggable shouldReverse={false} onDragRelease={() => { /* Optional handler */ }}>
  <View style={styles.container}>
    {/* Close Button */}
<View style={styles.navigationButtonsContainer}>
    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Ionicons name={"close"} size={24} color="white" />
    </TouchableOpacity>
    
</View>
    {/* Video Component */}
    <TouchableOpacity onPress={handleFullscreenToggle} style={styles.videoTouchable}>
    <Video
      ref={videoRef}
      source={{ uri: sources }}
      rate={1.0}
      volume={1.0}
      isMuted={false}
      resizeMode="contain"
      shouldPlay={isPlaying}
      useNativeControls={false}
      style={styles.video}
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      onLoad={async () => {
        if (savedPosition > 0) {
          await videoRef.current.setPositionAsync(savedPosition);
        }
        await videoRef.current.playAsync(); // Automatically start playing the video
      }}
    />
  </TouchableOpacity>

    {/* Selected ID and Episode Info */}
     
    {/* Slider */}
    {playbackStatus && (
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
 <Text style={styles.selectedIdText}>
{formatTitle(selectedEpisodeID3 )}
</Text>

    {/* Play/Pause and Fullscreen Buttons */}
    <View style={styles.controlRow}>
      <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
    <Ionicons name="play-back" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleFastForward} style={styles.controlButton}>
    <Ionicons name="play-forward" size={32} color="white" />
      </TouchableOpacity>
    </View>
  </View>
</Draggable>

  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e', // Dark background for a modern look
    borderRadius: 15,           // Softer rounded corners
    padding: 10,                // Spacing around the container
    shadowColor: '#000',        // Subtle shadow for depth
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,               // Shadow effect for Android
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -15,                   // Positioned just above the video
    right: 0,
    borderRadius: 50,           // Fully rounded button
    padding: 5,
    backgroundColor: '#ff3b30', // Bright red close button for clarity
    zIndex: 10,
  },
   selectedIdText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
     },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoTouchable: {
    width: '100%',
    height: 150,                // Keep the height consistent
    borderRadius: 15,
     marginBottom: 10,
         alignItems: 'center', // Center horizontally

  },
  video: {
    width: 250,
    height: '100%',
    
  },
  slider: {
    alignSelf: 'center',        // Center the slider horizontally
    width: '100%',               // Make the slider almost full width, aligned with the video
    marginBottom: 10,
    thumbTintColor: '#ffffff',  // White thumb for visibility
    minimumTrackTintColor: '#ff3b30', // Red for progress indicator
    maximumTrackTintColor: '#606060', // Dark gray for remaining track
  
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',  // Evenly space the controls
    alignItems: 'center',
    marginTop: 10,
  },
  controlButton: {
    backgroundColor: '#333',        // Dark button background
    padding: 10,
    borderRadius: 50,               // Fully rounded buttons for controls
    marginHorizontal: 5,
  },
  controlIcon: {
    color: 'white',                 // White icons for play/pause/forward/back
    fontSize: 24,
  },
  navigationButtonsContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,                    // Ensure this stays on top
    flexDirection: 'row',
  },
});


export default Hello;
