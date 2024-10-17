import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Popular from '../Home/Popular'; // Adjust path as needed
import Trending from '../Home/Trending'; // Adjust path as needed
import Trending2 from '../Home/Trending2'; // Adjust path as needed
import Recent from '../Home/Recent'; // Adjust path as needed

const Home = () => {
  return (
    <ScrollView style={styles.container}>
      <Trending2 />
      <Recent />
      <Popular />
      <Trending />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
});

export default Home;
