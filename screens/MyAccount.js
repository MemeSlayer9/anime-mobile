import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute
 import MyPlaylist from '../MyAccount/MyPlaylist'; // Adjust path as needed
  import History from '../MyAccount/History'; // Adjust path as needed

const MyAccount = () => {
   const route = useRoute(); // Get the current route
  
  const [activeTab, setActiveTab] = useState('History'); // Default tab
  const [page, setPage] = useState(1); // Pagination state

  // Set the active tab from navigation parameters if provided
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const renderContent = () => {
    if (activeTab === 'MyPlaylist') {
      return <MyPlaylist page={page} />;
    } else if (activeTab === 'History') {
      return <History page={page} />;
     
    } else {
      return null; 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
         
          <TouchableOpacity
          style={[styles.tab, activeTab === 'MyPlaylist' && styles.activeTab]}
          onPress={() => setActiveTab('MyPlaylist')}
        >
          <Text style={[styles.tabText, activeTab === 'MyPlaylist' && styles.activeTabText]}>MyPlaylist</Text>
        </TouchableOpacity>
          <TouchableOpacity
          style={[styles.tab, activeTab === 'History' && styles.activeTab]}
          onPress={() => setActiveTab('History')}
        >
          <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
          
      </View>

      <ScrollView style={styles.contentContainer}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
            backgroundColor: '#161616',

  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#161616',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: '#BBBBBB',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
});

export default MyAccount;
