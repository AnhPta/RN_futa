import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';

import DropdownAlert from 'react-native-dropdownalert';

class BlogScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      reload: 0
    };
  }


  _alertNow () {
    this.dropdown.alertWithType('error', 'Error', 'Lỗi đây này');
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>BlogScreen</Text>
        <Button
          onPress={() => this._alertNow()}
          title="Alert Now"
          color="#841584"
        />
        <DropdownAlert
          closeInterval={1500}
          defaultContainer={{padding: 8, paddingTop: Platform.OS === 'ios' ? 0 : 20, flexDirection: 'row'}}
          ref={ref => this.dropdown = ref} />
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

export default BlogScreen;
