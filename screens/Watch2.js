import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Linking, Alert, Text, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image, Pressable, Modal, ScrollView, StatusBar, BackHandler  } from 'react-native';
import axios from 'axios';
import { Video } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FullscreenContext } from './FullscreenContext'; // Import the context
import * as NavigationBar from 'expo-navigation-bar'; // Import the NavigationBar

import * as ScreenOrientation from 'expo-screen-orientation';
import VideoPlayer from './components/VideoPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure AsyncStorage is installed
import { useEpisode } from '../context/EpisodeProvider';
import { useID } from '../context/IdProvider';
import { useDownloadedFiles } from '../context/DownloadedFilesContext';
 import * as MediaLibrary from 'expo-media-library';
 
import {useDownloadedID, useDownloadedEpisodeID} from '../context/DownloadProvider';
  import { useKeepAwake } from 'expo-keep-awake';
import * as FileSystem from 'expo-file-system';
import { CircularProgress } from 'react-native-circular-progress';

const EpisodeSources = ({ route }) => {
    const navigation = useNavigation();

  const { episodeid } = route.params || {}; // Ensure episodeid is extracted
  const [controlsVisible, setControlsVisible] = useState(true); // State to manage visibility of controls
     const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [volume, setVolume] = useState(1.0); // Volume state
   const {  selectedEpisodeId, setSelectedEpisodeId, setSelectedEpisodeNumber, selectedEpisodeNumber } = useEpisode(); // Use your hook in a functional component
  const { selectId,  setselectid } = useID();  // Correct destructuring
const [episodes3, setEpisodes3] = useState(null);
    const [item4, setItem4] = useState(null);

  const { isFullscreen, setIsFullscreen } = useContext(FullscreenContext);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [selectedSubtitleIndex, setSelectedSubtitleIndex] = useState(null); // Index of selected subtitle
const [modalVisible, setModalVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(''); // State for the current subtitle
  const [qualities, setQualities] = useState([]);
 const [savedPosition, setSavedPosition] = useState(0); // State to store the saved position
const [selectedCategory, setSelectedCategory] = useState('sub'); // Default to 'sub'

  const [data, setData] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  
  // Check if the video URL is an HLS stream (m3u8)
   useKeepAwake();


 const handlePreviousEpisode = () => {
  if (!episodes3 || episodes3.length === 0) {
    console.error("episodes3 is null or empty.");
    return;
  }

  const currentIndex = episodes3.findIndex((item) => item.episodeId === selectedEpisodeId);
  if (currentIndex > 0) {
    const previousEpisode = episodes3[currentIndex - 1];
    if (previousEpisode) {
      // Update the selected episode and series ID
      const selectedEpisodeId = previousEpisode.episodeId;  // Get the previous episode's ID

      // Update the selected episode ID and series ID in state/context
      setSelectedEpisodeId(selectedEpisodeId);
            setSelectedEpisodeNumber(previousEpisode.number); // Assuming `number` exists in `episodes3`

      // Proceed with navigation to the previous episode
      navigateToEpisode(previousEpisode);
    }
  }
};

const handleNextEpisode = () => {
  const currentIndex = episodes3.findIndex((item) => item.episodeId === selectedEpisodeId);

  if (currentIndex < episodes3.length - 1) {
    const nextEpisode = episodes3[currentIndex + 1];

    if (nextEpisode) {
      // Update the selected episode ID and number
      setSelectedEpisodeId(nextEpisode.episodeId);
      setSelectedEpisodeNumber(nextEpisode.number); // Assuming `number` exists in `episodes3`

      // Navigate to the next episode
      navigateToEpisode(nextEpisode);
    }
  }
};


const navigateToEpisode = (item) => {
  if (item) {
     navigation.navigate('Watch2', {
        episodeid: item.episodeId,
        id: item4?.anime?.info?.id, // Passing episode2.id as a parameter
       
      });
  }
};

const checkVideoQualities = async (source) => {
  try {
    const response = await fetch(source.url);
    const playlist = await response.text();

    const baseUrl = source.url; // Use the full URL as base
    const qualities = [];
    const lines = playlist.split('\n');

    lines.forEach((line, index) => {
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const qualityInfo = line.match(/RESOLUTION=(\d+x\d+)/);
        const bandwidthInfo = line.match(/BANDWIDTH=(\d+)/);

        let url = lines[index + 1]; // The URL will be in the next line
        if (!url.startsWith('http')) {
          // If it's a relative URL, resolve it against the base URL
          url = new URL(url, baseUrl).href;
        }

        qualities.push({
          resolution: qualityInfo ? qualityInfo[1] : 'Unknown',
          bandwidth: bandwidthInfo ? parseInt(bandwidthInfo[1], 10) : 'Unknown',
          url: url,
        });
      }
    });

    if (qualities.length === 0) {
      console.warn('No qualities found or this is not a master playlist.');
    }

    return qualities;
  } catch (error) {
    console.error('Error checking video qualities:', error);
    return [];
  }
};



 

// Handle quality selection
const handleQualitySelect = async (quality) => {
  try {
    // Get the current playback state
    const playbackStatus = await videoRef.current.getStatusAsync();
    const currentPosition = playbackStatus.positionMillis;
    const wasPlaying = playbackStatus.isPlaying;

    // Save the new quality URL
    setVideoUrl(quality.url); 

            await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();


    // Reload the video with the selected quality
    await videoRef.current.loadAsync(
      { uri: quality.url }, 
      {
        shouldPlay: wasPlaying,   // Resume playing if it was playing before
        positionMillis: currentPosition, // Start from the same position
      }
    );

    // Close the modal after quality selection
    setModalVisible(false);
      setSavedPosition(currentPosition); // Store it in state for later use


        // After loading the video, force an update to playback status
        videoRef.current.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
  } catch (error) {
    console.error("Error changing quality:", error);
  }
};


const fetchAndParseVTT = async (vttUrl) => {
  try {
    const response = await fetch(vttUrl);
    const text = await response.text();

    // Updated regex for this type of VTT file
    const subtitles = [];
    const regex = /(\d{2}:\d{2}(?::\d{2})?\.\d{3}) --> (\d{2}:\d{2}(?::\d{2})?\.\d{3})\n([\s\S]*?)(?=\n\n|$)/g
;
    
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [_, start, end, subtitleText] = match;
      subtitles.push({
        start: convertToMillis(start),
        end: convertToMillis(end),
        text: subtitleText.trim(),
      });
    }

    return subtitles;
  } catch (error) {
    console.error('Failed to fetch or parse VTT file:', error);
    return [];
  }
};

const convertToMillis = (time) => {
  const parts = time.split(':');
  let hours = 0, minutes = 0, seconds = 0, millis = 0;

  if (parts.length === 3) {
    // Format: hh:mm:ss.mmm
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    // Format: mm:ss.mmm
    [minutes, seconds] = parts;
  }

  [seconds, millis] = seconds.split('.');

  return (
    parseInt(hours) * 3600000 +
    parseInt(minutes) * 60000 +
    parseInt(seconds) * 1000 +
    parseInt(millis)
  );
};


// Update handleSubtitleSelect
const handleSubtitleSelect = async (subtitle, index) => {
  setSelectedSubtitleIndex(index); // Set the selected subtitle index
  setIsModalVisible(false); // Close modal after selection

  if (subtitle.file) {
    try {
      const parsedSubtitles = await fetchAndParseVTT(subtitle.file);
      console.log('Parsed Subtitles Length:', parsedSubtitles.length);
      console.log('Parsed Subtitles:', parsedSubtitles);

      if (parsedSubtitles.length > 0) {
        const updatedTracks = [...data.tracks];
        updatedTracks[index].subtitles = parsedSubtitles;
        setData((prev) => ({ ...prev, tracks: updatedTracks }));

        // Display selected subtitle
        console.log('Selected Subtitle:', updatedTracks[index].subtitles);
      } else {
        console.warn('No subtitles found.');
      }
    } catch (error) {
      console.error('Error fetching or parsing subtitles:', error);
    }
  }
};

   
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
 
    const toggleControls = () => {
  setControlsVisible((prevVisible) => {
    const newVisibleState = !prevVisible;

    if (!newVisibleState) {
      NavigationBar.setVisibilityAsync('hidden'); // Ensure the navigation bar stays hidden
    }

    return newVisibleState;
  });
};

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

const handlePlaybackStatusUpdate = (status) => {
  if (status.isLoaded) {
    setPlaybackStatus(status);

    if (!status.isPlaying && status.positionMillis > 0) {
      savePlaybackPosition(status.positionMillis);
    }
        setLoading(false); // Ensure loading is disabled when video is ready


    const currentTime = status.positionMillis;

    if (data && data.tracks && data.tracks.length > 0) {
      const subtitleTrack = data.tracks[selectedSubtitleIndex] || data.tracks[0];

      if (subtitleTrack && subtitleTrack.subtitles) {
        console.log('Checking subtitles for current time:', currentTime);

        const currentSubtitle = subtitleTrack.subtitles.find(
          (subtitle) =>
            currentTime >= subtitle.start && currentTime <= subtitle.end
        );

        console.log('Current Subtitle:', currentSubtitle);

        setCurrentSubtitle(currentSubtitle ? currentSubtitle.text : '');
      } else {
       }
    }
  }
};
 
const navigateBack = async () => {
  try {
    console.log('SelectedEpisodeId:', selectedEpisodeId); // Check if it's defined
    navigation.navigate('HomeTabs', {
      episodeid3: selectedEpisodeId, // Correct parameter
      id: selectId,
    });
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

 

 


const handleSliderChange = (value) => {
  if (
    videoRef.current &&
    playbackStatus?.durationMillis && // Ensure durationMillis is valid
    !isNaN(playbackStatus.durationMillis)
  ) {
    const targetPosition = value * playbackStatus.durationMillis;

    if (!isNaN(targetPosition)) {
      videoRef.current.setPositionAsync(targetPosition);
    } else {
      console.error("Slider target position is NaN. Skipping seek.");
    }
  } else {
    console.warn("Cannot seek: Invalid playback status or video reference.");
  }
};
 
 const handleFullscreenToggle = async () => {
    setIsFullscreen((prev) => !prev);

    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      await NavigationBar.setVisibilityAsync('hidden'); // Hide the navigation bar
    StatusBar.setHidden(true,); // Show the status bar

    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      await NavigationBar.setVisibilityAsync('visible'); // Show the navigation bar
     StatusBar.setHidden(false,); // Show the status bar

    }
  };

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
  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.setVolumeAsync(value);
    }
  };

useEffect(() => {
  if (!episodeid) {
    console.error('episodeid is missing');
    return;
  }

  const fetchEpisodeSources = async () => {
    try {
      const response = await fetch(
        `https://wazzap-delta.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${episodeid}&category=${selectedCategory}`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.data.sources.length > 0) {
          // Automatically set the first source URL
          const source = { url: result.data.sources[0].url }; // Define the source here
          setVideoUrl(source.url);

 
          // Fetch video qualities
          const fetchedQualities = await checkVideoQualities(source);
           setQualities(fetchedQualities);
        }
      }
    } catch (error) {
      console.error('Error fetching episode sources:', error);
    }
  };

  fetchEpisodeSources();
}, [episodeid, selectedCategory]); // Add selectedCategory as a dependency


const fetchEpisode3 = async () => {
  setLoading(true); // Set loading state
  try {
    const response = await axios.get(`https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${selectId}/episodes`);
setEpisodes3(response.data?.data?.episodes || []); // Safely access episodes array
    console.log(`Fetching episodes from: https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${selectId}/episodes`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 error specifically
      setEpisodes3([]); // Set episodes to an empty array
      console.error('No data available for this title. (404 Not Found)');
    } else {
      // Handle other errors
      console.error('Error fetching bogok details:', error);
    }
  } finally {
    setLoading(false); // Reset loading state
  }
};


  const fetchDetail2 = async () => {
    try {
      const response = await axios.get(
        `https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${selectId}`
      );
      console.log('Full API Response:', response.data); // Log to debug
      setItem4(response.data?.data || null); // Ensure null if data is missing
    } catch (error) {
      console.error('API failed:', error);
      setItem4(null); // Prevent crashes by setting to null
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    
      fetchEpisode3();
   fetchDetail2();
  }, [selectId]);



// Function to handle category changes
const handleCategoryChange = (category) => {
  setSelectedCategory(category);
};
const getResolutionFromUrl = (url, qualities) => {
  const match = qualities.find((q) => q.url === url);
  return match ? match.resolution.split('x')[1] + 'p' : '1080p';
};

 
if (data && data.tracks && data.tracks.length === 0) {
  return <Text>No subtitles available</Text>;
}

  if (!episodeid) {
    return <Text>Error: episodeid is required</Text>;
  }


   if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={{ uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' }}
        style={styles.loadingGif}
      />
    </View>
  );
}
  if (!data) {
    return <View style={styles.container}>
    <Image
        source={{ uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' }}
        style={styles.loadingGif}
      />
    </View>;
  }

 
  const renderSubtitleItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleSubtitleSelect(item, index)}
    >
      <Text style={styles.label}>{item.label} ({item.kind})</Text>
    </TouchableOpacity>
  );
   const renderSubtitleModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Subtitle</Text>
          <FlatList
            data={data.tracks.filter((track) => track.kind === 'captions')}
            renderItem={({ item, index }) => renderSubtitleItem({ item, index })}
            keyExtractor={(item, index) => `${item.file}-${index}`}
            style={styles.subtitleList}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

    const renderEpisode3 = ({ item }) => (
  <TouchableOpacity
    onPress={async () => {
        const selectedEpisodeId = item.episodeId;
              const selectedEpisodeNumber = item?.number;

         setSelectedEpisodeId(selectedEpisodeId);
        setselectid(selectId);
      setSelectedEpisodeNumber(selectedEpisodeNumber);

       navigation.navigate('Watch2', {
        episodeid: item.episodeId,
       id: item4?.anime?.info?.id, // Passing episode2.id as a parameter
                selectedEpisodeNumber : selectedEpisodeNumber

       
      });
    }}
    style={styles.episodeContainer}
  >
       <Image source={{ uri: item4?.anime?.info?.poster }} style={styles.episodeImage} />

           <View style={styles.textContainer}>
 
    <Text style={styles.episodeTitle}> {item.episodeId}</Text>
        <Text style={styles.episodeTitle}>Episode {item.number}</Text>

    </View>
  </TouchableOpacity>
);

  return (
        <ScrollView style={styles.container}>
        
  <Pressable onPress={toggleControls} style={isFullscreen ? styles.videoContainerFullscreen : styles.videoContainer}>
 
    
     <View style={isFullscreen ? styles.videoContainerFullscreen : styles.videoContainer}>
 
       {videoUrl ? (
<Video
  ref={videoRef}
  source={{ uri: videoUrl }}
   volume={volume}
  useNativeControls={false}
  resizeMode="contain"
  shouldPlay={isPlaying}
  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      style={isFullscreen ? styles.videoFullscreen : styles.videoPlayer}
   onLoad={(status) => {
          if (status.isLoaded) {
             if (savedPosition > 0) {
              videoRef.current.setPositionAsync(savedPosition);
            }
          } else {
            console.error('Failed to load video metadata:', status);
          }
        }}
  textTracks={
    data && data.tracks
      ? data.tracks
          .filter(track => track.kind === 'captions')
          .map(track => ({
            uri: track.file,
            type: 'text/vtt',
            language: track.label,
            title: track.label,
          }))
      : []
  }
  selectedTextTrack={{
    type: 'index',
    value: selectedSubtitleIndex !== null ? selectedSubtitleIndex : 0,
  }}
  onError={(error) => console.error('Error loading video or subtitles', error)}
/>



      ) : (
        <Text>No video available</Text>
      )}



 
 
     
{currentSubtitle ? (
  <Text style={styles.subtitleText}>{currentSubtitle}</Text>
) : (
  <Text style={styles.subtitleText}>......</Text>
)}
  

    
       {isFullscreen && controlsVisible ? (
      <View style={styles.controlRow}>
     <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
      <Ionicons name="play-back" size={32} color="white" />
    </TouchableOpacity>
  
      <TouchableOpacity
     onPress={handlePreviousEpisode}
  disabled={!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0}
  style={[
    styles.navigationButton,
    (!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0) ? styles.disabledButton : null
  ]}
>
        <Ionicons name="chevron-back" size={30} color="white" />
      </TouchableOpacity>
      
  
   <>
          {/* Show loading indicator if video is loading or not started */}
          {(loading || (playbackStatus && playbackStatus.positionMillis === 0 && !playbackStatus.isPlaying)) ? (
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="large" color="#ffff" />
             </View>
          ) : (
            // Show play/pause button when the video is not loading
            <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.controlButton}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" />
            </TouchableOpacity>
          )}
        </>
     <TouchableOpacity
      onPress={handleNextEpisode}
      disabled={episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1
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
  disabled={!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0}
  style={[
    styles.navigationButton,
    (!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0) ? styles.disabledButton : null
  ]}
>
        <Ionicons name="chevron-back" size={30} color="white" />
      </TouchableOpacity>
      
  
      <>
          {/* Show loading indicator if video is loading or not started */}
          {(loading || (playbackStatus && playbackStatus.positionMillis === 0 && !playbackStatus.isPlaying)) ? (
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="large" color="#ffff" />
             </View>
          ) : (
            // Show play/pause button when the video is not loading
            <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.controlButton}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" />
            </TouchableOpacity>
          )}
        </>
  
      <TouchableOpacity
      onPress={handleNextEpisode}
      disabled={episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1
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
 {controlsVisible && (
   <View style={styles.controlsTop}> 
                   <View style={styles.leftControls}>

       <TouchableOpacity
     onPress={navigateBack}
     
   >
       <Ionicons name="arrow-down" size={30} color="white" />
   </TouchableOpacity>
      <Text style={styles.selectedIdText}>
      Episode {selectedEpisodeNumber}
    </Text>
   </View>
   
                <View style={styles.rightControls}>

                 <TouchableOpacity
        style={styles.openButton}
        onPress={() => setIsModalVisible(true)}
      >
  <Image
  source={require('../assets/subtitle2.png')} // Adjust path based on the file's location
  style={[styles.icon, { tintColor: 'white' }]} // Optional tint for color consistency
/>
      </TouchableOpacity>
      {renderSubtitleModal()}

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.pickerButton}>
                        <Ionicons name="settings" size={24} color="white" />

      <Text style={styles.buttonText}>
  {videoUrl ? getResolutionFromUrl(videoUrl, qualities) : 'Loading...'}
</Text>


        
      </TouchableOpacity>

      {/* Modal displaying available qualities */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Qualities</Text>
            {qualities.map((quality, index) => (
              <TouchableOpacity
                key={index}
                style={styles.qualityOption}
                onPress={() => handleQualitySelect(quality)}
              >
                <Text style={styles.qualityText}>
                  {quality.resolution} ({(quality.bandwidth / 1000).toFixed(0)} kbps)
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
       </View>
              </View>
    )}

      <Text style={styles.heading}>Available Subtitles</Text>
            {controlsVisible && (

    <View style={styles.controls}> 
   
          
        <>
        {/* Show loading indicator if video is loading or not started */}
        {(loading || (playbackStatus && playbackStatus.positionMillis === 0 && !playbackStatus.isPlaying)) ? (
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator size="large" color="#ffff" />
           </View>
        ) : (
          // Show play/pause button when the video is not loading
          <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.controlButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={25} color="white" />
          </TouchableOpacity>
        )}
      </>
       
              <View style={styles.timeContainer}> 
     <Text style={styles.timeText}>{formatTime(playbackStatus?.positionMillis)} / </Text>
              <Text style={styles.timeText}>{formatTime(playbackStatus?.durationMillis)}</Text>
              

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
    value={
      playbackStatus?.durationMillis
        ? playbackStatus?.positionMillis / playbackStatus?.durationMillis
        : 0
    }
    onValueChange={handleSliderChange}
    thumbTintColor="white"
    minimumTrackTintColor="#DB202C"
    maximumTrackTintColor="gray"
  />
   )}
        
      </View>
      </Pressable>
      <View style={styles.tabContainer}>
  <TouchableOpacity onPress={() => handleCategoryChange('sub')} style={styles.tabButton}>
    <Text style={styles.metadataText}>Sub</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleCategoryChange('dub')} style={styles.tabButton}>
    <Text style={styles.metadataText}>Dub</Text>
  </TouchableOpacity>
</View> 
       <View style={styles.hello}>
   <Text style={styles.selectedIdText}>
      {selectedEpisodeId}
    </Text>

    
         <Text style={styles.selectedIdText}>
Episode: {selectedEpisodeNumber}</Text>
     <TouchableOpacity
     onPress={navigateBack}
     
   >
       <Ionicons name="arrow-down" size={30} color="white" />
   </TouchableOpacity>
    <View style={styles.navigationButtonsContainer}>
    
        <TouchableOpacity
  onPress={handlePreviousEpisode}
  disabled={!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0}
  style={[
    styles.navigationButton,
    (!episodes3 || episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) <= 0) ? styles.disabledButton : null
  ]}
>
  <Ionicons name="chevron-back" size={30} color="white" />
</TouchableOpacity>

<TouchableOpacity
      onPress={handleNextEpisode}
      disabled={episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1}
      style={[
        styles.navigationButton,
        styles.previousNextButton, // Add margin to the button
        episodes3.findIndex((item) => item.episodeId === selectedEpisodeId) >= episodes3.length - 1
          ? styles.disabledButton
          : null,
      ]}
    >
      <Ionicons name="chevron-forward" size={30} color="white" />
    </TouchableOpacity>
    </View>
</View>

      <FlatList
    data={episodes3}
    renderItem={renderEpisode3}
    keyExtractor={(item) => item.episodeId}
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
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row', // Arrange tabs horizontally
    justifyContent: 'space-around', // Optional, to add spacing if needed
    marginVertical: 20,
    paddingHorizontal: 20,
  },
   metadataText: {
    color: '#fff',
    marginHorizontal: 5,
    textAlign: 'center',
  },
  
  tabButton: {
    flex: 1, // Take up 50% of the container width
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: 'rgb(36, 34, 53)',
    borderRadius: 8,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgb(57, 54, 83)',
    marginHorizontal: 5, // Small margin between buttons
  },
   videoContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
    slider: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
  },
  url: {
    fontSize: 14,
    color: 'blue',
  },
    videoFullscreen: {
    width: '100%',
    height: '100%',
  },
    videoContainerFullscreen: {
    width: Dimensions.get('window').height,
    height: Dimensions.get('window').width,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
     },
   timeContainer: {
   
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
  meta: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
      loadingGif: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
    
  },
   volumeSlider: {
    width: 100,
    marginHorizontal: 10,
  },
  subtitleText: {
  color: '#fff',
  fontSize: 16,
  textAlign: 'center',
  position: 'absolute', // Position the subtitle text absolutely
  bottom: 50, // Adjust this to place it slightly above the bottom of the video
  width: '100%', // Ensure it spans across the video width
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a translucent background for better visibility
  padding: 5,
},
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers the buttons horizontally
    alignItems: 'center',     // Aligns the buttons vertically in the middle
    position: 'absolute',
    alignSelf: 'center',
    bottom: '40%', // Adjust this to position the row as needed
 
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

  controlsTop: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
    rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftControls:{
 flexDirection: 'row',
    alignItems: 'center',
  },
     timeContainer: {
   
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
    loadingIndicatorContainer: {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
},
 openButton: {
   },
   icon: {
    width: 30, // Match the size of the Ionicons
    height: 30, // Ensure the aspect ratio is consistent
    resizeMode: 'contain', // Keep the aspect ratio intact
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
    selectedIdText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
   },
    episodeImage: {
    width: 100,
    height: 150,
     borderRadius: 10,
    marginRight: 10,
    resizeMode: 'cover',
  },
   button: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
     pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
     padding: 10,
     borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  qualityOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  qualityText: {
    fontSize: 16,
  },
    episodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgb(36, 34, 53)',
    borderRadius: 10,
    padding: 10,
  },
    textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
   episodeTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
    navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
    navigationButton: {
    padding: 22,
     borderRadius: 20,
    },
      disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // Grey out the button if it's disabled
  },
   
});

export default EpisodeSources;
 