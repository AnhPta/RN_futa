import React from 'react';
import { createStackNavigator } from 'react-navigation';

import AuthLoadingScreen from '../screens/Auth/AuthLoadingScreen';

const AuthLoadingStack = createStackNavigator(
  {
    AuthLoadingScreen: AuthLoadingScreen
  },
  {
    'headerMode': 'none'
  }
);

export default AuthLoadingStack;
