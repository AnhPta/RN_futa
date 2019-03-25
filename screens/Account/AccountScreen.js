import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Alert, AsyncStorage } from 'react-native';

import axios from "../../axios"
import { head } from 'lodash'

class AccountScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      reload: 0
    };
  }

  // Đăng xuất
  _confirmSignOut() {
    Alert.alert(
      'Thông báo',
      'Đăng xuất khỏi hệ thống',
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {text: 'OK', onPress: () => {
          this._signOutAsync()
        }},
      ],
      { cancelable: false }
    )
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('AuthLoading');
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Account Screen</Text>
        <Button
          onPress={() => this._confirmSignOut()}
          title="Đăng xuất"
          color="#841584"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  }
});

export default AccountScreen;
