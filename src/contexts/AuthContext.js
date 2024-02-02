import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth, DataStore, Hub } from 'aws-amplify';
import { Customer } from '../models';

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [sub, setSub] = useState(null);

  const fetchUserData = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
      setAuthUser(user);
      const sub =
        user?.attributes?.sub ||
        user?.accessToken?.payload?.sub ||
        user?.username;
      setSub(sub);

      fetchCustomerData(sub);
      observeCustomerChanges(sub);
    } catch (error) {
      // Handle error fetching user data
    }
  };

  const fetchCustomerData = async (sub) => {
    try {
      const customers = await DataStore.query(Customer, (user) =>
        user.sub.eq(sub)
      );
      if (customers.length > 0) {
        setDbUser(customers[0]);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      // Handle error fetching customer data
    }
  };

  const observeCustomerChanges = async (sub) => {
    let subscription;
    try {
      subscription = DataStore.observe(Customer, (model) =>
        model.sub.eq(sub)
      ).subscribe({
        next: (data) => {
          if (data.opType === 'INSERT' || data.opType === 'UPDATE') {
            const updatedCustomer = data.element;
            setDbUser(updatedCustomer);
          }
        },
        error: (error) => {
          // Handle error observing customer changes
        },
      });
    } catch (error) {
      // Handle error subscribing to customer changes
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  };

  useEffect(() => {
    const authListener = (data) => {
      switch (data.payload.event) {
        case 'signIn':
          // Handle sign-in event
          setAuthUser(data.payload.data);
          fetchUserData();
          break;
        case 'signOut':
          // Handle sign-out event
          setAuthUser(null);
          setDbUser(null);
          break;
        default:
          break;
      }
    };

    Hub.listen('auth', authListener);

    return () => {
      Hub.remove('auth', authListener);
    };
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, dbUser, sub, setDbUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
