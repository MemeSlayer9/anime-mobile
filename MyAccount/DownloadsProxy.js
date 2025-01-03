import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useDownloadedFiles } from '../context/DownloadedFilesContext';
import { Ionicons } from '@expo/vector-icons';
import { useClose } from '../context/CloseProvider';
import { supabase } from '../supabase/supabaseClient';

const DownloadsPage = () => {
  const { downloadedFiles, setDownloadedFiles } = useDownloadedFiles();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const videoRef = useRef(null);
  const { handleClose } = useClose();

  useEffect(() => {
    const loadDownloadedFiles = async () => {
      try {
        const files = JSON.parse(await AsyncStorage.getItem('downloadedFiles')) || [];
        setDownloadedFiles(files);
      } catch (error) {
        console.error('Failed to load downloaded files:', error);
      }
    };

    loadDownloadedFiles();
  }, []);

  const togglePlayback = async () => {
    if (playbackStatus?.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Permission Denied', 'You need permission to access the media library.');
        return false;
      }
    }
    return true;
  };

  const saveDownloadedFile = async (file) => {
    try {
      const existingFiles = JSON.parse(await AsyncStorage.getItem('downloadedFiles')) || [];
      const updatedFiles = [...existingFiles, file];
      await AsyncStorage.setItem('downloadedFiles', JSON.stringify(updatedFiles));
      setDownloadedFiles(updatedFiles);
    } catch (error) {
      console.error('Failed to save file metadata:', error);
    }
  };

 const saveFileToSupabase = async (file) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('Error fetching user:', userError?.message || 'User not found');
      return;
    }

    const user = userData.user; // Ensure user is defined
    const { data, error } = await supabase
      .from('downloaded_files')
      .insert({
        uri: file.uri,
        quality: file.quality,
        file_name: file.file_name || file.id, // Use `id` if `file_name` is missing
        user_id: user.id,
        episode_id: file.episodeId || null,
        image_url: file.imageUrl || null,
      });

    if (error) {
      console.error('Error saving file to Supabase:', error.message);
    } else {
      console.log('File saved to Supabase:', data);
    }
  } catch (error) {
    console.error('Error saving file to Supabase:', error);
  }
};


  const downloadToDocumentDirectory = async (fileUri, fileName, quality) => {
    try {
      let extension = fileUri.split('.').pop() || 'mp4';
      const targetUri = `${FileSystem.documentDirectory}${fileName}.${extension}`;
      await FileSystem.copyAsync({ from: fileUri, to: targetUri });

      const fileInfo = await FileSystem.getInfoAsync(targetUri);
      if (fileInfo.exists) {
        const fileMetadata = {
          id: fileName,
          uri: targetUri,
          quality: quality,
        };
        await saveDownloadedFile(fileMetadata);
        await saveFileToSupabase(fileMetadata); // Save file metadata to Supabase
        return targetUri;
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const saveToMediaLibrary = async (fileUri, albumName = "Downloads") => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync(albumName, asset, false);
      Alert.alert('Success', `File saved to Media Library in "${albumName}" album`);
    } catch (error) {
      console.error('Error saving to Media Library:', error);
    }
  };

  useEffect(() => {
    const downloadFilesSequentially = async () => {
      for (const file of downloadedFiles) {
        try {
          if (!file.uri) continue;
          const fileName = file.id;
          const targetUri = await downloadToDocumentDirectory(file.uri, fileName, file.quality);
          if (targetUri) await saveToMediaLibrary(targetUri, fileName);
        } catch (error) {
          console.error('Error downloading file:', error);
        }
      }
    };

    downloadFilesSequentially();
  }, [downloadedFiles]);

  const Close = async () => {
    await handleClose();
  };

  const handleVideoOpen = (uri) => {
    setVideoUri(uri);
    setIsVideoVisible(true);
  };

  const handleVideoClose = () => {
    setVideoUri(null);
    setIsVideoVisible(false);
    setPlaybackStatus(null);
  };

  const handleSliderChange = (value) => {
    if (videoRef.current && playbackStatus) {
      videoRef.current.setPositionAsync(value * playbackStatus.durationMillis);
    }
  };

  const handleFileOpen = async (file) => {
    if (file.uri && file.uri.endsWith('.mp4')) {
      handleVideoOpen(file.uri);
    } else if (file.uri) {
      try {
        await FileSystem.openDocumentAsync(file.uri);
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
  };

  const clearData = async () => {
  Alert.alert(
    "Clear Data",
    "Are you sure you want to clear all downloaded files?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            // Step 1: Delete files from Supabase
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData?.user) {
              console.error('Error fetching user:', userError?.message || 'User not found');
              return;
            }

            const user = userData.user;
            // Delete the downloaded files from Supabase for the logged-in user
            const { error: deleteError } = await supabase
              .from('downloaded_files')
              .delete()
              .eq('user_id', user.id);

            if (deleteError) {
              console.error('Error deleting files from Supabase:', deleteError.message);
              return;
            }
            
            // Step 2: Delete files locally using FileSystem
            await Promise.all(downloadedFiles.map(async (file) => {
              if (file.uri) await FileSystem.deleteAsync(file.uri, { idempotent: true });
            }));

            // Step 3: Clear local storage
            await AsyncStorage.removeItem('downloadedFiles');
            setDownloadedFiles([]);

            Alert.alert("Success", "All downloaded files have been cleared.");
          } catch (error) {
            console.error("Error clearing files:", error);
            Alert.alert("Error", "An error occurred while clearing files.");
          }
        },
      },
    ]
  );
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

  const formatFileName = (fileName, quality) => {
    const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
    const words = nameWithoutExtension.replace(/_/g, ' ').split('-');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const formattedName = capitalizedWords.join(' ').replace(/ \d+p$/, `-${quality}`);
    return formattedName + '.mp4';
  };

  const downloads = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUrl || item.uri }} style={styles.image} />
      <View style={styles.textContainer}>
        <TouchableOpacity onPress={async () => {
          await Close();
          handleFileOpen(item);
        }}>
          <Text style={styles.textFile}>{formatFileName(item.uri.split('/').pop(), item.quality)}</Text>
          <Text style={styles.qualityText}>Quality: {item.quality}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Downloaded Files</Text>

      <TouchableOpacity onPress={clearData} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>

      <FlatList
        data={downloadedFiles.slice().reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={downloads}
      />

       <Modal visible={isVideoVisible} animationType="slide" onRequestClose={handleVideoClose}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay
            onPlaybackStatusUpdate={status => setPlaybackStatus(status)}
            style={styles.video}
          />

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
              <View style={styles.controlRow}>

           <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
    <Ionicons name="play-back" size={32} color="white" />
      </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayback} style={styles.playPauseButton}>
            <Ionicons name={playbackStatus?.isPlaying ? "pause" : "play"} size={24} color="white" />
          </TouchableOpacity>
             <TouchableOpacity onPress={handleFastForward} style={styles.controlButton}>
    <Ionicons name="play-forward" size={32} color="white" />
      </TouchableOpacity>

         
        </View>
          <TouchableOpacity onPress={handleVideoClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  clearButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
   itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  urlText: {
    color: '#fff',
  },
  qualityText:{
    color: '#fff',
  },
  textFile: {
    color: '#fff',
  },
   textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
   
  clearButtonText: { 
    color: '#fff',
     fontSize: 16,
      fontWeight: 'bold' },
  episodeContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 100,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: { 
    fontSize: 18,
     fontWeight: 'bold',
      color: 'white'
     },
  airingDay: {
     color: 'gray' 
    },
  videoContainer: { 
    flex: 1, 
    justifyContent: 'center',
     alignItems: 'center', 
     backgroundColor: 'black' 
    },
  video: { 
    width: '100%',
     height: '80%'
     },
  slider: {
     width: '90%', 
     marginTop: 10
     },
  closeButton: { 
    padding: 10, 
    backgroundColor: 'white',
     marginTop: 10
     },
  closeButtonText: {
     color: 'black',
      fontSize: 16 },

  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',  // Evenly space the controls
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,           // Optional: adds padding around the row
  },
  controlButton: {
    padding: 10,                      // Adjusts padding for consistency
  },
  playPauseButton: {
    padding: 10,
  },
});

export default DownloadsPage;