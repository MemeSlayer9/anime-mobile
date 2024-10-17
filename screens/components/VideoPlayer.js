import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as ScreenOrientation from 'expo-screen-orientation';

const VideoPlayer = ({ videoSources }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(videoSources[3].quality);
  const [currentSource, setCurrentSource] = useState(videoSources[3].url);
  const [volume, setVolume] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const selectedSource = videoSources.find(source => source.quality === selectedQuality);
    if (selectedSource) {
      setCurrentSource(selectedSource.url);
    }
  }, [selectedQuality]);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

   const handleFullscreenToggle = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setIsFullscreen(!isFullscreen);
  };


  const handleLoad = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
    }
  };

  const handleProgress = (status) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
    }
  };
    const handleSliderChange = (value) => {
    if (videoRef.current && playbackStatus) {
      videoRef.current.setPositionAsync(value * playbackStatus.durationMillis);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: currentSource }}
        style={isFullscreen ? styles.fullscreenVideo : styles.video}
        useNativeControls={false}
        resizeMode="contain"
        shouldPlay={isPlaying}
        onPlaybackStatusUpdate={status => {
          handleLoad(status);
          handleProgress(status);
        }}
        volume={volume}
      />
    <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.timeText}>
          {Math.floor(currentTime / 60000)}:{((currentTime % 60000) / 1000).toFixed(0).padStart(2, '0')}
        </Text>
        <Slider
          style={styles.slider}
          value={currentTime}
          minimumValue={0}
          maximumValue={duration}
             thumbTintColor="white"
            minimumTrackTintColor="white"
            maximumTrackTintColor="gray"
          
          onValueChange={(value) => videoRef.current.setPositionAsync(value)}
        />
        <Text style={styles.timeText}>
          {Math.floor(duration / 60000)}:{((duration % 60000) / 1000).toFixed(0).padStart(2, '0')}
        </Text>
        <TouchableOpacity onPress={handleFullscreenToggle} style={styles.controlButton}>
            <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="white" />
          </TouchableOpacity>
        <Picker
          selectedValue={selectedQuality}
          onValueChange={(itemValue) => setSelectedQuality(itemValue)}
          style={styles.picker}
        >
          {videoSources.map((option) => (
            <Picker.Item key={option.quality} label={option.quality} value={option.quality} />
          ))}
        </Picker>
         
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
   controlButton: {
    marginHorizontal: 10,
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
    justifyContent: 'space-between',
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
 slider: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
  },
  
  timeContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
});

export default VideoPlayer;
