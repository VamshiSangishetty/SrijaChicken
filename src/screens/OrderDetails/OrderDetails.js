import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useOrderContext } from '../../contexts/OrderContext';
import { useBasketContext } from '../../contexts/BasketContext';
import { useNavigation } from '@react-navigation/native';

const OrderDetails = () => {
  const { createOrder } = useOrderContext();
  const { cartProducts, totalAmount } = useBasketContext();
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  
  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setIsLocating(false);
        return;
      }

      const newSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
          enableHighAccuracy: Platform.OS === 'android',
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });

          if (!mapRegion) {
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.002,  // Increase the value to zoom in
              longitudeDelta: 0.002,  // Increase the value to zoom in
            });
          }

          setIsLocating(false);
        }
      );

      setSubscription(newSubscription);
    } catch (error) {
      console.warn('Error getting current location:', error);
      setIsLocating(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleLocateUser = async () => {
    setIsLocating(true);

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Please enable location services for this app in your device settings.');
      return;
    }

    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.002,  // Increase the value to zoom in
        longitudeDelta: 0.002,  // Increase the value to zoom in
      });
    }

    getCurrentLocation();
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const onOrderPlaced = async () => {
    if (!currentLocation) {
      Alert.alert('Please enable location services to proceed with the order.');
      return;
    }
  
    const storeLatitude = 17.5534228;
    const storeLongitude = 78.4935845;
    const userLatitude = currentLocation.latitude;
    const userLongitude = currentLocation.longitude;
    const distance = calculateDistance(storeLatitude, storeLongitude, userLatitude, userLongitude);
  
    if (distance > 50) {
      Alert.alert(
        'You are outside the delivery range',
        'We are coming soon! Please stay tuned as we expand to your area'
      );
      return;
    }
  
    try {
      setIsLoading(true);
      await createOrder();
      setIsLoading(false);
      navigation.navigate('orderConfirm');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onMapReady={() => setIsLocating(false)}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
          />
        </MapView>
      )}

      {isLocating && (
        <View style={styles.locatingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <TouchableOpacity style={styles.locButton} onPress={handleLocateUser}>
        <Text style={{ fontSize: 16, color: 'blue' }}>Delivering to this Location</Text>
      </TouchableOpacity>

      <View style={styles.bottomContainer}>
        <Text style={styles.totalLabel}>
          Total Amount: <Text style={{ fontWeight: 'bold' }}>₹ {totalAmount}</Text>
        </Text>
        <TouchableOpacity onPress={handleToggleDetails} style={styles.infoButton}>
          <Ionicons name="ios-information-circle" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOrderPlaced} style={styles.orButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.orButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showDetails} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.detailsLabel}>Order Items:</Text>
          {cartProducts.map((item) => (
            <View key={item.id} style={styles.productContainer}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.productDetails}>
                {item.weight} KG - <Text style={{ fontWeight: 'bold' }}>₹ {item.amount}</Text>
              </Text>
            </View>
          ))}
          <Text style={{ fontSize: 18, margin: 16 }}>Payment Method: Cash on delivery</Text>
          <Button title="Close" onPress={handleToggleDetails} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    backgroundColor: 'white',
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 6,
  },
  infoButton: {
    marginBottom: 6,
  },
  modalContainer: {
    marginTop: 135,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  detailsText: {
    fontSize: 16,
    marginLeft: 16,
    margin: 14,
  },
  productName: {
    marginBottom: 4,
    fontSize: 16,
  },
  productDetails: {
    fontSize: 16,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  locatingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  locButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: 9,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    width: 210,
    alignSelf: 'center',
  },
  orButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default OrderDetails;
