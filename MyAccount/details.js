import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const MovieDetails = () => {
  const [activeTab, setActiveTab] = useState('Trailers'); // Active tab state

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <ImageBackground
        source={{ uri: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-bbBWj4pEFseh.jpg' }} // Replace with your image URL
        style={styles.imageBackground}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent', 'rgba(0, 0, 0, 1)']}
          style={styles.gradient}
        />
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Movie Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>Avatar: The Way of Water</Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>2022</Text>
          <Text style={styles.metadataText}>•</Text>
          <Text style={styles.metadataText}>Action</Text>
          <Text style={styles.metadataText}>•</Text>
          <Text style={styles.metadataText}>USA</Text>
        </View>
        <TouchableOpacity style={styles.watchButton}>
          <Text style={styles.watchButtonText}>Watch Now</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        {['Trailers', 'More Like This', 'About'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conditional Rendering for Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'Trailers' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Trailers</Text>
            <Text style={styles.sectionContent}>
              Trailers for this movie will go here.
            </Text>
          </View>
        )}

        {activeTab === 'More Like This' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>More Like This</Text>
            <Text style={styles.sectionContent}>
              Similar movies will go here.
            </Text>
          </View>
        )}

        {activeTab === 'About' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionContent}>
              Jake Sully lives with his newfound family formed on the extrasolar
              moon Pandora. Once a familiar threat returns to finish what was
              previously started, Jake must work with Neytiri and the army of
              the Na'vi race to protect their home.
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Audio Track:</Text>
              <Text style={styles.infoText}>English, Spanish</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Subtitles:</Text>
              <Text style={styles.infoText}>English, Spanish</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Country:</Text>
              <Text style={styles.infoText}>United States</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Year:</Text>
              <Text style={styles.infoText}>2022</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageBackground: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
metadata: {
  flexDirection: 'row', // Horizontal layout
  justifyContent: 'center', // Center items horizontally
  alignItems: 'center', // Center items vertically
  marginVertical: 10, // Add spacing around the section
},

  metadataText: {
    color: '#aaa',
    marginHorizontal: 5,
  },
  watchButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  sectionContent: {
    color: '#aaa',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoTitle: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  infoText: {
    color: '#fff',
  },
});

export default MovieDetails;
