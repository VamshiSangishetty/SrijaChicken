import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import ButtonText from '../../components/ButtonText/ButtonText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuthContext } from '../../contexts/AuthContext';
import { Auth, DataStore } from 'aws-amplify';
import { Customer } from '../../models';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

function AddressScreen(props) {
  const { sub, setDbUser, dbUser } = useAuthContext();
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(true); // New state for loading indicator

  const [name, setName] = useState(dbUser?.name || '');
  const [phoneNumber, setPhonenumber] = useState(dbUser?.phoneNumber || '');
  const [flatNo, setFlatNo] = useState(dbUser?.flatNo || '');
  const [street, setStreet] = useState(dbUser?.street || '');
  const [landmark, setLandmark] = useState(dbUser?.landmark || '');
  const [pincode, setPincode] = useState(dbUser?.pincode || '');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  useEffect(() => {
    setName(dbUser?.name || '');
    setPhonenumber(dbUser?.phoneNumber || '');
    setFlatNo(dbUser?.flatNo || '');
    setStreet(dbUser?.street || '');
    setLandmark(dbUser?.landmark || '');
    setPincode(dbUser?.pincode || '');
  }, [dbUser]);

  const { setDbUser: setDbUserProfile } = useAuthContext();

  useEffect(() => {
    setDbUserProfile(dbUser);
  }, [dbUser]);

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [flatnoError, setFlatnoError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  const validateName = () => {
    if (!name) {
      setNameError('Please enter full name');
    }
  };

  const validatePhoneNumber = () => {
    const regex = /^\d{10}$/;
    if (!regex.test(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number.');
    }
  };

  const validateFlatNo = () => {
    if (!flatNo) {
      setFlatnoError('Please enter flat Number');
    }
  };

  const validateStreet = () => {
    if (!street) {
      setStreetError('Please enter street name');
    }
  };

  const validateArea = () => {
    if (!landmark) {
      setAreaError('Please enter Area name');
    }
  };

  const validatePinCode = () => {
    const regex = /^\d{6}$/;
    if (!regex.test(pincode)) {
      setPincodeError('Please enter a valid 6-digit pin code.');
    }
  };

  const onSaveAddress = async () => {
    validateName();
    validatePhoneNumber();
    validateFlatNo();
    validateStreet();
    validateArea();
    validatePinCode();

    if (
      !nameError &&
      !phoneError &&
      !flatnoError &&
      !streetError &&
      !areaError &&
      !pincodeError
    ) {
      try {
        if (name && phoneNumber && flatNo && street && landmark && pincode) {
          if (dbUser) {
            await updateCustomer();
          } else {
            await createCustomer();
          }

          navigation.navigate('Order');
        } else {
          Alert.alert('Please fill all details');
        }
      } catch (error) {
        // Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Please fill all details');
    }
  };

  const updateCustomer = async () => {
    const customer = await DataStore.save(
      Customer.copyOf(dbUser, (updated) => {
        updated.name = name;
        updated.phoneNumber = phoneNumber;
        updated.flatNo = flatNo;
        updated.street = street;
        updated.landmark = landmark;
        updated.pincode = pincode;
        updated.lat = lat;
        updated.lng = lng;
      })
    );
    setDbUser(customer);
  };

  const createCustomer = async () => {
    try {
      const customer = await DataStore.save(
        new Customer({
          name,
          phoneNumber,
          flatNo,
          street,
          landmark,
          pincode,
          lat,
          lng,
          sub,
        })
      );
      setDbUser(customer);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          setLocationEnabled(false);
          setLoading(false); // Location permission denied, stop loading
          return;
        }
    
        const hasServicesEnabled = await Location.hasServicesEnabledAsync();
        if (!hasServicesEnabled) {
          console.log('Location services disabled');
          setLocationEnabled(false);
          setLoading(false); // Location services disabled, stop loading
          return;
        }
    
        const locationOptions = {
          accuracy: Location.Accuracy.High,
          distanceInterval: 100, // Set a distance filter in meters to receive updates
        };
    
        const locationSubscription = await Location.watchPositionAsync(locationOptions, (location) => {
          const { latitude, longitude } = location.coords;
          setLat(latitude);
          setLng(longitude);
          setLoading(false); // Location fetched, stop loading
        });
    
        // Unsubscribe the location subscription when no longer needed
        // locationSubscription.remove();
    
      } catch (error) {
        console.warn('Error getting current location:', error);
        setLoading(false); // Error occurred, stop loading
      }
    };
    
    fetchLocation();
  }, []);

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      showsVerticalScrollIndicator={false}>
      {/* {loading && ( // Render loading indicator if loading is true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )} */}
      <Text style={styles.head}>Enter delivery address</Text>
     
      <View style={styles.textInput}>
        <Text style={styles.text}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError('');
          }}
          onEndEditing={validateName}
        />
        {nameError && <Text style={styles.error}>{nameError}</Text>}
      </View>
      <View style={styles.textInput}>
        <Text style={styles.text}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(text) => {
            setPhonenumber(text);
            setPhoneError('');
          }}
          onEndEditing={validatePhoneNumber}
        />
        {phoneError && <Text style={styles.error}>{phoneError}</Text>}
      </View>
      <View style={styles.textInput}>
        <Text style={styles.text}>Flat No</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your flatno"
          value={flatNo}
          onChangeText={(text) => {
            setFlatNo(text);
            setFlatnoError('');
          }}
          onEndEditing={validateFlatNo}
        />
        {flatnoError && <Text style={styles.error}>{flatnoError}</Text>}
      </View>
      <View style={styles.textInput}>
        <Text style={styles.text}>Street</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your street"
          value={street}
          onChangeText={(text) => {
            setStreet(text);
            setStreetError('');
          }}
          onEndEditing={validateStreet}
        />
        {streetError && <Text style={styles.error}>{streetError}</Text>}
      </View>
      <View style={styles.textInput}>
        <Text style={styles.text}>Area/Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your area/landmark"
          value={landmark}
          onChangeText={(text) => {
            setLandmark(text);
            setAreaError('');
          }}
          onEndEditing={validateArea}
        />
        {areaError && <Text style={styles.error}>{areaError}</Text>}
      </View>
      <View style={styles.textInput}>
        <Text style={styles.text}>Pincode</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your pincode"
          value={pincode}
          onChangeText={(text) => {
            setPincode(text);
            setPincodeError('');
          }}
          onEndEditing={validatePinCode}
        />
        {pincodeError && <Text style={styles.error}>{pincodeError}</Text>}
      </View>
      {!locationEnabled && (
        <Text style={styles.locationDisabledText}>
          Please enable location services in your device settings to proceed.
        </Text>
      )}
      <View style={{ marginTop: 45 }}>
        <ButtonText text={loading?<ActivityIndicator  color="white" />:"Deliver to this address"} onPress={onSaveAddress} />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingVertical: 0,
    marginVertical: 0,
  },
  contentContainer: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
  },
  head: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  textInput: {
    paddingHorizontal: 9,
  },
  input: {
    height: 40,
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 3,
    paddingHorizontal: 18,
  },
  text: {
    fontSize: 15,
    marginLeft: 16,
    marginVertical: 10,
  },
  error: {
    color: 'red',
    marginLeft: 16,
  },
  locationDisabledText: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 10,
    color:'red'
  },
});

export default AddressScreen;
