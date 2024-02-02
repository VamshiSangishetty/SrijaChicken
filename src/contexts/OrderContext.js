import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataStore } from 'aws-amplify';
import { Order} from '../models';
import { useAuthContext } from './AuthContext';
import { useBasketContext } from './BasketContext';


const OrderContext = createContext({});

function OrderContextProvider({ children }) {
  const { dbUser,sub } = useAuthContext();
  const { cartProducts,totalAmount } = useBasketContext();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const subscription = DataStore.observe(Order).subscribe(() => {
      fetchOrders();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dbUser,orders]);

  const fetchOrders = async () => {
    try {
        if (!orders||!dbUser) {
            return;
          }
      const fetchedOrders = await DataStore.query(Order, (o) =>
        o.customerID.eq(dbUser.id)
      );

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dbUser,sub]);

  const createOrder = async () => {
    try {
      const newOrder = await DataStore.save(
        new Order({
          customerID: dbUser.id,
          total: totalAmount,
          status: 'NEW',
          latitude:dbUser.lat,
          longitude:dbUser.lng,
          orderItems: [], // Initialize the orderItems array
        })
      );
  
      const orderItems = cartProducts.map((cartProduct,index) => ({
        id: cartProduct.id,
        weight: cartProduct.weight,
        amount: cartProduct.amount,
        productName: cartProduct.productName,
        ProductImage: cartProduct.productImage,
        orderID: newOrder.id
      }));
      
  
      newOrder.orderItems = orderItems; // Assign the orderItems array to the newOrder object
  
      await DataStore.save(newOrder); // Save the updated newOrder object with orderItems
  
      await Promise.all(
        cartProducts
          .filter((cartProduct) => cartProduct.userSub === sub)
          .map((cartProduct) => DataStore.delete(cartProduct))
      );
  
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  

  return (
    <OrderContext.Provider value={{ createOrder, orders }}>
      {children}
    </OrderContext.Provider>
  );
}

export default OrderContextProvider;
export const useOrderContext = () => useContext(OrderContext);