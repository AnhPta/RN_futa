import React from 'react';
import { createStackNavigator } from 'react-navigation';

import SignInScreen from '../screens/Auth/SignInScreen';

const AuthStack = createStackNavigator(
  {
    SignInScreen: SignInScreen
  },
  {
    'initialRouteName': 'SignInScreen',
    'headerMode': 'none'
  }
);

export default AuthStack;
