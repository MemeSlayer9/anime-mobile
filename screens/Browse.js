import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute
import Recent from '../List/Recent'; // Adjust path as needed
import Schedule from '../Browse/Schedule.js'; // Adjust path as needed
 import AnimeChart from '../Browse/AnimeChart'; // Adjust path as needed
 import Genres from '../Browse/Genres'; // Adjust path as needed

const List = () => {
   const route = useRoute(); // Get the current route
  
  const [activeTab, setActiveTab] = useState('Schedule'); // Default tab
  const [page, setPage] = useState(1); // Pagination state

  // Set the active tab from navigation parameters if provided
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const renderContent = () => {
    if (activeTab === 'Recent') {
      return <Recent page={page} />;
    } else if (activeTab === 'Schedule') {
      return <Schedule page={page} />;
    } else if (activeTab === 'AnimeChart') {
      return <AnimeChart page={page} />;
    } else if (activeTab === 'Genres') {
      return <Genres page={page} />;
    } else {
      return null; 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
         
          <TouchableOpacity
          style={[styles.tab, activeTab === 'Schedule' && styles.activeTab]}
          onPress={() => setActiveTab('Schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'Schedule' && styles.activeTabText]}>Schedule</Text>
        </TouchableOpacity>
          <TouchableOpacity
          style={[styles.tab, activeTab === 'AnimeChart' && styles.activeTab]}
          onPress={() => setActiveTab('AnimeChart')}
        >
          <Text style={[styles.tabText, activeTab === 'AnimeChart' && styles.activeTabText]}>AnimeChart</Text>
        </TouchableOpacity>
          <TouchableOpacity
          style={[styles.tab, activeTab === 'Genres' && styles.activeTab]}
          onPress={() => setActiveTab('Genres')}
        >
          <Text style={[styles.tabText, activeTab === 'Genres' && styles.activeTabText]}>Genres</Text>
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

export default List;
