import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import ShoppingCartComponent from '../../components/ShoppingCartComponent/ShoppingCartComponent';
import ButtonText from '../../components/ButtonText/ButtonText';
import { useNavigation} from '@react-navigation/native';
import { useBasketContext } from '../../contexts/BasketContext';

function ShoppingCartScreen(props) {
  const navigation = useNavigation();
  const {cartProducts,totalAmount}=useBasketContext();

  const createOrderPress = () => {
    if (cartProducts.length > 0) {
    // createOrder();
    navigation.navigate('address')
    } else {
      Alert.alert('Add items in the Basket');
    }
  };

  return (
    <View style={styles.page}>
      {cartProducts.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={cartProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ShoppingCartComponent cartItem={item} />}
        />
      ) : (
        <Text style={styles.emptyText}>No items in the Basket</Text>
      )}
      <Text style={styles.totalAmount}>
        Total Amount ({cartProducts.length} items) :{' '}
        <Text style={{ fontWeight: 'bold' }}>₹ {totalAmount}</Text>
      </Text>
      <ButtonText text="Create Order" onPress={createOrderPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    marginVertical: 0,
    margin: 18,
    marginRight: 6,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  totalAmount: {
    fontSize: 18,
    marginBottom: 6,
    alignSelf: 'center',
  },
});

export default ShoppingCartScreen;
