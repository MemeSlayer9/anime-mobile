import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import MyPlaylist2 from '../MyAccount2/MyPlaylist2';
import History2 from '../MyAccount2/History2';
import { useMyUsername } from '../context/UsernameProvider';
import { useProfile } from '../context/ImageProvider';
import { supabase } from '../supabase/supabaseClient';

const HelloWorldApp = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [loading, setLoading] = useState(true);
  const { username1, setUsername1 } = useMyUsername(); // Username context
  const { profile, setProfileImage } = useProfile(); // Profile image context

  // Load session data from AsyncStorage when app starts
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username1');
        const storedProfileImage = await AsyncStorage.getItem('profile');

        if (storedUsername) {
          setUsername1(storedUsername);
        } else {
          console.warn('No username found in AsyncStorage.');
        }

        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        } else {
          console.warn('No profile image found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error loading session from AsyncStorage:', error);
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    loadSession();
  }, []);

  // Save session data to AsyncStorage whenever `username1` or `profile` changes
  useEffect(() => {
    const saveSessionToAsyncStorage = async () => {
      try {
        if (username1) {
          await AsyncStorage.setItem('username1', username1);
        }
        if (profile) {
          await AsyncStorage.setItem('profile', profile);
        }
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
      }
    };

    saveSessionToAsyncStorage();
  }, [username1, profile]);

  // Clear session data from AsyncStorage and context
  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('username1');
      await AsyncStorage.removeItem('profile');
      setUsername1(null);
      setProfileImage(null);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear local session data
      await clearSession();

      // Navigate to Login screen
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout failed', error.message);
    }
  };

  const renderContent = () => (
    <>
      <History2 />
      <MyPlaylist2 />
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {username1 ? (
          <View style={styles.userSection}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              {profile ? (
                <Image source={{ uri: profile }} style={styles.image} />
              ) : (
                <Text style={styles.login}>No Profile Image</Text>
              )}
    <Text style={styles.username}>{username1}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.login}>Login</Text>
          </TouchableOpacity>
        )}
        
      </View>
 
 
   <View style={styles.footer}>
  <TouchableOpacity 
    style={styles.footerButton} 
    onPress={() => navigation.navigate('MyAccount', { initialTab: 'MyPlaylist' })}
  >
    <Text style={styles.footerButtonText}>My Playlist</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.footerButton} 
    onPress={() => navigation.navigate('MyAccount', { initialTab: 'History' })}
  >
    <Text style={styles.footerButtonText}>History</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={styles.footerButton} 
    onPress={() => navigation.navigate('MyAccount', { initialTab: 'Downloads' })}
  >
    <Text style={styles.footerButtonText}>Downloads</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.footerButton} onPress={() => alert('Help & Feedback')}>
    <Text style={styles.footerButtonText}>Help & Feedback</Text>
  </TouchableOpacity>
</View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    paddingTop: 50, // Add padding to the top for header space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161616',
  },
  loadingText: {
    color: '#BBBBBB',
    fontSize: 16,
    fontWeight: 'bold', // Added bold for emphasis
  },
 
  
  header: {
     padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Subtle separator
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#BBBBBB', // Adding border around the image
  },
  username: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Centers the username text
  },
  login: {
    color: '#BBBBBB',
    fontSize: 16,
  },
  logout: {
    fontSize: 18,
    color: '#FF4C4C', // Slightly brighter red for logout
    fontWeight: '600', // Make it bold
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: '#333', // Subtle separator between footer and content
  },
  footerButton: {
    backgroundColor: '#444', // Subtle background for footer buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 8, // Adds spacing between buttons
    alignItems: 'center', // Center text within button
  },
  footerButtonText: {
    color: '#FFF', // Text color for the button
    fontSize: 16,
    fontWeight: '500', // Slightly bold text
  },
  userSection: {
    alignItems: 'center', // Center profile elements
    justifyContent: 'center',
  },
  footerButton: {
    backgroundColor: '#444', // Subtle background for footer buttons
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  footerButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500', // Slightly bolder text for footer button
  },
  headerTitle: {
    color: '#FFF', // Make the header title stand out
    fontSize: 20,
    fontWeight: 'bold',
  },
});


export default HelloWorldApp;
