import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// HOME SCREEN
import HomeScreen from '../screens/Home/HomeScreen';

// CART SCREEN
import CartScreen from '../screens/Cart/CartScreen';

// ACCOUNT SCREEN
import AccountScreen from '../screens/Account/AccountScreen';

// SEARCH SCREEN
import SearchScreen from '../screens/Search/SearchScreen';

// BLOG SCREEN
import BlogScreen from '../screens/Blog/BlogScreen';

// DASHBOARD SCREEN
import DashboardScreen from '../screens/Dashboard/DashboardScreen';

// F2GROUP SCREEN
import F2GroupScreen from '../screens/F2GroupHome/F2GroupScreen'; // Màn hình nhóm túi
import F2ListScreen from '../screens/F2GroupHome/F2ListScreen'; // Màn hình list
import F2DetailScreen from '../screens/F2GroupHome/F2DetailScreen'; // Màn hình chi tiết F2
import F2ConfirmArriveScreen from '../screens/F2GroupHome/F2ConfirmArriveScreen'; // Màn hình xác nhận hàng đến

// F3GROUP SCREEN
import F3GroupScreen from '../screens/F3GroupHome/F3GroupScreen'; // Màn hình nhóm túi
import F3DepartmentGroupToForCurrentDepartmentScreen from '../screens/F3GroupHome/F3DepartmentGroupToForCurrentDepartmentScreen'; // Màn hình get list Department để chọn nơi nhóm đến
import F3ListScreen from '../screens/F3GroupHome/F3ListScreen'; // Màn hình list
import F3DetailScreen from '../screens/F3GroupHome/F3DetailScreen'; // Màn hình chi tiết F3
import F3AddPackageToDetailScreen from '../screens/F3GroupHome/F3AddPackageToDetailScreen'; // Màn hình thêm kiện vào nhóm F3
import F3SelectVehicleScreen from '../screens/F3GroupHome/F3SelectVehicleScreen'; // Màn hình chọn bảng tài để xác nhận hàng đi
import F3ConfirmArriveScreen from '../screens/F3GroupHome/F3ConfirmArriveScreen'; // Màn hình xác nhận hàng đến
import F3ListCheckConfirmArriveScreen from '../screens/F3GroupHome/F3ListCheckConfirmArriveScreen'; // Màn hình check xem hàng F1 F2 trong danh sách F3 đến hỏng hay thất lạc hay không ?
// import Demo from '../screens/F3GroupHome/Demo'; // Thử tối ưu render List
// import Demo2 from '../screens/F3GroupHome/Demo2'; // Thử tối ưu render List


//========================================================================================================================
// DASHBOARD
const DashboradStack = createStackNavigator(
  {
    DashboardScreen: {
      screen: DashboardScreen
    }
  },
  {
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);

//========================================================================================================================
// Danh sách F2 (gồm trang list và trang chi tiết)
const F2ListStack = createStackNavigator(
  {
    F2ListScreen: {
      screen: F2ListScreen
    },
    F2DetailScreen: {
      screen: F2DetailScreen
    }
  },
  {
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);

// GROUPF2
const F2GroupBottomTabNavigation = createBottomTabNavigator(
  {
    F2GroupScreen: {
      screen: F2GroupScreen,
      navigationOptions: {
        tabBarLabel: 'Nhóm hàng'
      }
    },
    F2ListStack: {
      screen: F2ListStack,
      navigationOptions: {
        tabBarLabel: 'Danh sách'
      }
    },
  },
  {
    initialRouteName: 'F2GroupScreen',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

        if (routeName === 'F2GroupScreen') {
          iconName = 'ios-copy';
          return <Ionicons style={{ marginBottom: -5 }} name={iconName} size={20} color={tintColor} />;
        }

        if (routeName === 'F2ConfirmArriveScreen') {
          iconName = 'folder-open-o';
        }

        if (routeName === 'F2ListStack') {
          iconName = 'list-alt';
        }

        return <FontAwesome style={{ marginBottom: -5 }} name={iconName} size={20} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#000',
      inactiveTintColor: 'rgba(0,0,0,.2)',
      style: {
        backgroundColor: '#F5F6F8',
        borderTopColor: '#ccc',
        shadowOffset:{ width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 2,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: '500'
      },
    }
  }
);

// Danh sách F3 (gồm trang list và trang chi tiết)
const F3ListStack = createStackNavigator(
  {
    F3ListScreen: {
      screen: F3ListScreen
    },
    F3DetailScreen: {
      screen: F3DetailScreen
    },
    F3AddPackageToDetailScreen: {
      screen: F3AddPackageToDetailScreen
    },
    F3SelectVehicleScreen: {
      screen: F3SelectVehicleScreen
    }
  },
  {
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);

const F3GroupStack = createStackNavigator(
  {
    F3GroupScreen: {
      screen: F3GroupScreen
    },
    F3DepartmentGroupToForCurrentDepartmentScreen: {
      screen: F3DepartmentGroupToForCurrentDepartmentScreen
    }
  },
  {
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);

const F3ConfirmStack = createStackNavigator(
  {
    F3ConfirmArriveScreen: {
      screen: F3ConfirmArriveScreen
    },
    F3ListCheckConfirmArriveScreen: {
      screen: F3ListCheckConfirmArriveScreen
    }
  },
  {
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);



// GROUPF3
const F3GroupBottomTabNavigation = createBottomTabNavigator(
  {
    F3GroupStack: {
      screen: F3GroupStack,
      navigationOptions: {
        tabBarLabel: 'Nhóm hàng'
      }
    },
    F3ConfirmStack: {
      screen: F3ConfirmStack,
      navigationOptions: {
        tabBarLabel: 'Dỡ hàng'
      }
    },
    F3ListStack: {
      screen: F3ListStack,
      navigationOptions: {
        tabBarLabel: 'Danh sách'
      }
    },
    // Demo: {
    //   screen: Demo,
    //   navigationOptions: {
    //     tabBarLabel: 'Demo'
    //   }
    // },
    // Demo2: {
    //   screen: Demo2,
    //   navigationOptions: {
    //     tabBarLabel: 'Demo2'
    //   }
    // },
  },
  {
    initialRouteName: 'F3GroupStack',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

        if (routeName === 'F3GroupStack') {
          iconName = 'ios-copy';
          return <Ionicons style={{ marginBottom: -5 }} name={iconName} size={20} color={tintColor} />;
        }

        if (routeName === 'F3ConfirmStack') {
          iconName = 'folder-open-o';
        }

        if (routeName === 'F3ListStack') {
          iconName = 'list-alt';
        }

        if (routeName === 'Demo') {
          iconName = 'list-alt';
        }

        return <FontAwesome style={{ marginBottom: -5 }} name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#000',
      inactiveTintColor: 'rgba(0,0,0,.2)',
      style: {
        backgroundColor: '#F5F6F8',
        borderTopColor: '#ccc',
        shadowOffset:{ width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 2,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: '500'
      },
    }
  }
);

//============================================================================================================================


export default createStackNavigator(
  {
    DashboradStack: {
      screen: DashboradStack,
      navigationOptions: {
        tabBarLabel: 'DASHBOARD'
      }
    },
    F2GroupBottomTabNavigation: {
      screen: F2GroupBottomTabNavigation
    },
    F3GroupBottomTabNavigation: {
      screen: F3GroupBottomTabNavigation
    }
  },
  {
    initialRouteName: 'DashboradStack',
    headerMode: 'none',
    headerTransitionPreset: 'uikit'
  }
);
