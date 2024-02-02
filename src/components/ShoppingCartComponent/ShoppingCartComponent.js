import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataStore } from 'aws-amplify';
import { CartProduct } from '../../models';

const ShoppingCartComponent = ({ cartItem }) => {

  const onDeletePress = async () => {
    try {
      await DataStore.delete(CartProduct, cartItem.id);
    } catch (error) {
      // Alert.alert('Error deleting item');
    }
  };
  
  return (
    <View style={styles.component}>
      <View style={styles.row}>
        <Image style={styles.image} source={{ uri: cartItem.productImage }} />
        <View style={styles.textContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {cartItem.productName}
          </Text>
          <Text style={styles.weight}>{cartItem.weight} KG</Text>
          <Text style={styles.amount}>₹ {cartItem.amount}</Text>
        </View>
        <TouchableOpacity onPress={onDeletePress} style={styles.buttonContainer}>
          <View style={styles.buttonContent}>
            <Ionicons name="trash-outline" size={26} color="red" style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  component: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
  },
  image: {
    height: 89,
    width: 100,
    marginRight: 6,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 6,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  weight: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonContainer: {
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 18,
    alignSelf: 'flex-start',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  icon: {
    marginLeft: 5,
  },
});

export default ShoppingCartComponent