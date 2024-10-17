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

const Hello = forwardRef(({ onClose, selectedEpisodeID3, selectedID3 }, ref) => {
  const navigation = useNavigation();
  const { videoRef, handlePauseVideo } = useVideo();
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const { handleClose } = useClose();  // Access handleClose from CloseProvider

  const [sources, setSources] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [savedPosition, setSavedPosition] = useState(0);


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

  useEffect(() => {
    fetchEpisodeDetail();
    loadPlaybackPosition();
  }, [selectedEpisodeID3]);

  return (
<Draggable shouldReverse={false} onDragRelease={() => { /* Optional handler */ }} >
      <View style={styles.container}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        
        {/* Video component */}
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
        
        <Text>{selectedID3}</Text>
        <Text>Episode ID: {selectedEpisodeID3}</Text>

      {playbackStatus  && (
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
        {/* Play/Pause Button */}
        
        <TouchableOpacity onPress={handleFullscreenToggle} style={styles.controlButton}>
          <Ionicons name={"expand"} size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" />
        </TouchableOpacity>
      </View>
    </Draggable>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 30,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  controlButton: {
    marginTop: 10,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  video: {
    width: '100%',
    height: 200, // Adjust height as needed
  },
});

export default Hello;
