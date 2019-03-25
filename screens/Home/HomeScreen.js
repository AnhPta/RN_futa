import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform, StatusBar, TextInput,
  ScrollView,
  Image,
  Button,
  Dimensions
} from 'react-native';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      reload: 0
    };
  }

  componentWillMount() {

  }

  _alertNow () {
    this.dropdown.alertWithType('error', 'Error', 'Lỗi đây này');
  }

  render() {

    return (
      <View style={styles.container}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight
  }
});

export default HomeScreen;
