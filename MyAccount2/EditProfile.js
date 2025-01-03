import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Import image picker
import { useMyUsername } from '../context/UsernameProvider';
import { useProfile } from '../context/ImageProvider'; // Import useProfile
import { supabase } from '../supabase/supabaseClient';

const EditProfile = ({ navigation }) => {
  const { username1, setUsername1 } = useMyUsername(); 
  const { profile, setProfileImage } = useProfile(); // Use setProfileImage to update profile image
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [localProfileImage, setLocalProfileImage] = useState(null); // Local state for profile image
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState(username1); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('username', username1)
          .single();

        if (error) throw error;

        setFirstName(data.first_name);
        setLastName(data.last_name);
        setEmail(data.email);
        setLocalProfileImage(data.profile_image);
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error fetching profile', error.message);
      }
    };

    fetchProfile();
  }, [username1]);

  // Function to handle selecting a new profile image
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const selectedImage = pickerResult.assets[0].uri;
      setLocalProfileImage(selectedImage); // Set local state
    }
  };

console.log('Local Profile Image:', localProfileImage);


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


const handleSave = async () => {
  try {
    let profileImageUrl = localProfileImage;

    if (localProfileImage && !localProfileImage.startsWith('http')) {
      console.log('Uploading image...');
      profileImageUrl = await uploadImageToSupabase(localProfileImage);
      console.log('Image uploaded successfully:', profileImageUrl);
    }

    const { error: profileError } = await supabase
      .from('profile')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        profile_image: profileImageUrl, // Use Supabase image URL
        username: newUsername,
      })
      .eq('username', username1);

    if (profileError) {
      throw profileError;
    }

    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) {
        throw passwordError;
      }
    }

    setUsername1(newUsername);
    setProfileImage(profileImageUrl); // Update global profile image

    Alert.alert('Profile updated successfully');
    navigation.goBack();
  } catch (error) {
    console.error('Error updating profile:', error);
    Alert.alert('Profile update failed', error.message);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={newUsername}
        onChangeText={setNewUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Profile Image Section */}
      {localProfileImage ? (
        <Image source={{ uri: localProfileImage }} style={styles.profileImage} />
      ) : (
        <Text>No profile image selected</Text>
      )}

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.changeImageText}>Change Profile Image</Text>
      </TouchableOpacity>

      <Button title="Save Profile" onPress={handleSave} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  changeImageText: {
    color: '#007BFF',
    marginBottom: 20,
  },
});

export default EditProfile;
