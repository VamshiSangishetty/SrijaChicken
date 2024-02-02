import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import StoreItem from '../../components/storeItems/StoreItem';
import { DataStore } from 'aws-amplify';
import { Product } from '../../models';
import { useNavigation, useRoute } from '@react-navigation/native';
import '@azure/core-asynciterator-polyfill'

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await DataStore.query(Product);
      setProducts(result);
    };

    fetchProducts();

    const subscription = DataStore.observe(Product).subscribe(() => {
      fetchProducts();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <StoreItem store={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 0,
  },
});
