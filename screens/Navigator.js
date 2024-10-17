import React, { useState, useContext } from 'react';
import { View, Image, TextInput } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
 import Home from './Home';
 import Search from './Search';
import MyAccount from './MyAccount';
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
