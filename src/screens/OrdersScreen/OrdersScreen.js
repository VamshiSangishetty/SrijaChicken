import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import OrderComponent from '../../components/OrderComponent/OrderComponent';
import { useOrderContext } from '../../contexts/OrderContext';

export default function OrderScreen() {
  const { orders, createOrder } = useOrderContext();
  const sortedOrders = [...orders].reverse();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      {sortedOrders.map((order,index) => (
        <OrderComponent key={`${order.id}+${index}`} order={order} />
      ))}
      <View style={styles.totalContainer}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  totalContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    marginBottom: 8,
  },
});
