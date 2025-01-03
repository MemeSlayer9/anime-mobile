import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Schedule = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Default to current day
  const [countdown, setCountdown] = useState({});
  const navigation = useNavigation();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchData = async () => {
    try {
      let allResults = [];

      for (let page = 1; page <= 6; page++) {
        const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/airing-schedule?page=${page}`);
        const data = response.data.results;
        allResults = [...allResults, ...data];
      }

      setAnime(allResults);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anime:', error);
      setLoading(false);
    }
  };

  // Countdown logic for airing time
  const calculateCountdown = (airingAt) => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeDifference = airingAt - currentTime;

    if (timeDifference <= 0) {
      return "Airing now";
    } else {
      const days = Math.floor(timeDifference / (60 * 60 * 24));
      const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
      const seconds = Math.floor(timeDifference % 60);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  };

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdown = anime.reduce((acc, item) => {
        acc[item.id] = calculateCountdown(item.airingAt);
        return acc;
      }, {});
      setCountdown(newCountdown);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000); // Update countdown every second

    return () => clearInterval(timer);
  }, [anime]);

  useEffect(() => {
    fetchData();
  }, []);

  // Filter anime by the selected day
  const filteredAnime = anime.filter((item) => new Date(item.airingAt * 1000).getDay() === selectedDay);

  const renderItem = ({ item }) => {
    const airingDay = new Date(item.airingAt * 1000).getDay(); // Calculate airing day
    const airingDayName = daysOfWeek[airingDay]; // Convert to day name
    const countdownText = countdown[item.id]; // Get countdown for this item

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EpisodeDetail', { id: item.id })}
          style={styles.episodeContainer}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title.userPreferred}</Text>
            {/* Display countdown */}
            <Text style={styles.countdownText}>{countdownText}</Text>
            {/* Display airing day */}
            <Text style={styles.airingDay}>Airs on: {airingDayName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!anime.length) {
    return <Text>No data available</Text>;
  }

  return (
    <View  style={styles.container}>
      {/* Days of the week tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDay(index)}
              style={[styles.tabButton, selectedDay === index && styles.activeTab]}
            >
              <Text style={styles.tabText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Anime list for the selected day */}
      <FlatList
        data={filteredAnime}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#161616',
  },
  tabButton: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 100,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownText: {
    color: 'yellow', // Optional: style for the countdown text
  },
  airingDay: {
    color: 'gray', // Optional: style for the airing day text
  },
});

export default Schedule;
