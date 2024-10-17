import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const MyAccount = ({ route }) => {
  const { ViewAllMyPlaylist } = route.params; // Get the passed playlist

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Playlist</Text>

      {ViewAllMyPlaylist && ViewAllMyPlaylist.length > 0 ? (
        <FlatList
          data={ViewAllMyPlaylist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No Playlist Available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemContainer: {
    marginVertical: 10,
  },
  itemTitle: {
    fontSize: 16,
  },
});

export default MyAccount;
