import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function StoreItem({ store }) {
  const navigation = useNavigation();

  const onPress = () => {
    if (store.isAvailable) {
      navigation.navigate('product', { id: store.id });
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.productsContainer, !store.isAvailable && styles.disabledContainer]}
      disabled={!store.isAvailable}
    >
      <Image style={styles.image} source={{ uri: store.image }} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{store.name}</Text>
        {!store.isAvailable&& (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default StoreItem;

const styles = StyleSheet.create({
  productsContainer: {
    backgroundColor: 'white',
    width: '100%',
    marginVertical: 6,
    borderRadius: 27,
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.4, // You can adjust the opacity to make it visually indicate it's disabled
  },
  detailsContainer: {
    padding: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 6 / 3,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 6,
    alignSelf: 'center',
  },
  subTitle: {
    color: 'grey',
    marginBottom: 5,
  },
  outOfStock: {
    color: 'red',
    marginBottom: 5,
    textAlign:"center"
  },
});
