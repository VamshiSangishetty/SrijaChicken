import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing,Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import ButtonText from '../../components/ButtonText/ButtonText';
import { TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function OrderConfirmationScreen() {
  const [showAnimation, setShowAnimation] = useState(true);
  const checkmarkScale = new Animated.Value(0);
  const navigation = useNavigation();

  const onDonePress=()=>{
    navigation.navigate('stores');
  }

  useEffect(() => {
    Animated.timing(checkmarkScale, {
      toValue: 1,
      duration: 1000,
      easing: Easing.easeInOut,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {showAnimation ? (
          <Animated.View
            style={[
              styles.checkmark,
              { transform: [{ scale: checkmarkScale }] },
            ]}
          >
            <Ionicons name="checkmark-circle-sharp" size={100} color="#2ecc71" />
          </Animated.View>
        ) : (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle-sharp" size={100} color="#2ecc71" />
          </View>
        )}
        <Text style={styles.messageText}>Order Confirmed!</Text>
      <TouchableOpacity onPress={onDonePress}><Text style={{color:'blue',fontSize:22}} >Done</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    marginTop: 20,
    marginBottom:20,
    fontSize: 24,
    color: '#333',
  },
 
});
