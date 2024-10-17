import React, {  useContext, useEffect } from 'react'
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeTabs from './HomeTabs'; // Import HomeTabs
import Hello from './Hello'; // Import WatchStack
import Watch from './Watch'; // Import Watch component
import EpisodeDetail from './EpisodeDetail';
import SearchHeader from './SearchHeader'; // Import the SearchHeader component
 import * as NavigationBar from 'expo-navigation-bar';

const Stack = createStackNavigator();
  
 
export default function MainStack() {
  useEffect(() => {
    // Set the Android navigation bar to transparent
    NavigationBar.setBackgroundColorAsync('#161616');
    // Optionally set the bar to auto-hide with gestures
    NavigationBar.setVisibilityAsync('visible');
  }, []);
  return (
    <> 
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

    <Stack.Navigator
       screenOptions={{
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
       <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }} // Hide header for tabs
      />
       <Stack.Screen name="EpisodeDetail" component={EpisodeDetail} />

       <Stack.Screen
        name="Watch"
        component={Watch}
        options={{ headerShown: false }} // Customize header if needed
      />
      <Stack.Screen name="Hello" component={Hello} />

    </Stack.Navigator>
      
    </>
  );
}
