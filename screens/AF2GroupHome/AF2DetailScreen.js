import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

class AF2DetailScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      reload: 0
    };
  }

  render() {
    const {params} = this.props.navigation.state
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity  onPress={ () => this.props.navigation.navigate('DashboradStack') } >
            <View style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40 }}>
                <MaterialIcons name='navigate-before' size={ 35 } color='#000' style={{ fontWeight: 'bold' }} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Nhóm F2</Text>
            </View>
          </TouchableOpacity>
        <Text>{params.item.barcode}</Text>
      </View>
    );
  }
}

export default AF2DetailScreen;
