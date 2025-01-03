import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import CheckBox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/supabaseClient'; // Import the Supabase client
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import { useMyUsername } from '../context/UsernameProvider';
import { useProfile } from '../context/ImageProvider';

const SignUpScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
    const { setUsername1 } = useMyUsername();  // Get the setter function from the context
    const { setProfileImage } = useProfile();  // Get the setter function from the context

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSelected, setSelection] = useState(false);
  const [image, setImage] = useState(null);
  const navigation = useNavigation(); // Get the navigation object

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

const uploadImageToSupabase = async (imageUri) => {
    try {
        const fileExt = imageUri.split('.').pop(); // Get the file extension
        const fileName = `${Date.now()}.${fileExt}`; // Create a unique filename
        const { data, error } = await supabase.storage
            .from('profile-images') // Replace with your bucket name
            .upload(`profile_images/${fileName}`, {
                uri: imageUri,
                type: 'image/jpeg', // Adjust MIME type based on your image
                name: fileName,
            }, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }

        console.log('Upload successful, data:', data);

        // Get the public URL
        const { data: publicUrlData, error: urlError } = supabase.storage
            .from('profile-images')
            .getPublicUrl(`profile_images/${fileName}`);

        if (urlError) {
            console.error('Error generating public URL:', urlError);
            throw urlError;
        }

        console.log('Public URL:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl; // Return the public URL
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Image upload failed');
    }
};



const handleSignUp = async () => {
    if (password !== confirmPassword) {
        Alert.alert('Passwords do not match');
        return;
    }

    try {
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error('Sign-up error:', error);
            throw error;
        }

        let profileImageUrl = null;
        if (image) {
            console.log('Uploading image...');
            profileImageUrl = await uploadImageToSupabase(image);
            console.log('Image uploaded successfully:', profileImageUrl);
        }

        const { data, insertError } = await supabase.from('profile').insert([
            {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                profile_image: profileImageUrl,
            },
        ]);

        if (insertError) {
            console.error('Insert Error:', insertError);
            throw insertError;
        }

        setUsername1(username);
        setProfileImage(profileImageUrl); // Use the URL, not the local URI

        Alert.alert('Sign-up successful!');
        navigation.navigate('Home');
    } catch (error) {
        console.error('Error during sign-up:', error);
        Alert.alert('Sign-up failed', error.message);
    }
};




  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      
      <TouchableOpacity onPress={pickImage}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Tap to upload picture</Text>
          )}
        </View>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#999"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.checkboxContainer}>
        <CheckBox value={isSelected} onValueChange={setSelection} />
        <Text style={styles.checkboxLabel}>I agree with privacy and policy</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Already have an account? <Text style={styles.signInText}>Sign In</Text></Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#262626',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#DB202C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 10,
    color: '#fff',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  signInText: {
    color: '#DB202C',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
        width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    color: '#999',
  },
});

export default SignUpScreen;
