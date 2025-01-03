import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native';
import { Video } from 'expo-av';

// Fetch and parse VTT subtitles
 

// Main App component
const App = ({ route }) => {
  const { episodeid } = route.params;
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const videoRef = useRef(null);
  const [data, setData] = useState(null);

  const fetchEpisodeSources = async () => {
    try {
      const response = await fetch(
        `https://wazzap-delta.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${episodeid}`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.data.sources.length > 0) {
          const source = { url: result.data.sources[0].url }; // Automatically set the first source URL
          setVideoUrl(source.url);
          // Fetch and parse subtitle
          const vttUrl = 'https://s.megastatics.com/subtitle/074558bcd3744dc5cca24ac0ef9d6bcb/eng-2.vtt';
          const parsedSubtitles = await fetchAndParseVTT(vttUrl);
          setSubtitles(parsedSubtitles); // Set parsed subtitles
        }
      }
    } catch (error) {
      console.error('Error fetching episode sources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodeSources();
  }, []);

const fetchAndParseVTT = async (vttUrl) => {
  try {
    const response = await fetch(vttUrl);
    const text = await response.text();

    // Updated regex for this type of VTT file
    const subtitles = [];
    const regex = /(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\n([\s\S]*?)(?=\n\n|$)/g;
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
  const [minutes, seconds] = time.split(':');
  const [sec, millis] = seconds.split('.');
  return (
    parseInt(minutes) * 60000 + parseInt(sec) * 1000 + parseInt(millis)
  );
};


  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
       const currentTime = status.positionMillis;
      console.log('Current Time:', currentTime); // Debugging current time
      const currentSubtitle = subtitles.find(
        (subtitle) => currentTime >= subtitle.start && currentTime <= subtitle.end
      );
      console.log('Current Subtitle:', currentSubtitle); // Debugging current subtitle
      setCurrentSubtitle(currentSubtitle ? currentSubtitle.text : '');
    }
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' }}
          style={styles.loadingGif}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : videoUrl ? (
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          useNativeControls
          resizeMode="contain"
          shouldPlay
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          subtitles={[
            {
              uri: 'https://s.megastatics.com/subtitle/074558bcd3744dc5cca24ac0ef9d6bcb/eng-2.vtt',
              language: 'eng',
              type: 'webvtt',
            },
          ]}
          style={styles.videoPlayer}
        />
      ) : (
        <Text style={styles.errorText}>No video sources available.</Text>
      )}
      {currentSubtitle ? (
        <Text style={styles.subtitleText}>{currentSubtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingGif: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitleText: {
    color: 'white',
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
  },
});

export default App;
