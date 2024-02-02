import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from './AuthContext';
import { DataStore, Auth } from 'aws-amplify';
import { CartProduct } from '../models';
import { Alert } from 'react-native';

const BasketContext = createContext({});

const BasketContextProvider = ({ children }) => {
  const { dbUser,sub } = useAuthContext();
  const [cartProducts, setCartProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (sub) {
        const fetchedCartProducts = await DataStore.query(CartProduct, (cp) =>
          cp.userSub.eq(sub)
        );
        setCartProducts(fetchedCartProducts);
      }
    };

    fetchCartProducts();

    const subscription = DataStore.observe(CartProduct).subscribe(() => {
      fetchCartProducts();
    });

    return () => subscription.unsubscribe();
  }, [sub]);

  useEffect(() => {
    const calculateTotalAmount = () => {
      const amount = cartProducts.reduce((total, product) => {
        return total + product.amount;
      }, 0);
      setTotalAmount(amount);
    };

    calculateTotalAmount();
  }, [cartProducts]);

  const addItemToBasket = async ({
    weight,
    amount,
    userSub = sub,
    productName,
    productImage,
  }) => {
    if (sub) {
      await DataStore.save(
        new CartProduct({
          weight,
          amount,
          userSub,
          productName,
          productImage,
        })
      );
    } else {
Alert.alert("Something went wrong, Please try again later");
    }
  };

  return (
    <BasketContext.Provider value={{ addItemToBasket, cartProducts, totalAmount }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContextProvider;
export const useBasketContext = () => useContext(BasketContext);
