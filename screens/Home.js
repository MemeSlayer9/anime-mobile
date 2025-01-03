import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Popular from '../Home/Popular'; // Adjust path as needed
import Trending from '../Home/Trending'; // Adjust path as needed
import Trending2 from '../Home/Trending2'; // Adjust path as needed
import Recent from '../Home/Recent'; // Adjust path as needed
import { useNetInfo } from '@react-native-community/netinfo';

const Home = () => {
  const netInfo = useNetInfo();

  return (
    <ScrollView style={styles.container}>
      {!netInfo.isConnected ? (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      ) : (
        <>
          <Trending2 />
          <Recent />
          <Popular />
          <Trending />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Home;
