import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import styles from './styles';
import { Picker } from '@react-native-picker/picker';
import ButtonText from '../../components/ButtonText/ButtonText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import { Product, CartProduct } from '../../models';
import { useBasketContext } from '../../contexts/BasketContext';

function ProductScreen(props) {
  const route = useRoute();
  const navigation = useNavigation();
  const {addItemToBasket}=useBasketContext();

  const id = route.params?.id;

  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [updatedPrice, setUpdatedPrice] = useState(null);

  useEffect(() => {
    const getProduct = async () => {
      const result = await DataStore.query(Product, id);
      setProduct(result);
      setSelectedWeight(result.weights[1]);
      setUpdatedPrice((result.price + 25));
    };

    getProduct();

    const subscription = DataStore.observe(Product, id).subscribe(() => {
      getProduct();
    });

    return () => subscription.unsubscribe();
  }, [id]);

  const onaddToBasketPress = async () => {
    await addItemToBasket({weight:parseFloat(selectedWeight),
    amount: parseFloat(updatedPrice),
    productName:product.name,
    productImage:product.image,})
        
      // const newCartProduct = new CartProduct({
        // DataStore.save(newCartProduct);
        // });
    await navigation.goBack();
  };

  const updatePrice = (weight) => {
    const weightValue = parseFloat(weight); // Convert weight to a number
    const priceValue = parseFloat(product.price); // Convert product price to a number

    if (weightValue === 0.5) {
      return ((priceValue * 0.5 + 30)).toFixed(0);
    } else if (weightValue === 1) {
      return (priceValue + 25);
    } else if (weightValue === 1.5) {
      return ((priceValue * 1.5 + 20)).toFixed(0);
    } else if (weightValue === 2) {
      return (priceValue * 2 + 15);
    } else if (weightValue === 2.5) {
      return ((priceValue * 2.5 + 10)).toFixed(0);
    } else if (weightValue === 3) {
      return (priceValue * 3 + 5);
    } else if (weightValue === 3.5) {
      return (priceValue * 3.5).toFixed(0);
    } else if (weightValue === 4) {
      return (priceValue * 4 );
    } else if (weightValue === 4.5) {
      return (priceValue * 4.5 ).toFixed(0);
    } else if (weightValue === 5) {
      return (priceValue * 5);
    } else if (weightValue === 5.5) {
      return (priceValue * 5.5).toFixed(0);
    } else if (weightValue === 6) {
      return (priceValue * 6);
    }
  };

  useEffect(() => {
    if (selectedWeight && product) {
      const price = updatePrice(selectedWeight);
      setUpdatedPrice(price);
    }
  }, [selectedWeight, product]);

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{product.name}</Text>
        <Image style={styles.image} source={{ uri: product.image }} />
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.weight}>Select Weight:</Text>
        <Picker
          style={styles.picker}
          selectedValue={selectedWeight}
          onValueChange={(itemValue) => {
            setSelectedWeight(itemValue);
          }}
        >
          {product.weights.map((weight) => (
            <Picker.Item label={`${weight} KG`} value={weight} key={weight} />
          ))}
        </Picker>
        <Text style={styles.price}>Amount = ₹ {updatedPrice}</Text>
        <ButtonText text="Add to Basket" onPress={onaddToBasketPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProductScreen;
