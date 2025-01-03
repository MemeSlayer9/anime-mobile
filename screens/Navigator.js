import React, { useState, useContext } from 'react';
import { View, Image, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
 import Home from './Home';
 import Search from './Search';
import MyAccount from './MyAccount';
import MyAccount2 from './MyAccount2';
import Login from '../MyAccount2/Login';
import Register from '../MyAccount2/Register';
import EditProfile from '../MyAccount2/EditProfile';
import { AuthContext } from '../context/AuthContext';
import { useMyUsername } from '../context/UsernameProvider'; // Import the username context

import ViewAllMyPlaylist from './ViewAllMyPlaylist';

 import List from './List';
import Browse from './Browse';

 import { StyleSheet, TouchableOpacity } from 'react-native';
import { FullscreenContext } from './FullscreenContext'; // Import FullscreenContext
import { useNavigation } from '@react-navigation/native'; // Import navigation
import SearchHeader from './SearchHeader'; // Import the SearchHeader component

const Stack = createStackNavigator();
 
export function HomeStack() {
  const [isSearchActive, setIsSearchActive] = useState(false); // State to manage search bar visibility
  const [searchText, setSearchText] = useState(''); // State to manage search input text
  const { isFullscreen } = useContext(FullscreenContext); // Get fullscreen state from context
    const navigation = useNavigation(); // Initialize navigation

  // Function to handle search
  const handleSearch = () => {
    if (searchText) {
      setIsSearchActive(false); // Close search bar
      navigation.navigate('Search', { query: searchText }); // Navigate to Search screen with query
    }
  };
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: !isFullscreen, // Hide the header when fullscreen is active
        headerStyle: {
          backgroundColor: '#161616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle:  () => <SearchHeader /> // Use SearchHeader component for the title
      }}
    >
      <Stack.Screen name="Home" component={Home} />
             <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="List" component={List} />

     </Stack.Navigator>
  );
}






export function BrowseList() {
 
  const { isFullscreen } = useContext(FullscreenContext); // Get fullscreen state from context

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: !isFullscreen, // Hide the header when fullscreen is active
        headerStyle: {
          backgroundColor: '#161616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => <SearchHeader /> // Use SearchHeader component for the title
      }}
    >
    
      <Stack.Screen name="Browse" component={Browse} />
             <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="List" component={List} />
      <Stack.Screen name="Home" component={Home} />
 

    
    </Stack.Navigator>
  );
}

export function ListStack() {
   
  const { isFullscreen } = useContext(FullscreenContext); // Get fullscreen state from context

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: !isFullscreen, // Hide the header when fullscreen is active
        headerStyle: {
          backgroundColor: '#161616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => <SearchHeader /> // Use SearchHeader component for the title
      }}
    >
      <Stack.Screen name="List" component={List} />
                    <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Browse" component={Browse} />
      <Stack.Screen name="Home" component={Home} />
 
    </Stack.Navigator>
  );  
}


export function AccountStack() {
   
  const { isFullscreen } = useContext(FullscreenContext); // Get fullscreen state from context

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: !isFullscreen, // Hide the header when fullscreen is active
        headerStyle: {
          backgroundColor: '#161616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => <SearchHeader /> // Use SearchHeader component for the title
      }}
    >
      <Stack.Screen name="MyAccount" component={MyAccount} />
   
 
    </Stack.Navigator>
  );  
}
 


export function MyAccountStack2() {
  // Get fullscreen and login state from context
  const { isFullscreen } = useContext(FullscreenContext); 
  const { isLoggedIn } = useContext(AuthContext);
  const { username1, setUsername1 } = useMyUsername(); // Access the username from context

  console.log('User logged in:', isLoggedIn); // Debugging to verify state
  console.log('Current username:', username1); // Debugging the current username

  return (
   <Stack.Navigator
      initialRouteName={isLoggedIn ? 'MyAccount2' : 'Login'} // Set initial route based on login status
      screenOptions={{
        headerShown: !isFullscreen,
        headerStyle: {
          backgroundColor: '#161616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: () => <SearchHeader />, // Adjust according to your app's header component
      }}
    >
      {/* Screen for logged-in users */}
      <Stack.Screen name="MyAccount2" component={MyAccount2} />

      {/* Screens for not logged-in users */}
      {!isLoggedIn && (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}

      {/* Screens for logged-in users */}
      {isLoggedIn && (
        <>
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="MyAccount" component={MyAccount} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  logo: {
    width: '100%',
    height: 40,
  },
   
   searchInput: {
      
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    height: 40,
    width: 320, // Ensures full width
    textAlign: 'left', // Centers the placeholder text within the input
    fontSize: 16, // Adjust the font size if needed
   },
});
