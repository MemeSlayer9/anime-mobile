import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CheckBox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../supabase/supabaseClient';
import { useMyUsername } from '../context/UsernameProvider'; // Context for managing username
import { useProfile } from '../context/ImageProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');  // Define email state
  const [password, setPassword] = useState('');  // Define password state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { setUsername1 } = useMyUsername(); // Access the setUsername1 function from context
  const {  setProfileImage } = useProfile();

    useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      const storedEmail = await AsyncStorage.getItem('@user_email');
      if (storedEmail) {
        // If email is found in AsyncStorage, navigate directly to Home
        navigation.navigate('Home');
      }
    };

    checkLoggedIn();
  }, [navigation]);


  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('username, profile_image')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('Error fetching username:', profileError);
        Alert.alert('Error', 'Could not fetch profile.');
        return;
      }

      if (!profileData || !profileData.username) {
        Alert.alert('Error', 'Username not found.');
        return;
      }

      const username = profileData.username;
      const profile_image = profileData.profile_image;

      // Set the context state for username and profile image
      setUsername1(username);
      setProfileImage(profile_image);

      // Store email in AsyncStorage if "Remember Me" is checked
      if (rememberMe) {
        await AsyncStorage.setItem('@user_email', email);
      }

      Alert.alert('Login Successful', `Welcome, ${username}`);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('An error occurred', error.message);
    }
  };



  return (
    <View style={styles.container}>
      {/* Login form UI */}
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#BBBBBB"
        value={email}  // Bind email state
        onChangeText={setEmail}  // Update email state
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.yawa}
          placeholder="Password"
          placeholderTextColor="#BBBBBB"
          secureTextEntry={!showPassword}
          value={password}  // Bind password state
          onChangeText={setPassword}  // Update password state
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {/* Additional options like Remember Me */}
      <View style={styles.optionsContainer}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#BB2B4A' : undefined}
          />
          <Text style={styles.rememberMeText}>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPasswordText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* Login button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log in</Text>
      </TouchableOpacity>

      {/* Social login */}
      <Text style={styles.orSignInText}>Or Sign in with</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="facebook" size={30} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="google" size={30} color="#DB4437" />
        </TouchableOpacity>
      </View>

      {/* Navigation to registration */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 15,
    borderColor: '#DB202C',
    borderWidth: 1,
  },
  yawa: {
    color: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 10,
    padding: 15,
    borderColor: '#DB202C',
    borderWidth: 1,
  },
  showPasswordText: {
    color: '#DB202C',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#BBBBBB',
    marginLeft: 8,
  },
  forgotPasswordText: {
    color: '#DB202C',
  },
  loginButton: {
    backgroundColor: '#DB202C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orSignInText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: '#262626',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBBBBB',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#DB202C',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#DB202C',
  },
});

export default LoginScreen;
