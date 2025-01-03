import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import { useDownloadedFiles } from '../context/DownloadedFilesContext';
import { Ionicons } from '@expo/vector-icons';
import { useClose } from '../context/CloseProvider';

const DownloadsPage = () => {
  const { downloadedFiles, setDownloadedFiles } = useDownloadedFiles();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const videoRef = useRef(null);
   const {  handleClose } = useClose();

 useEffect(() => {
    console.log('Downloaded Files:', downloadedFiles);
  }, [downloadedFiles]);

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
    console.log('Requesting permissions...');
    const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      console.error('Media Library permission denied');
      Alert.alert('Permission Denied', 'You need permission to access the media library.');
      return false;
    }
  }
  return true;
};

const downloadToDocumentDirectory = async (fileUri, fileName) => {
  try {
    let extension = fileUri.split('.').pop() || 'mp4';
    const targetUri = `${FileSystem.documentDirectory}${fileName}.${extension}`;
    console.log('Copying file to:', targetUri);

    // Try copying the file
    await FileSystem.copyAsync({ from: fileUri, to: targetUri });

    const fileInfo = await FileSystem.getInfoAsync(targetUri);
    console.log('File info after copy:', fileInfo);

    if (!fileInfo.exists) {
      console.error("File does not exist after copy");
      Alert.alert('Error', 'File saving failed.');
      return;
    }

    Alert.alert('Success', `File copied to ${targetUri}`);
    return targetUri; // Return the path to be used in saveToMediaLibrary
  } catch (error) {
    console.error('Error during file copy:', error);
    Alert.alert('Error', `Failed to copy file: ${error.message}`);
  }
};
const saveToMediaLibrary = async (fileUri, albumName = "Downloads") => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Create an asset from the downloaded file URI
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    console.log("Asset created:", asset);

    // Save the asset to a custom album (like "Downloads")
    await MediaLibrary.createAlbumAsync(albumName, asset, false);
    console.log(`File saved to Media Library under album: ${albumName}`);
    Alert.alert('Success', `File saved to Media Library in "${albumName}" album`);
  } catch (error) {
    console.error('Error saving to Media Library:', error);
    Alert.alert('Error', 'Failed to save file to Media Library');
  }
};



useEffect(() => {
  const downloadFilesSequentially = async () => {
    for (const file of downloadedFiles) {
      try {
        if (!file.uri) {
          console.error(`Missing file URI for ${file.id}`);
          continue; // Skip files with missing URIs
        }

        const fileName = file.id;

        // Download file to the document directory and get the target URI
        const targetUri = await downloadToDocumentDirectory(file.uri, fileName);

        // Once the file is downloaded, save it to the media library using the correct target URI
        if (targetUri) {
          await saveToMediaLibrary(targetUri, fileName);
        }
        
      } catch (error) {
        console.error('Error downloading file:', error);
        Alert.alert('Download Error', `Download failed for ${file.id}: ${error.message}`);
      }
    }
  };

  downloadFilesSequentially();
}, [downloadedFiles]);
 

 

 


    const Close = async () => {
    await handleClose(); // Use the context's handlePauseVideo function
  };
  const handleVideoOpen = (uri) => {
    setVideoUri(uri);
    setIsVideoVisible(true);
  };

  const handleVideoClose = () => {
    setVideoUri(null);
    setIsVideoVisible(false);
    setPlaybackStatus(null); // Reset playback status
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
        Alert.alert('Error', 'Failed to open file');
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
            // Delete each file and check if any errors occur
            await Promise.all(downloadedFiles.map(async (file) => {
              if (file.uri) {
                await FileSystem.deleteAsync(file.uri, { idempotent: true });
              }
            }));

            // Clear the files in the context to update the UI
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
const formatFileName = (fileName, quality) => {
  // Remove the file extension
  const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
  
  // Replace '_' with ' ' and split by '-' to create an array of words
  const words = nameWithoutExtension.replace(/_/g, ' ').split('-');
  
  // Capitalize the first letter of each word
  const capitalizedWords = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the words back together and replace the last element if it contains any resolution format (like '720p')
  const formattedName = capitalizedWords.join(' ').replace(/ \d+p$/, `-${quality}`);
  
  return formattedName + '.mp4'; // Add the file extension back
};


  // Separate downloads function for rendering items
  const downloads = ({ item }) => {
     return (
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
  };



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Downloaded Files</Text>

      <TouchableOpacity onPress={clearData} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>
<FlatList
  data={downloadedFiles.slice().reverse()} // Reverse the data array
  keyExtractor={(item) => item.id.toString()}
  renderItem={downloads}  // Use the separate downloads function here
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
          <TouchableOpacity onPress={togglePlayback} style={styles.playPauseButton}>
  <Ionicons name={playbackStatus?.isPlaying ? "pause" : "play"} size={24} color="white" />
</TouchableOpacity>


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
});

export default DownloadsPage;