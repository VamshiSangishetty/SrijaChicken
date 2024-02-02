import React from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { DataStore } from 'aws-amplify';
import { Order } from '../../models';

export default function OrderComponent({ order }) {
  const orderDate = new Date(order.createdAt);
  const sortedOrderItems = [...order.orderItems].sort((a, b) => b.createdAt - a.createdAt);

  const formattedOrderDate = orderDate.toLocaleString('en-US', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  const handleCancelOrder = async () => {
    if (order.status === 'NEW') {
      Alert.alert(
        'Confirm Cancel',
        'Are you sure you want to cancel this order?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await DataStore.delete(Order, order.id);
                Alert.alert('Order Cancelled Successfully');
                // Perform any additional actions after order cancellation
              } catch (error) {
                Alert.alert('Failed to cancel order. Please try again.');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Cannot cancel order', 'We have already started processing your order.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.orderDate}>Order Date: {formattedOrderDate}</Text>
      <Text style={styles.orderId}>Status: {order.status=='DELIVERED'?<Text style={{color:"green"}}>{order.status}</Text>:<Text>{order.status}</Text>}</Text>
      <Text style={styles.total}>
        Total Amount: <Text style={{ fontWeight: 'bold' }}>₹ {order.total}</Text>
      </Text>
      <Text style={styles.orderItems}>Order Items:</Text>
      {sortedOrderItems.map((item) => (
        <Text key={item.id} style={styles.orderItem}>
          {item.productName} ({item.weight}KG) -{' '}
          <Text style={{ fontWeight: 'bold' }}>₹{item.amount}</Text>
        </Text>
      ))}
      {order.status === 'NEW' && (
        <TouchableOpacity onPress={handleCancelOrder}>
          <Text style={{ color: 'red', alignSelf: 'center' }}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItem: {
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 16,
    marginBottom: 4,
  },
});
