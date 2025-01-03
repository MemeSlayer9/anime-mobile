import React, { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import { useEpisode } from '../context/EpisodeProvider';
import { useID } from '../context/IdProvider';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useClose } from '../context/CloseProvider';
import { useEpisodeHistory } from '../context/EpisodeHistoryProvider';
import { supabase } from '../supabase/supabaseClient';
 import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HelloWorldApp = () => {
  const { selectedEpisodeId, setSelectedEpisodeId } = useEpisode();
  const { selectId, setselectid } = useID();
  const navigation = useNavigation();
  const { handleClose } = useClose();
  const { clearEpisodeHistory } = useEpisodeHistory();
  const [episode2, setEpisodes2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [episodeHistory, setEpisodeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
const [displayOrder, setDisplayOrder] = useState([]);

  // Fetch episode details based on selectId
  const fetchEpisode2 = async () => {
    if (!selectId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://juanito66.vercel.app/anime/gogoanime/info/${selectId}`);
      setEpisodes2(response.data);
    } catch (error) {
      console.error('Error fetching episode details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode2();
  }, [selectId]);

  const saveEpisodeToDatabase = async (episode) => {
    try {
      if (!user) {
        console.error('No user is authenticated.');
        return;
      }

      const exists = episodeHistory.some(
        (ep) => ep.episode_id === episode.id || ep.id === episode.id
      );

      if (!exists) {
        const { data, error } = await supabase
          .from('episode_history')
          .insert([{
            user_id: user.id,
            episode_id: episode.id,
            title: episode.title,
            series_id: episode.seriesId,
            image_url: episode.image,
          }]);

        if (error) {
          console.error('Error adding episode to playlist:', error);
          return;
        }

        setEpisodeHistory((prev) => [...prev, { ...episode, user_id: user.id }]);
      }
    } catch (error) {
      console.error('Unexpected error while saving episode:', error);
    }
  };

  useEffect(() => {
    const handleAddEpisode = async () => {
      if (episode2 && selectedEpisodeId && user) {
        const newEpisode = {
          id: selectedEpisodeId,
          title: episode2?.title,
          seriesId: episode2?.id,
          image: episode2?.image,
        };
        setEpisodes2(null);
        await saveEpisodeToDatabase(newEpisode);
      }
    };
    handleAddEpisode();
  }, [selectedEpisodeId, episode2, user]);

  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return user;
  };

  const fetchEpisodeHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('episode_history')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user episode history:', error);
        return;
      }

      const uniqueEpisodeHistory = Array.from(
        new Map(data.map((ep) => [ep.episode_id, ep])).values()
      );

      setEpisodeHistory(uniqueEpisodeHistory);
    } catch (error) {
      console.error('Database error while fetching user episode history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchEpisodeHistory(currentUser.id);
      }
    };
    initializeUser();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearEpisodeHistory();
        setEpisodeHistory([]);
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        initializeUser();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const clearData2 = async () => {
    if (!user) {
      console.error('User is not authenticated. Cannot clear data.');
      return;
    }

    try {
      const { error } = await supabase
        .from('episode_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing playlist from Supabase:', error);
      } else {
        setEpisodeHistory([]);
      }
    } catch (error) {
      console.error('Database error while clearing playlist:', error);
    }
  };


   const deleteEpisodeFromHistory = async (episodeId) => {
    if (!user) {
      console.error('No user authenticated. Cannot delete episode.');
      return;
    }

    try {
      const { error } = await supabase
        .from('episode_history')
        .delete()
        .eq('user_id', user.id)
        .eq('episode_id', episodeId);

      if (error) {
        console.error('Error deleting episode from history:', error);
        return;
      }

      setEpisodeHistory((prev) =>
        prev.filter((episode) => episode.episode_id !== episodeId)
      );

      Alert.alert('Success', 'Deleted from History');
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
    } finally {
      setModalVisible(false); // Close the modal after deletion
    }
  };

  const formatTitle2 = (id) => {
    const match = id.match(/episode-\d+/i);
    return match ? match[0].replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  };
 
  useEffect(() => {
  if (episodeHistory.length > 0) {
    setDisplayOrder(episodeHistory.slice().reverse());
  }
}, [episodeHistory]);


const moveEpisodeToTop = (episode) => {
  setDisplayOrder((prevOrder) => {
    const newOrder = [episode, ...prevOrder.filter((ep) => ep.episode_id !== episode.episode_id)];
    return newOrder;
  });
};


  return (
    <View style={styles.container}>
      <View style={styles.paginationContainer}>
        <Text style={styles.title}>My History</Text>
        <TouchableOpacity onPress={clearData2}>
          <Text style={[styles.title, { width: 130 }]} numberOfLines={1} ellipsizeMode="tail">
            Clear Data
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyAccount', { initialTab: 'History' })}>
          <Text style={styles.title}>View All</Text>
        </TouchableOpacity>
      </View>
 <View style={styles.container}>
      {loadingHistory ? (
        <Text style={styles.text}>Loading history...</Text>
      ) : episodeHistory.length > 0 ? (
        <View>
        
{displayOrder.map((episode, index) => (
  <TouchableOpacity
    key={episode.episode_id || episode.id} // Make sure `key` is unique
    onPress={async () => {
      try {
        await handleClose(); // Close any modals or dialogs if open
        const selectedEpisodeId = episode.episode_id || episode.id;
        const selectId = episode.series_id || episode.seriesId;

        // Move the episode to the top of the list
        moveEpisodeToTop(episode); // This should correctly update the order

        // Update selected episode state and navigate
        setSelectedEpisodeId(selectedEpisodeId);
        setselectid(selectId) ;
        navigation.navigate('Watch', {
          episodeid: selectedEpisodeId,
          id: selectId,
          selectedItemId2: selectedEpisodeId,
        });
      } catch (error) {
        console.error('Error closing and navigating:', error);
      }
    }}
  >
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: episode.image_url || episode.image }}
        style={styles.episodeImage}
      />
      <View style={styles.episodeDetailsContainer}>
        <View style={styles.episodeTextContainer}>
          <Text style={[styles.title]}>
            {episode.title}
          </Text>
          <Text style={styles.text}>
            {formatTitle2(episode.episode_id || episode.id)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedEpisode(episode);
            setModalVisible(true);
          }}
        >
          <Ionicons name="ellipsis-vertical-outline" size={20} color="#FFF" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
))}
        </View>
      ) : (
        <Text style={styles.text}>No previous episodes selected.</Text>
      )}
       <Modal
   animationType="fade" transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Delete this episode from history?</Text>
               <Text style={styles.modalMessage}>Are you sure you want to delete this episode?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={() => deleteEpisodeFromHistory(selectedEpisode?.episode_id)}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scrollContainer: {
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
   itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
  },
   episodeDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
    icon: {
    marginLeft: 10,
  },
  episodeTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  episodeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   episodeImage: {
    width: 100,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 8,
    marginRight: 10,
  },
   modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
    modalMessage: {
    color: '#FFF',
    marginBottom: 20,
  },
 modalContainer: {
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalText: {
     fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  modalCancelButton: {
     backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalDeleteButton: {
   backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center', 
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default HelloWorldApp;
