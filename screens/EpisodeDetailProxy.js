import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useEpisode } from '../context/EpisodeProvider';
import { useMyId } from '../context/PlaylistProvider';
import { Ionicons } from '@expo/vector-icons';
import { useID } from '../context/IdProvider';
import { subTosub, dubTodub } from '../Provider/imageMappings';

 

const EpisodeDetail = ({ route }) => {
  const navigation = useNavigation();
  const { setsMyListID } = useMyId();
  const { selectId, setselectid } = useID();
  const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode();
  const { id } = route.params;
    const [provider, setProvider] = useState(''); // State to manage selected provider
const [zoroId, setZoroId] = useState("");

  const [item, setItem] = useState(null);
    const [item2, setItem2] = useState(null);
 
const [  item3 ,setReccomendation] = useState(null);
    const [item4, setItem4] = useState(null);

  const [formattedTitle, setFormattedTitle] = useState('');
  const [formattedTitle2, setFormattedTitle2] = useState('');
  const [selectedTab, setSelectedTab] = useState('sub'); // Default to 'sub'
const [episodes2, setEpisodes] = useState(null);
const [episodes3, setEpisodes3] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
        const [countdown, setCountdown] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // Default tab
const [activeTab2, setActiveTab2] = useState("episodes2"); // State for active tab



  const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
  const GogoSub = {
  ...subTosub,
  // Add any additional mappings if necessary
};

const GogoDub = {
  ...dubTodub,
  // Add any additional mappings if necessary
};
  // Format titles based on romaji
  useEffect(() => {
    if (item?.title?.romaji) {
      // Format the title: replace spaces with hyphens, remove colons and periods, ensure single hyphens
      const baseTitle = item.title.romaji
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[:.]/g, '')
        .replace(/-+/g, '-');
      
      setFormattedTitle(baseTitle); // e.g., 'bleach-sennen-kessen-hen-soukoku-tan'
      setFormattedTitle2(`${baseTitle}-dub`); // e.g., 'bleach-sennen-kessen-hen-soukoku-tan-dub'
    }
  }, [item]);
  
  // Fetch item details based on ID
 const fetchDetail = async () => {
  setLoading(true);
  try {
    // Try the primary API
    const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/info/${id}`);
    setItem(response.data);
    console.log(`Fetched item details from: https://juanito66.vercel.app/meta/anilist/info/${id}`);
  } catch (error) {
    console.error('Failed to fetch data from primary API, attempting fallback:', error);
    try {
      // Fallback to the secondary API
      const fallbackResponse = await axios.get(`https://api.amvstr.me/api/v2/info/${id}`);
      setItem(fallbackResponse.data);
      console.log(`Fetched item details from fallback API: https://api.amvstr.me/api/v2/info/${id}`);
    } catch (fallbackError) {
      console.error('Failed to fetch data from both APIs:', fallbackError);
    }
  } finally {
    setLoading(false);
  }
};

const fetchProvider = async () => {
  try {
    const response = await axios.get(`https://api.amvstr.me/api/v2/info/${id}`);
    setItem2(response.data);

    // Log and use idZoro
    if (response.data?.id_provider) {
      const { idGogo, idZoro } = response.data.id_provider;

      // Set provider using mapping or fallback to idGogo
      setProvider(GogoSub[idGogo] || idGogo);

      // Log idZoro
      console.log(`idZoro: ${idZoro}`);
      
      // Optionally set idZoro to a state variable if needed
      setZoroId(idZoro); // Define a state variable for idZoro if you want to use it later
    }

    console.log(`Primary API successful: https://juanito66.vercel.app/meta/anilist/info/${id}`);
  } catch (error) {
    console.error('Primary API failed, attempting backup...', error);
  }
};



  const fetchDetail2 = async () => {
    try {
      const response = await axios.get(
        `https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${zoroId}`
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



  const fetchRecoomendation = async () => {
    try {
      const response = await axios.get(`https://api.amvstr.me/api/v2/recommendations/${id}}`);
      setReccomendation(response.data);
    } catch (error) {
      console.error('Error xxx episode detail:', error);
    } finally {
      setLoading(false);
    }
  };
  
 
const handleProviderClick = (providerKey) => {
    const selectedProvider = item2?.id_provider[providerKey];

    console.log('Provider Key:', providerKey);
    console.log('Selected Provider:', selectedProvider);
    
    if (selectedProvider) {
        // Use mapped value or fallback to the selected provider if mapping is unavailable
        const mappedProvider = providerKey === 'idGogo' 
            ? GogoSub[selectedProvider] || selectedProvider
            : GogoDub[selectedProvider] || selectedProvider;

        console.log('Mapped Provider:', mappedProvider);
        
        setProvider(mappedProvider);
    } else {
        console.log('Provider not available for key:', providerKey);
        setProvider('Not Available');
    }
};


      useEffect(() => {

    fetchDetail();
    fetchProvider();
     fetchRecoomendation();
  }, [id]);

    useEffect(() => {
    if (provider) {
      fetchEpisode2();
    }
  }, [provider]);

  
  // Fetch episodes based on selected tab and formatted titles
  useEffect(() => {
    let mappedTitle = ''; 
     console.log('Selected Tab:', selectedTab);
  console.log('Formatted Title:', formattedTitle);
  console.log('Formatted Title (Dub):', formattedTitle2);
    
    if (selectedTab === 'sub' && formattedTitle) {
      mappedTitle = GogoSub[formattedTitle] || formattedTitle; // Use mapped value or default to formattedTitle
    } else if (selectedTab === 'dub' && formattedTitle2) {
      mappedTitle = GogoDub[formattedTitle2] || formattedTitle2; // Use mapped value or default to formattedTitle2
    }
    
    if (mappedTitle) {
      fetchEpisode2(mappedTitle);
    }
  }, [selectedTab, formattedTitle, formattedTitle2]);
  
  // Fetch episode details function
const fetchEpisode2 = async () => {
  setLoading(true); // Set loading state
  try {
    const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${provider}`);
    setEpisodes(response.data); // Set episodes if successful
    console.log(`Fetching episodes from: https://juanito66.vercel.app/anime/gogoanime/info/${provider}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 error specifically
      setEpisodes([]); // Set episodes to an empty array
      console.error('No data available for this title. (404 Not Found)');
    } else {
      // Handle other errors
      console.error('Error fetching episode details:', error);
    }
  } finally {
    setLoading(false); // Reset loading state
  }
};

const fetchEpisode3 = async () => {
  setLoading(true); // Set loading state
  try {
    const response = await axios.get(`https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${zoroId}/episodes`);
setEpisodes3(response.data?.data?.episodes || []); // Safely access episodes array
    console.log(`Fetching episodes from: https://baba-mu-nine.vercel.app/api/v2/hianime/anime/${zoroId}/episodes`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 error specifically
      setEpisodes3([]); // Set episodes to an empty array
      console.error('No data available for this title. (404 Not Found)');
    } else {
      // Handle other errors
      console.error('Error fetching episode details:', error);
    }
  } finally {
    setLoading(false); // Reset loading state
  }
};

  useEffect(() => {
    
      fetchEpisode3();
    fetchDetail2();
  }, [zoroId]);


  // Handle adding to bookmarks
  const handleAddBookmark = (id) => {
    setsMyListID(id);  // Set the selected ID when the bookmark is clicked
    console.log('Bookmark clicked, selectId:', id);
  };
  
   const formatTitle = (id) => {
  // Replace 'tv' with 'Tv' and capitalize each word
  return id
    .replace(/-/g, ' ')            // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase())  // Capitalize the first letter of each word
    .replace('Tv', 'TV')            // Replace 'Tv' with 'TV'
    .replace('Episode', 'Episode'); // Add hyphen before episode number
};

 const calculateCountdown = (airingAt) => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const timeDifference = airingAt - currentTime;

  if (timeDifference <= 0) {
    return "Airing now";
  } else {
    const days = Math.floor(timeDifference / (60 * 60 * 24));
    const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
    const seconds = Math.floor(timeDifference % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
};

useEffect(() => {
  // Check if `item` and `item.nextAiringEpisode` exist
  if (item?.nextAiringEpisode?.airingTime) {
    const timer = setInterval(() => {
      const countdownArray = calculateCountdown(item.nextAiringEpisode.airingTime);
      setCountdown(countdownArray);
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);
  }
}, [item?.nextAiringEpisode?.airingTime]);

useEffect(() => {
  // Check if `item` and `item.nextAiringEpisode` exist
  if (item?.nextair?.airingAt) {
    const timer = setInterval(() => {
      const countdownArray = calculateCountdown(item.nextair.airingAt);
      setCountdown(countdownArray);
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);
  }
}, [item?.nextair?.airingAt]);

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
 
  
  if (!item) {
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
        const selectId = episodes2.id;
          // Use the context here, inside the functional component
        setSelectedEpisodeId(selectedEpisodeId);
        setselectid(selectId);
      navigation.navigate('Watch', {
        episodeid: item.episodeid || item.id,
        id: episodes2.id, // Passing episode2.id as a parameter
        selectedItemId2: item.id || item.episodeid, // Passing the selectedItemId to Watch screen
      });
    }}
    style={styles.episodeContainer}
  >
    <Image source={{ uri: episodes2.image }} style={styles.episodeImage} />
          <View style={styles.textContainer}>
 
    <Text style={styles.episodeTitle}>{formatTitle(item.id)}</Text>
    </View>
  </TouchableOpacity>
);

  

  const renderEpisode3 = ({ item }) => (
  <TouchableOpacity
    onPress={async () => {
        const selectedEpisodeId = item.episodeId;
        const selectId = item4?.anime?.info?.id;

         setSelectedEpisodeId(selectedEpisodeId);
                  setselectid(selectId);

       navigation.navigate('Watch2', {
        episodeid: item.episodeId,
                id: item4?.anime?.info?.id, // Passing episode2.id as a parameter

       
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
      <LinearGradient
        colors={['#161616', 'rgba(22, 22, 22, 0.9)', 'rgba(22, 22, 22, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.imageContainer}>
       <Image 
  source={{ 
    uri: item.image 
      ? item.image 
      : item.coverImage.large.replace("/medium/", "/large/") 
  }} 
  style={styles.image} 
/>


          <LinearGradient
            colors={['rgba(10, 20, 22, 0)', 'rgba(22, 22, 22, 1)']}
            style={styles.overlayGradient}
          />
        </View>
  
 
                            <Text style={styles.title}>{item.title.romaji}</Text>

                   <View style={styles.metadata}>

                 <Text style={styles.metadataText}>Rating: {item?.rating || item?.score?.averageScore}%</Text>
          <Text style={styles.metadataText}>Status: {item?.status}</Text>
        <Text style={styles.metadataText}>Season: {item?.season}</Text>

        </View>
                    <View style={styles.metadata}>

                  <Text style={styles.metadataText}>{item?.genres.join(", ")}</Text>
                  </View>
                                      <View style={styles.metadata}>

<Text style={styles.metadataText}>
  Started Date:{" "}
  {item.startIn
    ? `${item?.startIn?.year || ''} ${
        months[item?.startIn?.month - 1] || ''
      } ${item?.startIn?.day || ''}`
    : item?.startDate
    ? `${item?.startDate?.year || ''} ${
        months[item?.startDate?.month - 1] || ''
      } ${item?.startDate?.day || ''}`
    : ''}
</Text>
<Text style={styles.metadataText}>End Date:{" "}
   {item?.endIn
    ? `${item?.endIn?.year || ''} ${
        months[item?.endIn?.month - 1] || ''
      } ${item?.endIn?.day || ''}`
    : item?.endDate
    ? `${item?.endDate?.year || ''} ${
        months[item?.endDate?.month - 1] || ''
      } ${item?.endDate?.day || ''}`
    : ''}
</Text>
</View>
<View>
  {(item?.nextAiringEpisode || item?.nextair) && (
    <Text style={styles.metadataText}>
      <Text style={styles.episodeText}>
        Episode {(item?.nextAiringEpisode?.episode || item?.nextair?.episode)}
      </Text>
      {"  "}
      <Text style={styles.countdownText}>{countdown}</Text>
    </Text>
  )}
</View>
                     
          <TouchableOpacity onPress={() => handleAddBookmark(item.id)} style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={30} color="#DB202C" />
        </TouchableOpacity>
      

       {/* Description */}
     
      {/* Tab Buttons */}
     

 <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}
    >
      <TouchableOpacity
        onPress={() => setActiveTab('description')}
        style={[
          styles.tabButton,
          activeTab === 'description' && styles.activeTabButton,
                { width:  150 }, // 2 items per line (almost 50%)

        ]}
      >
        <Text style={styles.tabText}>Description</Text>
      </TouchableOpacity>
      

      <TouchableOpacity
        onPress={() => setActiveTab('relations')}
        style={[
          styles.tabButton,
          activeTab === 'relations' && styles.activeTabButton,
                { width:  150 }, // 2 items per line (almost 50%)

        ]}
      >
        <Text style={styles.tabText}>Relations</Text>
      </TouchableOpacity>

       <TouchableOpacity
        onPress={() => setActiveTab('recommendations')}
        style={[
          styles.tabButton,
          activeTab === 'recommendations' && styles.activeTabButton,
                { width:  150 }, // 2 items per line (almost 50%)

        ]}
      >
        <Text style={styles.tabText}>Recommendations</Text>
      </TouchableOpacity>
          <TouchableOpacity
        onPress={() => setActiveTab('characters')}
        style={[
          styles.tabButton,
          activeTab === 'characters' && styles.activeTabButton,
                { width:  150 }, // 2 items per line (almost 50%)

        ]}
      >
        <Text style={styles.tabText}>Characters</Text>
      </TouchableOpacity>
    </ScrollView>

          





     
      {activeTab === 'description' && (

         <Text style={styles.description}>{item.description}</Text>
       )}

      {/* Tab Content */}
      {activeTab === 'relations' && (
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.scrollContainer}
>
  {(item?.relation || item?.relations)
    ?.filter(relation => (relation?.format === 'TV' || relation?.type === 'TV' || relation?.format === 'MOVIE' || relation?.type === 'MOVIE')) // Filter based on 'format' or 'type' being 'TV' or 'MOVIE'
    ?.map((relation) => (
      <TouchableOpacity
        key={relation?.id}
        style={styles.relation}
        onPress={() => navigation.navigate('EpisodeDetail', { id: relation?.id })}
      >
        <Image
          source={{ uri: relation?.coverImage?.large || relation?.image }}
          style={styles.bitch}
        />
        <View style={styles.textContainer}>
          <Text style={styles.episodeTitle}>Status: {relation?.status}</Text>
          <Text
            style={[styles.episodeTitle, { width: 120 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {relation?.title?.romaji}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
    
</ScrollView>

      )}

      {activeTab === 'recommendations' && (
      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.scrollContainer}
>
  {(item3?.results || item?.recommendations)?.map((recommendation) => (
    <TouchableOpacity
      key={recommendation?.id}
      style={styles.relation}
      onPress={() =>
        navigation.navigate('EpisodeDetail', { id: recommendation?.id })
      }
    >
      <Image
        source={{ uri: recommendation?.coverImage?.large || recommendation?.image }}
        style={styles.bitch}
      />
      <Text
        style={[styles.episodeTitle, { width: 120 }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {recommendation?.title?.romaji}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>

      )}
    


       {activeTab === 'characters' && (
     <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.scrollContainer}
>
  {item?.characters?.map((character) => (
    <TouchableOpacity
      key={character?.id}
      style={styles.characters}
    >
      <Image
        source={{ uri: character?.image }}
        style={styles.bitch}
      />
      <View style={styles.textContainer}>
        <Text style={styles.episodeTitle}>{character?.name?.full}</Text>
      </View>
    </TouchableOpacity>
  ))}
</ScrollView>

      )}
         {
  /* 
  <View style={styles.tabContainer}>
    <TouchableOpacity 
      onPress={() => setSelectedTab('sub')} 
      style={[styles.tabButton]}
    >
      <Text style={selectedTab === 'sub' ? styles.activeTabText : styles.inactiveTabText}>
        Sub
      </Text>
    </TouchableOpacity>

    <TouchableOpacity 
      onPress={() => setSelectedTab('dub')} 
      style={[styles.tabButton]}
    >
      <Text style={selectedTab === 'dub' ? styles.activeTabText : styles.inactiveTabText}>
        Dub
      </Text>
    </TouchableOpacity>
  </View>
  */
}

 
  {item2?.id_provider && (
 <View style={styles.tabContainer}>
     <TouchableOpacity onPress={() => handleProviderClick('idGogo')}  style={[styles.tabButton,  ]}>
      <Text style={styles.metadataText}>
        Sub
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleProviderClick('idGogoDub')}  style={[styles.tabButton,  ]}>
      <Text style={styles.metadataText}>
        Dub
      </Text>
    </TouchableOpacity>
  </View>
)}
<View>
 <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "episodes2" && styles.activeTab]}
        onPress={() => setActiveTab("episodes2")}
      >
        <Text style={[styles.tabText, activeTab === "episodes2" && styles.activeTabText]}>
        Server 1
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "episodes3" && styles.activeTab]}
        onPress={() => setActiveTab("episodes3")}
      >
        <Text style={[styles.tabText, activeTab === "episodes3" && styles.activeTabText]}>
         Server 2
        </Text>
      </TouchableOpacity>
    </View>

  
  </View>

      

{!episodes2?.episodes?.length && (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <Text style={{ fontSize: 18, color: 'gray' }}>No episodes available.</Text>
  </View>
)}
  
   
      {activeTab === "episodes2" ? (
      <FlatList
        data={episodes2?.episodes}
        renderItem={renderEpisode2}
        keyExtractor={(item) => item.provider}
        contentContainerStyle={styles.episodeList}
      />
    ) : (
      <FlatList
        data={episodes3}
        renderItem={renderEpisode3}
        keyExtractor={(item) => item.episodeId}
        contentContainerStyle={styles.episodeList}
      />
    )}
      </LinearGradient>

      {/* Tab buttons */}
     
      
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
    height: 500, // Adjust as needed
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // This ensures the image is covered properly without distortion
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  details: {
    fontSize: 18,
    marginVertical: 10,
    color: '#fff',
    paddingHorizontal: 10,
  },
   scrollViewContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
    textAlign: 'center',  // Center the text horizontally
  },
  description: {
    fontSize: 15,
    marginVertical: 10,
    color: '#fff',
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row', // Arrange tabs horizontally
    justifyContent: 'space-around', // Optional, to add spacing if needed
    marginVertical: 20,
    paddingHorizontal: 20,
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
  activeTabText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  inactiveTabText: {
    textAlign: 'center',
    color: '#ccc',
    fontWeight: '500',
  },
  episodeList: {
    paddingHorizontal: 10,
  },
  episodeTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  noEpisodes: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
   relation: {
     alignItems: 'center',
    marginBottom: 10,
     borderRadius: 10,
    padding: 10,
  },
   episodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgb(36, 34, 53)',
    borderRadius: 10,
    padding: 10,
  },
  episodeImage: {
    width: 100,
    height: 150,
     borderRadius: 10,
    marginRight: 10,
    resizeMode: 'cover',
  },
  bitch:{
   width: 150,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
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
metadata: {
  flexDirection: 'row', // Horizontal layout
  justifyContent: 'center', // Center items horizontally
  alignItems: 'center', // Center items vertically
  marginVertical: 10, // Add spacing around the section
},
   metadataText: {
    color: '#fff',
    marginHorizontal: 5,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgb(36, 34, 53)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
     borderRadius: 8,
     marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E90FF',
  },
  tabText: {
    color: '#aaa',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
    activeTabButton: {
    backgroundColor: '#DB202C',
    color: '#fff',
  },
});

export default EpisodeDetail;
