import React,{ useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from '@expo/vector-icons';
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import OrdersScreen from '../screens/OrdersScreen/OrdersScreen';
import OrderDetails from '../screens/OrderDetails/OrderDetails';
import ProfileScreen from '../screens/ProfileScreen/index';
import ProductScreen from '../screens/ProductScreen/ProductScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen/ShoppingCartScreen';
import AddressScreen from '../screens/AddressScreen/AddressScreen';

import SignInScreen from '../screens/AuthenticationScreens/SignInScreen';
import SignUpScreen from '../screens/AuthenticationScreens/SignUpScreen';
import ConfirmEmailScreen from '../screens/AuthenticationScreens/ConfirmEmailScreen';
import ForgetPasswordScreen from '../screens/AuthenticationScreens/ForgetPasswordScreen';
import NewPasswordScreen from '../screens/AuthenticationScreens/NewPasswordScreen';
import {Auth,Hub} from 'aws-amplify';
import { ActivityIndicator,View,Text } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import HeaderComponent from "../components/HeaderComponent/HeaderComponent";
import { StyleSheet } from 'react-native';
import { useBasketContext } from "../contexts/BasketContext";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen/OrderConfirmationScreen";

const AuthStack=createNativeStackNavigator();

const AuthStackNavigator=()=>{
    const [user,setUser]=useState(undefined);
    const checkUser=async()=>{
        try{
            const authUser = await Auth.currentAuthenticatedUser({bypassCache:true});
            setUser(authUser);
        }catch(e){
            setUser(null);
        }
    };
    useEffect(()=>{
        checkUser();
    },[]);
    
    useEffect(()=>{
        const listener = data=>{
            if(data.payload.event==='signIn' || data.payload.event==='signOut'){
                checkUser();
            }
        }
        Hub.listen('auth',listener);
        return () => Hub.remove('auth', listener);
    },[]);
    
    if (user===undefined) {
        return(
            <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
            <ActivityIndicator size={"large"}/>
        </View>
    )
}

    return(
        <AuthStack.Navigator screenOptions={{headerShown:false}}>
            {user?(<AuthStack.Screen name ='HomeScreen' component={RootNavigator}/>
            ):(
                <>
                <AuthStack.Screen name ='SignIn' component={SignInScreen} />
                <AuthStack.Screen name ='SignUp' component={SignUpScreen}/>
                <AuthStack.Screen name ='confirmEmail' component={ConfirmEmailScreen}/>
                <AuthStack.Screen name ='ForgetPassword' component={ForgetPasswordScreen}/>
                <AuthStack.Screen name ='NewPassword' component={NewPasswordScreen}/>
                </>
            )
            }

        </AuthStack.Navigator>
    );
};

const Stack = createNativeStackNavigator();
const RootNavigator = () => {
    return(
    <Stack.Navigator screenOptions={{header:()=><HeaderComponent/>}}>
            <Stack.Screen name="SrijaChicken"  
              component={HomeTabs}/>
    </Stack.Navigator>
    );
};

const Tab = createBottomTabNavigator();
const HomeTabs = () => {
  const {cartProducts}=useBasketContext();
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown:false,
    // tabBarShowLabel: false,
    tabBarActiveTintColor: 'black',
    tabBarInactiveTintColor: 'grey',
    tabBarStyle: { display: 'flex' },
    tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        let cartCount = cartProducts.length;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home';
        } else if (route.name === 'Orders') {
          iconName = focused ? 'clipboard-list' : 'clipboard-list';
        } else if (route.name === 'Basket') {
          iconName = focused ? 'shopping-cart' : 'shopping-cart';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'user-alt' : 'user-alt';
        }
      
        return (
          <View style={styles.iconContainer}>
            <FontAwesome5 name={iconName} size={24} color={color} />
            {route.name === 'Basket' && cartCount > 0 && (
              <View style={styles.cartCountContainer}>
                <Text style={styles.cartCount}>{cartCount}</Text>
              </View>
            )}
          </View>
        );
      },      
  })}
>
      <Tab.Screen name="Home"  component={HomeStackNavigator} />
      <Tab.Screen name="Orders" component={OrderStackNavigator} />
      <Tab.Screen name="Basket" component={ShoppingCartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }  
  });
  

const HomeStack=createNativeStackNavigator();

const HomeStackNavigator=()=>{
    return(
        <HomeStack.Navigator screenOptions={{headerShown:false}}>
            <HomeStack.Screen name="stores"  component={HomeScreen}/>
            <HomeStack.Screen name="product" component={ProductScreen}/>
            <HomeStack.Screen name="basket" component={ShoppingCartScreen}/>
            <HomeStack.Screen name="address" component={AddressScreen}/>
            <HomeStack.Screen name="orderConfirm" component={OrderConfirmationScreen}/>
            <HomeStack.Screen name="Order" component={OrderDetails}/>
        </HomeStack.Navigator>
    )
}
const OrdersStack=createNativeStackNavigator();

const OrderStackNavigator=()=>{
    return(
        <OrdersStack.Navigator screenOptions={{headerShown:false}}>
            <OrdersStack.Screen name="orders" component={OrdersScreen}/>
            <OrdersStack.Screen name="Order" component={OrderDetails}/>
        </OrdersStack.Navigator>
    )
}

export default AuthStackNavigator;