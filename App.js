import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStackNavigator from './src/navigation/index';

import {Amplify,Auth,DataStore,API} from 'aws-amplify';
import awsconfig from './src/aws-exports';
import AuthContextProvider from './src/contexts/AuthContext';
import BasketContextProvider from './src/contexts/BasketContext';
import '@azure/core-asynciterator-polyfill';
import OrderContextProvider from './src/contexts/OrderContext';

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);


function App() {
  return (
          <NavigationContainer>
            <AuthContextProvider>
              <BasketContextProvider>
                <OrderContextProvider>
             <AuthStackNavigator/>
                </OrderContextProvider>
              </BasketContextProvider>
            </AuthContextProvider>
     </NavigationContainer>      
  );
};

export default App;
