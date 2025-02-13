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

 const Watch = ({ route }) => {
        const navigation = useNavigation(); // Use the hook to access navigation

  const { episodeid, id, selectedItemId2, selectedEpisodeID3 } = route.params;
   const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState(null);
    const [downloads, setDownloads] = useState(null);

  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [qualityOptions, setQualityOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const { isFullscreen, setIsFullscreen } = useContext(FullscreenContext);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [volume, setVolume] = useState(1.0); // Volume state
      const [episode2, setEpisodes2] = useState(null);
const [selectedItemId, setSelectedItemId] = useState(selectedItemId2 || selectedEpisodeID3 || selectedEpisodeId || null); // Initialize with passed ID
const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const videoRef = useRef(null);
  const [videoSources, setVideoSources] = useState([])
  const [controlsVisible, setControlsVisible] = useState(true); // State to manage visibility of controls
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [savedPosition, setSavedPosition] = useState(0); // State to store the saved position
 const [isModalVisible2, setIsModalVisible2] = useState(false);
   const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode(); // Use your hook in a functional component
   const { downloadedID, setDownloadedID} = useDownloadedID();
   const { downloadedEpisodeID, setDownloadedEpisodeID } = useDownloadedEpisodeID();
  const { selectId, setselectid } = useID();  // Correct destructuring
const { downloadedFiles, setDownloadedFiles } = useDownloadedFiles();
 const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
const [reloadKey, setReloadKey] = useState(0); // Key to force re-render

const reloadVideo = () => {
  console.warn('Reloading video due to NaN:NaN issue.');
  setReloadKey((prevKey) => prevKey + 1); // Increment key to force re-render
};

 const downloadArray = downloads
    ? Object.entries(downloads).map(([resolution, url]) => ({
        resolution: resolution.split('x')[1] + 'p', // Extract height and add 'p'
        url,
      }))
    : [];

const downloadQuality = async (quality) => {
  // Close the modal immediately after selecting quality
  setIsModalVisible2(false);
  setIsDownloading(true); // Start the download
  setSelectedQuality(quality); // Set the selected quality

  try {
    // Find the URL for the given quality in downloadArray
    const selectedKey = downloadArray.find(item => item.resolution === quality)?.url;

    // Define downloadedEpisodeID, downloadedID, and imageUrl based on provided data
    const downloadedEpisodeID = selectedItemId;
    const downloadedID = episode2?.id;
    const imageUrl = episode2?.image;

    // Download video if the selected URL exists
    if (selectedKey) {
      const videoUri = `${FileSystem.documentDirectory}${downloadedEpisodeID}_${quality}.mp4`;

      try {
        const downloadResumable = FileSystem.createDownloadResumable(
          selectedKey,
          videoUri,
          {},
          (downloadProgress) => {
        const progressPercentage = Math.floor((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100);
  setProgress(progressPercentage);

          }
        );

        const videoResult = await downloadResumable.downloadAsync();
        console.log('Downloaded video to:', videoResult.uri);

        setDownloadedFiles((prevFiles) => [
          ...prevFiles,
          { quality, id: downloadedEpisodeID, uri: videoResult.uri, type: 'Video' }
        ]);
      } catch (error) {
        console.error('Video download failed:', error.message);
      }
    } else {
      console.error('Error: No URL found for selected quality:', quality);
    }

     

  } catch (error) {
    console.error('Error in downloadQuality function:', error.message);
  } finally {
    setIsDownloading(false); // End download
    setProgress(0); // Reset progress for next download
  }
};


 
 



 
// Reme
     useKeepAwake();

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
  if (status.isLoaded) {
    // Ensure positionMillis and durationMillis are valid before using them
    if (!isNaN(status.positionMillis) && !isNaN(status.durationMillis)) {
      setPlaybackStatus(status);

      // Save the current position if playback stops
      if (!status.isPlaying && status.positionMillis > 0) {
        savePlaybackPosition(status.positionMillis);
      }
    } else {
      console.error("Detected NaN issue in playback status:", status);
    }
  } else {
    console.warn("Playback status indicates video is not yet loaded:", status);
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


 
useEffect(() => {
    const backAction = async () => {
      try {
        await NavigationBar.setVisibilityAsync('visible'); // Optional: Hide the nav bar on back action
        
       const selectedEpisodeId = selectedItemId || selectedItemId; // Use the passed episodeid or the current selectedItemId
    const selectId = episode2.id;

    // Set the selected episode ID in context or state
    setSelectedEpisodeId(selectedEpisodeId); 
    setselectid(selectId);
    // Get the current playback position from the video player
    const status = await videoRef.current.getStatusAsync();
    const position = status.positionMillis;

    // Save the current position
    await savePlaybackPosition(position);

    
    // Navigate back to HomeTabs with the saved position and episode details
    navigation.navigate('HomeTabs', {
      showHello: true,
      episodeid: selectedEpisodeId,  // Make sure this is the correct selected episode ID
      id: episode2.id,               // Pass the correct id for episode2
      savedPosition: position,       // Pass the saved playback position
    });
  } catch (error) {
    console.error('Failed to save position or navigate:', error);
  }
};


    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the event listener on component unmount
}, [navigation, episode2, selectedItemId]); // Include relevant dependencies



const navigateBack = async (episodeid) => {
  try {
    const selectedEpisodeId = selectedItemId || selectedItemId; // Use the passed episodeid or the current selectedItemId
    const selectId = episode2.id;

    // Set the selected episode ID in context or state
    setSelectedEpisodeId(selectedEpisodeId); 
    setselectid(selectId);
    // Get the current playback position from the video player
    const status = await videoRef.current.getStatusAsync();
    const position = status.positionMillis;

    // Save the current position
    await savePlaybackPosition(position);

  
    // Navigate back to HomeTabs with the saved position and episode details
    navigation.navigate('HomeTabs', {
      showHello: true,
      episodeid: selectedEpisodeId,  // Make sure this is the correct selected episode ID
      id: episode2.id,               // Pass the correct id for episode2
      savedPosition: position,       // Pass the saved playback position
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
            setSavedPosition(currentPosition); // Store it in state for later use


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
  setControlsVisible((prevVisible) => {
    const newVisibleState = !prevVisible;

    if (!newVisibleState) {
      NavigationBar.setVisibilityAsync('hidden'); // Ensure the navigation bar stays hidden
    }

    return newVisibleState;
  });
};

const hideControlsAfterTimeout = () => {
  setTimeout(() => {
    setControlsVisible(false);
    NavigationBar.setVisibilityAsync('hidden'); // Keep the navigation bar hidden when controls disappear
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
const fetchDownload = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`https://api.janime.workers.dev/download/${episodeid}`);
    setDownloads(response.data.results);
   } catch (error) {
    console.error('Error fetching episode yawa:', error);
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
    fetchDownload();
  }, [episodeid, id]); // Fetch data whenever episodeid or id changes

  const handleQualityChange = (newQuality) => {
  if (videoRef.current && playbackStatus) {
    const currentPosition = playbackStatus.positionMillis; // Save current position
    setSavedPosition(currentPosition); // Store it in state for later use
  }

  setSelectedQuality(newQuality); // Update the selected quality
};

 useEffect(() => {
  if (sources) {
    const selectedSource = qualityOptions.find(source => source.quality === selectedQuality);
    if (selectedSource) {
      setSources(selectedSource.url); // Change the video source

      // Seek to the saved position after a brief delay
      const seekToSavedPosition = async () => {
        if (videoRef.current && savedPosition) {
          try {
            await videoRef.current.setPositionAsync(savedPosition);
          } catch (error) {
            console.error("Failed to seek to saved position:", error);
          }
        }
      };

      setTimeout(seekToSavedPosition, 500); // Adjust delay if necessary
    }
  }
}, [selectedQuality]);




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
 
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
 

const handleSliderChange = (value) => {
  if (
    videoRef.current &&
    playbackStatus &&
    !isNaN(playbackStatus.durationMillis) // Ensure duration is valid
  ) {
    const targetPosition = value * playbackStatus.durationMillis;

    if (!isNaN(targetPosition)) {
      videoRef.current.setPositionAsync(targetPosition);
    } else {
      console.error("Slider target position is NaN. Skipping seek.");
    }
  }
};

const handleNextEpisode = () => {
  const currentIndex = episode2.episodes.findIndex((item) => item.id === selectedItemId);
  if (currentIndex < episode2.episodes.length - 1) {
    const nextEpisode = episode2.episodes[currentIndex + 1];
    if (nextEpisode) {
      // Update the selected episode and series ID
      const selectedEpisodeId = nextEpisode.episodeid || nextEpisode.id;  // Get the next episode's ID
      const selectId = episode2.id;  // Get the series ID

      // Update the selected episode ID and series ID in state/context
      setSelectedEpisodeId(selectedEpisodeId);
      setselectid(selectId);

      // Proceed with navigation to the next episode
      navigateToEpisode(nextEpisode);
    }
  }
};


const handlePreviousEpisode = () => {
  const currentIndex = episode2.episodes.findIndex((item) => item.id === selectedItemId);
  if (currentIndex > 0) {
    const previousEpisode = episode2.episodes[currentIndex - 1];
    if (previousEpisode) {
      // Update the selected episode and series ID
      const selectedEpisodeId = previousEpisode.episodeid || previousEpisode.id;  // Get the previous episode's ID
      const selectId = episode2.id;  // Get the series ID

      // Update the selected episode ID and series ID in state/context
      setSelectedEpisodeId(selectedEpisodeId);
      setselectid(selectId);

      // Proceed with navigation to the previous episode
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
  if (selectedItemId2 || selectedEpisodeID3 || selectedEpisodeId) {
    setSelectedItemId(selectedItemId2 || selectedEpisodeID3 || selectedEpisodeId); // Update the state with the passed ID
  }
}, [selectedItemId2, selectedEpisodeID3, selectedEpisodeId]);

 
  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.setVolumeAsync(value);
    }
  };

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
        const selectId = episode2.id;
          // Use the context here, inside the functional component
        setSelectedEpisodeId(selectedEpisodeId);
        setselectid(selectId);
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
         
  
          {sources && (

     <Video
       key={reloadKey} // Change key to force re-mounting

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
        onLoad={(status) => {
          if (status.isLoaded) {
            console.log('Video metadata loaded:', status);
            if (savedPosition > 0) {
              videoRef.current.setPositionAsync(savedPosition);
            }
          } else {
            console.error('Failed to load video metadata:', status);
          }
        }}
        onError={(error) => {
          console.error('Video error:', error);
          reloadVideo(); // Automatically reload the page on error
        }}
      />
 
        )}

  
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
      <>
        {/* Show loading indicator if video is loading or not started */}
        {(loading || (playbackStatus && playbackStatus.positionMillis === 0 && !playbackStatus.isPlaying)) ? (
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator size="small" color="#ffff" />
           </View>
        ) : (
          // Show play/pause button when the video is not loading
          <TouchableOpacity onPress={() => handlePlayPause(!isPlaying)} style={styles.controlButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
          </TouchableOpacity>
        )}
      </>
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
  value={
    playbackStatus.durationMillis
      ? playbackStatus.positionMillis / playbackStatus.durationMillis
      : 0 // Prevent NaN display in slider
  }
  onValueChange={handleSliderChange}
  thumbTintColor="white"  
  minimumTrackTintColor="#DB202C"
  maximumTrackTintColor="gray"
/>

      )}
    </View>
  </Pressable>
  
 
                <Text style={styles.selectedIdText}>{episode2.title}</Text>
  {(selectedItemId || selectedItemId2 || selectedEpisodeID3 || selectedEpisodeId ) && (
    <Text style={styles.selectedIdText}>
      {formatTitle(selectedItemId || selectedItemId2 || selectedEpisodeID3 || selectedEpisodeId )}
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
 <View style={{ flex: 1, padding: 20 }}>
    {isDownloading ? (
  <CircularProgress
    size={100}
    width={10}
    fill={progress}
    tintColor="#fff"
    backgroundColor="#3d5875"
  >
    {(fill) => (
      <Text style={{ color: '#fff', fontSize: 18 }}>
        {Math.round(fill)}%
      </Text>
    )}
  </CircularProgress>
      ) : (
        // Show Download button when not downloading
        <TouchableOpacity onPress={() => setIsModalVisible2(true)} style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      )}

      {/* Modal for selecting download quality */}
      <Modal visible={isModalVisible2} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quality</Text>
            
            {downloadArray.length > 0 ? (
              downloadArray.map((item, index) => (
                <TouchableOpacity
                  key={item.resolution}
                  style={styles.optionButton}
                  onPress={() => downloadQuality(item.resolution)}
                >
                  <Text style={styles.optionText}>{`${item.resolution}p`}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No available downloads</Text>
            )}

            <TouchableOpacity onPress={() => setIsModalVisible2(false)} style={styles.closeButton}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    
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
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgb(36, 34, 53)',
    borderRadius: 10,
    padding: 10,
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
    downloadButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 18,
  },
   loadingContainer: {
    flex: 1,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
  },
    loadingGif: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
    
  },
  loadingIndicatorContainer: {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
},
   
});

export default Watch;
