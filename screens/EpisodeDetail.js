import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useEpisode } from '../context/EpisodeProvider';
 import { useMyId} from '../context/PlaylistProvider';
import { Ionicons } from '@expo/vector-icons';
import { useID } from '../context/IdProvider';
import { subTosub, dubTodub } from '../Provider/imageMappings';


const EpisodeDetail = ({ route }) => {
      const navigation = useNavigation(); // Use the hook to access navigation
      const { setsMyListID } = useMyId();  // Correct destructuring
  const { selectId, setselectid } = useID();  // Correct destructuring

   const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode(); // Use your hook in a functional component

  const { id } = route.params; // Retrieve id from route params
  const [item, setItem] = useState(null);
    const [episode, setEpisodes] = useState(null);
    const [episode2, setEpisodes2] = useState(null);
  const [provider, setProvider] = useState(''); // State to manage selected provider
 const [selectedTab, setSelectedTab] = useState('Tab2');
const [error, setError] = useState(null); // Add this line

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

// Simulate data refresh

  const GogoSub = {
  ...subTosub,
  
 };

  const GogoDub = {
  ...dubTodub,
  
 };

 
  const handleAddBookmark = (id) => {
  setsMyListID(id);  // Set the selected ID when the bookmark is clicked
  console.log('Bookmark clicked, selectId:', id);
};


const onRefresh = () => {
  setRefreshing(true);
  // Add your data-fetching logic here
  setTimeout(() => {
    setRefreshing(false);
  }, 2000); // Simulating network request with 2 seconds delay
};

 const formatTitle = (id) => {
  // Replace 'tv' with 'Tv' and capitalize each word
  return id
    .replace(/-/g, ' ')            // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase())  // Capitalize the first letter of each word
    .replace('Tv', 'TV')            // Replace 'Tv' with 'TV'
    .replace('Episode', 'Episode'); // Add hyphen before episode number
};
 


const fetchDetail = async () => {
  try {
    const response = await axios.get(`https://api.amvstr.me/api/v2/info/${id}`);
    setItem(response.data);
    
    // Check and set provider with mapping
    if (response.data.id_provider) {
      const gogoId = response.data.id_provider.idGogo;
      setProvider(GogoSub[gogoId] || gogoId); // Use mapping if available
      console.log(`Primary API successful: https://api.amvstr.me/api/v2/info/${id}`);
    }
  } catch (error) {
    console.error('Primary API failed, attempting backup...', error);

    try {
      const backupResponse = await axios.get(`https://amvstrmapiprod-1-f3650650.deta.app/api/v2/info/${id}`);
      setItem(backupResponse.data);
      
      // Check and set provider with backup mapping
      if (backupResponse.data.id_provider) {
        const gogoDubId = backupResponse.data.id_provider.idGogoDub;
        setProvider(GogoDub[gogoDubId] || gogoDubId); // Use backup mapping if available
      }
      console.log(`Backup API successful: https://amvstrmapiprod-1-f3650650.deta.app/api/v2/info/${id}`);
    } catch (backupError) {
      console.error('Backup API also failed:', backupError);
    }
  } finally {
    setLoading(false);
  }
};

  
  
  const fetchEpisode = async () => {
    try {
      const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/episodes/${id}`);
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error xxx episode detail:', error);
    } finally {
      setLoading(false);
    }
  };
  
const fetchEpisode2 = async () => {
    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${provider}`);
      setEpisodes2(response.data)
    } catch (error) {
      console.error('Error zxc episode detail:', error);
     } finally {
      setLoading(false);
    }
  };
        console.log(`https://juanito66.vercel.app/anime/gogoanime/info/${provider}`);

  
const handleProviderClick = (providerKey) => {
    const selectedProvider = item.id_provider[providerKey];
    if (selectedProvider) {
        const mappedProvider = providerKey === 'idGogo' ? GogoSub[selectedProvider] : GogoDub[selectedProvider];
        setProvider(mappedProvider || 'Not Available');
    } else {
        setProvider('Not Available');
    }
};

  
   useEffect(() => {
    if (provider) {
      fetchEpisode2();
    }
  }, [provider]);

  useEffect(() => {
    fetchDetail();
    fetchEpisode();
 
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!item || !episode || !episode2) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' }}
          style={styles.loadingGif}
        />
      </View>
    );
  }

  const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active ? styles.activeTabButton : null]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active ? styles.activeTabText : null]}>{title}</Text>
  </TouchableOpacity>
);

  
  const renderEpisode = ({ item }) => (
    <TouchableOpacity style={styles.episodeContainer}>
      <Image source={{ uri: item.image }} style={styles.episodeImage} />
 
    <Text style={styles.episodeTitle}>{formatTitle(item.id)}</Text>
 
  
    </TouchableOpacity>
  );
const renderEpisode2 = ({ item }) => (
  <TouchableOpacity
    onPress={async () => {
        const selectedEpisodeId = item.episodeid || item.id;
        const selectId = episode2.id;
          // Use the context here, inside the functional component
        setSelectedEpisodeId(selectedEpisodeId);
        setselectid(selectId);
      navigation.navigate('Watch', {
        episodeid: item.episodeid || item.id,
        id: episode2.id, // Passing episode2.id as a parameter
        selectedItemId2: item.id || item.episodeid, // Passing the selectedItemId to Watch screen
      });
    }}
    style={styles.episodeContainer}
  >
    <Image source={{ uri: episode2.image }} style={styles.episodeImage} />
          <View style={styles.textContainer}>
 
    <Text style={styles.episodeTitle}>{formatTitle(item.id)}</Text>
    </View>
  </TouchableOpacity>
);


 
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#161616', 'rgba(22, 22, 22, 0.9)', 'rgba(22, 22, 22, 0.8)']}
        style={styles.gradient}
      >
         <View style={styles.imageContainer}>
<Image 
  source={{ uri: item.bannerImage ? item.bannerImage : item.coverImage.large }} 
  style={styles.image} 
/>
          <LinearGradient
            colors={['rgba(10, 20, 22, 0)', 'rgba(22, 22, 22, 1)']}
            style={styles.overlayGradient}
          />
        </View>
        <Text style={styles.details}>Episode ID: {item.id}</Text>
        <Text style={styles.title}>{item.title.userPreferred}</Text>
        <Text style={styles.title}>Status: {item.status}</Text>
        <Text style={styles.title}>Status: {item.season}</Text>
          <TouchableOpacity onPress={() => handleAddBookmark(item.id)}>
            <Ionicons name="bookmark-outline" size={30} color="#DB202C" />
          </TouchableOpacity>
          
        <Text style={styles.description}>{item.description}</Text>
{item.id_provider && (
  <View style={styles.providerContainer}>
    <TouchableOpacity onPress={() => handleProviderClick('idGogo')}>
      <Text style={styles.providerText}>
        idGogo: {GogoSub[item.id_provider.idGogo] || item.id_provider.idGogo}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleProviderClick('idGogoDub')}>
      <Text style={styles.providerText}>
        idGogoDub: {GogoDub[item.id_provider.idGogoDub] || item.id_provider.idGogoDub}
      </Text>
    </TouchableOpacity>
  </View>
)}


                <Text style={styles.providerDisplay}>Currently displaying: {provider}</Text>
        
            <View style={styles.tabContainer}>
      <TouchableOpacity onPress={() => setSelectedTab('Tab1')} style={styles.tab}>
        <Text style={selectedTab === 'Tab1' ? styles.activeTabText : styles.inactiveTabText}>Tab 1</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setSelectedTab('Tab2')} style={styles.tab}>
        <Text style={selectedTab === 'Tab2' ? styles.activeTabText : styles.inactiveTabText}>Tab 2</Text>
      </TouchableOpacity>
        </View>
  {selectedTab === 'Tab1' ? (
      <FlatList
        data={episode}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.episodeList}
         refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
      />
    ) : (
      <FlatList
        data={episode2.episodes}
        renderItem={renderEpisode2}
        keyExtractor={(item) => item.provider}
        contentContainerStyle={styles.episodeList}
         refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
      />
    )}
 
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 350, // Adjust as needed
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
   textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
  },
    providerDisplay: {
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 18,
    marginVertical: 10,
    color: '#fff',
    paddingHorizontal: 10,
  },
  details: {
    fontSize: 18,
    marginVertical: 10,
    color: '#fff',
    paddingHorizontal: 10,
  },
  providerContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  tabContainer: {
 paddingHorizontal: 10,
    marginVertical: 10,
  },
  activeTabText:{
fontSize: 16,
    color: '#fff',
  },
  inactiveTabText:{
fontSize: 16,
    color: '#fff',
  },
  
  providerText: {
    fontSize: 16,
    color: '#fff',
  },
  
  episodeList: {
    paddingHorizontal: 10,
  },
  episodeContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
   },
  episodeImage: {
     width: 100,
    height: 150,
    marginRight: 10,
     resizeMode: 'cover',
  },
  episodeTitle: {
    fontSize: 16,
    color: '#fff',
    
  },
  loadingGif: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
  },
});


export default EpisodeDetail;
