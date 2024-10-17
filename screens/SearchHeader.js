import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import logo from '../assets/logo1.png'; // Adjust the path to your logo

const SearchHeader = () => {
  const [isSearchActive, setIsSearchActive] = useState(false); // Manage search bar visibility
  const [searchText, setSearchText] = useState(''); // Manage search input text
  const navigation = useNavigation(); // Initialize navigation

  // Function to handle search
  const handleSearch = () => {
    if (searchText) {
      setIsSearchActive(false); // Close search bar
      navigation.navigate('Search', { query: searchText }); // Navigate to Search screen with query
    }
  };

  return (
    <View style={styles.container}>
      {isSearchActive ? (
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={true} // Automatically focus the input when search is active
          onSubmitEditing={handleSearch} // Trigger search on submit
        />
      ) : (
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      )}

      <TouchableOpacity onPress={() => setIsSearchActive(!isSearchActive)} style={styles.iconContainer}>
        <Ionicons
          name={isSearchActive ? 'close' : 'search'} // Toggle between search and close icon
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align elements in a row
    alignItems: 'center',
    justifyContent: 'space-between', // Logo on the left, icon on the right
    width: '100%',
   },
  logoContainer: {
     flex: 1,
     width: 100,
    
  },
  logo: {
    width: 120,
    height: 40,
  },
  searchInput: {
    flex: 1, // Use full available width
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    height: 40,
    fontSize: 16,
    borderRadius: 5,
  },
  iconContainer: {
    paddingLeft: 10, // Add space between the search bar and icon
  },
});

export default SearchHeader;
