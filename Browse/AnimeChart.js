import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Schedule = () => {
  const [anime, setAnime] = useState([]);
  const [otherAnime, setOtherAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Default to current day
  const [countdown, setCountdown] = useState({});
  const navigation = useNavigation();
  const [format, setFormat] = useState('TV');
  const [year, setYear] = useState('2024');
  const [season, setSeason] = useState('FALL');
  const [page, setPage] = useState(1);
  const [showOtherAnime, setShowOtherAnime] = useState(false); // State to manage visibility of other anime
    const Format  = ["TV", "TV_SHORT", "OVA", "ONA", "MOVIE", "SPECIAL", ];
 
   const Seasons = ['Winter', 'Spring', 'Summer', 'Fall']; // List of seasons
   const startYear = 1999;

   const currentYear = new Date().getFullYear(); // Get the current year

  const Years = [];
for (let year = startYear; year <= currentYear; year++) {
  Years.push(year.toString());
}
  const handleSeasonChange = (selectedValue) => {
    setSeason(selectedValue);
    setShowOtherAnime(false); // Hide the other anime content when the season changes
  };

  const handleFormatChange = (selectedValue) => {
  setFormat(selectedValue); // Set the selected format
  setShowOtherAnime(false); // Hide other anime content when format changes
};

  const handleYearChange = (selectedValue) => {
    setYear(selectedValue);
      setShowOtherAnime(false); // Hide the other anime content when dropdown value changes

  };
     const handleTBAButtonClick = () => {
    fetchData();
    setShowOtherAnime(true); // Show the other anime content when button is clicked
  };
  
  

  

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch anime data for the selected season and year
      const { data: animeData } = await axios.get(
        `https://juanito66.vercel.app/meta/anilist/advanced-search?season=${season}&year=${year}&page=${page}&perPage=100&format=${format}`
      );

      // Fetch other anime data that is not yet released
      const { data: otherData } = await axios.get(
        `https://juanito66.vercel.app/meta/anilist/advanced-search?status=NOT_YET_RELEASED&page=${page}&format=${format}`
      );

      setAnime(animeData.results || []); // Ensure animeData is an array
      setOtherAnime(otherData.results || []); // Ensure otherData is an array

      setLoading(false);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, format, year, season]);

  const renderItem = ({ item }) => {
  
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EpisodeDetail', { id: item.id })}
          style={styles.episodeContainer}
        >
            <Text style={styles.title}>{item.title.userPreferred}</Text>
              <Text style={styles.genres}>Genres: {item.genres.join(", ")}</Text>
  {item.currentEpisode !== null && (
              <Text style={styles.status}>Current Episodes: {item.currentEpisode}</Text>
            )}
        <View style={styles.flexContainer}>
      {/* Image and Status displayed side by side */}
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
            <Text style={styles.status}>{item.status}</Text>
                        <Text style={styles.status}>{item.type}</Text>
                                                <Text style={styles.status}>Ratings: {item.rating}%</Text>

                        <Text style={styles.status}>Total Episodes: {item.totalEpisodes}</Text>

          <View style={styles.descriptionWrapper}>
              <ScrollView>
                <Text style={styles.description}>{item.description}</Text>
              </ScrollView>
            </View>
          </View>

    </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!anime.length && !otherAnime.length) {
    return <Text>No data available</Text>;
  }

  return (
    
   <View style={styles.container}>
  {/* Dropdown to select the season */}
    
     <View style={styles.pickerWrapper}>
 
    <View style={styles.pickerContainer}>
    
        <Picker
          selectedValue={season}
          onValueChange={handleSeasonChange}
          style={styles.picker}
        >
          {Seasons.map((seasonOption, index) => (
            <Picker.Item key={index} label={seasonOption} value={seasonOption.toUpperCase()} />
          ))}
        </Picker>
      </View>

      {/* Second dropdown for a different purpose */}
       <View style={styles.pickerContainer}>
        <Picker
          selectedValue={format}
          onValueChange={handleFormatChange}
          style={styles.picker}
        >
          {Format.map((formatOption, index) => (
            <Picker.Item key={index} label={formatOption} value={formatOption.toUpperCase()} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={year}
          onValueChange={handleYearChange}
          style={styles.picker}
        >
          {Years.map((YearOption, index) => (
            <Picker.Item key={index} label={YearOption} value={YearOption} />
          ))}
        </Picker>
      </View>
       <TouchableOpacity onPress={handleTBAButtonClick} style={styles.tbaButton}>
          <Text style={styles.buttonText}>{showOtherAnime }TBA</Text>
</TouchableOpacity>
     </View>
 
      {/* Anime list for the selected day */}
      {!showOtherAnime ? (
         <View>
                   <Text style={styles.otherAnimeHeader}>Results</Text>
        <FlatList
          data={anime}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
        </View>
      ) : (
        <View>
          <Text style={styles.otherAnimeHeader}>Not Yet Released</Text>
          <FlatList
            data={otherAnime}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </View>
      )}
      
          
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
 
  episodeContainer: {
     borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 10,
   },
  image: {
    width: 200,
    height: 300,
    marginRight: 20,
    borderRadius: 8,
  },
   flexContainer: {
    flexDirection: 'row', // Image and status in a row
    alignItems: 'center',
    marginTop: 10, // Space between title and flex container
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
        textAlign: 'center',

  },
   genres: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
        textAlign: 'center',

  },
 status: {
    fontSize: 14,
    color: '#fff',
            textAlign: 'center',

   },
  otherAnimeHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
   },
    textContainer: {
    flexDirection: 'column', // Status and description in a column
      maxWidth: 200, // Limit the width of the text content
  },
    descriptionWrapper: {
    height: 200, // Limit the height of the description to 200
    overflow: 'hidden', // Prevent the text from flowing outside the container
  },
    description: {
    fontSize: 15,
    color: '#fff',
    maxWidth: 150, // Limit the width of the description
   },
      dropdownContainer: {
    padding: 10,
   },
  
  pickerWrapper: {
   flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
   },
  pickerContainer: {
    flex: 1,  // Allow pickers to adjust to available space
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    },
  picker: {
    flex: 1, // Make each picker take up equal space
    color: 'white',
    marginRight: 10, // Add some space between the dropdowns
     width: '100%', // Ensure the picker takes full width of its container

     },
     tbaButton: {
     padding: 10, // Padding to make the button clickable
    borderRadius: 10,
        marginHorizontal: 3,
    borderColor: '#ccc',
    borderWidth: 1,

     alignItems: 'center', // Center the text inside the button
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Schedule;
