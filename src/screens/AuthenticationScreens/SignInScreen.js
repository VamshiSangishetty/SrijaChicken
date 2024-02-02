import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Alert, ActivityIndicator } from 'react-native';
import Logo from '../../../assets/images/srijalogobg.png';
import CustomButton from '../../components/AuthenticationComponents/CustomButton';
import CustomInput from '../../components/AuthenticationComponents/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Auth } from 'aws-amplify';
import * as Location from 'expo-location';

function SignInScreen(props) {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [checkingProximity, setCheckingProximity] = useState(true);
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [showSignInScreen, setShowSignInScreen] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [available,setAvailable]=useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const storeLatitude = 17.5534228;
  const storeLongitude = 78.4935845;

  useEffect(() => {
    const checkProximity = async () => {
      setCheckingProximity(true); // Set loading state to true

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCheckingProximity(false); // Set loading state to false
          setAvailable(false);
          Alert.alert(
            'Location Services Required',
            'Please enable location services for this app in your device settings.',
            [
              {
                text: 'OK',
                onPress: () => {
                    setShowSignInScreen(true);
                }
              },
            ],
          );
          return;
        }

        const location = await Location.getLastKnownPositionAsync();
        setUserLocation(location); // Set initial user location

        // Subscribe to location updates
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Minimum distance (in meters) for a location update
          },
          (location) => {
            setUserLocation(location); // Update user location on each update
          }
        );
      } catch (error) {
        console.warn('Error checking proximity:', error);
        setShowSignInScreen(false);
      } finally {
        setCheckingProximity(false); // Set loading state to false
      }
    };

    checkProximity();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const userLatitude = userLocation.coords.latitude;
      const userLongitude = userLocation.coords.longitude;
      const distance = calculateDistance(userLatitude, userLongitude, storeLatitude, storeLongitude);

      if (distance <= 50) {
        setShowSignInScreen(true);
        setAvailable(true);
        // Alert.alert("Delivery is available in your area!"," Please sign in and place your order.");
      } else {
        setShowSignInScreen(false);
        setAvailable(false)
      }
    }
  }, [userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const onSigInPressed = async (data) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
       await Auth.signIn(data.email, data.password);
      // console.log(response);
    } catch (e) {
      Alert.alert('Oops', e.message);
    }
    setLoading(false);
  };

  const onForgetPassPressed = () => {
    navigation.navigate('ForgetPassword');
  };

  const onSignUpPressed = () => {
    navigation.navigate('SignUp');
  };

  if (checkingProximity) {
    // Render a loading indicator while checking proximity
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.messageText}>We're checking if our services are available in your area. This may take a moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image source={Logo} style={[styles.logo, { height: height * 0.3 }]} />
      {available ? <Text style={{color:"green"}}>Delivery is available in your area! Please sign in</Text> : null}
      {showSignInScreen ? (
        <>
          <CustomInput
            name="email"
            placeholder="Enter Email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: { value: EMAIL_REGEX, message: 'Email is invalid' },
            }}
          />
          <CustomInput
            name="password"
            placeholder="Enter Password"
            secureTextEntry
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password should be minimum of 8 characters long',
              },
            }}
            control={control}
          />
          <CustomButton onPress={handleSubmit(onSigInPressed)} text={loading ? 'Loading...' : 'Sign In'} />
          <CustomButton onPress={onForgetPassPressed} text=" Forgot Password?" type="TERTIARY" />
          <CustomButton onPress={onSignUpPressed} text=" Don't have an account? Create One" type="TERTIARY" />
        </>
      ) : (<>
      <Text style={styles.messageText}>We are coming soon to your Area! Please stay tuned.</Text>
      <CustomButton text="Take a tour of our app" onPress={() => setShowSignInScreen(true)} />
      </>
      )}
    </View>
  );
}

export default SignInScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FBFC',
  },
  loadingContainer: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFC',
  },
  logo: {
    width: '100%',
    maxHeight: 400,
    maxWidth: 400,
  },
  messageText: {
    fontSize: 18,
    marginTop: 50,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom:50
  },
});
