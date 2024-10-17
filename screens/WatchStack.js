import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Watch from './Watch'; // Import Watch component
 
const Stack = createStackNavigator();

export default function WatchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#161616' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Watch"
        component={Watch}
        options={{ title: 'Watch Video' }}
      />
 
    </Stack.Navigator>
  );
}
